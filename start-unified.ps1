# Simple Menu - Unified Monitoring Quick Start
# One command to start everything: App + Prometheus + Grafana + ELK

Write-Host "🚀 Starting Simple Menu with Unified Monitoring..." -ForegroundColor Cyan
Write-Host ""

# Check Docker
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check system resources
$memory = [math]::Round((Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
Write-Host "ℹ️  System Memory: $memory GB" -ForegroundColor Blue

if ($memory -lt 4) {
    Write-Host "⚠️  Warning: Unified monitoring requires 4GB+ RAM for optimal performance" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Consider using: .\start.ps1 -Mode prometheus" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "🔧 Starting all services..." -ForegroundColor Yellow
Write-Host "   This includes:"
Write-Host "   • Simple Menu Application (Frontend + Backend)"
Write-Host "   • Prometheus + Grafana (Metrics & Dashboards)"
Write-Host "   • ELK Stack (Logs & Search)"
Write-Host ""

# Start unified stack
docker-compose -f docker-compose.unified.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "⏳ Waiting for services to initialize (3-5 minutes)..." -ForegroundColor Yellow
    
    # Show progress dots
    for ($i = 0; $i -lt 180; $i++) {
        Write-Host "." -NoNewline -ForegroundColor Gray
        Start-Sleep -Seconds 1
        if (($i + 1) % 60 -eq 0) { Write-Host " $([math]::Floor(($i + 1) / 60))min" -ForegroundColor Gray }
    }
    
    Write-Host ""
    Write-Host ""
    Write-Host "🎉 Simple Menu with Unified Monitoring is ready!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📱 APPLICATION:" -ForegroundColor Cyan
    Write-Host "   • Frontend:  http://localhost:4200" -ForegroundColor White
    Write-Host "   • Backend:   http://localhost:3000" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📊 METRICS & MONITORING:" -ForegroundColor Cyan
    Write-Host "   • Grafana:      http://localhost:3001 (admin/admin123)" -ForegroundColor White
    Write-Host "   • Prometheus:   http://localhost:9090" -ForegroundColor White
    Write-Host "   • cAdvisor:     http://localhost:8080" -ForegroundColor White
    Write-Host "   • Node Export:  http://localhost:9100" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🔍 LOGS & SEARCH:" -ForegroundColor Cyan
    Write-Host "   • Kibana:       http://localhost:5601" -ForegroundColor White
    Write-Host "   • Elasticsearch: http://localhost:9200" -ForegroundColor White
    Write-Host "   • Logstash:     http://localhost:9600" -ForegroundColor White
    Write-Host ""
    
    Write-Host "💡 QUICK TIPS:" -ForegroundColor Yellow
    Write-Host "   • Check container status: docker ps" -ForegroundColor Gray
    Write-Host "   • View logs: docker-compose -f docker-compose.unified.yml logs -f" -ForegroundColor Gray
    Write-Host "   • Stop everything: docker-compose -f docker-compose.unified.yml down" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🎯 Resource Usage: ~3GB RAM, monitoring $(docker ps --format 'table {{.Names}}' | wc -l) containers" -ForegroundColor Blue
    
} else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    Write-Host "💡 Try: docker-compose -f docker-compose.unified.yml logs" -ForegroundColor Yellow
}
