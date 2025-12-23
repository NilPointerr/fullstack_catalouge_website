from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError
import logging

from app.api import deps
from app.models.category import Category
from app.models.user import User
from app.schemas.category import Category as CategorySchema, CategoryCreate, CategoryUpdate
from app.core.file_upload import save_uploaded_file

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[CategorySchema])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve categories.
    """
    # Use selectinload to eagerly load children
    categories = db.query(Category).options(
        selectinload(Category.children)
    ).filter(Category.parent_id == None).offset(skip).limit(limit).all()
    return categories

@router.post("/", response_model=CategorySchema)
def create_category(
    *,
    db: Session = Depends(deps.get_db),
    category_in: CategoryCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new category.
    """
    logger.info(f"Creating category: {category_in.name} (slug: {category_in.slug})")
    data = category_in.model_dump()
    parent_id = data.get("parent_id")
    if parent_id in (0, None):
        data["parent_id"] = None
    else:
        # ensure parent exists
        parent = db.query(Category).filter(Category.id == parent_id).first()
        if not parent:
            raise HTTPException(status_code=400, detail="Parent category not found")

    db_category = Category(**data)
    db.add(db_category)
    try:
        db.commit()
        db.refresh(db_category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    logger.info(f"Category created successfully with ID: {db_category.id}, image_url: {db_category.image_url}")
    return db_category

@router.put("/{category_id}", response_model=CategorySchema)
def update_category(
    *,
    db: Session = Depends(deps.get_db),
    category_id: int,
    category_in: CategoryUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a category.
    """
    logger.info(f"Updating category ID: {category_id}")
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    update_data = category_in.dict(exclude_unset=True)
    logger.info(f"Update data: {update_data}")
    for field, value in update_data.items():
        setattr(category, field, value)
        
    db.add(category)
    try:
        db.commit()
        db.refresh(category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    logger.info(f"Category updated successfully, image_url: {category.image_url}")
    return category


@router.post("/upload-image")
async def upload_category_image(
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_superuser),
):
    """
    Upload a category image and return its URL.
    """
    image_url = await save_uploaded_file(file)
    return {"image_url": image_url}

@router.delete("/{category_id}", response_model=CategorySchema)
def delete_category(
    *,
    db: Session = Depends(deps.get_db),
    category_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a category.
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    db.delete(category)
    db.commit()
    return category
