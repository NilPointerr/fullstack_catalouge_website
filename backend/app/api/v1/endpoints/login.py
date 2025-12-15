from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token, LoginRequest

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    *,
    db: AsyncSession = Depends(deps.get_db),
    credentials: LoginRequest = Body(..., description="JSON body with email and password"),
) -> Any:
    """
    Login with email/password and return a JWT bearer token.
    """
    result = await db.execute(select(User).filter(User.email == credentials.email))
    user = result.scalars().first()

    if not user or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
