# 🚀 Quick Start Guide

Get the project running in 3 simple steps!

## Prerequisites

- Docker & Docker Compose installed
- Git installed

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd fullstack_catalouge_website
```

## Step 2: Start Everything

```bash
docker-compose up --build -d
```

This will:
- ✅ Build all Docker images
- ✅ Start PostgreSQL database
- ✅ Run database migrations automatically
- ✅ Seed initial data (admin user, categories, products)
- ✅ Start backend API (port 8000)
- ✅ Start frontend (port 3000)

## Step 3: Access the Application

Wait 30-60 seconds for services to start, then:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Login

- **Email**: `admin@example.com`
- **Password**: `admin123`

## That's It! 🎉

You're ready to use the application. Check the main [README.md](README.md) for more details.

## Troubleshooting

**Services not starting?**
```bash
docker-compose logs -f
```

**Need to reset everything?**
```bash
docker-compose down -v
docker-compose up --build -d
```

**Database issues?**
```bash
docker-compose restart db
docker-compose exec backend alembic upgrade head
```

