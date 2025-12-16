from typing import Any, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session, selectinload
import json

from app.api import deps
from app.models.product import Product, ProductVariant, ProductImage
from app.models.user import User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate
from app.core.file_upload import save_multiple_files

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
) -> Any:
    """
    Retrieve products with filtering.
    """
    query = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    )
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
        
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
        
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=ProductSchema)
def read_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
) -> Any:
    """
    Get product by ID.
    """
    product = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductSchema)
async def create_product(
    request: Request,
    db: Session = Depends(deps.get_db),
    # File upload fields (for multipart/form-data)
    name: Optional[str] = Form(None, example="Classic Denim Jeans"),
    slug: Optional[str] = Form(None, example="classic-denim-jeans"),
    description: Optional[str] = Form(None, example="Premium quality denim jeans with perfect fit"),
    base_price: Optional[float] = Form(None, example=49.99),
    category_id: Optional[int] = Form(None, example=1),
    is_active: Optional[bool] = Form(None, example=True),
    variants: Optional[str] = Form(
        default='[]',
        description='JSON array string. Format: [{"sku": "string", "size": "string", "color": "string", "stock_quantity": 0, "price_override": null}]. Example: [{"sku": "JEANS-M-BLUE", "size": "M", "color": "Blue", "stock_quantity": 10, "price_override": null}]',
        example='[{"sku": "JEANS-M-BLUE", "size": "M", "color": "Blue", "stock_quantity": 10, "price_override": null}]'
    ),  # JSON string array
    images: List[UploadFile] = File([], description="Product image files (jpg, jpeg, png, gif, webp)"),  # File uploads
    image_urls: Optional[str] = Form(
        default='[]',
        description='JSON array string. Format: [{"image_url": "string", "is_primary": true}]. Example: [{"image_url": "https://example.com/image.jpg", "is_primary": true}]',
        example='[{"image_url": "https://example.com/image1.jpg", "is_primary": true}]'
    ),  # JSON string for existing URLs (optional)
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new product with file upload support for images.
    
    Supports multipart/form-data with file uploads.
    
    **Required fields:**
    - name: Product name (e.g., "Classic Denim Jeans")
    - slug: URL-friendly slug (e.g., "classic-denim-jeans")
    - base_price: Base price as float (e.g., 49.99)
    
    **Optional fields:**
    - description: Product description
    - category_id: Category ID (integer)
    - is_active: Whether product is active (true/false, default: true)
    - variants: JSON string array of variant objects
      Example: '[{"sku": "JEANS-M-BLUE", "size": "M", "color": "Blue", "stock_quantity": 10, "price_override": null}]'
    - images: Multiple image files (jpg, jpeg, png, gif, webp, max 10MB each)
    - image_urls: JSON string array for existing image URLs
      Example: '[{"image_url": "https://example.com/image.jpg", "is_primary": true}]'
    
    **Variant object structure:**
    - sku: Stock keeping unit (string, optional)
    - size: Size variant (string, optional, e.g., "S", "M", "L", "XL")
    - color: Color variant (string, optional, e.g., "Blue", "Red", "Black")
    - stock_quantity: Available stock (integer, required)
    - price_override: Override price for this variant (float, optional, null uses base_price)
    """
    # Check if using file upload (multipart/form-data)
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type or images or name is not None:
        # Using form data with file uploads
        if not name or not slug or base_price is None:
            raise HTTPException(status_code=400, detail="name, slug, and base_price are required")
        
        # Parse variants JSON - be lenient with invalid input
        variants_data = []
        if variants and variants.strip() and variants.strip() != '[]':
            try:
                # Try to parse as JSON
                parsed = json.loads(variants)
                if isinstance(parsed, list):
                    variants_data = parsed
                elif isinstance(parsed, dict):
                    # Single variant object, wrap in array
                    variants_data = [parsed]
                else:
                    # Not a valid variant format, use empty array
                    variants_data = []
            except (json.JSONDecodeError, ValueError):
                # If not valid JSON, treat as empty array (don't fail the request)
                variants_data = []
        
        # Parse image URLs JSON (for existing URLs) - be lenient
        image_urls_data = []
        if image_urls and image_urls.strip() and image_urls.strip() != '[]':
            try:
                parsed = json.loads(image_urls)
                if isinstance(parsed, list):
                    image_urls_data = parsed
                elif isinstance(parsed, str):
                    # Single URL string, wrap in array
                    image_urls_data = [parsed]
                else:
                    image_urls_data = []
            except (json.JSONDecodeError, ValueError):
                # If not valid JSON, treat as empty array
                image_urls_data = []
        
        # Save uploaded files
        uploaded_image_paths = []
        if images:
            uploaded_image_paths = await save_multiple_files(images)
        
        # Create product
        db_product = Product(
            name=name,
            slug=slug,
            description=description,
            base_price=base_price,
            category_id=category_id,
            is_active=is_active if is_active is not None else True,
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        # Create variants
        for variant_data in variants_data:
            db_variant = ProductVariant(
                sku=variant_data.get("sku"),
                size=variant_data.get("size"),
                color=variant_data.get("color"),
                stock_quantity=variant_data.get("stock_quantity", 0),
                price_override=variant_data.get("price_override"),
                product_id=db_product.id
            )
            db.add(db_variant)
        
        # Create images from uploaded files
        for idx, image_path in enumerate(uploaded_image_paths):
            db_image = ProductImage(
                image_url=image_path,
                is_primary=(idx == 0),  # First image is primary
                product_id=db_product.id
            )
            db.add(db_image)
        
        # Create images from provided URLs
        for idx, url_data in enumerate(image_urls_data):
            if isinstance(url_data, str):
                # Simple URL string
                db_image = ProductImage(
                    image_url=url_data,
                    is_primary=(len(uploaded_image_paths) == 0 and idx == 0),
                    product_id=db_product.id
                )
            elif isinstance(url_data, dict):
                # URL with metadata
                db_image = ProductImage(
                    image_url=url_data.get("image_url", ""),
                    is_primary=url_data.get("is_primary", False) or (len(uploaded_image_paths) == 0 and idx == 0),
                    product_id=db_product.id
                )
            db.add(db_image)
            
        db.commit()
        
        # Refresh with relations
        product = db.query(Product).options(
            selectinload(Product.variants),
            selectinload(Product.images)
        ).filter(Product.id == db_product.id).first()
        return product
    
    else:
        # Try to parse JSON body
        try:
            body = await request.json()
            product_in = ProductCreate(**body)
        except Exception:
            raise HTTPException(
                status_code=400, 
                detail="Product data required. Use multipart/form-data for file uploads or JSON body for URL-based images."
            )
        
        # Create product
        product_data = product_in.dict(exclude={"variants", "images"})
        db_product = Product(**product_data)
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        # Create variants
        for variant in product_in.variants:
            db_variant = ProductVariant(**variant.dict(), product_id=db_product.id)
            db.add(db_variant)
            
        # Create images
        for image in product_in.images:
            db_image = ProductImage(**image.dict(), product_id=db_product.id)
            db.add(db_image)
            
        db.commit()
        
        # Refresh with relations
        product = db.query(Product).options(
            selectinload(Product.variants),
            selectinload(Product.images)
        ).filter(Product.id == db_product.id).first()
        return product
