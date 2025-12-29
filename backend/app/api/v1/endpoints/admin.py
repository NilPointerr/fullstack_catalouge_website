from typing import Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.core.rate_limit import rate_limit_general
from app.core.cache import cache_response
from app.core.config import settings

router = APIRouter()

@router.get("/stats")
@rate_limit_general()
@cache_response(ttl=60, key_prefix="admin_stats")  # 1 minute cache for stats
async def get_admin_stats(
    request: Request,
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
