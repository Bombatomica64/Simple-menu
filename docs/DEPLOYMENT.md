# 🚀 Deployment Guide

This guide covers the two main deployment methods for Simple Menu: local development setup and Docker deployment.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [LAN Configuration](#lan-configuration)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Simple-menu
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm start
   ```

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd Frontend/front
   npm install
   npm start
   ```

4. **Access the application**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:3000
   - **Health Check**: http://localhost:3000/health

### Development Features

- **Hot Reload**: Both frontend and backend support hot reload during development
- **Database Studio**: Access the database with `npx prisma studio` (from Backend directory)
- **Real-time Updates**: WebSocket connection provides live updates across all clients
- **Debug Mode**: Full error logging and detailed console output

### Database Management

```bash
# Generate Prisma client (run from Backend directory)
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## Docker Deployment

### Prerequisites
- **Docker** and **Docker Compose**

### Quick Deployment

```bash
# Complete deployment with full monitoring stack
docker-compose -f docker\docker-compose.unified.yml up -d
```

### What's Included

The unified Docker deployment includes:

#### 🍝 Core Application
- **Frontend**: Angular application served via Nginx
- **Backend**: Node.js API server with WebSocket support
- **Database**: SQLite with persistent storage

#### 📊 Monitoring Stack
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and alerting
- **Node Exporter**: System metrics collection
- **cAdvisor**: Container metrics collection

#### 📋 Logging Stack
- **Elasticsearch**: Log storage and search engine
- **Logstash**: Log processing and enrichment
- **Kibana**: Log visualization and analysis
- **Filebeat**: Log collection and shipping

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| 🍝 **Simple Menu** | http://localhost:4200 | - |
| 🔧 **Backend API** | http://localhost:3000 | - |
| 📊 **Grafana** | http://localhost:3001 | admin/admin |
| 🔍 **Prometheus** | http://localhost:9090 | - |
| 📋 **Kibana** | http://localhost:5601 | - |
| 🔍 **Elasticsearch** | http://localhost:9200 | - |

### System Requirements

#### Minimum Requirements
- **RAM**: 4GB
- **CPU**: 2 cores
- **Storage**: 10GB free space

#### Recommended Requirements
- **RAM**: 6GB+
- **CPU**: 4+ cores
- **Storage**: 20GB+ free space

### Docker Management

```bash
# Check service status
docker-compose -f docker\docker-compose.unified.yml ps

# View logs
docker-compose -f docker\docker-compose.unified.yml logs -f [service-name]

# Stop services
docker-compose -f docker\docker-compose.unified.yml down

# Rebuild and restart
docker-compose -f docker\docker-compose.unified.yml up --build -d

# Remove all data (caution!)
docker-compose -f docker\docker-compose.unified.yml down -v
```

### Health Checks

```bash
# Application health
curl http://localhost:3000/health
curl http://localhost:4200

# Monitoring health
curl http://localhost:9090/-/healthy          # Prometheus
curl http://localhost:3001/api/health         # Grafana
curl http://localhost:9200/_cluster/health    # Elasticsearch
```

## LAN Configuration

### Automatic Setup (Windows)

```powershell
# Run the automated LAN setup script
.\scripts\lan-setup\setup-lan-auto.ps1
```

### Manual Setup

1. **Find your local IP address**
   ```bash
   # Windows
   ipconfig | findstr IPv4
   
   # Linux/macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

2. **Update frontend environment**
   ```typescript
   // Frontend/front/src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://YOUR_IP:3000',
     wsUrl: 'ws://YOUR_IP:3000/menu-updates'
   };
   ```

3. **For Docker deployment**
   ```bash
   # Update docker-compose.yml environment variables
   FRONTEND_API_URL=http://YOUR_IP:3000
   FRONTEND_WS_URL=ws://YOUR_IP:3000/menu-updates
   ```

4. **Restart the application**
   ```bash
   # Local development
   # Restart both frontend and backend servers
   
   # Docker
   docker-compose -f docker\docker-compose.unified.yml down
   docker-compose -f docker\docker-compose.unified.yml up -d
   ```

### Network Access

After LAN configuration, the application will be accessible from any device on the network:
- **Application**: http://YOUR_IP:4200
- **Admin Interface**: http://YOUR_IP:4200/menu
- **Slideshow**: http://YOUR_IP:4200/slideshow

## Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check if ports are in use
netstat -an | findstr :3000
netstat -an | findstr :4200

# Kill processes using the ports (Windows)
taskkill /f /im node.exe
taskkill /f /im ng.exe
```

#### Database Issues
```bash
# Reset database (development only)
cd Backend
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

#### WebSocket Connection Issues
```bash
# Check backend is running
curl http://localhost:3000/health

# Test WebSocket connection
# Use a WebSocket client or browser dev tools
```

#### Docker Issues
```bash
# View container logs
docker-compose -f docker\docker-compose.unified.yml logs backend
docker-compose -f docker\docker-compose.unified.yml logs frontend

# Check container status
docker-compose -f docker\docker-compose.unified.yml ps

# Free up space
docker system prune -a
```

#### Performance Issues

##### High Memory Usage
- Reduce Elasticsearch heap size in docker-compose.yml
- Limit Docker container memory usage
- Close unnecessary applications

##### Slow Response Times
- Check system resources with `docker stats`
- Verify network connectivity
- Check database performance in Grafana dashboards

#### LAN Access Issues

1. **Firewall Settings**
   - Ensure ports 3000 and 4200 are open
   - Check Windows Firewall or system firewall settings

2. **Network Configuration**
   - Verify all devices are on the same network
   - Check router settings for device communication

3. **Environment Configuration**
   - Verify IP addresses in environment files
   - Ensure frontend is pointing to correct backend URL

### Getting Help

1. **Check Logs**: Always start by checking application and container logs
2. **Health Endpoints**: Use `/health` endpoints to verify service status
3. **Network Tools**: Use `ping`, `curl`, and browser dev tools for debugging
4. **Documentation**: Refer to [API Reference](API_REFERENCE.md) for detailed API information

---

*For more information, see the main [README](../README.md) or other documentation files in the [docs](.) directory.*
