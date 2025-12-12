from typing import Optional, List
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = True
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    name: Optional[str] = None
    slug: Optional[str] = None

class Category(CategoryBase):
    id: int
    children: List['Category'] = []

    class Config:
        from_attributes = True

Category.update_forward_refs()
