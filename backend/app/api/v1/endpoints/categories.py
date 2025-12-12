from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.category import Category
from app.models.user import User
from app.schemas.category import Category as CategorySchema, CategoryCreate, CategoryUpdate

router = APIRouter()

@router.get("/", response_model=List[CategorySchema])
async def read_categories(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve categories.
    """
    # Use selectinload to eagerly load children
    result = await db.execute(
        select(Category)
        .options(selectinload(Category.children))
        .filter(Category.parent_id == None) # Get root categories
        .offset(skip)
        .limit(limit)
    )
    categories = result.scalars().all()
    return categories

@router.post("/", response_model=CategorySchema)
async def create_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_in: CategoryCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new category.
    """
    db_category = Category(**category_in.dict())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategorySchema)
async def update_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_id: int,
    category_in: CategoryUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a category.
    """
    result = await db.execute(select(Category).filter(Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    update_data = category_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
        
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/{category_id}", response_model=CategorySchema)
async def delete_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a category.
    """
    result = await db.execute(select(Category).filter(Category.id == category_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    await db.delete(category)
    await db.commit()
    return category
