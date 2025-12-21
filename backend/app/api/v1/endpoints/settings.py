from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.settings import SiteSettings
from app.models.user import User
from app.schemas.settings import (
    SiteSettings as SiteSettingsSchema,
    SiteSettingsCreate,
    SiteSettingsUpdate,
    SettingsBulkUpdate
)

router = APIRouter()

@router.get("/", response_model=List[SiteSettingsSchema])
def read_settings(
    db: Session = Depends(deps.get_db),
    category: str = None,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve all settings or filter by category.
    """
    query = db.query(SiteSettings)
    if category:
        query = query.filter(SiteSettings.category == category)
    settings = query.all()
    return settings

@router.get("/{setting_key}", response_model=SiteSettingsSchema)
def read_setting(
    *,
    db: Session = Depends(deps.get_db),
    setting_key: str,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get a specific setting by key.
    """
    setting = db.query(SiteSettings).filter(SiteSettings.key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@router.post("/", response_model=SiteSettingsSchema)
def create_setting(
    *,
    db: Session = Depends(deps.get_db),
    setting_in: SiteSettingsCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create a new setting.
    """
    # Check if setting already exists
    existing = db.query(SiteSettings).filter(SiteSettings.key == setting_in.key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Setting with this key already exists")
    
    db_setting = SiteSettings(**setting_in.model_dump())
    db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return db_setting

@router.put("/{setting_key}", response_model=SiteSettingsSchema)
def update_setting(
    *,
    db: Session = Depends(deps.get_db),
    setting_key: str,
    setting_in: SiteSettingsUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a setting.
    """
    setting = db.query(SiteSettings).filter(SiteSettings.key == setting_key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    update_data = setting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)
    
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting

@router.post("/bulk-update")
def bulk_update_settings(
    *,
    db: Session = Depends(deps.get_db),
    settings_update: SettingsBulkUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update multiple settings at once.
    """
    updated = []
    for key, value in settings_update.settings.items():
        setting = db.query(SiteSettings).filter(SiteSettings.key == key).first()
        if setting:
            # Convert value to string based on value_type
            if setting.value_type == "boolean":
                setting.value = "true" if value else "false"
            elif setting.value_type == "integer":
                setting.value = str(int(value))
            else:
                setting.value = str(value) if value is not None else None
            updated.append(setting.key)
        else:
            # Create new setting if it doesn't exist
            new_setting = SiteSettings(
                key=key,
                value=str(value) if value is not None else None,
                value_type="string",
                category="general"
            )
            db.add(new_setting)
            updated.append(key)
    
    db.commit()
    return {"message": "Settings updated successfully", "updated_keys": updated}

@router.get("/public/general")
def get_public_settings(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get public settings (no auth required) - for frontend display.
    """
    public_keys = [
        "store_name",
        "store_logo",
        "store_email",
        "store_phone",
        "store_address",
        "currency",
        "currency_symbol",
        "meta_title",
        "meta_description",
        "social_facebook",
        "social_instagram",
        "social_twitter",
    ]
    
    settings = db.query(SiteSettings).filter(SiteSettings.key.in_(public_keys)).all()
    result = {}
    for setting in settings:
        # Convert value based on type
        if setting.value_type == "boolean":
            result[setting.key] = setting.value == "true"
        elif setting.value_type == "integer":
            result[setting.key] = int(setting.value) if setting.value else 0
        else:
            result[setting.key] = setting.value
    
    return result

