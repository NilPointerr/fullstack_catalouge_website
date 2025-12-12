from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.product import Product, ProductVariant, ProductImage
from app.models.user import User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
async def read_products(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
) -> Any:
    """
    Retrieve products with filtering.
    """
    query = select(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    )
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
        
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
        
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    products = result.scalars().all()
    return products

@router.get("/{product_id}", response_model=ProductSchema)
async def read_product(
    *,
    db: AsyncSession = Depends(deps.get_db),
    product_id: int,
) -> Any:
    """
    Get product by ID.
    """
    query = select(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    ).filter(Product.id == product_id)
    
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductSchema)
async def create_product(
    *,
    db: AsyncSession = Depends(deps.get_db),
    product_in: ProductCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new product.
    """
    # Create product
    product_data = product_in.dict(exclude={"variants", "images"})
    db_product = Product(**product_data)
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    
    # Create variants
    for variant in product_in.variants:
        db_variant = ProductVariant(**variant.dict(), product_id=db_product.id)
        db.add(db_variant)
        
    # Create images
    for image in product_in.images:
        db_image = ProductImage(**image.dict(), product_id=db_product.id)
        db.add(db_image)
        
    await db.commit()
    
    # Refresh with relations
    query = select(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    ).filter(Product.id == db_product.id)
    result = await db.execute(query)
    return result.scalars().first()
