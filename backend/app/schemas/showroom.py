from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_serializer

class ShowroomBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    phone: str
    email: EmailStr
    opening_hours: Dict[str, str]  # e.g., {"monday": "10:00 AM - 8:00 PM", "tuesday": "10:00 AM - 8:00 PM", ...}
    map_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    is_active: Optional[bool] = True

class ShowroomCreate(ShowroomBase):
    pass

class ShowroomUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    opening_hours: Optional[Dict[str, str]] = None
    map_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    is_active: Optional[bool] = None

class Showroom(ShowroomBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        if dt is None:
            return None
        return dt.isoformat()

    class Config:
        from_attributes = True

