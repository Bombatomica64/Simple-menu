# Simple Monitoring Options for Simple Menu

## Quick Start Guide

### Option 1: Prometheus + Grafana (Recommended for Raspberry Pi)
**Resource Requirements:** Low (512MB RAM)
**Best for:** System metrics, performance monitoring, alerts

```powershell
.\start-monitoring-simple.ps1
```

**What you get:**
- Real-time system metrics (CPU, memory, disk)
- Container monitoring
- Beautiful Grafana dashboards
- Lightweight and Pi-friendly

**Access:**
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090

---

### Option 2: ELK Stack (Higher resource requirements)
**Resource Requirements:** High (2GB+ RAM)
**Best for:** Log analysis, debugging, search

```powershell
.\start-monitoring-elk.ps1
```

**What you get:**
- Centralized log collection
- Full-text search of logs
- Log visualization and analysis
- Application debugging tools

**Access:**
- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

---

### Option 3: No Monitoring (Minimal)
Just run the basic application:

```powershell
docker-compose up -d
```

---

## Recommendations

### For Raspberry Pi 3/4 (2-4GB RAM):
✅ **Use Prometheus + Grafana** - Perfect balance of features and performance

### For Raspberry Pi 4 (8GB RAM) or Desktop:
✅ **Either option works** - Choose based on your needs:
- **Prometheus + Grafana** for metrics and performance
- **ELK Stack** for log analysis and debugging

### For Development/Testing:
✅ **ELK Stack** - Better for debugging application issues

---

## Quick Commands

### Start with simple monitoring:
```powershell
.\start-monitoring-simple.ps1
```

### Start with ELK monitoring:
```powershell
.\start-monitoring-elk.ps1
```

### Stop everything:
```powershell
docker-compose down
docker-compose -f docker-compose.monitoring-simple.yml down
# OR
docker-compose -f docker-compose.elk-simple.yml down
```

### View logs:
```powershell
docker-compose logs -f
```

---

## What's Different from Before

These new configurations are:
- ✅ **Simpler** - Based on proven docker/awesome-compose patterns
- ✅ **Lighter** - Reduced resource usage for Pi
- ✅ **Faster to start** - Minimal configuration files
- ✅ **Easy to maintain** - Standard configurations
- ✅ **Well documented** - Clear access points and usage

The previous monitoring configurations are still available but these new ones are recommended for production use.
