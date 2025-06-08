# Start Simple Menu with Prometheus + Grafana Monitoring
# Lightweight monitoring stack for Raspberry Pi

Write-Host "Starting Simple Menu with Prometheus + Grafana monitoring..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Start main application
Write-Host "Starting Simple Menu application..." -ForegroundColor Yellow
docker-compose up -d

# Wait a moment for services to start
Start-Sleep -Seconds 10

# Start monitoring stack
Write-Host "Starting Prometheus + Grafana monitoring..." -ForegroundColor Yellow
docker-compose -f docker-compose.monitoring-simple.yml up -d

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "`nService Status:" -ForegroundColor Cyan
docker ps --filter "name=simple-menu" --filter "name=prometheus" --filter "name=grafana" --filter "name=node-exporter" --filter "name=cadvisor" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n🚀 Simple Menu with monitoring is starting up!" -ForegroundColor Green
Write-Host "📊 Access points:" -ForegroundColor Cyan
Write-Host "   • Simple Menu: http://localhost:3000" -ForegroundColor White
Write-Host "   • Grafana: http://localhost:3001 (admin/admin123)" -ForegroundColor White
Write-Host "   • Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "   • Node Exporter: http://localhost:9100" -ForegroundColor White
Write-Host "   • cAdvisor: http://localhost:8080" -ForegroundColor White

Write-Host "`n💡 To stop everything: docker-compose down && docker-compose -f docker-compose.monitoring-simple.yml down" -ForegroundColor Yellow
