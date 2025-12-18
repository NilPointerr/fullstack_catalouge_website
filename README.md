# 🛍️ LUXE - Full-Stack Catalog Website

A modern, production-ready e-commerce catalog platform for physical clothing showrooms, built with Next.js and FastAPI.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start (Docker)](#-quick-start-docker)
- [Local Development](#-local-development)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Production Deployment](#-production-deployment)

## ✨ Features

### Customer Features
- 🏠 Browse product catalog with advanced filtering
- 🔍 Search products by name, category, price range
- 👁️ View detailed product information with image galleries
- 👤 User registration and authentication
- ❤️ Wishlist management
- 📍 View showroom locations and details
- 📱 Fully responsive design (mobile-first)

### Admin Features
- 📊 Admin dashboard with statistics
- 📦 Category management (CRUD operations)
- 🛍️ Product management with multiple images
- 🎨 Product variant management (size, color, stock)
- 📍 Showroom management (locations, hours, gallery)
- 👥 User management
- 🔐 Role-based access control

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 16
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: FastAPI multipart

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10+) and **Docker Compose** (version 2.0+)
- **Git**
- **Node.js** 18+ (for local development)
- **Python** 3.11+ (for local development)

### Verify Installation

```bash
docker --version
docker-compose --version
git --version
```

## 🐳 Quick Start (Docker)

The easiest way to get started is using Docker. All services will be automatically configured.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd fullstack_catalouge_website
```

### Step 2: Start All Services

```bash
docker-compose up --build -d
```

This command will:
- Build Docker images for backend and frontend
- Start PostgreSQL database
- Run database migrations automatically
- Seed initial data (admin user, categories, products)
- Start backend API server
- Start frontend Next.js application

### Step 3: Wait for Services to Start

Wait about 30-60 seconds for all services to initialize. You can check the logs:

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Step 4: Access the Application

Once all services are running, access:

- **🌐 Frontend**: http://localhost:3000
- **🔌 Backend API**: http://localhost:8000
- **📚 API Documentation**: http://localhost:8000/docs
- **🗄️ Database**: localhost:5432

### Step 5: Login

Use the default admin credentials:
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 💻 Local Development

If you prefer to run the project locally without Docker:

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/catalog_db
# SECRET_KEY=your-secret-key-here
# ACCESS_TOKEN_EXPIRE_MINUTES=30

# Run database migrations
alembic upgrade head

# Seed initial data
python app/initial_data.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd catalogue

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

### Local Database Setup

1. **Install PostgreSQL** (if not already installed)

2. **Create database**:
```bash
createdb catalog_db
# Or using psql:
psql -U postgres
CREATE DATABASE catalog_db;
```

3. **Run migrations**:
```bash
cd backend
alembic upgrade head
```

4. **Seed initial data**:
```bash
python app/initial_data.py
```

## 🗄️ Database Setup

### Automatic Setup (Docker)

When using Docker, the database is automatically:
- ✅ Created and initialized
- ✅ Migrations are run automatically via entrypoint script
- ✅ Initial data is seeded (admin user, categories, products)

### Manual Setup

If you need to manually set up the database:

```bash
# Using Docker
docker-compose exec backend alembic upgrade head
docker-compose exec backend python app/initial_data.py

# Or locally
cd backend
alembic upgrade head
python app/initial_data.py
```

### Database Migrations

The project uses Alembic for database migrations. All migrations are in `backend/alembic/versions/`.

**Create a new migration**:
```bash
cd backend
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

**Rollback a migration**:
```bash
alembic downgrade -1
```

**Check migration status**:
```bash
alembic current
alembic history
```

## 📁 Project Structure

```
fullstack_catalouge_website/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/        # API route handlers
│   │   │   └── api.py            # API router
│   │   ├── core/
│   │   │   ├── config.py         # Configuration
│   │   │   ├── security.py      # Authentication & hashing
│   │   │   └── file_upload.py   # File upload utilities
│   │   ├── db/
│   │   │   ├── base.py          # Base model
│   │   │   └── session.py       # Database session
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── category.py
│   │   │   ├── showroom.py
│   │   │   └── wishlist.py
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── initial_data.py      # Seed data script
│   │   └── main.py              # FastAPI application
│   ├── alembic/                 # Database migrations
│   │   ├── versions/            # Migration files
│   │   └── env.py
│   ├── uploads/                 # Uploaded files
│   ├── Dockerfile
│   ├── entrypoint.sh            # Startup script
│   ├── requirements.txt
│   └── alembic.ini
├── catalogue/
│   ├── src/
│   │   ├── app/                 # Next.js pages
│   │   │   ├── (public)/        # Public routes
│   │   │   ├── (auth)/          # Auth routes
│   │   │   ├── (user)/          # User routes
│   │   │   └── admin/           # Admin routes
│   │   ├── components/          # React components
│   │   │   ├── features/        # Feature components
│   │   │   ├── forms/           # Form components
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # UI components
│   │   ├── lib/                 # Utilities
│   │   │   ├── api.ts           # API client
│   │   │   └── utils.ts
│   │   └── store/               # Zustand stores
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Authentication
- `POST /api/v1/login/access-token` - User login
- `POST /api/v1/users/open` - User registration
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile

#### Products
- `GET /api/v1/products` - List products (with filters)
- `GET /api/v1/products/{id}` - Get product details
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/{id}` - Update product (Admin)
- `DELETE /api/v1/products/{id}` - Delete product (Admin)

#### Categories
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category (Admin)
- `PUT /api/v1/categories/{id}` - Update category (Admin)
- `DELETE /api/v1/categories/{id}` - Delete category (Admin)

#### Showrooms
- `GET /api/v1/showrooms` - List showrooms
- `GET /api/v1/showrooms/{id}` - Get showroom details
- `POST /api/v1/showrooms` - Create showroom (Admin)
- `PUT /api/v1/showrooms/{id}` - Update showroom (Admin)
- `DELETE /api/v1/showrooms/{id}` - Delete showroom (Admin)

#### Wishlist
- `GET /api/v1/wishlist` - Get user wishlist
- `POST /api/v1/wishlist` - Add to wishlist
- `DELETE /api/v1/wishlist/{product_id}` - Remove from wishlist

## 🔧 Troubleshooting

### Issue: Database connection errors

**Solution**:
```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Issue: Migrations not running

**Solution**:
```bash
# Manually run migrations
docker-compose exec backend alembic upgrade head

# Check migration status
docker-compose exec backend alembic current
```

### Issue: Port already in use

**Solution**:
```bash
# Stop all containers
docker-compose down

# Change ports in docker-compose.yml if needed
# Then restart
docker-compose up -d
```

### Issue: Frontend can't connect to backend

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in frontend environment
2. Ensure backend is running: `docker-compose ps backend`
3. Check backend logs: `docker-compose logs backend`
4. Verify CORS settings in backend

### Issue: Images not loading

**Solution**:
```bash
# Check uploads directory exists
docker-compose exec backend ls -la /app/uploads/images

# Restart backend
docker-compose restart backend
```

### Issue: Reset everything

**Solution**:
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build -d
```

## 🚀 Production Deployment

### Environment Variables

Create `.env` files for production:

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-production-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging

## 📝 Default Credentials

**Admin Account**:
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **Important**: Change these credentials in production!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check the [Troubleshooting](#-troubleshooting) section
- Review the API documentation at `/docs`

## 🎯 Next Steps

After setting up:
1. ✅ Login with admin credentials
2. ✅ Create categories
3. ✅ Add products with images
4. ✅ Set up showrooms
5. ✅ Customize the frontend theme
6. ✅ Configure production environment

---

**Happy Coding! 🚀**
