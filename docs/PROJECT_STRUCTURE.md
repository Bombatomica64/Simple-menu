# 🗂️ Project Structure Overview

This document explains the organized structure of the Simple Menu project.

> **Note**: For setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md). For component details, see [COMPONENTS.md](COMPONENTS.md).

## 📁 Main Directories

### `/Backend/` - Node.js Backend Server
- **Purpose**: Core application server with API endpoints and WebSocket support
- **Technology**: Node.js, Express, Prisma ORM, SQLite
- **Key Files**: 
  - `src/index.js` - Main server entry point
  - `prisma/schema.prisma` - Database schema
  - `assets/` - Uploaded images and static files
  - `src/routes/` - API endpoint definitions
  - `src/websocket/` - Real-time WebSocket handlers
  - `src/services/` - Business logic and data services

### `/Frontend/` - Angular Frontend Application  
- **Purpose**: User interface and client-side application
- **Technology**: Angular 20, TypeScript, PrimeNG, TailwindCSS
- **Key Files**:
  - `front/src/app/` - Angular components and services
  - `front/src/app/shared/` - Shared components (AppImageComponent)
  - `front/nginx.conf` - Production web server configuration
  - `front/angular.json` - Angular CLI configuration

### `/docker/` - Docker Compose Configurations
- **Purpose**: Container orchestration and deployment files
- **Files**:
  - `docker-compose.unified.yml` - Complete application + monitoring stack (Recommended)

### `/monitoring/` - Monitoring Configurations
- **Purpose**: Configuration files for observability tools
- **Subdirectories**:
  - `unified/` - Complete monitoring stack configs (Prometheus + Grafana + ELK)
  - `simple/` - Basic Prometheus + Grafana configs
  - `elk-simple/` - Basic ELK stack configs
  - `prometheus/` - Prometheus-specific configurations
  - `grafana/` - Grafana dashboards and provisioning

### `/scripts/` - Automation Scripts
- **Purpose**: Deployment, monitoring, and maintenance scripts
- **Subdirectories**:
  - `deployment/` - Deploy scripts and Docker helpers
  - `monitoring/` - Monitoring and performance scripts  
  - `lan-setup/` - Network configuration scripts
  - `database/` - Database management utilities

### `/docs/` - Documentation
- **Purpose**: Comprehensive project documentation
- **Files**:
  - `README.md` - Main project overview (in root)
  - `DEPLOYMENT.md` - Quick setup and deployment guide
  - `DEPLOYMENT_GUIDE.md` - Advanced production deployment
  - `API_REFERENCE.md` - REST API and WebSocket documentation
  - `COMPONENTS.md` - Technical component and service details
  - `MONITORING_OPTIONS.md` - Monitoring setup options
  - `MONITORING_SIMPLE.md` - Simple monitoring guide
  - `LAN-SETUP.md` - Network configuration guide
  - `PROJECT_STRUCTURE.md` - This file

## 🚀 Quick Start Commands

### Basic Application
```bash
# Start just the Simple Menu application
docker compose -f docker/docker-compose.unified.yml up -d backend frontend
```

### With Monitoring (Recommended)
```bash
# Basic monitoring (Prometheus + Grafana)
docker compose -f docker/docker-compose.unified.yml up -d backend frontend prometheus grafana node-exporter

# Full monitoring stack
docker compose -f docker/docker-compose.unified.yml up -d
```

### Development Mode
```bash
# Backend (from Backend/ directory)
npm install && npm start

# Frontend (from Frontend/front/ directory)
npm install && npm start
```

## 📊 Access Points

| Service | URL | Credentials | When Available |
|---------|-----|------------|----------------|
| Simple Menu | http://localhost:3000 | - | Always |
| Admin Panel | http://localhost:3000/submit | - | Always |
| Health Check | http://localhost:3000/health | - | Always |
| Grafana | http://localhost:3001 | admin/admin123 | With monitoring |
| Prometheus | http://localhost:9090 | - | With monitoring |
| Kibana | http://localhost:5601 | - | Full stack only |
| Elasticsearch | http://localhost:9200 | - | Full stack only |

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Simple Menu Application                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Angular 20)     │     Backend (Node.js)          │
│  • Standalone Components   │     • Express Server           │
│  • Angular Signals         │     • WebSocket Support        │
│  • HttpResource            │     • Prisma ORM               │
│  • SSR Compatible          │     • SQLite Database          │
│  • TailwindCSS + PrimeNG   │     • File Upload              │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────┐
│         Monitoring Stack    │    Optional (Resource Dependent) │
├─────────────────────────────┼─────────────────────────────────┤
│  Prometheus                 │     ELK Stack                   │
│  • Metrics Collection       │     • Elasticsearch             │
│  • Performance Monitoring   │     • Logstash                  │
│  • Alert Rules             │     • Kibana                    │
│                             │     • Log Aggregation           │
│  Grafana                    │     • Full-text Search         │
│  • Dashboards              │     • Log Analysis             │
│  • Visualization           │                                 │
│  • Real-time Charts        │                                 │
└─────────────────────────────┴─────────────────────────────────┘
```

## 🛠️ File Organization Benefits

1. **Cleaner Root Directory**: Only essential startup scripts in root
2. **Logical Grouping**: Related files grouped by purpose and technology
3. **Easy Navigation**: Clear structure for finding specific components
4. **Separation of Concerns**: Frontend, backend, monitoring, and docs separated
5. **Docker Integration**: All containerization files in dedicated folder
6. **Comprehensive Documentation**: Complete docs with clear cross-references
4. **Scalability**: Easy to add new scripts and configurations
5. **Maintenance**: Simplified updates and version control

## 🔧 Configuration Files

The main configuration files remain in the root directory:
- `docker-compose.yml` - Basic application stack
- `start.ps1` - Main startup script
- `start-unified.ps1` - Quick unified deployment
- `README.md` - Main project documentation

All deployment variations are now organized in the `/docker/` directory with clear naming conventions.

---

## Related Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete setup and deployment guide
- **[COMPONENTS.md](COMPONENTS.md)** - Technical component and service details
- **[API_REFERENCE.md](API_REFERENCE.md)** - REST API and WebSocket documentation
- **Main [README](../README.md)** - Project overview and quick start
