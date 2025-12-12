import asyncio
import sys
sys.path.insert(0, '/app')

from sqlalchemy import create_engine
from app.db.base import Base
from app.core.config import settings
from app.models import user, category, product, wishlist

# Create sync engine for create_all
sync_url = settings.DATABASE_URL
engine = create_engine(sync_url)

# Create all tables
Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")
