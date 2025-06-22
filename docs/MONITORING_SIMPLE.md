# Simple Monitoring Setup Guide

This guide provides easy monitoring setup options for the Simple Menu application.

> **Note**: For detailed monitoring options, see [MONITORING_OPTIONS.md](MONITORING_OPTIONS.md). For complete setup, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Quick Start

### Option 1: No Monitoring (Minimal Resources)
**Resource Requirements:** ~200MB RAM
**Best for:** Testing, minimal setups

```bash
# Start just the application
docker compose -f docker/docker-compose.unified.yml up -d backend frontend
```

**Access:**
- Simple Menu: http://localhost:3000

---

### Option 2: Basic Monitoring (Recommended for Raspberry Pi)
**Resource Requirements:** ~512MB RAM additional
**Best for:** System metrics, performance monitoring, production use

```bash
# Start with Prometheus + Grafana
docker compose -f docker/docker-compose.unified.yml up -d backend frontend prometheus grafana node-exporter
```

**What you get:**
- Real-time system metrics (CPU, memory, disk)
- Container monitoring
- Beautiful Grafana dashboards
- Performance alerts
- Lightweight and Pi-friendly

**Access:**
- Simple Menu: http://localhost:3000
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090

---

### Option 3: Full Monitoring Stack
**Resource Requirements:** ~2GB+ RAM additional
**Best for:** Development, debugging, high-resource environments

```bash
# Start complete monitoring stack
docker compose -f docker/docker-compose.unified.yml up -d
```

**What you get:**
- Everything from Option 2, plus:
- Centralized log collection (ELK stack)
- Full-text search of logs
- Log visualization and analysis
- Advanced debugging tools

**Access:**
- Simple Menu: http://localhost:3000
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090
- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

---

## Recommendations by Environment

### For Raspberry Pi 3/4 (2-4GB RAM):
✅ **Use Basic Monitoring (Option 2)** - Perfect balance of features and performance

### For Raspberry Pi 4 (8GB RAM) or High-Resource Systems:
✅ **Full Monitoring Stack (Option 3)** - Complete observability with metrics and logs

### For Development/Testing:
✅ **Full Monitoring Stack** - Better for debugging application issues

### For Production Deployments:
✅ **Basic Monitoring** - Reliable and efficient for monitoring production systems

---

## Management Commands

### Check Status
```bash
# View running services
docker compose -f docker/docker-compose.unified.yml ps

# Check resource usage
docker stats --no-stream
```

### View Logs
```bash
# All services
docker compose -f docker/docker-compose.unified.yml logs -f

# Specific service
docker compose -f docker/docker-compose.unified.yml logs -f backend
docker compose -f docker/docker-compose.unified.yml logs -f grafana
```

### Stop Services
```bash
# Stop all services
docker compose -f docker/docker-compose.unified.yml down

# Stop only monitoring (keep app running)
docker compose -f docker/docker-compose.unified.yml stop prometheus grafana elasticsearch kibana logstash
```

### Update Services
```bash
# Update and restart
git pull
docker compose -f docker/docker-compose.unified.yml up --build -d
```

---

## Grafana Dashboard Setup

Default dashboards are automatically loaded, but you can customize:

1. **Access Grafana**: http://localhost:3001 (admin/admin123)
2. **Import additional dashboards**: Go to + → Import
3. **Popular dashboard IDs**:
   - Node Exporter Full: 1860
   - Docker container monitoring: 193
   - System overview: 3662

## Troubleshooting

### High Resource Usage
- Use Option 1 (no monitoring) for minimal systems
- Stop unnecessary services
- Monitor with `docker stats`

### Services Won't Start
```bash
# Check for port conflicts
netstat -tlnp | grep -E ":(3001|9090|5601|9200)"

# Check Docker logs
docker compose -f docker/docker-compose.unified.yml logs

# Restart with fresh containers
docker compose -f docker/docker-compose.unified.yml down
docker system prune -f
docker compose -f docker/docker-compose.unified.yml up -d
```

---

## Related Documentation

- **[MONITORING_OPTIONS.md](MONITORING_OPTIONS.md)** - Detailed monitoring information
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete setup guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Advanced production deployment
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
