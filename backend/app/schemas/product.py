from typing import Optional, List
from pydantic import BaseModel

# Image Schemas
class ProductImageBase(BaseModel):
    image_url: str
    is_primary: Optional[bool] = False

class ProductImageCreate(ProductImageBase):
    pass

class ProductImage(ProductImageBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

# Variant Schemas
class ProductVariantBase(BaseModel):
    sku: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    stock_quantity: int = 0
    price_override: Optional[float] = None

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariant(ProductVariantBase):
    id: int
    product_id: int

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    base_price: float
    is_active: Optional[bool] = True
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    variants: List[ProductVariantCreate] = []
    images: List[ProductImageCreate] = []

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    slug: Optional[str] = None
    base_price: Optional[float] = None

class Product(ProductBase):
    id: int
    variants: List[ProductVariant] = []
    images: List[ProductImage] = []

    class Config:
        from_attributes = True
