# Simple Menu - Unified Monitoring Stack Startup
# Starts the complete monitoring solution with both metrics and logs

param(
    [switch]$Help
)

if ($Help) {
    Write-Host "Simple Menu - Unified Monitoring Stack" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "This script starts the complete Simple Menu application with unified monitoring:"
    Write-Host "- Frontend (Angular) + Backend (Node.js)"
    Write-Host "- Prometheus + Grafana (Metrics & Dashboards)"
    Write-Host "- ELK Stack (Elasticsearch, Logstash, Kibana)"
    Write-Host "- System monitoring (Node Exporter, cAdvisor)"
    Write-Host ""
    Write-Host "Usage: .\start-unified.ps1"
    Write-Host ""
    Write-Host "System Requirements:"
    Write-Host "- Recommended: 6GB+ RAM, 4+ CPU cores"
    Write-Host "- Minimum: 4GB RAM, 2+ CPU cores"
    Write-Host "- Storage: 10GB+ free space"
    return
}

try {
    # Check if Docker is running
    docker ps > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker is not running. Please start Docker first." -ForegroundColor Red
        exit 1
    }

    Write-Host "Starting Simple Menu - Unified Monitoring Stack..." -ForegroundColor Green
    Write-Host "This includes:" -ForegroundColor White
    Write-Host "  * Simple Menu Application (Frontend + Backend)" -ForegroundColor White
    Write-Host "  * Prometheus + Grafana (Metrics and Dashboards)" -ForegroundColor White
    Write-Host "  * ELK Stack (Logs and Search)" -ForegroundColor White
    Write-Host "  * System Monitoring (Node Exporter, cAdvisor)" -ForegroundColor White
    Write-Host ""

    # Start unified stack
    Write-Host "Starting all services..." -ForegroundColor Yellow
    docker-compose -f docker\docker-compose.unified.yml up -d

    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: All services are starting up..." -ForegroundColor Green
        Write-Host "Please wait 3-5 minutes for all services to initialize." -ForegroundColor Yellow
        Write-Host ""
        
        # Show progress
        Write-Host "Waiting for services to become ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        Write-Host ""
        Write-Host "ACCESS POINTS:" -ForegroundColor Green
        Write-Host "=============="
        Write-Host ""
        
        Write-Host "APPLICATION:" -ForegroundColor Cyan
        Write-Host "  * Frontend:     http://localhost:4200" -ForegroundColor White
        Write-Host "  * Backend API:  http://localhost:3000" -ForegroundColor White
        Write-Host "  * Health Check: http://localhost:3000/health" -ForegroundColor White
        Write-Host ""
        
        Write-Host "METRICS & DASHBOARDS:" -ForegroundColor Cyan
        Write-Host "  * Grafana:      http://localhost:3001 (admin/admin123)" -ForegroundColor White
        Write-Host "  * Prometheus:   http://localhost:9090" -ForegroundColor White
        Write-Host "  * cAdvisor:     http://localhost:8080" -ForegroundColor White
        Write-Host "  * Node Export:  http://localhost:9100" -ForegroundColor White
        Write-Host ""
        
        Write-Host "LOGS & SEARCH:" -ForegroundColor Cyan
        Write-Host "  * Kibana:       http://localhost:5601" -ForegroundColor White
        Write-Host "  * Elasticsearch: http://localhost:9200" -ForegroundColor White
        Write-Host "  * Logstash:     http://localhost:9600" -ForegroundColor White
        Write-Host ""
        
        Write-Host "MANAGEMENT COMMANDS:" -ForegroundColor Yellow
        Write-Host "  * Check status: docker ps" -ForegroundColor Gray
        Write-Host "  * View logs:    docker-compose -f docker-compose.unified.yml logs -f" -ForegroundColor Gray
        Write-Host "  * Stop all:     docker-compose -f docker-compose.unified.yml down" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "NOTE: Initial startup may take several minutes. Check service health at the URLs above." -ForegroundColor Blue
        
    } else {
        Write-Host "ERROR: Failed to start services" -ForegroundColor Red
        Write-Host "Try checking the logs: docker-compose -f docker-compose.unified.yml logs" -ForegroundColor Yellow
        exit 1
    }

} catch {
    Write-Host "ERROR: An unexpected error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
