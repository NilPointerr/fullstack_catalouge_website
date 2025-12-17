from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Catalog Website API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "b7fb243c8cf04461f7e99e11dd3bd4ae1418e7dab6338a3c282e0500be70f735"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@catalog_db:5432/catalog_db?ssl=disable"

    USERS_OPEN_REGISTRATION: bool = True

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://frontend:3000",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return []

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
