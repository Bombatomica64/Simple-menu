# 🗂️ Project Structure Overview

This document explains the organized structure of the Simple Menu project.

## 📁 Main Directories

### `/Backend/` - Node.js Backend Server
- **Purpose**: Core application server with API endpoints
- **Key Files**: 
  - `src/index.js` - Main server entry point
  - `prisma/schema.prisma` - Database schema
  - `assets/` - Uploaded images and static files

### `/Frontend/` - Angular Frontend Application  
- **Purpose**: User interface and client-side logic
- **Key Files**:
  - `front/src/app/` - Angular components and services
  - `front/nginx.conf` - Production web server configuration

### `/docker/` - Docker Compose Configurations
- **Purpose**: Container orchestration files
- **Files**:
  - `docker-compose.unified.yml` - Complete monitoring stack (Recommended)
  - `docker-compose.monitoring-simple.yml` - Prometheus + Grafana
  - `docker-compose.elk-simple.yml` - Elasticsearch + Logstash + Kibana
  - `docker-compose.override.yml` - Development overrides

### `/monitoring/` - Monitoring Configurations
- **Purpose**: Configuration files for observability tools
- **Subdirectories**:
  - `unified/` - Complete monitoring stack configs
  - `simple/` - Basic Prometheus + Grafana configs
  - `elk-simple/` - Basic ELK stack configs

### `/scripts/` - Automation Scripts
- **Purpose**: Deployment, monitoring, and maintenance scripts
- **Subdirectories**:
  - `deployment/` - Deploy scripts and Docker helpers
  - `monitoring/` - Monitoring and performance scripts
  - `lan-setup/` - Network configuration scripts
  - `database/` - Database management utilities

### `/docs/` - Documentation
- **Purpose**: Project documentation and guides
- **Files**:
  - `QUICK_START.md` - Getting started guide
  - `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
  - `MONITORING_OPTIONS.md` - Monitoring setup options
  - `LAN-SETUP.md` - Network configuration guide

## 🚀 Quick Start Commands

### Basic Application
```powershell
# Start just the Simple Menu application
docker-compose up -d
```

### With Monitoring (Recommended)
```powershell
# Interactive menu with all options
.\start.ps1

# Direct unified monitoring deployment
.\start-unified.ps1
```

### Using Docker Compose Directly
```powershell
# Unified monitoring stack
docker-compose -f docker\docker-compose.unified.yml up -d

# Simple Prometheus monitoring
docker-compose -f docker\docker-compose.monitoring-simple.yml up -d

# ELK logging stack
docker-compose -f docker\docker-compose.elk-simple.yml up -d
```

## 📊 Access Points

| Service | URL | Credentials |
|---------|-----|------------|
| Simple Menu | http://localhost:4200 | - |
| Backend API | http://localhost:3000 | - |
| Grafana | http://localhost:3001 | admin/admin |
| Prometheus | http://localhost:9090 | - |
| Kibana | http://localhost:5601 | - |
| Elasticsearch | http://localhost:9200 | - |

## 🛠️ File Organization Benefits

1. **Cleaner Root Directory**: Only essential files remain in root
2. **Logical Grouping**: Related files are grouped by purpose
3. **Easy Navigation**: Clear structure for finding specific components
4. **Scalability**: Easy to add new scripts and configurations
5. **Maintenance**: Simplified updates and version control

## 🔧 Configuration Files

The main configuration files remain in the root directory:
- `docker-compose.yml` - Basic application stack
- `start.ps1` - Main startup script
- `start-unified.ps1` - Quick unified deployment
- `README.md` - Main project documentation

All deployment variations are now organized in the `/docker/` directory with clear naming conventions.
