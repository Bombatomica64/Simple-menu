# Frontend Dockerfile - Development with ng serve
FROM node:lts-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy source code
COPY . .

# Build arguments for dynamic backend configuration
ARG BACKEND_HOST=localhost
ARG BACKEND_PORT=3000

# Create dynamic environment file for Docker
RUN echo "export const environment = {" > src/environments/environment.docker.ts && \
    echo "  production: false," >> src/environments/environment.docker.ts && \
    echo "  apiUrl: 'http://${BACKEND_HOST}:${BACKEND_PORT}'," >> src/environments/environment.docker.ts && \
    echo "  wsUrl: 'ws://${BACKEND_HOST}:${BACKEND_PORT}/menu-updates'," >> src/environments/environment.docker.ts && \
    echo "  getFullImageUrl: (imageUrl: string) => imageUrl.startsWith('http') ? imageUrl : \`http://${BACKEND_HOST}:${BACKEND_PORT}/\${imageUrl}\`" >> src/environments/environment.docker.ts && \
    echo "};" >> src/environments/environment.docker.ts

# Update the main.ts to use docker environment
RUN sed -i 's/environment.dynamic/environment.docker/g' src/main.ts || true

# Expose port 4200 (Angular dev server default)
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4200/ || exit 1

# Start Angular development server
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]
