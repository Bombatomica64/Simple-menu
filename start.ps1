# Simple Menu - Unified Startup Script
# Handles all deployment options in one script

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("basic", "prometheus", "elk", "unified", "menu")]
    [string]$Mode = "menu"
)

# Colors and formatting
$Colors = @{
    Header = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Blue"
    Accent = "Magenta"
}

function Write-Header {
    param([string]$Text)
    Write-Host "=" * 60 -ForegroundColor $Colors.Header
    Write-Host "   $Text" -ForegroundColor $Colors.Header
    Write-Host "=" * 60 -ForegroundColor $Colors.Header
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor $Colors.Success
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor $Colors.Warning
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor $Colors.Error
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor $Colors.Info
}

function Write-Accent {
    param([string]$Text)
    Write-Host "$Text" -ForegroundColor $Colors.Accent
}

function Test-Docker {
    try {
        $dockerInfo = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker is running"
            return $true
        }
    } catch {
        # Ignore errors
    }
    
    Write-Error "Docker is not running or not installed"
    Write-Info "Please start Docker Desktop or install it from: https://www.docker.com/products/docker-desktop"
    return $false
}

function Get-SystemInfo {
    $memory = [math]::Round((Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
    $cpuCores = (Get-WmiObject -Class Win32_Processor).NumberOfCores
    $os = (Get-WmiObject -Class Win32_OperatingSystem).Caption
    
    return @{
        Memory = $memory
        CpuCores = $cpuCores
        OS = $os
    }
}

function Show-SystemInfo {
    $sysInfo = Get-SystemInfo
    Write-Info "System Information:"
    Write-Host "   • OS: $($sysInfo.OS)" -ForegroundColor White
    Write-Host "   • Memory: $($sysInfo.Memory) GB" -ForegroundColor White
    Write-Host "   • CPU Cores: $($sysInfo.CpuCores)" -ForegroundColor White
    Write-Host ""
}

function Show-Menu {
    Write-Header "Simple Menu - Unified Startup"
    Show-SystemInfo
    
    Write-Accent "Available Options:"
    Write-Host ""
    Write-Host "1. " -NoNewline -ForegroundColor $Colors.Accent
    Write-Host "Basic Setup" -ForegroundColor White
    Write-Host "   └─ Just the Simple Menu application" -ForegroundColor Gray
    Write-Host "   └─ Resource usage: ~200MB RAM" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. " -NoNewline -ForegroundColor $Colors.Accent
    Write-Host "Prometheus + Grafana Monitoring (Recommended)" -ForegroundColor White
    Write-Host "   └─ System metrics, performance monitoring, dashboards" -ForegroundColor Gray
    Write-Host "   └─ Resource usage: ~512MB RAM" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "3. " -NoNewline -ForegroundColor $Colors.Accent
    Write-Host "ELK Stack Monitoring" -ForegroundColor White
    Write-Host "   └─ Log analysis, debugging, full-text search" -ForegroundColor Gray
    Write-Host "   └─ Resource usage: ~2GB RAM" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "4. " -NoNewline -ForegroundColor $Colors.Accent
    Write-Host "Unified Monitoring (Recommended)" -ForegroundColor White
    Write-Host "   └─ Both Prometheus+Grafana AND ELK Stack" -ForegroundColor Gray
    Write-Host "   └─ Resource usage: ~3GB RAM" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "5. " -NoNewline -ForegroundColor $Colors.Accent
    Write-Host "Stop All Services" -ForegroundColor White
    Write-Host "   └─ Stop and clean up all running containers" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "6. " -NoNewline -ForegroundColor $Colors.Accent
    Write-Host "View Service Status" -ForegroundColor White
    Write-Host "   └─ Check running containers and their status" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "7. " -NoNewline -ForegroundColor $Colors.Accent
    Write-Host "Exit" -ForegroundColor White
    Write-Host ""
}

function Get-UserChoice {
    do {
        $choice = Read-Host "Select an option (1-7)"
        if ($choice -match '^[1-7]$') {
            return [int]$choice
        }
        Write-Warning "Please enter a number between 1 and 7"
    } while ($true)
}

function Start-BasicSetup {
    Write-Header "Starting Basic Simple Menu"
    
    Write-Info "Starting Simple Menu application..."
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Start-Sleep -Seconds 5
        Write-Success "Simple Menu started successfully!"
        Write-Host ""
        Write-Accent "📱 Access Point:"
        Write-Host "   • Simple Menu: http://localhost:3000" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Error "Failed to start Simple Menu"
    }
}

function Start-PrometheusSetup {
    Write-Header "Starting Simple Menu with Prometheus + Grafana"
    
    $sysInfo = Get-SystemInfo
    if ($sysInfo.Memory -lt 1) {
        Write-Warning "Low memory detected ($($sysInfo.Memory)GB). This might affect performance."
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            return
        }
    }
    
    Write-Info "Starting Simple Menu application..."
    docker-compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start Simple Menu application"
        return
    }
    
    Write-Info "Waiting for main application to start..."
    Start-Sleep -Seconds 10
    
    Write-Info "Starting Prometheus + Grafana monitoring..."
    docker-compose -f docker-compose.monitoring-simple.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Waiting for monitoring services to be ready..."
        Start-Sleep -Seconds 30
        
        Write-Success "Simple Menu with Prometheus + Grafana started successfully!"
        Write-Host ""
        Write-Accent "📊 Access Points:"
        Write-Host "   • Simple Menu: http://localhost:3000" -ForegroundColor White
        Write-Host "   • Grafana: http://localhost:3001 (admin/admin123)" -ForegroundColor White
        Write-Host "   • Prometheus: http://localhost:9090" -ForegroundColor White
        Write-Host "   • Node Exporter: http://localhost:9100" -ForegroundColor White
        Write-Host "   • cAdvisor: http://localhost:8080" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Error "Failed to start monitoring services"
    }
}

