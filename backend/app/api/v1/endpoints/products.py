from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from app.api import deps
from app.models.product import Product, ProductVariant, ProductImage
from app.models.user import User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
) -> Any:
    """
    Retrieve products with filtering.
    """
    query = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    )
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
        
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
        
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=ProductSchema)
def read_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
) -> Any:
    """
    Get product by ID.
    """
    product = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductSchema)
def create_product(
    *,
    db: Session = Depends(deps.get_db),
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
    db.commit()
    db.refresh(db_product)
    
    # Create variants
    for variant in product_in.variants:
        db_variant = ProductVariant(**variant.dict(), product_id=db_product.id)
        db.add(db_variant)
        
    # Create images
    for image in product_in.images:
        db_image = ProductImage(**image.dict(), product_id=db_product.id)
        db.add(db_image)
        
    db.commit()
    
    # Refresh with relations
    product = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    ).filter(Product.id == db_product.id).first()
    return product
