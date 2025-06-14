# 🚀 Quick Start Guide - Unified Startup

## Overview
The unified startup scripts provide a single entry point for all Simple Menu deployment options with an interactive menu and command-line support.

## Usage

### Windows (PowerShell)
```powershell
# Interactive menu (recommended)
.\start.ps1

# Direct commands
.\start.ps1 -Mode basic          # Basic setup only
.\start.ps1 -Mode prometheus     # With Prometheus + Grafana
.\start.ps1 -Mode elk           # With ELK Stack
```

### Linux/macOS (Bash)
```bash
# Interactive menu (recommended)
./start.sh

# Direct commands
./start.sh basic          # Basic setup only
./start.sh prometheus     # With Prometheus + Grafana
./start.sh elk           # With ELK Stack
```

## Options Available

### 1. Basic Setup
- **What:** Just the Simple Menu application
- **Resources:** ~200MB RAM
- **Access:** http://localhost:3000
- **Best for:** Simple deployments, testing

### 2. Prometheus + Grafana (Recommended for Pi)
- **What:** System metrics, performance monitoring, beautiful dashboards
- **Resources:** ~512MB RAM
- **Access:** 
  - Simple Menu: http://localhost:3000
  - Grafana: http://localhost:3001 (admin/admin123)
  - Prometheus: http://localhost:9090
- **Best for:** Production monitoring, performance tracking

### 3. ELK Stack
- **What:** Log analysis, debugging, full-text search
- **Resources:** ~2GB RAM
- **Access:**
  - Simple Menu: http://localhost:3000
  - Kibana: http://localhost:5601
  - Elasticsearch: http://localhost:9200
- **Best for:** Development, debugging, log analysis

### 4. Stop All Services
- Stops all running containers
- Cleans up unused resources
- Safe shutdown of all services

### 5. View Service Status
- Shows running containers
- Displays resource usage
- System health check

## Features

### 🎯 **Smart System Detection**
- Automatic memory and CPU detection
- OS-specific optimizations
- Resource requirement warnings

### 🛡️ **Error Handling**
- Docker availability checks
- Service startup validation
- Graceful error recovery

### 📊 **Real-time Feedback**
- Color-coded status messages
- Progress indicators
- Clear access point information

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
