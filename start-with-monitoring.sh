#!/bin/bash

# Simple Menu Monitoring Stack Startup Script
# Starts monitoring services alongside the main application

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITORING_TYPE="${1:-prometheus}"  # prometheus or elk

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $*"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Check available memory
check_memory() {
    local available_memory=$(free -m | grep MemAvailable | awk '{print $2}')
    local required_memory=1024
    
    if [[ "$MONITORING_TYPE" == "elk" ]]; then
        required_memory=2048
    fi
    
    if [[ $available_memory -lt $required_memory ]]; then
        log_warn "Available memory (${available_memory}MB) is less than recommended (${required_memory}MB)"
        log_warn "Monitoring stack may experience performance issues"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Start main application
start_main_app() {
    log "Starting Simple Menu application..."
    
    cd "$SCRIPT_DIR"
    
    # Stop any existing services
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Start main application
    docker-compose up -d
    
    # Wait for services to be healthy
    log "Waiting for main application to be healthy..."
    local max_wait=120
    local wait_time=0
    
    while [[ $wait_time -lt $max_wait ]]; do
        local backend_status=$(docker-compose ps -q backend | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
        local frontend_status=$(docker-compose ps -q frontend | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
        
        if [[ "$backend_status" == "healthy" && "$frontend_status" == "healthy" ]]; then
            log "✅ Main application is healthy"
            return 0
        fi
        
        sleep 5
        wait_time=$((wait_time + 5))
        echo -n "."
    done
    
    log_error "Main application failed to become healthy"
    return 1
}

# Start monitoring stack
start_monitoring() {
    local compose_file="docker-compose.${MONITORING_TYPE}.yml"
    
    if [[ ! -f "$compose_file" ]]; then
        log_error "Monitoring compose file not found: $compose_file"
        exit 1
    fi
    
    log "Starting $MONITORING_TYPE monitoring stack..."
    
    # Stop any existing monitoring services
    docker-compose -f "$compose_file" down --remove-orphans 2>/dev/null || true
    
    # Start monitoring services
    docker-compose -f "$compose_file" up -d
    
    # Wait for key services to start
    log "Waiting for monitoring services to start..."
    sleep 30
    
    # Check status
    case "$MONITORING_TYPE" in
        prometheus)
            if curl -sf http://localhost:9090/-/healthy >/dev/null 2>&1; then
                log "✅ Prometheus is running at http://localhost:9090"
            else
                log_warn "Prometheus may not be ready yet"
            fi
            
            if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
                log "✅ Grafana is running at http://localhost:3001 (admin/simplemenu123)"
            else
                log_warn "Grafana may not be ready yet"
            fi
            ;;
        elk)
            if curl -sf http://localhost:9200/_cluster/health >/dev/null 2>&1; then
                log "✅ Elasticsearch is running at http://localhost:9200"
            else
                log_warn "Elasticsearch may not be ready yet"
            fi
            
            if curl -sf http://localhost:5601/status >/dev/null 2>&1; then
                log "✅ Kibana is running at http://localhost:5601"
            else
                log_warn "Kibana may not be ready yet"
            fi
            ;;
    esac
}

# Show status
show_status() {
    echo
    log "🎉 Simple Menu with monitoring is starting up!"
    echo
    echo "📱 Main Application:"
    echo "  Frontend: http://localhost:4200"
    echo "  Backend API: http://localhost:3000"
    echo
    
    case "$MONITORING_TYPE" in
        prometheus)
            echo "📊 Monitoring (Prometheus + Grafana):"
            echo "  Prometheus: http://localhost:9090"
            echo "  Grafana: http://localhost:3001 (admin/simplemenu123)"
            echo "  AlertManager: http://localhost:9093"
            echo "  Node Exporter: http://localhost:9100"
            echo "  cAdvisor: http://localhost:8080"
            ;;
        elk)
            echo "📊 Monitoring (ELK Stack):"
            echo "  Elasticsearch: http://localhost:9200"
            echo "  Kibana: http://localhost:5601"
            echo "  Logstash: http://localhost:9600"
            ;;
    esac
    
    echo
    echo "📝 Useful Commands:"
    echo "  View all logs: docker-compose logs -f"
    echo "  View monitoring logs: docker-compose -f docker-compose.${MONITORING_TYPE}.yml logs -f"
    echo "  Stop everything: docker-compose down && docker-compose -f docker-compose.${MONITORING_TYPE}.yml down"
    echo "  Restart monitoring: docker-compose -f docker-compose.${MONITORING_TYPE}.yml restart"
    echo
}

# Main function
main() {
    log "🚀 Starting Simple Menu with $MONITORING_TYPE monitoring..."
    
    check_docker
    check_memory
    start_main_app
    start_monitoring
    show_status
    
    log "✅ Startup complete!"
}

# Show usage
show_usage() {
    echo "Simple Menu Monitoring Startup Script"
    echo
    echo "Usage: $0 [MONITORING_TYPE]"
    echo
    echo "MONITORING_TYPE:"
    echo "  prometheus  - Start with Prometheus + Grafana (recommended for Pi)"
    echo "  elk        - Start with ELK stack (requires more resources)"
    echo
    echo "Examples:"
    echo "  $0 prometheus"
    echo "  $0 elk"
    echo
}

# Handle script arguments
case "${1:-}" in
    prometheus|elk)
        main
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        if [[ -n "${1:-}" ]]; then
            log_error "Unknown monitoring type: $1"
            echo
        fi
        show_usage
        exit 1
        ;;
esac
