from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.api import deps
from app.models.user import User
from app.models.product import Product
from app.models.category import Category

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Get admin dashboard statistics.
    """
    # Count users
    user_count = await db.execute(select(func.count(User.id)))
    user_count = user_count.scalar()

    # Count products
    product_count = await db.execute(select(func.count(Product.id)))
    product_count = product_count.scalar()

    # Count categories
    category_count = await db.execute(select(func.count(Category.id)))
    category_count = category_count.scalar()

    return {
        "total_users": user_count,
        "total_products": product_count,
        "total_categories": category_count,
    }
