# Quick Reference - Production Improvements

## 🚀 Quick Start

### Development (Default)
```bash
# Works out of the box with defaults
# SECRET_KEY auto-generated if not set
python -m uvicorn app.main:app --reload
```

### Production
```bash
# Set required environment variables
export SECRET_KEY="your-strong-secret-key-min-32-chars"
export DATABASE_URL="postgresql://user:pass@host:port/dbname"
export ENVIRONMENT="production"

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📝 Environment Variables

### Required (Production)
- `SECRET_KEY` - Minimum 32 characters
- `DATABASE_URL` - PostgreSQL connection string
- `ENVIRONMENT` - "production" | "staging" | "development"

### Optional (with defaults)
- `DB_ECHO` - SQL logging (default: false)
- `LOG_LEVEL` - DEBUG | INFO | WARNING | ERROR (default: INFO)
- `DB_POOL_SIZE` - Connection pool size (default: 5)
- `DB_MAX_OVERFLOW` - Max overflow connections (default: 10)

## 📁 New Files

- `app/core/exceptions.py` - Custom exception classes
- `app/core/logging_config.py` - Logging configuration
- `logs/` - Log directory (auto-created)

## 🔧 Key Changes

1. **Configuration**: All settings via environment variables
2. **Error Handling**: Centralized exception classes
3. **Logging**: Structured logging with file output in production
4. **Database**: Configurable connection pooling and logging
5. **Security**: No hardcoded secrets

## ✅ Verification

```bash
# Check health
curl http://localhost:8000/health

# Check API
curl http://localhost:8000/api/v1/products/
```

## 📖 Full Documentation

See `PRODUCTION_IMPROVEMENTS.md` for complete details.


