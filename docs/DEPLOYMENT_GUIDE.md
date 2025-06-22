# Simple Menu Production Deployment Guide

> **Note**: For quick setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md). This guide covers advanced production deployment scenarios.

This guide provides comprehensive instructions for deploying the Simple Menu application in production environments, with emphasis on Raspberry Pi deployment with Docker and monitoring.

## 🎯 Overview

The Simple Menu application supports multiple deployment modes:
- **Basic deployment**: Application only (minimal resources)
- **With monitoring**: Prometheus + Grafana (recommended for production)
- **Full monitoring**: Unified stack with ELK + Prometheus + Grafana (high-resource environments)

## 📋 Prerequisites

### Hardware Requirements
- **Raspberry Pi 3B+ or newer** (4GB RAM recommended for monitoring)
- **microSD card**: 32GB+ (Class 10 or better)
- **Network connection**: Ethernet or WiFi
- **Power supply**: Official Raspberry Pi power adapter

### Software Requirements
- **Docker** and **Docker Compose** v2.0+
- **Node.js** 18+ (for local development)
- **Git** for repository management

## 🚀 Quick Start

### 1. System Setup (Raspberry Pi)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Reboot to apply changes
sudo reboot
```

### 2. Deploy Application

```bash
# Clone repository
git clone <repository-url> simple-menu
cd simple-menu

# Choose deployment mode:

# Basic (app only)
docker compose -f docker/docker-compose.unified.yml up -d backend frontend

# With monitoring (recommended)
./start-unified.ps1  # Windows
./start-unified.sh   # Linux/macOS

# Or use Docker directly
docker compose -f docker/docker-compose.unified.yml up -d
```

## 🔧 Configuration

### Environment Variables

Create `.env` file for custom configuration:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production

# Application
BACKEND_PORT=3000
FRONTEND_PORT=4200

# Monitoring (optional)
PM2_PUBLIC_KEY=your_pm2_public_key
PM2_SECRET_KEY=your_pm2_secret_key

# Performance Monitoring
GRAFANA_ADMIN_PASSWORD=admin123
```

### Docker Configuration

The application uses the unified Docker Compose configuration (`docker/docker-compose.unified.yml`):

```yaml
services:
  backend:
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 30s

  frontend:
    restart: always
    depends_on:
      backend:
        condition: service_healthy
```

### Resource Management

**Minimum requirements by deployment type:**

| Deployment Type | RAM | Storage | CPU |
|---|---|---|---|
| Basic (app only) | 512MB | 2GB | 1 core |
| With monitoring | 2GB | 4GB | 2 cores |
| Full monitoring | 4GB | 8GB | 2+ cores |
- 🚨 Alert notifications via email
- 📊 System resource monitoring
- 🌡️ CPU temperature monitoring (Raspberry Pi)
- 📝 Comprehensive logging

### Database Manager (`db-manager.sh`)

Database backup and recovery:

```bash
# Create manual backup
./db-manager.sh backup pre-update

# List available backups
./db-manager.sh list

# Restore from backup
./db-manager.sh restore /path/to/backup.db

# Database maintenance
./db-manager.sh maintain

# Verify database health
./db-manager.sh verify

# Cleanup old backups
./db-manager.sh cleanup
```

### Performance Monitor (`performance-monitor.sh`)

## 📊 Monitoring and Management

### Access Points

Once deployed, access the application and monitoring:

- **Simple Menu**: http://localhost:3000 (or your server IP)
- **Admin Panel**: http://localhost:3000/submit
- **Grafana Dashboard**: http://localhost:3001 (admin/admin123) - if monitoring enabled
- **Prometheus Metrics**: http://localhost:9090 - if monitoring enabled

### Docker Management

```bash
# View running services
docker compose -f docker/docker-compose.unified.yml ps

# View logs
docker compose -f docker/docker-compose.unified.yml logs -f

# Restart services
docker compose -f docker/docker-compose.unified.yml restart

# Stop all services
docker compose -f docker/docker-compose.unified.yml down

# Update and rebuild
git pull
docker compose -f docker/docker-compose.unified.yml up --build -d
```

### Health Monitoring

The system includes built-in health checks:

```bash
# Check application health
curl http://localhost:3000/health

# Check all services
docker compose -f docker/docker-compose.unified.yml ps
```

### Log Management

View application logs:

```bash
# Backend logs
docker compose -f docker/docker-compose.unified.yml logs -f backend

# Frontend logs  
docker compose -f docker/docker-compose.unified.yml logs -f frontend

# All logs
docker compose -f docker/docker-compose.unified.yml logs -f
```

## 🚨 Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check Docker status
docker info

# Check compose file syntax
docker compose -f docker/docker-compose.unified.yml config

# View service logs
docker compose -f docker/docker-compose.unified.yml logs

# Restart services
docker compose -f docker/docker-compose.unified.yml restart
```

#### Port Conflicts

```bash
# Check what's using ports
netstat -tlnp | grep -E ":(3000|4200|3001|9090)"

# Stop conflicting services
sudo systemctl stop <service-name>

