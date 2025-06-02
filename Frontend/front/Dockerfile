# Frontend Dockerfile - Multi-stage build
FROM node:lts-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for dynamic backend configuration
ARG BACKEND_HOST=localhost
ARG BACKEND_PORT=3000

# Create dynamic environment file for Docker
RUN echo "export const environment = {" > src/environments/environment.docker.ts && \
    echo "  production: true," >> src/environments/environment.docker.ts && \
    echo "  apiUrl: 'http://${BACKEND_HOST}:${BACKEND_PORT}'," >> src/environments/environment.docker.ts && \
    echo "  wsUrl: 'ws://${BACKEND_HOST}:${BACKEND_PORT}/menu-updates'" >> src/environments/environment.docker.ts && \
    echo "};" >> src/environments/environment.docker.ts

# Update the main.ts to use docker environment in production
RUN sed -i 's/environment.dynamic/environment.docker/g' src/main.ts || true

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist/front /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
