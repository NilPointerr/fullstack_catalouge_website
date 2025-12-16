from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Serve uploaded files - use absolute path for Docker compatibility
BASE_DIR = Path(__file__).resolve().parent.parent
upload_dir = BASE_DIR / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
(upload_dir / "images").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# CORS for local/dev (explicit list + permissive regex fallback)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_origin_regex=".*",  # keep local/dev flexible
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Catalog Website API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

