"""
Database session management.

Provides database engine and session dependency for FastAPI.
"""
import logging
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from app.core.config import settings

logger = logging.getLogger(__name__)

# Database engine configuration
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,  # SQL logging (disabled in production)
    poolclass=QueuePool,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_reset_on_return="commit",
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
        "options": "-c statement_timeout=30000",  # 30 second statement timeout
    },
)

# Log connection pool events in development
if settings.is_development:
    @event.listens_for(engine, "connect")
    def receive_connect(dbapi_conn, connection_record):
        """Log database connections in development."""
        logger.debug("Database connection established")

    @event.listens_for(engine, "checkout")
    def receive_checkout(dbapi_conn, connection_record, connection_proxy):
        """Log connection checkout in development."""
        logger.debug("Database connection checked out from pool")

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Session:
    """
    Dependency for getting database session.
    
    FastAPI will handle closing the session automatically.
    Yields a database session that is properly closed after use.
    
    Usage:
        @router.get("/items")
        def read_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