function Start-ELKSetup {
    Write-Header "Starting Simple Menu with ELK Stack"
    
    $sysInfo = Get-SystemInfo
    if ($sysInfo.Memory -lt 4) {
        Write-Warning "ELK Stack requires at least 4GB RAM. You have $($sysInfo.Memory)GB"
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Info "Consider using Prometheus + Grafana monitoring instead (option 2)"
            return
        }
    }
    
    Write-Info "Starting Simple Menu application..."
    docker-compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start Simple Menu application"
        return
    }
    
    Write-Info "Waiting for main application to start..."
    Start-Sleep -Seconds 10
    
    Write-Info "Starting ELK Stack monitoring (this may take a few minutes)..."
    docker-compose -f docker-compose.elk-simple.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Waiting for ELK services to be ready (this can take 2-3 minutes)..."
        Start-Sleep -Seconds 90
        
        Write-Success "Simple Menu with ELK Stack started successfully!"
        Write-Host ""
        Write-Accent "📊 Access Points:"
        Write-Host "   • Simple Menu: http://localhost:3000" -ForegroundColor White
        Write-Host "   • Kibana: http://localhost:5601" -ForegroundColor White
        Write-Host "   • Elasticsearch: http://localhost:9200" -ForegroundColor White
        Write-Host ""
        Write-Warning "Note: ELK Stack uses significant resources. Monitor system performance."
    } else {
        Write-Error "Failed to start ELK services"
    }
}

