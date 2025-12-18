from typing import Any, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
import json
import math

from app.api import deps
from app.models.product import Product, ProductVariant, ProductImage
from app.models.user import User
from app.schemas.product import Product as ProductSchema, ProductCreate, ProductUpdate
from app.schemas.pagination import PaginatedResponse
from app.core.file_upload import save_multiple_files

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[ProductSchema])
def read_products(
    db: Session = Depends(deps.get_db),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(12, ge=1, le=100, description="Number of items per page"),
    skip: Optional[int] = Query(None, description="Offset (for backward compatibility, deprecated)"),
    limit: Optional[int] = Query(None, description="Limit (for backward compatibility, deprecated)"),
    category_id: Optional[int] = None,
    category_ids: Optional[str] = None,  # Comma-separated category IDs
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    color: Optional[str] = None,
    size: Optional[str] = None,
    sort_by: Optional[str] = Query(None, description="Sort order: 'featured', 'price_low', 'price_high', 'newest'"),
) -> Any:
    """
    Retrieve products with filtering, sorting, and pagination.
    
    Supports:
    - page: Page number (default: 1)
    - page_size: Items per page (default: 12, max: 100)
    - category_id: Single category ID (for backward compatibility)
    - category_ids: Comma-separated category IDs (e.g., "1,2,3")
    - search: Search by product name
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    - color: Filter by variant color
    - size: Filter by variant size
    - sort_by: Sort order - 'featured' (default/id), 'price_low', 'price_high', 'newest'
    """
    from sqlalchemy import or_, and_
    
    # Handle backward compatibility with skip/limit
    if skip is not None or limit is not None:
        if skip is not None:
            page = (skip // (limit or page_size)) + 1
        if limit is not None:
            page_size = limit
    
    # Build base query
    base_query = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    )
    
    # Category filtering - support both single and multiple
    if category_ids:
        # Parse comma-separated category IDs
        try:
            cat_ids = [int(cid.strip()) for cid in category_ids.split(",") if cid.strip()]
            if cat_ids:
                base_query = base_query.filter(Product.category_id.in_(cat_ids))
        except ValueError:
            pass
    elif category_id:
        base_query = base_query.filter(Product.category_id == category_id)
        
    if search:
        base_query = base_query.filter(Product.name.ilike(f"%{search}%"))
    
    # Price filtering
    if min_price is not None:
        base_query = base_query.filter(Product.base_price >= min_price)
    if max_price is not None:
        base_query = base_query.filter(Product.base_price <= max_price)
    
    # Color and size filtering (via variants)
    if color or size:
        # Join with variants for color/size filtering
        base_query = base_query.join(ProductVariant)
        
        if color:
            base_query = base_query.filter(ProductVariant.color.ilike(f"%{color}%"))
        if size:
            base_query = base_query.filter(ProductVariant.size.ilike(f"%{size}%"))
        
        # Use distinct to avoid duplicate products when multiple variants match
        base_query = base_query.distinct()
    
    # Apply sorting
    if sort_by == "price_low":
        base_query = base_query.order_by(Product.base_price.asc())
    elif sort_by == "price_high":
        base_query = base_query.order_by(Product.base_price.desc())
    elif sort_by == "newest":
        base_query = base_query.order_by(Product.created_at.desc())
    else:
        # Default: featured (sort by id, which typically reflects creation/featured order)
        base_query = base_query.order_by(Product.id.asc())
    
    # Get total count
    total = base_query.count()
    
    # Calculate pagination
    skip_count = (page - 1) * page_size
    pages = math.ceil(total / page_size) if total > 0 else 0
    
    # Get paginated results
    products = base_query.offset(skip_count).limit(page_size).all()
    
    # Sort images: primary first for each product
    for product in products:
        if product.images:
            product.images.sort(key=lambda img: (not img.is_primary, img.id))
    
    return PaginatedResponse(
        items=products,
        total=total,
        page=page,
        size=page_size,
        pages=pages
    )

