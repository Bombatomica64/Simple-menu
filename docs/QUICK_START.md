# 🚀 Quick Start Guide

> **Note**: This is the legacy quick start guide. For current setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Current Recommended Setup

### Docker Deployment (Recommended)
```bash
# Clone repository
git clone <repository-url> simple-menu
cd simple-menu

# Basic deployment
docker compose -f docker/docker-compose.unified.yml up -d backend frontend

# With monitoring (recommended for production)
docker compose -f docker/docker-compose.unified.yml up -d backend frontend prometheus grafana node-exporter

# Full monitoring stack (high-resource environments)
docker compose -f docker/docker-compose.unified.yml up -d
```

### Local Development
```bash
# Backend (from Backend/ directory)
npm install && npm start

# Frontend (from Frontend/front/ directory) 
npm install && npm start
```

**Access:**
- **Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/submit
- **Grafana** (if enabled): http://localhost:3001 (admin/admin123)

---

## Legacy Options (Deprecated)

> **Warning**: The following startup scripts are deprecated. Use the Docker Compose commands above instead.

### Windows (PowerShell) - Legacy
```powershell
# Interactive menu (deprecated)
.\start.ps1

# Direct commands (deprecated)  
.\start.ps1 -Mode basic          # Basic setup only
.\start.ps1 -Mode prometheus     # With Prometheus + Grafana
.\start.ps1 -Mode elk           # With ELK Stack
```

### Linux/macOS (Bash) - Legacy
```bash
# Interactive menu (deprecated)
./start.sh

# Direct commands (deprecated)
./start.sh basic          # Basic setup only
./start.sh prometheus     # With Prometheus + Grafana
./start.sh elk           # With ELK Stack
```

## Deployment Modes

### 1. Basic Deployment
- **What:** Just the Simple Menu application
- **Resources:** ~200MB RAM
- **Command:** `docker compose -f docker/docker-compose.unified.yml up -d backend frontend`
- **Access:** http://localhost:3000
- **Best for:** Minimal deployments, testing

### 2. Basic Monitoring (Recommended for Production)
- **What:** Application + Prometheus + Grafana monitoring
- **Resources:** ~512MB RAM additional
- **Command:** `docker compose -f docker/docker-compose.unified.yml up -d backend frontend prometheus grafana node-exporter`
- **Access:** 
  - Simple Menu: http://localhost:3000
  - Grafana: http://localhost:3001 (admin/admin123)
  - Prometheus: http://localhost:9090
- **Best for:** Production monitoring, Raspberry Pi

### 3. Full Monitoring Stack
- **What:** Application + Prometheus + Grafana + ELK Stack
- **Resources:** ~2GB RAM additional
- **Command:** `docker compose -f docker/docker-compose.unified.yml up -d`
- **Access:**
  - Simple Menu: http://localhost:3000
  - Grafana: http://localhost:3001 (admin/admin123)
  - Prometheus: http://localhost:9090
  - Kibana: http://localhost:5601
  - Elasticsearch: http://localhost:9200
- **Best for:** Development, debugging, high-resource environments

## Management Commands

```bash
# Check status
docker compose -f docker/docker-compose.unified.yml ps

# View logs
docker compose -f docker/docker-compose.unified.yml logs -f

# Stop services
docker compose -f docker/docker-compose.unified.yml down

# Update and restart
git pull && docker compose -f docker/docker-compose.unified.yml up --build -d
```

---

## Related Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete setup and deployment guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Advanced production deployment
- **[MONITORING_SIMPLE.md](MONITORING_SIMPLE.md)** - Simple monitoring setup
- **[LAN-SETUP.md](LAN-SETUP.md)** - Network configuration for multiple devices
- **[API_REFERENCE.md](API_REFERENCE.md)** - API and WebSocket documentation
- **[COMPONENTS.md](COMPONENTS.md)** - Technical component details

---

## Migration Notice

**This legacy quick start guide is preserved for reference. New deployments should use:**

1. **[DEPLOYMENT.md](DEPLOYMENT.md)** for current setup instructions
2. **Docker Compose** commands shown above for container deployment
3. **npm start** commands for local development

The legacy startup scripts (`start.ps1`, `start.sh`, etc.) may be deprecated in future versions.

### 🔄 **Cross-Platform**
- Windows PowerShell support
- Linux/macOS Bash support
- Consistent experience across platforms

## Quick Examples

### Start with monitoring (recommended):
```powershell
# Windows
.\start.ps1 -Mode prometheus

# Linux/macOS
./start.sh prometheus
```

### Interactive setup:
```powershell
# Windows
.\start.ps1

# Linux/macOS  
./start.sh
```

### Stop everything:
```powershell
# Run the script and select option 4
.\start.ps1
```

## Legacy Scripts

The following individual scripts are still available but the unified script is recommended:
- `start-monitoring-simple.ps1` → Use `start.ps1 -Mode prometheus`
- `start-monitoring-elk.ps1` → Use `start.ps1 -Mode elk`
- `docker-start.ps1` → Use `start.ps1 -Mode basic`

## System Requirements

| Setup Type | RAM | CPU | Disk |
|------------|-----|-----|------|
| Basic | 512MB+ | 1 core | 2GB |
| Prometheus | 1GB+ | 2 cores | 5GB |
| ELK Stack | 4GB+ | 4 cores | 10GB |

## Troubleshooting

### Docker not running
```
✗ Docker is not running or not installed
```
**Solution:** Start Docker Desktop or install Docker

### Low memory warning
```
⚠️ Low memory detected (0.8GB). This might affect performance.
```
**Solution:** Close other applications or choose a lighter setup

### Service startup failure
```
✗ Failed to start monitoring services
```
**Solution:** Check logs with `docker-compose logs` and ensure ports aren't in use

---

**💡 Tip:** Use the interactive menu for the best experience. It provides real-time system information and guides you through the setup process.
