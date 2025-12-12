from typing import Optional
from pydantic import BaseModel
from app.schemas.product import Product

class WishlistBase(BaseModel):
    product_id: int

class WishlistCreate(WishlistBase):
    pass

class Wishlist(WishlistBase):
    id: int
    user_id: int
    product: Product

    class Config:
        from_attributes = True
