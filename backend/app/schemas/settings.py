from typing import Optional, Dict, Any
from pydantic import BaseModel

class SiteSettingsBase(BaseModel):
    key: str
    value: Optional[str] = None
    value_type: str = "string"
    description: Optional[str] = None
    category: str = "general"

class SiteSettingsCreate(SiteSettingsBase):
    pass

class SiteSettingsUpdate(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class SiteSettings(SiteSettingsBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class SettingsBulkUpdate(BaseModel):
    settings: Dict[str, Any]  # key-value pairs

