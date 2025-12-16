from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.api import deps
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.models.user import User
from app.schemas.wishlist import Wishlist as WishlistSchema, WishlistCreate

router = APIRouter()

@router.get("/", response_model=List[WishlistSchema])
def read_wishlist(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve current user's wishlist.
    """
    wishlist_items = db.query(Wishlist).options(
        selectinload(Wishlist.product).selectinload(Product.images)
    ).filter(
        Wishlist.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return wishlist_items

@router.post("/", response_model=WishlistSchema)
def add_to_wishlist(
    *,
    db: Session = Depends(deps.get_db),
    wishlist_in: WishlistCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add product to wishlist.
    """
    # Check if already in wishlist
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == wishlist_in.product_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")
        
    # Check if product exists
    product = db.query(Product).filter(Product.id == wishlist_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_wishlist = Wishlist(
        user_id=current_user.id,
        product_id=wishlist_in.product_id
    )
    db.add(db_wishlist)
    db.commit()
    db.refresh(db_wishlist)
    
    # Reload with product relationship
    wishlist_item = db.query(Wishlist).options(
        selectinload(Wishlist.product).selectinload(Product.images)
    ).filter(Wishlist.id == db_wishlist.id).first()
    return wishlist_item

@router.delete("/{product_id}", response_model=WishlistSchema)
def remove_from_wishlist(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Remove product from wishlist.
    """
    wishlist_item = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")
        
    db.delete(wishlist_item)
    db.commit()
    return wishlist_item
