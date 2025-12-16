# Catalog Website - Production-Ready E-Commerce Platform

A full-stack catalog website similar to Nykaa Fashion, built for physical clothing showrooms.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **ORM**: SQLAlchemy (Async)
- **Migrations**: Alembic

## 📋 Prerequisites

- Docker & Docker Compose
- Git

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
cd "catalog website"
```

### 2. Start All Services

```bash
docker-compose up --build -d
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: PostgreSQL on port 5432
- **Redis**: Port 6380
- **MinIO**: http://localhost:9002 (Console: http://localhost:9003)

### 3. Access the Application

- **Website**: Open http://localhost:3000 in your browser
- **API Docs**: Open http://localhost:8000/docs for Swagger UI
- **Admin Login**: Use the seeded admin account:
  - Email: `admin@example.com`
  - Password: `admin123`

## 📁 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API routes
│   │   ├── core/            # Config, security
│   │   ├── db/              # Database session
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── main.py          # FastAPI app
│   ├── alembic/             # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── catalogue/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   └── store/           # Zustand stores
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🎯 Features

### Customer Features
- Browse product catalog
- Search and filter products
- View product details
- User registration and login
- Wishlist management
- Responsive design (mobile-first)

### Admin Features
- Admin dashboard with statistics
- Category management (CRUD)
- Product management (CRUD)
- Multi-image upload per product
- Product variant management (size, color, stock)
- User management

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/login/access-token` - Login
- `POST /api/v1/users/open` - Register
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile

### Products
- `GET /api/v1/products/` - List products
- `GET /api/v1/products/{id}` - Get product details
- `POST /api/v1/products/` - Create product (Admin)

### Categories
- `GET /api/v1/categories/` - List categories
- `POST /api/v1/categories/` - Create category (Admin)

### Wishlist
- `GET /api/v1/wishlist/` - Get wishlist
- `POST /api/v1/wishlist/` - Add to wishlist
- `DELETE /api/v1/wishlist/{product_id}` - Remove from wishlist

### Admin
- `GET /api/v1/admin/stats` - Dashboard statistics

## 🧪 Testing

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

### Reset Database

```bash
docker-compose down -v
docker-compose up --build -d
```

## 🔧 Development

### Backend Development

```bash
cd backend
pip install uv
uv pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd catalogue
npm install
npm run dev
```

### Default Ports
- Backend API: `8000`
- Frontend (Next.js): `3000`

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/catalog_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 🚀 Production Deployment

### Docker Deployment
1. Update environment variables for production
2. Use production Dockerfile (multi-stage builds)
3. Set up SSL certificates
4. Configure domain and DNS
5. Use production-ready database credentials

### Cloud Platforms
- **AWS**: EC2 + RDS + S3 + CloudFront
- **GCP**: Compute Engine + Cloud SQL + Cloud Storage
- **DigitalOcean**: Droplets + Managed PostgreSQL + Spaces

## 📊 Database Schema

### Tables
- `users` - User accounts
- `categories` - Product categories (hierarchical)
- `products` - Products
- `product_variants` - Product variants (size, color, price)
- `product_images` - Product images
- `wishlists` - User wishlists

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection (React)
- HTTPS support (production)

## 📄 License

MIT

## 👥 Support

For issues and questions, please open an issue on GitHub.
