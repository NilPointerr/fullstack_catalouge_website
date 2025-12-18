from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.user import User
from app.models.product import Product
from app.models.category import Category

router = APIRouter()

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get admin dashboard statistics.
    """
    # Count users
    user_count = db.query(func.count(User.id)).scalar()

    # Count products
    product_count = db.query(func.count(Product.id)).scalar()

    # Count categories
    category_count = db.query(func.count(Category.id)).scalar()

    return {
        "total_users": user_count,
        "total_products": product_count,
        "total_categories": category_count,
    }
