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
            {"name": "Men", "slug": "men", "image_url": "https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?q=80&w=1000&auto=format&fit=crop"},
            {"name": "Women", "slug": "women", "image_url": "https://images.unsplash.com/photo-1525845859779-54d477ff291f?q=80&w=1000&auto=format&fit=crop"},
            {"name": "Kids", "slug": "kids", "image_url": "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000&auto=format&fit=crop"},
            {"name": "Accessories", "slug": "accessories", "image_url": "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1000&auto=format&fit=crop"},
        ]
        
        category_map = {}
        for cat_data in categories_data:
            category = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not category:
                category = Category(**cat_data)
                db.add(category)
            category_map[cat_data["slug"]] = category
        db.commit()
        logger.info("Categories created.")

        # Create Products
        logger.info("Creating products...")
        
        products_data = [
            # Women's Products
            {
                "name": "Floral Summer Dress",
                "slug": "floral-summer-dress",
                "description": "Beautiful floral dress perfect for summer occasions. Made with lightweight, breathable fabric.",
                "base_price": 49.99,
                "category_slug": "women",
                "variants": [
                    {"sku": "FSD-S", "size": "S", "color": "Red", "stock_quantity": 10},
                    {"sku": "FSD-M", "size": "M", "color": "Red", "stock_quantity": 15},
                    {"sku": "FSD-L", "size": "L", "color": "Red", "stock_quantity": 8},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            {
                "name": "Elegant Evening Gown",
                "slug": "elegant-evening-gown",
                "description": "Stunning evening gown with elegant design. Perfect for special occasions and formal events.",
                "base_price": 129.99,
                "category_slug": "women",
                "variants": [
                    {"sku": "EEG-S", "size": "S", "color": "Black", "stock_quantity": 5},
                    {"sku": "EEG-M", "size": "M", "color": "Black", "stock_quantity": 7},
                    {"sku": "EEG-L", "size": "L", "color": "Black", "stock_quantity": 4},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1566479179817-2782b1b5a0e8?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            {
                "name": "Casual Denim Jacket",
                "slug": "casual-denim-jacket",
                "description": "Classic denim jacket with modern fit. Versatile piece for any wardrobe.",
                "base_price": 79.99,
                "category_slug": "women",
                "variants": [
                    {"sku": "CDJ-S", "size": "S", "color": "Blue", "stock_quantity": 12},
                    {"sku": "CDJ-M", "size": "M", "color": "Blue", "stock_quantity": 15},
                    {"sku": "CDJ-L", "size": "L", "color": "Blue", "stock_quantity": 10},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            # Men's Products
            {
                "name": "Classic White T-Shirt",
                "slug": "classic-white-tshirt",
                "description": "Premium cotton t-shirt with perfect fit. Essential wardrobe staple.",
                "base_price": 29.99,
                "category_slug": "men",
                "variants": [
                    {"sku": "CWT-S", "size": "S", "color": "White", "stock_quantity": 20},
                    {"sku": "CWT-M", "size": "M", "color": "White", "stock_quantity": 25},
                    {"sku": "CWT-L", "size": "L", "color": "White", "stock_quantity": 18},
                    {"sku": "CWT-XL", "size": "XL", "color": "White", "stock_quantity": 15},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1503342217505-b0815a046baf?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            {
                "name": "Slim Fit Business Suit",
                "slug": "slim-fit-business-suit",
                "description": "Professional business suit with modern slim fit. Perfect for office and formal occasions.",
                "base_price": 299.99,
                "category_slug": "men",
                "variants": [
                    {"sku": "SFBS-M", "size": "M", "color": "Navy", "stock_quantity": 8},
                    {"sku": "SFBS-L", "size": "L", "color": "Navy", "stock_quantity": 10},
                    {"sku": "SFBS-XL", "size": "XL", "color": "Navy", "stock_quantity": 6},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1594938291221-94f18b46bb4a?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            {
                "name": "Casual Hoodie",
                "slug": "casual-hoodie",
                "description": "Comfortable and stylish hoodie for everyday wear. Made with premium materials.",
                "base_price": 59.99,
                "category_slug": "men",
                "variants": [
                    {"sku": "CH-S", "size": "S", "color": "Gray", "stock_quantity": 12},
                    {"sku": "CH-M", "size": "M", "color": "Gray", "stock_quantity": 15},
                    {"sku": "CH-L", "size": "L", "color": "Gray", "stock_quantity": 18},
                    {"sku": "CH-XL", "size": "XL", "color": "Gray", "stock_quantity": 10},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            # Kids Products
            {
                "name": "Kids Playful T-Shirt",
                "slug": "kids-playful-tshirt",
                "description": "Fun and colorful t-shirt for kids. Made with soft, child-friendly materials.",
                "base_price": 19.99,
                "category_slug": "kids",
                "variants": [
                    {"sku": "KPT-XS", "size": "XS", "color": "Blue", "stock_quantity": 15},
                    {"sku": "KPT-S", "size": "S", "color": "Blue", "stock_quantity": 20},
                    {"sku": "KPT-M", "size": "M", "color": "Blue", "stock_quantity": 18},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            {
                "name": "Kids Denim Shorts",
                "slug": "kids-denim-shorts",
                "description": "Durable and comfortable denim shorts perfect for active kids.",
                "base_price": 24.99,
                "category_slug": "kids",
                "variants": [
                    {"sku": "KDS-XS", "size": "XS", "color": "Blue", "stock_quantity": 12},
                    {"sku": "KDS-S", "size": "S", "color": "Blue", "stock_quantity": 15},
                    {"sku": "KDS-M", "size": "M", "color": "Blue", "stock_quantity": 10},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            # Accessories
            {
                "name": "Leather Watch",
                "slug": "leather-watch",
                "description": "Elegant leather watch with classic design. Perfect for any occasion.",
                "base_price": 149.99,
                "category_slug": "accessories",
                "variants": [
                    {"sku": "LW-ONE", "size": "One Size", "color": "Brown", "stock_quantity": 10},
                    {"sku": "LW-ONE-B", "size": "One Size", "color": "Black", "stock_quantity": 8},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            {
                "name": "Designer Sunglasses",
                "slug": "designer-sunglasses",
                "description": "Stylish designer sunglasses with UV protection. Available in multiple colors.",
                "base_price": 89.99,
                "category_slug": "accessories",
                "variants": [
                    {"sku": "DS-ONE", "size": "One Size", "color": "Black", "stock_quantity": 15},
                    {"sku": "DS-ONE-B", "size": "One Size", "color": "Brown", "stock_quantity": 12},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1511499767150-a49a00e2e11e?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
            {
                "name": "Leather Handbag",
                "slug": "leather-handbag",
                "description": "Premium leather handbag with spacious interior. Perfect for daily use.",
                "base_price": 199.99,
                "category_slug": "accessories",
                "variants": [
                    {"sku": "LH-ONE", "size": "One Size", "color": "Brown", "stock_quantity": 8},
                    {"sku": "LH-ONE-B", "size": "One Size", "color": "Black", "stock_quantity": 6},
                ],
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop", "is_primary": True},
                    {"image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop", "is_primary": False},
                ]
            },
        ]
        
        for prod_data in products_data:
            category_slug = prod_data.pop("category_slug")
            category = category_map.get(category_slug)
            if not category:
                logger.warning(f"Category {category_slug} not found, skipping product {prod_data['name']}")
                continue
                
            prod_data["category_id"] = category.id
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
                logger.info(f"Created product: {product.name}")
        logger.info("Products created.")
    finally:
        db.close()

def main() -> None:
    logger.info("Initializing service")
    init_db()
    logger.info("Service finished initializing")

if __name__ == "__main__":
    main()
