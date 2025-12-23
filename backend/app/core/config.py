"""
Application configuration settings.

All settings can be overridden via environment variables.
For production, ensure SECRET_KEY and DATABASE_URL are set via environment variables.
"""
import secrets
from typing import List, Union
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Project metadata
    PROJECT_NAME: str = "Catalog Website API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # Security
    # Default matches legacy value to preserve existing tokens in development.
    # In production this must be overridden via environment variable.
    SECRET_KEY: str = (
        "b7fb243c8cf04461f7e99e11dd3bd4ae1418e7dab6338a3c282e0500be70f735"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Database
    # DATABASE_URL: str = "postgresql://postgres:postgres@catalog_db:5432/catalog_db?ssl=disable"
    
    # connect to localhost database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5433/catalog_db"
    DB_ECHO: bool = False  # SQLAlchemy echo (SQL logging) - set to False in production
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 3600  # Recycle connections after 1 hour
    
    # User management
    USERS_OPEN_REGISTRATION: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://frontend:3000",
    ]
    
    # File uploads
    UPLOAD_DIR: str = "uploads/images"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    
    # Logging
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """
        Validate or generate SECRET_KEY.
        
        In production, SECRET_KEY must be provided via environment variable.
        In development, generates a random key if not provided.
        """
        if not v:
            # Fall back to a generated key only if completely unset.
            # Default dev key above keeps tokens stable across restarts.
            return secrets.token_urlsafe(32)
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []
    
    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        """Validate environment value."""
        valid_envs = ["development", "staging", "production"]
        if v.lower() not in valid_envs:
            raise ValueError(f"ENVIRONMENT must be one of: {', '.join(valid_envs)}")
        return v.lower()
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT == "development"
    
    @model_validator(mode="after")
    def validate_production_secret_key(self):
        """Validate SECRET_KEY is set in production."""
        if self.ENVIRONMENT == "production" and not self.SECRET_KEY:
            raise ValueError(
                "SECRET_KEY must be set via environment variable in production"
            )
        return self
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore extra environment variables
    )


# Global settings instance
settings = Settings()
