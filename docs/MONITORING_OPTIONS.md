# Monitoring Stack Options for Simple Menu

This document outlines monitoring solutions for the Simple Menu application using industry-standard tools.

> **Note**: For quick setup, see [DEPLOYMENT.md](DEPLOYMENT.md). For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Deployment Options

### Option 1: Basic Deployment (No Monitoring)
**Resource Requirements**: Minimal (~200MB RAM)
```bash
# Start only the core application
docker compose -f docker/docker-compose.unified.yml up -d backend frontend
```

### Option 2: Prometheus + Grafana (Recommended)
**Resource Requirements**: Low (~512MB RAM additional)
```bash
# Start with monitoring
docker compose -f docker/docker-compose.unified.yml up -d backend frontend prometheus grafana node-exporter
```

### Option 3: Full Monitoring Stack
**Resource Requirements**: High (~2GB RAM additional)
```bash
# Start complete monitoring stack
docker compose -f docker/docker-compose.unified.yml up -d
```

## Option Details

### Prometheus + Grafana Stack

**Benefits:**
- **Time-series Metrics**: Perfect for performance monitoring
- **Lightweight**: More suitable for Raspberry Pi
- **Rich Dashboards**: Beautiful, interactive dashboards
- **Alerting**: Built-in alert manager
- **Real-time Monitoring**: Live metrics collection

**What you get:**
- System metrics (CPU, memory, disk, network)
- Container metrics (Docker stats)
- Application metrics (response times, error rates)
- Pre-configured dashboards
- Alert notifications

**Access:**
- Grafana: http://localhost:3001 (admin/admin123)
- Prometheus: http://localhost:9090

### ELK Stack (Elasticsearch + Logstash + Kibana)

**Benefits:**
- **Centralized Logging**: All application logs in one place
- **Powerful Search**: Full-text search across all logs
- **Rich Visualizations**: Custom dashboards and charts
- **Real-time Analysis**: Live log streaming and analysis
- **Pattern Detection**: Anomaly identification

**What you get:**
- Centralized log collection from all containers
- Full-text search capabilities
- Log visualization and analysis
- Error tracking and debugging
- Performance analysis through logs

**Access:**
- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

## Recommendation for Different Environments

### Raspberry Pi / Low-Resource Environments
**Recommended**: Prometheus + Grafana
- Uses about 1/3 the memory of ELK
- Better performance for metrics collection
- Faster startup times
- Built-in alerting without additional components
- Many pre-built ARM images available

### High-Resource Environments / Development
**Recommended**: Full Monitoring Stack
- Complete observability with both metrics and logs
- Powerful debugging capabilities
- Comprehensive analysis tools
- Professional-grade monitoring

### Production Environments
**Recommended**: Prometheus + Grafana + External Logging
- Use Prometheus/Grafana for metrics
- Send logs to external service (e.g., cloud logging)
- Maintains performance while providing comprehensive monitoring

## Setup Instructions

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url> simple-menu
   cd simple-menu
   ```

2. **Choose your monitoring level:**
   ```bash
   # Basic (no monitoring)
   docker compose -f docker/docker-compose.unified.yml up -d backend frontend
   
   # With Prometheus + Grafana (recommended)
   docker compose -f docker/docker-compose.unified.yml up -d backend frontend prometheus grafana node-exporter
   
   # Full stack (high resource)
   docker compose -f docker/docker-compose.unified.yml up -d
   ```

### Configuration

The monitoring stack is pre-configured with:
- **Grafana dashboards** for system and application metrics
- **Prometheus targets** for all monitored services
- **Alert rules** for common issues (high CPU, memory, errors)
- **Log collection** from all application containers

### Customization

To modify monitoring configuration:
- **Grafana dashboards**: Edit files in `monitoring/unified/dashboards/`
- **Prometheus config**: Edit `monitoring/unified/prometheus.yml`
- **Alert rules**: Edit files in `monitoring/unified/rules/`
- **Log parsing**: Edit `monitoring/unified/logstash.conf`

---

## Related Documentation

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Advanced production deployment
- **[MONITORING_SIMPLE.md](MONITORING_SIMPLE.md)** - Simple monitoring setup guide
- **[COMPONENTS.md](COMPONENTS.md)** - Technical component details
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Project organization overview

### Option A: Integrated with Current Stack
Add monitoring services to the existing `docker-compose.yml`

### Option B: Separate Monitoring Stack
Create a separate `docker-compose.monitoring.yml` for monitoring services

### Option C: Minimal Monitoring
Lightweight monitoring with just essential metrics

## Next Steps

Please choose:
1. **Which monitoring stack**: ELK or Prometheus+Grafana?
2. **Integration approach**: Integrated, Separate, or Minimal?
3. **Monitoring focus**: Logs, Metrics, or Both?

I'll then create the appropriate configuration files and integration.