# Or use different ports in docker-compose.yml
```

#### Database Issues

```bash
# Check database file permissions
ls -la Backend/prisma/dev.db

# Reset database (development only!)
cd Backend
npx prisma migrate reset --force
```

#### Memory Issues

```bash
# Check memory usage
free -h

# Check Docker container usage
docker stats

# Reduce services (disable monitoring if needed)
docker compose -f docker/docker-compose.unified.yml up -d backend frontend
```

### Recovery Procedures

#### Complete Reset

```bash
# Stop all services
docker compose -f docker/docker-compose.unified.yml down

# Remove all data (careful!)
docker compose -f docker/docker-compose.unified.yml down -v

# Clean Docker system
docker system prune -f

# Rebuild from scratch
docker compose -f docker/docker-compose.unified.yml up --build -d
```

#### Backup and Restore

```bash
# Create backup
cp Backend/prisma/dev.db backup/dev.db.$(date +%Y%m%d_%H%M%S)
cp -r Backend/assets backup/assets.$(date +%Y%m%d_%H%M%S)

# Restore from backup
cp backup/dev.db.YYYYMMDD_HHMMSS Backend/prisma/dev.db
cp -r backup/assets.YYYYMMDD_HHMMSS Backend/assets
```

## 📈 Performance Optimization

### Raspberry Pi Specific Optimizations

1. **Memory Management**:
   ```bash
   # Check available memory
   free -h
   
   # Monitor Docker memory usage
   docker stats --no-stream
   ```

2. **Docker Optimization**:
   ```yaml
   # Set resource limits in docker-compose.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '1.0'
   ```

3. **Database Optimization**:
   ```bash
   # SQLite optimization for Pi
   cd Backend
   npx prisma db push
   ```

### Network Optimization

The application includes several optimizations:

- **Gzip compression** enabled in nginx
- **Browser caching** for static assets  
- **WebSocket optimization** for real-time updates
- **Connection pooling** for database access

## 🔐 Security

### Built-in Security Features

1. **Container Security**:
   - Non-root user execution
   - Network isolation
   - Resource limits
   - Health monitoring

2. **Application Security**:
   - Input validation
   - File upload restrictions
   - CORS configuration
   - Rate limiting

3. **Network Security**:
   - Internal Docker networks
   - Exposed ports minimized
   - Health check endpoints only

## 📦 Backup and Maintenance

### Manual Backup

```bash
# Create complete backup
mkdir -p backup/$(date +%Y%m%d)

# Backup database
cp Backend/prisma/dev.db backup/$(date +%Y%m%d)/

# Backup uploaded assets
cp -r Backend/assets backup/$(date +%Y%m%d)/

# Backup configuration
cp docker/docker-compose.unified.yml backup/$(date +%Y%m%d)/
```

### Automated Maintenance

```bash
# Setup daily backup (cron job)
0 2 * * * cd /path/to/simple-menu && mkdir -p backup/$(date +\%Y\%m\%d) && cp Backend/prisma/dev.db backup/$(date +\%Y\%m\%d)/

# Cleanup old Docker data
0 3 * * 0 docker system prune -f
```

## 🔄 Updates and Deployment

### Application Updates

```bash
# Stop services
docker compose -f docker/docker-compose.unified.yml down

# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker/docker-compose.unified.yml up --build -d

# Verify deployment
curl http://localhost:3000/health
```

### Database Migrations

```bash
# Apply database changes
cd Backend
npx prisma migrate deploy
```

## 🎯 Production Checklist

Before deploying to production, verify:

- [ ] Docker and Docker Compose are properly installed
- [ ] All ports (3000, 4200, 3001, 9090) are available
- [ ] Sufficient system resources for chosen deployment mode
- [ ] Database file permissions are correct
- [ ] Network connectivity is stable
- [ ] Health checks return successful responses
- [ ] WebSocket connections work properly
- [ ] File upload functionality is tested
- [ ] Backup procedures are in place

## 📋 Quick Reference

### Essential Commands
```bash
# Deploy application
docker compose -f docker/docker-compose.unified.yml up -d

# View running services
docker compose -f docker/docker-compose.unified.yml ps

# View logs
docker compose -f docker/docker-compose.unified.yml logs -f

# Stop services
docker compose -f docker/docker-compose.unified.yml down

# Update deployment
git pull && docker compose -f docker/docker-compose.unified.yml up --build -d
```

### Health Check URLs
- **Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/submit  
- **Health Check**: http://localhost:3000/health
- **Grafana** (if enabled): http://localhost:3001
- **Prometheus** (if enabled): http://localhost:9090

### Troubleshooting Commands
```bash
# Check Docker status
docker info

# Check service health
curl http://localhost:3000/health

# Check container resources
docker stats

# View detailed logs
docker compose -f docker/docker-compose.unified.yml logs backend
```

---

For quick setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).  
For component details, see [COMPONENTS.md](COMPONENTS.md).  
For API documentation, see [API_REFERENCE.md](API_REFERENCE.md).