@router.get("/trending", response_model=List[ProductSchema])
def get_trending_products(
    db: Session = Depends(deps.get_db),
    limit: int = Query(4, ge=1, le=20, description="Number of trending products to return"),
) -> Any:
    """
    Get trending products (newest active products).
    Returns the most recently created active products.
    """
    products = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    ).filter(
        Product.is_active == True
    ).order_by(
        Product.created_at.desc()
    ).limit(limit).all()
    
    # Sort images: primary first for each product
    for product in products:
        if product.images:
            product.images.sort(key=lambda img: (not img.is_primary, img.id))
    
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
    
    # Sort images: primary first
    if product.images:
        product.images.sort(key=lambda img: (not img.is_primary, img.id))
    
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
        
        # Sort images: primary first
        if product and product.images:
            product.images.sort(key=lambda img: (not img.is_primary, img.id))
        
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
        
        # Sort images: primary first
        if product and product.images:
            product.images.sort(key=lambda img: (not img.is_primary, img.id))
        
        return product

@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: int,
    request: Request,
    db: Session = Depends(deps.get_db),
    # File upload fields (for multipart/form-data)
    name: Optional[str] = Form(None),
    slug: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    base_price: Optional[float] = Form(None),
    category_id: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    variants: Optional[str] = Form(default='[]'),
    images: List[UploadFile] = File([]),
    image_urls: Optional[str] = Form(default='[]'),
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update product with file upload support for images.
    
    Supports multipart/form-data with file uploads.
    Only provided fields will be updated.
    """
    # Get existing product
    product = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if using file upload (multipart/form-data)
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type or images or name is not None:
        # Using form data with file uploads
        # Update fields if provided
        if name is not None:
            product.name = name
        if slug is not None:
            product.slug = slug
        if description is not None:
            product.description = description
        if base_price is not None:
            product.base_price = base_price
        if category_id is not None:
            product.category_id = category_id
        if is_active is not None:
            product.is_active = is_active
        
        db.add(product)
        db.commit()
        
        # Handle variants update if provided
        if variants and variants.strip() and variants.strip() != '[]':
            try:
                parsed = json.loads(variants)
                if isinstance(parsed, list):
                    # Delete existing variants
                    db.query(ProductVariant).filter(ProductVariant.product_id == product_id).delete()
                    # Create new variants
                    for variant_data in parsed:
                        db_variant = ProductVariant(
                            sku=variant_data.get("sku"),
                            size=variant_data.get("size"),
                            color=variant_data.get("color"),
                            stock_quantity=variant_data.get("stock_quantity", 0),
                            price_override=variant_data.get("price_override"),
                            product_id=product_id
                        )
                        db.add(db_variant)
            except (json.JSONDecodeError, ValueError):
                pass  # Ignore invalid JSON
        
        # Handle image management: delete images not in the keep list, then add new ones
        # Only process image_urls if explicitly provided (not empty and not just empty array)
        if image_urls and image_urls.strip() and image_urls.strip() != '[]' and image_urls.strip() != '':
            try:
                parsed = json.loads(image_urls)
                if isinstance(parsed, list) and len(parsed) > 0:
                    # Get URLs to keep
                    urls_to_keep = []
                    for url_data in parsed:
                        if isinstance(url_data, str) and url_data.strip():
                            urls_to_keep.append(url_data.strip())
                        elif isinstance(url_data, dict):
                            img_url = url_data.get("image_url", "").strip()
                            if img_url:
                                urls_to_keep.append(img_url)
                    
                    # Delete images that are not in the keep list
                    if urls_to_keep:
                        existing_images = db.query(ProductImage).filter(
                            ProductImage.product_id == product_id
                        ).all()
                        for existing_img in existing_images:
                            # Check if this image URL should be kept
                            should_keep = False
                            existing_url = existing_img.image_url.strip()
                            
                            for keep_url in urls_to_keep:
                                # Normalize URLs for comparison (handle both full and relative paths)
                                # Compare exact match, or if one ends with the other
                                if (existing_url == keep_url or 
                                    existing_url.endswith(keep_url) or 
                                    keep_url.endswith(existing_url) or
                                    existing_url in keep_url or
                                    keep_url in existing_url):
                                    should_keep = True
                                    break
                            
                            if not should_keep:
                                db.delete(existing_img)
                    
                    # Update primary status for kept images
                    has_primary = False
                    for url_data in parsed:
                        if isinstance(url_data, dict) and url_data.get("is_primary", False):
                            # Find and update the image
                            img_url = url_data.get("image_url", "").strip()
                            if img_url:
                                # Try exact match first
                                existing_img = db.query(ProductImage).filter(
                                    ProductImage.product_id == product_id,
                                    ProductImage.image_url == img_url
                                ).first()
                                
                                # If not found, try partial match
                                if not existing_img:
                                    existing_images = db.query(ProductImage).filter(
                                        ProductImage.product_id == product_id
                                    ).all()
                                    for img in existing_images:
                                        if img_url in img.image_url or img.image_url in img_url:
                                            existing_img = img
                                            break
                                
                                if existing_img:
                                    existing_img.is_primary = True
                                    has_primary = True
                                    db.add(existing_img)
                    
                    # If no primary was set, set first kept image as primary
                    if not has_primary:
                        first_img = db.query(ProductImage).filter(
                            ProductImage.product_id == product_id
                        ).first()
                        if first_img:
                            first_img.is_primary = True
                            db.add(first_img)
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing image_urls: {e}")
        
        # Handle new image uploads
        if images:
            uploaded_image_paths = await save_multiple_files(images)
            # Check if there's already a primary image
            existing_primary = db.query(ProductImage).filter(
                ProductImage.product_id == product_id,
                ProductImage.is_primary == True
            ).first()
            
            for idx, image_path in enumerate(uploaded_image_paths):
                # Set first uploaded image as primary if no primary exists
                is_primary = (not existing_primary and idx == 0)
                
                db_image = ProductImage(
                    image_url=image_path,
                    is_primary=is_primary,
                    product_id=product_id
                )
                db.add(db_image)
        
        db.commit()
        
        # Refresh with relations
        updated_product = db.query(Product).options(
            selectinload(Product.variants),
            selectinload(Product.images)
        ).filter(Product.id == product_id).first()
        
        # Sort images: primary first
        if updated_product and updated_product.images:
            updated_product.images.sort(key=lambda img: (not img.is_primary, img.id))
        
        return updated_product
    
    else:
        # Try to parse JSON body
        try:
            body = await request.json()
            product_in = ProductUpdate(**body)
        except Exception:
            raise HTTPException(
                status_code=400, 
                detail="Product data required. Use multipart/form-data for file uploads or JSON body."
            )
        
        # Update product fields
        update_data = product_in.dict(exclude_unset=True, exclude={"variants", "images"})
        for field, value in update_data.items():
            setattr(product, field, value)
        
        db.add(product)
        db.commit()
        db.refresh(product)
        
        # Refresh with relations
        updated_product = db.query(Product).options(
            selectinload(Product.variants),
            selectinload(Product.images)
        ).filter(Product.id == product_id).first()
        
        # Sort images: primary first
        if updated_product and updated_product.images:
            updated_product.images.sort(key=lambda img: (not img.is_primary, img.id))
        
        return updated_product

@router.delete("/{product_id}", response_model=ProductSchema)
def delete_product(
    *,
    db: Session = Depends(deps.get_db),
    product_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a product.
    """
    product = db.query(Product).options(
        selectinload(Product.variants),
        selectinload(Product.images)
    ).filter(Product.id == product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Store product data before deletion
    result = product
    
    # Delete product (cascade will handle variants and images)
    db.delete(product)
    db.commit()
    
    return result