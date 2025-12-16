import logging

from app.db.session import SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.category import Category
from app.models.product import Product, ProductVariant, ProductImage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    db = SessionLocal()
    try:
        # Create Superuser
        logger.info("Creating superuser...")
        user = db.query(User).filter(User.email == "admin@example.com").first()
        if not user:
            user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin User",
                is_superuser=True,
                is_active=True,
            )
            db.add(user)
            db.commit()
            logger.info("Superuser created.")
        else:
            logger.info("Superuser already exists.")

        # Create Categories
        logger.info("Creating categories...")
        categories_data = [
            {"name": "Men", "slug": "men", "image_url": "https://example.com/men.jpg"},
            {"name": "Women", "slug": "women", "image_url": "https://example.com/women.jpg"},
            {"name": "Kids", "slug": "kids", "image_url": "https://example.com/kids.jpg"},
        ]
        
        for cat_data in categories_data:
            category = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not category:
                category = Category(**cat_data)
                db.add(category)
        db.commit()
        logger.info("Categories created.")

        # Create Products
        logger.info("Creating products...")
        # Get Women category
        women_cat = db.query(Category).filter(Category.slug == "women").first()
        
        if women_cat:
            products_data = [
                {
                    "name": "Floral Summer Dress",
                    "slug": "floral-summer-dress",
                    "description": "Beautiful floral dress for summer.",
                    "base_price": 49.99,
                    "category_id": women_cat.id,
                    "variants": [
                        {"sku": "FSD-S", "size": "S", "color": "Red", "stock_quantity": 10},
                        {"sku": "FSD-M", "size": "M", "color": "Red", "stock_quantity": 15},
                    ],
                    "images": [
                        {"image_url": "https://example.com/dress1.jpg", "is_primary": True},
                        {"image_url": "https://example.com/dress2.jpg", "is_primary": False},
                    ]
                }
            ]
            
            for prod_data in products_data:
                product = db.query(Product).filter(Product.slug == prod_data["slug"]).first()
                if not product:
                    # Create product
                    variants = prod_data.pop("variants")
                    images = prod_data.pop("images")
                    product = Product(**prod_data)
                    db.add(product)
                    db.commit()
                    db.refresh(product)
                    
                    # Create variants
                    for var_data in variants:
                        variant = ProductVariant(**var_data, product_id=product.id)
                        db.add(variant)
                        
                    # Create images
                    for img_data in images:
                        image = ProductImage(**img_data, product_id=product.id)
                        db.add(image)
                        
                    db.commit()
        logger.info("Products created.")
    finally:
        db.close()

def main() -> None:
    logger.info("Initializing service")
    init_db()
    logger.info("Service finished initializing")

if __name__ == "__main__":
    main()
