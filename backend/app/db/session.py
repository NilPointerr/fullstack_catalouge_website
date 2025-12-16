from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Use psycopg2 (sync) - DATABASE_URL already uses postgresql://
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    """
    Dependency for getting database session.
    FastAPI will handle closing the session automatically.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
