from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean
from sqlalchemy.sql import func
from app.db.base import Base

class Showroom(Base):
    __tablename__ = "showrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip_code = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    opening_hours = Column(JSON, nullable=False)  # Store as JSON: {"monday": "10:00 AM - 8:00 PM", ...}
    map_url = Column(String)  # Google Maps embed URL or coordinates
    gallery_images = Column(JSON)  # Array of image URLs
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

