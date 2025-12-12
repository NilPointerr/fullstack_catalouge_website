from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.models.user import User
from app.schemas.wishlist import Wishlist as WishlistSchema, WishlistCreate

router = APIRouter()

@router.get("/", response_model=List[WishlistSchema])
async def read_wishlist(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve current user's wishlist.
    """
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.product).selectinload(Product.images))
        .filter(Wishlist.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    wishlist_items = result.scalars().all()
    return wishlist_items

@router.post("/", response_model=WishlistSchema)
async def add_to_wishlist(
    *,
    db: AsyncSession = Depends(deps.get_db),
    wishlist_in: WishlistCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add product to wishlist.
    """
    # Check if already in wishlist
    result = await db.execute(
        select(Wishlist).filter(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == wishlist_in.product_id
        )
    )
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Product already in wishlist")
        
    # Check if product exists
    result = await db.execute(select(Product).filter(Product.id == wishlist_in.product_id))
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Product not found")

    db_wishlist = Wishlist(
        user_id=current_user.id,
        product_id=wishlist_in.product_id
    )
    db.add(db_wishlist)
    await db.commit()
    await db.refresh(db_wishlist)
    
    # Reload with product relationship
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.product).selectinload(Product.images))
        .filter(Wishlist.id == db_wishlist.id)
    )
    return result.scalars().first()

@router.delete("/{product_id}", response_model=WishlistSchema)
async def remove_from_wishlist(
    *,
    db: AsyncSession = Depends(deps.get_db),
    product_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove product from wishlist.
    """
    result = await db.execute(
        select(Wishlist).filter(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id
        )
    )
    wishlist_item = result.scalars().first()
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
        
    await db.delete(wishlist_item)
    await db.commit()
    return wishlist_item
