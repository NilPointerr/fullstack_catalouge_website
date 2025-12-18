-- Drop existing tables if any
DROP TABLE IF EXISTS showrooms CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price FLOAT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create product_variants table
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(255) UNIQUE,
    size VARCHAR(50),
    color VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0,
    price_override FLOAT
);

-- Create product_images table
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
);

-- Create wishlists table
CREATE TABLE wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create showrooms table
CREATE TABLE showrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    opening_hours JSONB NOT NULL,
    map_url VARCHAR(500),
    gallery_images JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Insert admin user (password: admin123)
-- Password hash for 'admin123': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyLqZsuukPeC
INSERT INTO users (email, hashed_password, full_name, is_active, is_superuser)
VALUES ('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyLqZsuukPeC', 'Admin User', TRUE, TRUE);

-- Insert categories
INSERT INTO categories (name, slug, description, image_url, is_active) VALUES 
('Women', 'women', 'Women''s fashion collection', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', TRUE),
('Men', 'men', 'Men''s fashion collection', 'https://images.unsplash.com/photo-1488161628813-99c974fc5b76?w=400', TRUE),
('Kids', 'kids', 'Kids'' fashion collection', 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400', TRUE);

-- Insert sample products for Women
INSERT INTO products (name, slug, description, base_price, is_active, category_id) VALUES 
('Floral Summer Dress', 'floral-summer-dress', 'Beautiful floral pattern dress perfect for summer. Made with lightweight breathable fabric.', 49.99, TRUE, 1),
('Classic White Shirt', 'classic-white-shirt', 'Elegant white shirt suitable for both casual and formal occasions.', 29.99, TRUE, 1),
('Denim Jacket', 'denim-jacket-women', 'Stylish denim jacket with modern fit. Perfect for layering.', 79.99, TRUE, 1),
('High-Waist Jeans', 'high-waist-jeans', 'Comfortable high-waist jeans with stretch fabric. Classic blue denim.', 59.99, TRUE, 1);

-- Insert sample products for Men
INSERT INTO products (name, slug, description, base_price, is_active, category_id) VALUES 
('Cotton T-Shirt', 'cotton-tshirt-men', 'Premium cotton t-shirt. Available in multiple colors. Comfortable fit.', 19.99, TRUE, 2),
('Formal Blazer', 'formal-blazer', 'Professional blazer for business meetings. Slim fit design.', 129.99, TRUE, 2),
('Casual Jeans', 'casual-jeans-men', 'Regular fit jeans. Durable denim with modern style.', 54.99, TRUE, 2),
('Sports Hoodie', 'sports-hoodie', 'Comfortable hoodie perfect for workouts and casual wear.', 44.99, TRUE, 2);

-- Insert sample products for Kids
INSERT INTO products (name, slug, description, base_price, is_active, category_id) VALUES 
('Kids T-Shirt Pack', 'kids-tshirt-pack', 'Pack of 3 colorful t-shirts for kids. Soft cotton material.', 24.99, TRUE, 3),
('Children Jeans', 'children-jeans', 'Durable jeans for active kids. Adjustable waist.', 34.99, TRUE, 3);

-- Insert product variants for Floral Summer Dress
INSERT INTO product_variants (product_id, sku, size, color, stock_quantity, price_override) VALUES 
(1, 'FSD-S-RED', 'S', 'Red', 10, NULL),
(1, 'FSD-M-RED', 'M', 'Red', 15, NULL),
(1, 'FSD-L-RED', 'L', 'Red', 8, NULL),
(1, 'FSD-S-BLUE', 'S', 'Blue', 12, NULL),
(1, 'FSD-M-BLUE', 'M', 'Blue', 20, NULL);

-- Insert product variants for other products
INSERT INTO product_variants (product_id, sku, size, color, stock_quantity) VALUES 
(2, 'CWS-S', 'S', 'White', 25),
(2, 'CWS-M', 'M', 'White', 30),
(2, 'CWS-L', 'L', 'White', 20),
(3, 'DJ-S', 'S', 'Blue', 15),
(3, 'DJ-M', 'M', 'Blue', 18),
(3, 'DJ-L', 'L', 'Blue', 12),
(4, 'HWJ-28', '28', 'Blue', 22),
(4, 'HWJ-30', '30', 'Blue', 25),
(4, 'HWJ-32', '32', 'Blue', 20),
(5, 'CTM-S-BLK', 'S', 'Black', 40),
(5, 'CTM-M-BLK', 'M', 'Black', 50),
(5, 'CTM-L-BLK', 'L', 'Black', 35),
(6, 'FB-40', '40', 'Navy', 15),
(6, 'FB-42', '42', 'Navy', 18),
(6, 'FB-44', '44', 'Navy', 12),
(7, 'CJM-30', '30', 'Blue', 30),
(7, 'CJM-32', '32', 'Blue', 35),
(7, 'CJM-34', '34', 'Blue', 25),
(8, 'SH-S', 'S', 'Grey', 28),
(8, 'SH-M', 'M', 'Grey', 32),
(8, 'SH-L', 'L', 'Grey', 24),
(9, 'KTP-4', '4', 'Multi', 20),
(9, 'KTP-6', '6', 'Multi', 25),
(9, 'KTP-8', '8', 'Multi', 22),
(10, 'CJ-4', '4', 'Blue', 18),
(10, 'CJ-6', '6', 'Blue', 22),
(10, 'CJ-8', '8', 'Blue', 20);

-- Insert product images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES 
-- Floral Summer Dress
(1, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&fm=jpg&fit=crop&q=80', TRUE),
(1, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- Classic White Shirt
(2, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&fm=jpg&fit=crop&q=80', TRUE),
(2, 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- Denim Jacket
(3, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&fm=jpg&fit=crop&q=80', TRUE),
(3, 'https://images.unsplash.com/photo-1543076659-9380cdf10613?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- High-Waist Jeans
(4, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&fm=jpg&fit=crop&q=80', TRUE),
(4, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- Cotton T-Shirt
(5, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&fm=jpg&fit=crop&q=80', TRUE),
(5, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- Formal Blazer
(6, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&fm=jpg&fit=crop&q=80', TRUE),
(6, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- Casual Jeans
(7, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&fm=jpg&fit=crop&q=80', TRUE),
(7, 'https://images.unsplash.com/photo-1624378515195-6bbdb73dac92?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- Sports Hoodie
(8, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&fm=jpg&fit=crop&q=80', TRUE),
(8, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- Kids T-Shirt Pack
(9, 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&fm=jpg&fit=crop&q=80', TRUE),
(9, 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&fm=jpg&fit=crop&q=80', FALSE),
-- Children Jeans
(10, 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&fm=jpg&fit=crop&q=80', TRUE),
(10, 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&fm=jpg&fit=crop&q=80', FALSE);

-- Verify the data
SELECT 'Users created:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Categories created:', COUNT(*) FROM categories
UNION ALL
SELECT 'Products created:', COUNT(*) FROM products
UNION ALL
SELECT 'Product variants created:', COUNT(*) FROM product_variants
UNION ALL
SELECT 'Product images created:', COUNT(*) FROM product_images;
