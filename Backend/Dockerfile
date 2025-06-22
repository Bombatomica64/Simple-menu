# Backend Dockerfile
FROM node:lts-alpine

# Install curl and bash for healthcheck and startup script
RUN apk add --no-cache curl bash

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Run database migrations on startup
RUN npx prisma migrate deploy || echo "Migration will run at startup"

# Create assets directory if it doesn't exist
RUN mkdir -p assets

# Make startup script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000



# Add health check endpoint
COPY healthcheck.js ./

# Use startup script
CMD ["bash", "/app/start.sh"]
