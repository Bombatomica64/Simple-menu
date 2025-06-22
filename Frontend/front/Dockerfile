# Frontend Dockerfile - Development with ng serve
FROM node:lts-alpine

# Install bash and wget for scripts and healthcheck
RUN apk add --no-cache bash wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy source code
COPY . .

# Build arguments for dynamic backend configuration (not used, keeping dynamic env)
ARG BACKEND_HOST=localhost
ARG BACKEND_PORT=3000

# Note: We keep using environment.dynamic for LAN network compatibility
# The dynamic environment automatically detects the host from window.location

# Make start script executable
RUN chmod +x start.sh

# Expose port 4200 (Angular dev server default)
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4200/ || exit 1

# Use the start script
CMD ["bash", "./start.sh"]
