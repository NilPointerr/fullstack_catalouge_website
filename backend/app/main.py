from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

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

