FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
# Use uv as package manager for faster, cached installs (system install inside container)
RUN pip install --no-cache-dir uv && uv pip install --system --no-cache -r requirements.txt

COPY . .

# Create uploads directory
RUN mkdir -p uploads/images

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
