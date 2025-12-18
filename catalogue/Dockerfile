FROM node:20-alpine

WORKDIR /app

# Install dependencies separately to leverage Docker layer caching
COPY package*.json ./
RUN npm ci --quiet

# Copy application source
COPY . .

EXPOSE 3000

# Run Next.js in dev mode listening on all interfaces
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

