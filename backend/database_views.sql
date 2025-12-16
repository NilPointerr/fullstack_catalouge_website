-- Database Views for easier querying
-- This file contains helpful views to see products with their variants and images

-- View: products_with_variants
-- Shows all products with their variants in a flat structure
-- Each row represents one product-variant combination
CREATE OR REPLACE VIEW products_with_variants AS 
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.slug,
    p.description,
    p.base_price,
    p.is_active,
    p.category_id,
    pv.id as variant_id,
    pv.sku,
    pv.size,
    pv.color,
    pv.stock_quantity,
    pv.price_override,
    COALESCE(pv.price_override, p.base_price) as final_price
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
ORDER BY p.id, pv.id;

-- View: products_summary
-- Shows products with aggregated variant information
CREATE OR REPLACE VIEW products_summary AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.base_price,
    p.is_active,
    p.category_id,
    COUNT(pv.id) as variant_count,
    SUM(pv.stock_quantity) as total_stock,
    MIN(pv.stock_quantity) as min_stock,
    MAX(pv.stock_quantity) as max_stock,
    STRING_AGG(DISTINCT pv.size, ', ' ORDER BY pv.size) as available_sizes,
    STRING_AGG(DISTINCT pv.color, ', ' ORDER BY pv.color) as available_colors
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.name, p.slug, p.base_price, p.is_active, p.category_id
ORDER BY p.id;

-- View: products_with_images
-- Shows products with their images
CREATE OR REPLACE VIEW products_with_images AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.slug,
    p.base_price,
    pi.id as image_id,
    pi.image_url,
    pi.is_primary
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
ORDER BY p.id, pi.is_primary DESC, pi.id;

-- Example queries:
-- 
-- 1. See all products with their variants:
--    SELECT * FROM products_with_variants;
--
-- 2. See product summary with variant counts:
--    SELECT * FROM products_summary;
--
-- 3. See products with images:
--    SELECT * FROM products_with_images;
--
-- 4. See a specific product with all its variants:
--    SELECT * FROM products_with_variants WHERE product_id = 17;
--
-- 5. See products that have no variants:
--    SELECT * FROM products_summary WHERE variant_count = 0;

