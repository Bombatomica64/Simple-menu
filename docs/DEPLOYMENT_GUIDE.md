# Simple Menu Raspberry Pi Deployment Guide

This guide provides comprehensive instructions for deploying the Simple Menu application on Raspberry Pi with Docker, ensuring robust production deployment with automatic recovery and monitoring.

## 🎯 Overview

The Simple Menu application is configured for reliable deployment on Raspberry Pi with:
- **Docker containerization** with automatic restart policies
- **Health monitoring** with automatic service recovery
- **Performance monitoring** and alerting
- **Database backup and recovery** mechanisms
- **Error handling** and graceful degradation
- **Production-ready nginx** configuration with fallback pages

## 📋 Prerequisites

### Hardware Requirements
- **Raspberry Pi 3B+ or newer** (4GB RAM recommended)
- **microSD card**: 32GB+ (Class 10 or better)
- **Network connection**: Ethernet or WiFi
- **Power supply**: Official Raspberry Pi power adapter

### Software Requirements
- **Raspberry Pi OS** (64-bit recommended)
- **Docker** and **Docker Compose**
- **Git** for deployment updates
- **Basic system tools**: curl, wget, jq

## 🚀 Quick Start

### 1. Initial System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Reboot to apply group changes
sudo reboot
```

### 2. Clone and Deploy

```bash
# Clone repository
git clone <repository-url> simple-menu
cd simple-menu

# Make scripts executable
chmod +x *.sh

# Run automated deployment
./deploy.sh
```

The deployment script will:
- ✅ Check system requirements
- 📦 Create database backup
- 🔧 Install dependencies
- 🚀 Deploy application with Docker
- ⚙️ Setup systemd services
- 🔍 Verify deployment

## 🔧 Configuration

### Environment Variables

Create `.env` file for custom configuration:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production

# Monitoring
ALERT_EMAIL=admin@example.com
CHECK_INTERVAL=60

# Performance Thresholds
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90
ALERT_THRESHOLD_TEMP=75
```

### Docker Configuration

The application uses production-optimized Docker configuration:

```yaml
# docker-compose.yml
services:
  backend:
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 30s

  frontend:
    restart: always
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4200/health"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 30s
```

## 🛠️ Management Scripts

### Health Monitor (`monitor.sh`)

Automatic health monitoring and recovery:

```bash
# Check current health
./monitor.sh --check

# Generate health report
./monitor.sh --report

# Run as daemon (auto-started by systemd)
./monitor.sh --daemon
```

**Features:**
- 🔍 Continuous health monitoring
- 🔄 Automatic service restart on failure
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

System performance tracking:

```bash
# Collect current metrics
./performance-monitor.sh collect

# Generate performance report
./performance-monitor.sh report

# Show current status
./performance-monitor.sh status

# Check for alerts
./performance-monitor.sh alert-check
```

## 📊 Monitoring and Alerting

### System Services

The deployment includes systemd services for automatic management:

```bash
# Check health monitor service
sudo systemctl status simple-menu-monitor.service

# Check application service
sudo systemctl status simple-menu.service

# View service logs
sudo journalctl -u simple-menu-monitor.service -f
```

### Log Files

Monitor application logs:

```bash
# Application logs
docker-compose logs -f

# Health monitor logs
tail -f /var/log/simple-menu-monitor.log

# Performance logs
tail -f /var/log/simple-menu-performance.log

# Database logs
tail -f /var/log/simple-menu-db.log
```

### Performance Metrics

The system collects metrics in CSV format:

- **System metrics**: `/var/log/simple-menu-metrics/system-YYYYMMDD.csv`
- **Docker metrics**: `/var/log/simple-menu-metrics/docker-YYYYMMDD.csv`
- **Application metrics**: `/var/log/simple-menu-metrics/application-YYYYMMDD.csv`

## 🚨 Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check Docker status
sudo systemctl status docker

# Check application logs
docker-compose logs

# Restart services
docker-compose restart
```

#### High Memory Usage

```bash
# Check memory usage
free -h

# Check Docker container usage
docker stats

# Restart containers to free memory
docker-compose restart
```

#### Database Issues

```bash
# Verify database
./db-manager.sh verify

# Create backup before fixing
./db-manager.sh backup emergency

# Run maintenance
./db-manager.sh maintain
```

#### High CPU Temperature

```bash
# Check temperature
cat /sys/class/thermal/thermal_zone0/temp

# If over 70°C, check cooling:
# - Clean dust from heatsink
# - Ensure proper ventilation
# - Consider active cooling
```

### Recovery Procedures

#### Complete Service Recovery

```bash
# Stop all services
docker-compose down

# Clean Docker system
docker system prune -f

# Rebuild and restart
docker-compose up --build -d

# Verify deployment
./monitor.sh --check
```

#### Database Recovery

```bash
# List available backups
./db-manager.sh list

# Restore from latest backup
./db-manager.sh restore /path/to/latest/backup.db

