"""
FastAPI dependencies for authentication and database access.

Provides reusable dependencies for:
- Database session management
- User authentication
- Authorization checks
"""
import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.db.session import get_db as _get_db
from app.models.user import User
from app.schemas.token import TokenPayload
from app.core.config import settings
from app.core import security
from app.core.exceptions import UnauthorizedError, ForbiddenError, NotFoundError

logger = logging.getLogger(__name__)

# Re-export get_db for convenience
get_db = _get_db

# Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)


def _extract_bearer_token(
    credentials: Optional[HTTPAuthorizationCredentials],
) -> str:
    """
    Extract bearer token from credentials.
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        Bearer token string
        
    Raises:
        UnauthorizedError: If credentials are invalid or missing
    """
    if not credentials or credentials.scheme.lower() != "bearer":
        raise UnauthorizedError("Not authenticated")
    return credentials.credentials


def get_current_user(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> User:
    """
    Dependency to get the current authenticated user.
    
    Validates JWT token and retrieves user from database.
    
    Args:
        db: Database session
        credentials: HTTP authorization credentials
        
    Returns:
        Authenticated User object
        
    Raises:
        UnauthorizedError: If token is missing or invalid
        ForbiddenError: If token cannot be validated
        NotFoundError: If user is not found
    """
    token = _extract_bearer_token(credentials)
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError) as e:
        logger.warning(f"Token validation failed: {e}")
        raise ForbiddenError("Could not validate credentials")
    
    # Get user from database
    try:
        user_id = int(token_data.sub)
    except (ValueError, TypeError):
        logger.warning(f"Invalid user ID in token: {token_data.sub}")
        raise ForbiddenError("Invalid token payload")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise NotFoundError("User", user_id)
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get the current active user.
    
    Ensures the authenticated user is active.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Active User object
        
    Raises:
        ForbiddenError: If user is inactive
    """
    if not current_user.is_active:
        raise ForbiddenError("Inactive user")
    return current_user


def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to get the current superuser.
    
    Ensures the authenticated user has superuser privileges.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Superuser User object
        
    Raises:
        ForbiddenError: If user is not a superuser
    """
    if not current_user.is_superuser:
        raise ForbiddenError("The user doesn't have enough privileges")
    return current_user
