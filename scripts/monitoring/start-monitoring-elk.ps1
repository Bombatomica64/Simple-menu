# Start Simple Menu with ELK Stack Monitoring
# Higher resource requirements - use only with 4GB+ RAM

Write-Host "Starting Simple Menu with ELK Stack monitoring..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check available memory
$memory = (Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1GB
if ($memory -lt 4) {
    Write-Host "⚠️  Warning: ELK Stack requires at least 4GB RAM. You have $([math]::Round($memory, 1))GB" -ForegroundColor Yellow
    $choice = Read-Host "Continue anyway? (y/N)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        Write-Host "Exiting. Consider using the simple monitoring stack instead." -ForegroundColor Red
        exit 1
    }
}

# Start main application
Write-Host "Starting Simple Menu application..." -ForegroundColor Yellow
docker-compose up -d

# Wait a moment for services to start
Start-Sleep -Seconds 10

# Start ELK monitoring stack
Write-Host "Starting ELK Stack monitoring (this may take a few minutes)..." -ForegroundColor Yellow
docker-compose -f docker-compose.elk-simple.yml up -d

# Wait for services to be ready
Write-Host "Waiting for ELK services to be ready (this can take 2-3 minutes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Check service status
Write-Host "`nService Status:" -ForegroundColor Cyan
docker ps --filter "name=simple-menu" --filter "name=elasticsearch" --filter "name=kibana" --filter "name=logstash" --filter "name=filebeat" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n🚀 Simple Menu with ELK monitoring is starting up!" -ForegroundColor Green
Write-Host "📊 Access points:" -ForegroundColor Cyan
Write-Host "   • Simple Menu: http://localhost:3000" -ForegroundColor White
Write-Host "   • Kibana: http://localhost:5601" -ForegroundColor White
Write-Host "   • Elasticsearch: http://localhost:9200" -ForegroundColor White

Write-Host "`n💡 To stop everything: docker-compose down && docker-compose -f docker-compose.elk-simple.yml down" -ForegroundColor Yellow
Write-Host "📝 Note: ELK Stack uses more resources. Monitor your system performance." -ForegroundColor Yellow
