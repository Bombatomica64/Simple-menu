# Frontend Dockerfile - Angular SSR with Node.js (like the Medium article)
FROM node:lts-alpine AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application for production with SSR
RUN npm run build
RUN find dist -type f | sort

# Production stage with Node.js (not nginx - we're using SSR)
FROM node:lts-alpine AS final

# Create user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install wget for healthcheck
RUN apk add --no-cache wget

# Switch to app user
USER appuser
WORKDIR /usr/app

# Copy built application from build stage
COPY --from=build /app/dist/front/ ./
RUN ls -la ./

# Expose port 4000 (Angular SSR default)
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/ || exit 1

# Start the SSR server
CMD ["node", "server/server.mjs"]
