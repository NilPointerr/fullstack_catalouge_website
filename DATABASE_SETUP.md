# Quick Database Setup Guide

## Issue
The database tables are not initialized automatically due to the startup script timing issues.

## Solution - Manual Database Initialization

### Option 1: Using Python Script (Recommended)

1. **Stop and remove containers:**
```bash
cd "/home/dev62/Documents/catalog website"
docker-compose down
```

2. **Start only database and redis:**
```bash
docker-compose up -d db redis minio
```

3. **Wait 5 seconds, then start backend:**
```bash
sleep 5
docker-compose up -d backend
```

4. **Wait 5 seconds, then initialize database:**
```bash
sleep 5
docker-compose exec backend python -c "
from sqlalchemy import create_engine
from app.db.base import Base
from app.core.config import settings
from app.models import user, category, product, wishlist

engine = create_engine(settings.DATABASE_URL)
Base.metadata.create_all(bind=engine)
print('Tables created!')
"
```

5. **Seed initial data:**
```bash
docker-compose exec backend python app/initial_data.py
```

6. **Start remaining services:**
```bash
docker-compose up -d
```

### Option 2: Using PostgreSQL Client

1. **Access the database:**
```bash
docker exec -it catalog_db psql -U postgres -d catalog_db
```

2. **Run the SQL commands manually:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description VARCHAR,
    image_url VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    slug VARCHAR UNIQUE NOT NULL,
    description TEXT,
    base_price FLOAT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR UNIQUE,
    size VARCHAR,
    color VARCHAR,
    stock_quantity INTEGER DEFAULT 0,
    price_override FLOAT
);

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user (password: admin123)
INSERT INTO users (email, hashed_password, full_name, is_active, is_superuser)
VALUES ('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyLqZsuukPeC', 'Admin User', TRUE, TRUE);

-- Insert categories
INSERT INTO categories (name, slug, image_url) VALUES 
('Women', 'women', 'https://example.com/women.jpg'),
('Men', 'men', 'https://example.com/men.jpg'),
('Kids', 'kids', 'https://example.com/kids.jpg');
```

### Option 3: Simplest - Rebuild Everything

1. **Remove all containers and volumes:**
```bash
docker-compose down -v
```

2. **Update docker-compose.yml backend command to include initialization:**
Add a healthcheck and depends_on condition, or use an entrypoint script that waits for DB.

3. **Rebuild and start:**
```bash
docker-compose up --build -d
```

## Verification

After initialization, test:

```bash
# Check health
curl http://localhost:8000/health

# Try to fetch categories (should return empty array)
curl http://localhost:8000/api/v1/categories/

# Access Swagger docs
open http://localhost:8000/docs
```

## Login Credentials

After seeding:
- **Email:** admin@example.com
- **Password:** admin123

Test at: http://localhost:3000/login
