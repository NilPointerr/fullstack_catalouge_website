from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token, LoginRequest

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    credentials: LoginRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Login with email/password and return a JWT bearer token.
    """
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
