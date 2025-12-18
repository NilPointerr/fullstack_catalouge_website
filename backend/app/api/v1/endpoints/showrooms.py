from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
import json

from app.api import deps
from app.models.showroom import Showroom
from app.models.user import User
from app.schemas.showroom import Showroom as ShowroomSchema, ShowroomCreate, ShowroomUpdate
from app.core.file_upload import save_multiple_files

router = APIRouter()

@router.get("/", response_model=List[ShowroomSchema])
def read_showrooms(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(True, description="Filter to only active showrooms"),
) -> Any:
    """
    Retrieve all showrooms.
    """
    query = db.query(Showroom)
    if active_only:
        query = query.filter(Showroom.is_active == True)
    showrooms = query.offset(skip).limit(limit).all()
    return showrooms

@router.get("/{showroom_id}", response_model=ShowroomSchema)
def read_showroom(
    *,
    db: Session = Depends(deps.get_db),
    showroom_id: int,
) -> Any:
    """
    Get a specific showroom by ID.
    """
    showroom = db.query(Showroom).filter(Showroom.id == showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    return showroom

@router.post("/", response_model=ShowroomSchema)
async def create_showroom(
    *,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
    # Form fields
    name: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    zip_code: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    opening_hours: Optional[str] = Form(None),  # JSON string
    map_url: Optional[str] = Form(None),
    gallery_images: Optional[str] = Form(None),  # JSON string array
    is_active: Optional[bool] = Form(True),
    # File uploads
    images: Optional[List[UploadFile]] = File(None),
    # JSON body fallback
    showroom_in: Optional[ShowroomCreate] = None,
) -> Any:
    """
    Create new showroom with file upload support. Admin only.
    
    Supports both JSON body and multipart/form-data with file uploads.
    """
    # Check if using file upload (multipart/form-data)
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type or images or name is not None:
        # Using form data with file uploads
        if not all([name, address, city, state, zip_code, phone, email, opening_hours]):
            raise HTTPException(
                status_code=400, 
                detail="name, address, city, state, zip_code, phone, email, and opening_hours are required"
            )
        
        # Parse opening_hours JSON
        try:
            opening_hours_data = json.loads(opening_hours) if opening_hours else {}
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="opening_hours must be valid JSON")
        
        # Parse gallery_images JSON (for existing URLs)
        gallery_images_data = []
        if gallery_images and gallery_images.strip() and gallery_images.strip() != '[]':
            try:
                parsed = json.loads(gallery_images)
                if isinstance(parsed, list):
                    gallery_images_data = parsed
            except json.JSONDecodeError:
                gallery_images_data = []
        
        # Save uploaded files
        uploaded_image_paths = []
        if images:
            uploaded_image_paths = await save_multiple_files(images)
            # Add uploaded paths to gallery_images
            gallery_images_data.extend(uploaded_image_paths)
        
        # Create showroom
        db_showroom = Showroom(
            name=name,
            address=address,
            city=city,
            state=state,
            zip_code=zip_code,
            phone=phone,
            email=email,
            opening_hours=opening_hours_data,
            map_url=map_url,
            gallery_images=gallery_images_data if gallery_images_data else None,
            is_active=is_active if is_active is not None else True,
        )
        db.add(db_showroom)
        db.commit()
        db.refresh(db_showroom)
        return db_showroom
    else:
        # Using JSON body
        if not showroom_in:
            raise HTTPException(status_code=400, detail="Showroom data is required")
        showroom_data = showroom_in.model_dump()
        db_showroom = Showroom(**showroom_data)
        db.add(db_showroom)
        db.commit()
        db.refresh(db_showroom)
        return db_showroom

@router.put("/{showroom_id}", response_model=ShowroomSchema)
async def update_showroom(
    *,
    request: Request,
    db: Session = Depends(deps.get_db),
    showroom_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
    # Form fields
    name: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    zip_code: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    opening_hours: Optional[str] = Form(None),  # JSON string
    map_url: Optional[str] = Form(None),
    gallery_images: Optional[str] = Form(None),  # JSON string array
    is_active: Optional[bool] = Form(None),
    # File uploads
    images: Optional[List[UploadFile]] = File(None),
    # JSON body fallback
    showroom_in: Optional[ShowroomUpdate] = None,
) -> Any:
    """
    Update a showroom with file upload support. Admin only.
    
    Supports both JSON body and multipart/form-data with file uploads.
    """
    showroom = db.query(Showroom).filter(Showroom.id == showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    
    # Check if using file upload (multipart/form-data)
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type or images or name is not None:
        # Using form data with file uploads
        if name is not None:
            showroom.name = name
        if address is not None:
            showroom.address = address
        if city is not None:
            showroom.city = city
        if state is not None:
            showroom.state = state
        if zip_code is not None:
            showroom.zip_code = zip_code
        if phone is not None:
            showroom.phone = phone
        if email is not None:
            showroom.email = email
        if opening_hours is not None:
            try:
                showroom.opening_hours = json.loads(opening_hours)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="opening_hours must be valid JSON")
        if map_url is not None:
            showroom.map_url = map_url
        if is_active is not None:
            showroom.is_active = is_active
        
        # Handle gallery images
        gallery_images_data = list(showroom.gallery_images) if showroom.gallery_images else []
        
        # Parse gallery_images JSON (for existing URLs)
        if gallery_images and gallery_images.strip() and gallery_images.strip() != '[]':
            try:
                parsed = json.loads(gallery_images)
                if isinstance(parsed, list):
                    gallery_images_data = parsed
            except json.JSONDecodeError:
                pass
        
        # Save uploaded files
        if images:
            uploaded_image_paths = await save_multiple_files(images)
            gallery_images_data.extend(uploaded_image_paths)
        
        if gallery_images is not None:  # Only update if explicitly provided
            showroom.gallery_images = gallery_images_data if gallery_images_data else None
    else:
        # Using JSON body
        if not showroom_in:
            raise HTTPException(status_code=400, detail="Showroom update data is required")
        update_data = showroom_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(showroom, field, value)
    
    db.add(showroom)
    db.commit()
    db.refresh(showroom)
    return showroom

@router.delete("/{showroom_id}", response_model=ShowroomSchema)
def delete_showroom(
    *,
    db: Session = Depends(deps.get_db),
    showroom_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a showroom. Admin only.
    """
    showroom = db.query(Showroom).filter(Showroom.id == showroom_id).first()
    if not showroom:
        raise HTTPException(status_code=404, detail="Showroom not found")
    
    db.delete(showroom)
    db.commit()
    return showroom

