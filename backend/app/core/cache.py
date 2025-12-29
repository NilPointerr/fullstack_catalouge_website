"""
Response caching middleware for API endpoints.

Provides in-memory caching with optional Redis backend support.
"""
import logging
import hashlib
import json
from typing import Optional, Callable, Any
from functools import wraps
from datetime import datetime, timedelta
from fastapi import Request, Response

from app.core.config import settings

logger = logging.getLogger(__name__)

# In-memory cache store (can be replaced with Redis in production)
_cache_store: dict[str, tuple[Any, datetime]] = {}


def _generate_cache_key(request: Request, ttl: Optional[int] = None) -> str:
    """
    Generate a cache key from request path and query parameters.
    
    Args:
        request: FastAPI request object
        ttl: Optional TTL to include in key for versioning
        
    Returns:
        Cache key string
    """
    # Include path and query parameters in cache key
    path = request.url.path
    query_params = sorted(request.query_params.items())
    
    # Create a hash of the request
    cache_data = {
        "path": path,
        "query": query_params,
        "ttl": ttl,
    }
    cache_str = json.dumps(cache_data, sort_keys=True)
    cache_hash = hashlib.md5(cache_str.encode()).hexdigest()
    
    return f"cache:{cache_hash}"


def _is_cache_valid(cached_time: datetime, ttl: int) -> bool:
    """Check if cached entry is still valid."""
    return datetime.now() < cached_time + timedelta(seconds=ttl)


def cache_response(ttl: Optional[int] = None, key_prefix: Optional[str] = None) -> Callable:
    """
    Decorator to cache endpoint responses.
    
    Supports both sync and async functions.
    
    Args:
        ttl: Time to live in seconds (defaults to CACHE_GET_TTL from settings)
        key_prefix: Optional prefix for cache key
        
    Usage:
        @router.get("/products")
        @cache_response(ttl=300)
        async def get_products(...):
            ...
    """
    import inspect
    
    def decorator(func: Callable) -> Callable:
        is_async = inspect.iscoroutinefunction(func)
        
        if is_async:
            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                # Skip caching if disabled
                if not settings.CACHE_ENABLED:
                    return await func(*args, **kwargs)
                
                # Get TTL
                cache_ttl = ttl or settings.CACHE_GET_TTL
                
                # Find Request object in args/kwargs
                request = None
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
                if not request:
                    request = kwargs.get("request")
                
                # If no request found, skip caching (might be a dependency)
                if not request:
                    return await func(*args, **kwargs)
                
                # Generate cache key
                cache_key = _generate_cache_key(request, cache_ttl)
                if key_prefix:
                    cache_key = f"{key_prefix}:{cache_key}"
                
                # Check cache
                if cache_key in _cache_store:
                    cached_data, cached_time = _cache_store[cache_key]
                    if _is_cache_valid(cached_time, cache_ttl):
                        logger.debug(f"Cache hit: {cache_key}")
                        return cached_data
                
                # Execute function and cache result
                result = await func(*args, **kwargs)
                
                # Only cache successful responses (not exceptions)
                if result is not None:
                    try:
                        _cache_store[cache_key] = (result, datetime.now())
                        logger.debug(f"Cache set: {cache_key}")
                    except Exception as e:
                        logger.warning(f"Failed to cache result: {e}")
                
                return result
            
            return async_wrapper
        else:
            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                # Skip caching if disabled
                if not settings.CACHE_ENABLED:
                    return func(*args, **kwargs)
                
                # Get TTL
                cache_ttl = ttl or settings.CACHE_GET_TTL
                
                # Find Request object in args/kwargs
                request = None
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
                if not request:
                    request = kwargs.get("request")
                
                # If no request found, skip caching (might be a dependency)
                if not request:
                    return func(*args, **kwargs)
                
                # Generate cache key
                cache_key = _generate_cache_key(request, cache_ttl)
                if key_prefix:
                    cache_key = f"{key_prefix}:{cache_key}"
                
                # Check cache
                if cache_key in _cache_store:
                    cached_data, cached_time = _cache_store[cache_key]
                    if _is_cache_valid(cached_time, cache_ttl):
                        logger.debug(f"Cache hit: {cache_key}")
                        return cached_data
                
                # Execute function and cache result
                result = func(*args, **kwargs)
                
                # Only cache successful responses (not exceptions)
                if result is not None:
                    try:
                        _cache_store[cache_key] = (result, datetime.now())
                        logger.debug(f"Cache set: {cache_key}")
                    except Exception as e:
                        logger.warning(f"Failed to cache result: {e}")
                
                return result
            
            return sync_wrapper
    
    return decorator


def invalidate_cache(pattern: Optional[str] = None):
    """
    Invalidate cache entries matching pattern.
    
    Args:
        pattern: Pattern to match cache keys (if None, clears all)
    """
    global _cache_store
    
    if pattern:
        keys_to_remove = [key for key in _cache_store.keys() if pattern in key]
        for key in keys_to_remove:
            del _cache_store[key]
        logger.info(f"Invalidated {len(keys_to_remove)} cache entries matching '{pattern}'")
    else:
        count = len(_cache_store)
        _cache_store.clear()
        logger.info(f"Cleared all {count} cache entries")


def get_cache_stats() -> dict:
    """Get cache statistics."""
    return {
        "enabled": settings.CACHE_ENABLED,
        "total_entries": len(_cache_store),
        "cache_keys": list(_cache_store.keys())[:10],  # First 10 keys as sample
    }

