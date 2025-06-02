# Backend Dockerfile
FROM node:lts-alpine


# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create assets directory if it doesn't exist
RUN mkdir -p assets

# Expose port
EXPOSE 3000

# Add health check endpoint
COPY healthcheck.js ./

# Start the application
CMD ["npm", "start"]
