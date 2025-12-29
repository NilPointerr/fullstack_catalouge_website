"""
Rate limiting middleware for API endpoints.

Uses slowapi for rate limiting with configurable limits per endpoint type.
"""
import logging
from typing import Callable
from fastapi import Request, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"] if settings.RATE_LIMIT_ENABLED else [],
)


# Rate limit decorators for different endpoint types
# Create no-op decorator when rate limiting is disabled
def _noop_decorator(func: Callable) -> Callable:
    """No-op decorator when rate limiting is disabled."""
    return func

# Create wrapper functions that return decorators
# These allow usage with parentheses: @rate_limit_general()
if settings.RATE_LIMIT_ENABLED:
    _rate_limit_general_decorator = limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
    _rate_limit_auth_decorator = limiter.limit(f"{settings.RATE_LIMIT_AUTH_PER_MINUTE}/minute")
    _rate_limit_strict_decorator = limiter.limit(f"{settings.RATE_LIMIT_STRICT_PER_MINUTE}/minute")
    
    def rate_limit_general(func: Callable = None) -> Callable:
        """Rate limit decorator for general endpoints (60/min default)."""
        if func is None:
            return _rate_limit_general_decorator
        return _rate_limit_general_decorator(func)
    
    def rate_limit_auth(func: Callable = None) -> Callable:
        """Rate limit decorator for authentication endpoints (10/min default)."""
        if func is None:
            return _rate_limit_auth_decorator
        return _rate_limit_auth_decorator(func)
    
    def rate_limit_strict(func: Callable = None) -> Callable:
        """Rate limit decorator for strict endpoints like registration (5/min default)."""
        if func is None:
            return _rate_limit_strict_decorator
        return _rate_limit_strict_decorator(func)
else:
    # When rate limiting is disabled, return no-op decorators
    def rate_limit_general(func: Callable = None) -> Callable:
        if func is None:
            return _noop_decorator
        return func
    
    def rate_limit_auth(func: Callable = None) -> Callable:
        if func is None:
            return _noop_decorator
        return func
    
    def rate_limit_strict(func: Callable = None) -> Callable:
        if func is None:
            return _noop_decorator
        return func

