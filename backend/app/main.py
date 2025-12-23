"""
FastAPI application entry point.

Main application setup with middleware, exception handlers, and route registration.
"""
import time
import logging
from pathlib import Path
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text

from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.exceptions import create_error_response
from app.db.session import engine

# Setup logging first
setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready catalog website API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs" if settings.is_development else None,  # Disable docs in production
    redoc_url="/redoc" if settings.is_development else None,  # Disable redoc in production
)

# CORS configuration
# Note: When allow_credentials=True, you cannot use allow_origin_regex=".*"
# Must use explicit origins list
cors_origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]

# Add common localhost variants for development
if settings.is_development:
    dev_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    for origin in dev_origins:
        if origin not in cors_origins:
            cors_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Serve uploaded files - use absolute path for Docker compatibility
BASE_DIR = Path(__file__).resolve().parent.parent
upload_dir = BASE_DIR / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
# Ensure images subdirectory exists
(upload_dir / "images").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

def _add_cors_headers(response: JSONResponse, request: Request) -> JSONResponse:
    """Add CORS headers to response if origin is allowed."""
    origin = request.headers.get("origin")
    if origin and origin in cors_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """
    Handle HTTP exceptions with CORS headers.
    
    Ensures CORS headers are present even on HTTP exceptions.
    """
    response = create_error_response(
        status_code=exc.status_code,
        detail=exc.detail,
        headers=exc.headers,
    )
    return _add_cors_headers(response, request)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle request validation errors with CORS headers.
    
    Returns detailed validation error information.
    """
    response = JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )
    return _add_cors_headers(response, request)


@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """
    Handle unhandled exceptions.
    
    Logs the full exception traceback and returns a generic error message
    to avoid exposing internal details to clients.
    """
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {exc}",
        exc_info=True,
        extra={"path": request.url.path, "method": request.method},
    )
    
    # In production, return generic error; in development, include more details
    detail = (
        f"Internal server error: {str(exc)}"
        if settings.is_development
        else "Internal server error"
    )
    
    response = create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=detail,
    )
    return _add_cors_headers(response, request)

@app.get("/", tags=["health"])
async def root() -> dict:
    """Root endpoint - API welcome message."""
    return {
        "message": "Welcome to Catalog Website API",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """
    Health check endpoint.
    
    Returns API health status. Useful for load balancers and monitoring.
    """
    return {"status": "ok", "environment": settings.ENVIRONMENT}

@app.on_event("startup")
async def startup_event() -> None:
    """
    Application startup event.
    
    Waits for database to be ready before accepting requests.
    Retries connection with exponential backoff.
    """
    max_retries = 10
    retry_delay = 2
    
    logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode")
    
    for attempt in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection established successfully")
            return
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(
                    f"Database connection attempt {attempt + 1}/{max_retries} failed: {e}. "
                    f"Retrying in {retry_delay}s..."
                )
                time.sleep(retry_delay)
            else:
                logger.error(
                    f"Failed to connect to database after {max_retries} attempts: {e}"
                )
                raise

# Include API routers
from app.api.v1.api import api_router

app.include_router(api_router, prefix=settings.API_V1_STR)

logger.info(f"API routes registered under {settings.API_V1_STR}")