# Verify restoration
./db-manager.sh verify
```

## 📈 Performance Optimization

### Raspberry Pi Specific Optimizations

1. **Memory Management**:
   - Increased GPU memory split for headless operation
   - Swap file optimization
   - Memory limits for containers

2. **CPU Optimization**:
   - PM2 process management with CPU limits
   - Node.js heap size restrictions
   - Efficient WebSocket connection handling

3. **Storage Optimization**:
   - Log rotation and cleanup
   - Database vacuum operations
   - Docker image cleanup

### Network Optimization

1. **Nginx Configuration**:
   - Gzip compression enabled
   - Browser caching headers
   - Connection keep-alive
   - Request rate limiting

2. **WebSocket Optimization**:
   - Connection pooling
   - Heartbeat monitoring
   - Automatic reconnection
   - Dead connection cleanup

## 🔐 Security

### Security Features

1. **Container Security**:
   - Non-root user execution
   - Resource limits
   - Network isolation
   - Read-only filesystem where possible

2. **Nginx Security**:
   - Security headers (HSTS, CSP, etc.)
   - Request size limits
   - Rate limiting
   - Hidden server information

3. **System Security**:
   - Systemd service isolation
   - File permission restrictions
   - Log access controls

## 📦 Backup Strategy

### Automated Backups

The system includes automated backup strategies:

1. **Database Backups**:
   - Daily automated backups
   - Retention policy (30 days)
   - Both binary and SQL dumps
   - Integrity verification

2. **Configuration Backups**:
   - Docker compose files
   - Environment configurations
   - Service definitions

3. **Log Rotation**:
   - Daily log rotation
   - 7-day retention
   - Compression enabled

### Manual Backup

```bash
# Create comprehensive backup
./deploy.sh --backup-only

# Backup database only
./db-manager.sh backup manual-$(date +%Y%m%d)

# Backup configuration
tar -czf config-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml \
  docker-compose.override.yml \
  .env \
  *.sh
```

## 🔄 Updates and Maintenance

### Application Updates

```bash
# Pull latest code
git pull origin main

# Create backup before update
./db-manager.sh backup pre-update-$(date +%Y%m%d)

# Rebuild and deploy
docker-compose down
docker-compose up --build -d

# Verify update
./monitor.sh --check
```

### System Maintenance

```bash
# Weekly maintenance (run as cron job)
#!/bin/bash
# Database maintenance
./db-manager.sh maintain

# Performance cleanup
./performance-monitor.sh cleanup

# System cleanup
docker system prune -f
apt autoremove -y
```

### Cron Jobs

Add to crontab for automated maintenance:

```bash
# Edit crontab
crontab -e

# Add maintenance jobs
# Database backup (daily at 2 AM)
0 2 * * * /home/pi/simple-menu/db-manager.sh auto-backup

# Performance monitoring (every 5 minutes)
*/5 * * * * /home/pi/simple-menu/performance-monitor.sh collect

# Weekly maintenance (Sunday at 3 AM)
0 3 * * 0 /home/pi/simple-menu/db-manager.sh maintain
```

## 📞 Support and Maintenance

### Health Check URLs

- **Frontend**: http://localhost:4200/health
- **Backend**: http://localhost:3000/health
- **Application**: http://localhost:4200

### Monitoring Dashboard

Generate a real-time performance report:

```bash
# Generate HTML report
./performance-monitor.sh report

# View report in browser
# File will be saved to /tmp/simple-menu-performance-report.html
```

### Alert Configuration

Configure email alerts in `.env`:

```bash
ALERT_EMAIL=admin@example.com
SMTP_SERVER=localhost
SMTP_PORT=587
```

## 🎯 Production Checklist

Before going to production, verify:

- [ ] All services start automatically on boot
- [ ] Health monitoring is active and functional
- [ ] Database backups are working
- [ ] Performance monitoring is collecting metrics
- [ ] Email alerts are configured and tested
- [ ] Log rotation is properly configured
- [ ] Security headers are enabled
- [ ] Resource limits are appropriate
- [ ] Error pages are accessible
- [ ] WebSocket connections are stable

---

## 📋 Quick Reference

### Service Commands
```bash
# Start/Stop/Restart
docker-compose up -d
docker-compose down
docker-compose restart

# View logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend

# Service status
sudo systemctl status simple-menu-monitor.service
```

### Health Checks
```bash
# Quick health check
./monitor.sh --check

# Performance status
./performance-monitor.sh status

# Database health
./db-manager.sh verify
```

### Emergency Recovery
```bash
# Stop everything
docker-compose down

# Clean system
docker system prune -f

# Restore from backup
./db-manager.sh restore /path/to/backup.db

# Restart services
docker-compose up --build -d
```

This deployment is production-ready with comprehensive monitoring, automatic recovery, and robust error handling specifically optimized for Raspberry Pi hardware constraints.