function Start-UnifiedSetup {
    Write-Header "Starting Simple Menu with Unified Monitoring"
    
    $sysInfo = Get-SystemInfo
    if ($sysInfo.Memory -lt 6) {
        Write-Warning "Unified monitoring stack requires at least 6GB RAM. You have $($sysInfo.Memory)GB"
        if ($sysInfo.Memory -lt 4) {
            Write-Error "System has insufficient memory. Minimum 4GB required."
            return
        }
        $continue = Read-Host "Continue with reduced performance? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Info "Consider using Prometheus + Grafana monitoring instead (option 2)"
            return
        }
    }
    
    Write-Info "Starting unified monitoring stack (this will take several minutes)..."
    Write-Info "This includes: Simple Menu + Prometheus + Grafana + ELK Stack"
    
    docker-compose -f docker-compose.unified.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Info "Waiting for all services to be ready (this can take 3-5 minutes)..."
        Start-Sleep -Seconds 180
        
        Write-Success "Simple Menu with Unified Monitoring started successfully!"
        Write-Host ""
        Write-Accent "🚀 Application:"
        Write-Host "   • Simple Menu: http://localhost:4200" -ForegroundColor White
        Write-Host "   • Backend API: http://localhost:3000" -ForegroundColor White
        Write-Host ""
        Write-Accent "📊 Metrics & Visualization:"
        Write-Host "   • Grafana: http://localhost:3001 (admin/admin123)" -ForegroundColor White
        Write-Host "   • Prometheus: http://localhost:9090" -ForegroundColor White
        Write-Host "   • Node Exporter: http://localhost:9100" -ForegroundColor White
        Write-Host "   • cAdvisor: http://localhost:8080" -ForegroundColor White
        Write-Host ""
        Write-Accent "🔍 Logs & Search:"
        Write-Host "   • Kibana: http://localhost:5601" -ForegroundColor White
        Write-Host "   • Elasticsearch: http://localhost:9200" -ForegroundColor White
        Write-Host "   • Logstash: http://localhost:9600" -ForegroundColor White
        Write-Host ""
        Write-Warning "Note: Unified stack uses significant resources (~3GB RAM). Monitor system performance."
    } else {
        Write-Error "Failed to start unified monitoring services"
    }
}

function Stop-AllServices {
    Write-Header "Stopping All Services"
    
    Write-Info "Stopping unified monitoring services..."
    docker-compose -f docker-compose.unified.yml down 2>$null
    
    Write-Info "Stopping individual monitoring services..."
    docker-compose -f docker-compose.monitoring-simple.yml down 2>$null
    docker-compose -f docker-compose.elk-simple.yml down 2>$null
    docker-compose -f docker-compose.monitoring.yml down 2>$null
    docker-compose -f docker-compose.elk.yml down 2>$null
    
    Write-Info "Stopping Simple Menu application..."
    docker-compose down
    
    Write-Info "Cleaning up unused containers and networks..."
    docker system prune -f >$null 2>&1
    
    Write-Success "All services stopped successfully!"
}

function Show-ServiceStatus {
    Write-Header "Service Status"
    
    Write-Info "Running containers:"
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    
    if ($containers) {
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Warning "No containers are currently running"
    }
    
    Write-Host ""
    Write-Info "Docker system information:"
    docker system df 2>$null | ForEach-Object { 
        if ($_ -match "^(TYPE|Images|Containers|Local Volumes)") {
            Write-Host $_ -ForegroundColor White
        }
    }
}

function Wait-ForKeyPress {
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
}

# Main execution
if (-not (Test-Docker)) {
    exit 1
}

# Handle command line parameters
switch ($Mode) {
    "basic" {
        Start-BasicSetup
        exit 0
    }
    "prometheus" {
        Start-PrometheusSetup
        exit 0
    }
    "elk" {
        Start-ELKSetup
        exit 0
    }
    "unified" {
        Start-UnifiedSetup
        exit 0
    }
    "menu" {
        # Continue to interactive menu
    }
}

# Interactive menu
do {
    Show-Menu
    $choice = Get-UserChoice
    
    switch ($choice) {
        1 {
            Start-BasicSetup
            Wait-ForKeyPress
        }
        2 {
            Start-PrometheusSetup
            Wait-ForKeyPress
        }
        3 {
            Start-ELKSetup
            Wait-ForKeyPress
        }
        4 {
            Start-UnifiedSetup
            Wait-ForKeyPress
        }
        5 {
            Stop-AllServices
            Wait-ForKeyPress
        }
        6 {
            Show-ServiceStatus
            Wait-ForKeyPress
        }
        7 {
            Write-Host "Goodbye! 👋" -ForegroundColor $Colors.Success
            exit 0
        }
    }
} while ($true)
