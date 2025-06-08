# Simple Menu Deployment Script for Windows with Docker Desktop
# PowerShell version for Windows development and testing

param(
    [string]$Command = "deploy",
    [switch]$BackupOnly,
    [switch]$VerifyOnly,
    [switch]$InstallDepsOnly,
    [switch]$Help
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogFile = Join-Path $env:TEMP "simple-menu-deploy-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$BackupDir = Join-Path $env:USERPROFILE "simple-menu-backups"

# Colors for output (PowerShell compatible)
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️ $Message" -ForegroundColor Cyan }

# Logging function
function Write-Log {
    param($Level, $Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp [$Level] $Message"
    Write-Output $logEntry | Out-File -FilePath $LogFile -Append
    
    switch ($Level) {
        "SUCCESS" { Write-Success $Message }
        "ERROR" { Write-Error $Message }
        "WARN" { Write-Warning $Message }
        "INFO" { Write-Info $Message }
        default { Write-Output $Message }
    }
}

# Check system requirements
function Test-Requirements {
    Write-Log "INFO" "🔍 Checking system requirements..."
    
    # Check Windows version
    $osVersion = [System.Environment]::OSVersion.Version
    if ($osVersion.Major -ge 10) {
        Write-Log "SUCCESS" "Windows version is compatible: $($osVersion.ToString())"
    } else {
        Write-Log "WARN" "Windows version may not be fully compatible: $($osVersion.ToString())"
    }
    
    # Check Docker Desktop
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Write-Log "SUCCESS" "Docker is installed"
        
        # Check if Docker is running
        try {
            docker info | Out-Null
            Write-Log "SUCCESS" "Docker is running"
        } catch {
            Write-Log "ERROR" "Docker is not running. Please start Docker Desktop."
            return $false
        }
    } else {
        Write-Log "ERROR" "Docker is not installed. Please install Docker Desktop."
        return $false
    }
    
    # Check Docker Compose
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        Write-Log "SUCCESS" "Docker Compose is installed"
    } else {
        Write-Log "ERROR" "Docker Compose is not installed."
        return $false
    }
    
    # Check available disk space (at least 5GB)
    $drive = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq "C:" }
    $freeSpaceGB = [math]::Round($drive.FreeSpace / 1GB, 2)
    if ($freeSpaceGB -gt 5) {
        Write-Log "SUCCESS" "Sufficient disk space available: ${freeSpaceGB}GB"
    } else {
        Write-Log "WARN" "Low disk space available: ${freeSpaceGB}GB"
    }
    
    # Check available memory (at least 4GB total)
    $totalMemoryGB = [math]::Round((Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
    if ($totalMemoryGB -gt 4) {
        Write-Log "SUCCESS" "Sufficient memory available: ${totalMemoryGB}GB"
    } else {
        Write-Log "WARN" "Low memory available: ${totalMemoryGB}GB"
    }
    
    Write-Log "SUCCESS" "System requirements check completed"
    return $true
}

# Create backup
function New-Backup {
    Write-Log "INFO" "📦 Creating backup of existing deployment..."
    
    $backupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = Join-Path $BackupDir "simple-menu-backup-$backupTimestamp"
    
    # Create backup directory
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    
    # Backup database
    $dbPath = Join-Path $ScriptDir "Backend\prisma\dev.db"
    if (Test-Path $dbPath) {
        Copy-Item $dbPath (Join-Path $backupPath "dev.db.backup")
        Write-Log "SUCCESS" "Database backed up"
    }
    
    # Backup configuration files
    $configFiles = @(
        "docker-compose.yml",
        "docker-compose.override.yml",
        ".env"
    )
    
    foreach ($file in $configFiles) {
        $filePath = Join-Path $ScriptDir $file
        if (Test-Path $filePath) {
            Copy-Item $filePath $backupPath
        }
    }
    
    # Create backup manifest
    $manifest = @"
Simple Menu Backup - $backupTimestamp
=======================================
Backup created: $(Get-Date)
Git commit: $(try { git rev-parse HEAD } catch { "Unknown" })
Files backed up:
$(Get-ChildItem $backupPath | ForEach-Object { "  - $($_.Name)" } | Out-String)
"@
    
    $manifest | Out-File -FilePath (Join-Path $backupPath "MANIFEST.txt")
    
    Write-Log "SUCCESS" "Backup created at: $backupPath"
    
    # Clean old backups (keep last 5)
    $oldBackups = Get-ChildItem $BackupDir -Directory | Sort-Object CreationTime -Descending | Select-Object -Skip 5
    $oldBackups | Remove-Item -Recurse -Force
    
    return $backupPath
}

# Install system dependencies
function Install-Dependencies {
    Write-Log "INFO" "📦 Installing system dependencies..."
    
    # Check if Chocolatey is installed
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Log "INFO" "Installing Chocolatey package manager..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    # Install required tools
    $tools = @("git", "curl", "jq")
    foreach ($tool in $tools) {
        if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
            Write-Log "INFO" "Installing $tool..."
            choco install $tool -y
        } else {
            Write-Log "SUCCESS" "$tool is already installed"
        }
    }
    
    # Install Node.js if not present (for development tools)
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Log "INFO" "Installing Node.js..."
        choco install nodejs -y
    }
    
    Write-Log "SUCCESS" "System dependencies installed"
}

# Deploy application
function Deploy-Application {
    Write-Log "INFO" "🚀 Deploying Simple Menu application..."
    
    # Change to script directory
    Set-Location $ScriptDir
    
    # Stop existing services
    try {
        $runningContainers = docker-compose ps --services --filter "status=running"
        if ($runningContainers) {
            Write-Log "INFO" "Stopping existing services..."
            docker-compose down --remove-orphans
        }
    } catch {
        Write-Log "INFO" "No existing services to stop"
    }
    
    # Pull latest images
    Write-Log "INFO" "Pulling latest Docker images..."
    docker-compose pull
    
    # Build and start services
    Write-Log "INFO" "Building and starting services..."
    docker-compose up --build -d
    
    # Wait for services to start
    Write-Log "INFO" "Waiting for services to start..."
    Start-Sleep -Seconds 30
    
    # Check if services are healthy
    $maxWait = 300  # 5 minutes
    $waitTime = 0
    while ($waitTime -lt $maxWait) {
        try {
            $backendStatus = docker inspect --format='{{.State.Health.Status}}' (docker-compose ps -q backend) 2>$null
            $frontendStatus = docker inspect --format='{{.State.Health.Status}}' (docker-compose ps -q frontend) 2>$null
            
            if ($backendStatus -eq "healthy" -and $frontendStatus -eq "healthy") {
                Write-Log "SUCCESS" "All services are healthy"
                break
            }
        } catch {
            # Services may not have health checks yet
        }
        
        Write-Log "INFO" "Waiting for services to become healthy... ($waitTime`s)"
        Start-Sleep -Seconds 10
        $waitTime += 10
    }
    
    if ($waitTime -ge $maxWait) {
        Write-Log "ERROR" "Services failed to become healthy within timeout"
        return $false
    }
    
    Write-Log "SUCCESS" "Application deployed successfully"
    return $true
}

# Verify deployment
function Test-Deployment {
    Write-Log "INFO" "🔍 Verifying deployment..."
    
    # Check Docker services
    $runningServices = docker-compose ps --services --filter "status=running"
    if (-not $runningServices) {
        Write-Log "ERROR" "Docker services are not running"
        return $false
    }
    
    # Check API endpoint
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log "SUCCESS" "Backend API is responding"
        } else {
            Write-Log "ERROR" "Backend API returned status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-Log "ERROR" "Backend API is not responding: $($_.Exception.Message)"
        return $false
    }
    
    # Check frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log "SUCCESS" "Frontend is responding"
        } else {
            Write-Log "ERROR" "Frontend returned status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-Log "ERROR" "Frontend is not responding: $($_.Exception.Message)"
        return $false
    }
    
    Write-Log "SUCCESS" "Deployment verification successful"
    
    # Display service information
    Write-Output ""
    Write-Output "🎉 Simple Menu has been successfully deployed!"
    Write-Output "============================================="
    Write-Output "🌐 Frontend URL: http://localhost:4200"
    Write-Output "🔧 Backend API: http://localhost:3000"
    Write-Output "📊 Health Check: http://localhost:3000/health"
    Write-Output ""
    Write-Output "📋 Service Status:"
    docker-compose ps
    Write-Output ""
    Write-Output "📝 Logs:"
    Write-Output "  - Application: docker-compose logs -f"
    Write-Output "  - Backend only: docker-compose logs -f backend"
    Write-Output "  - Frontend only: docker-compose logs -f frontend"
    Write-Output ""
    Write-Output "🛠️  Management Commands:"
    Write-Output "  - Restart: docker-compose restart"
    Write-Output "  - Stop: docker-compose down"
    Write-Output "  - Rebuild: docker-compose up --build -d"
    Write-Output ""
    
    return $true
}

# Show usage
function Show-Usage {
    Write-Output @"
Simple Menu Deployment Script for Windows
==========================================

Usage: .\deploy.ps1 [OPTIONS]

Options:
  -Command <command>    Deployment command (deploy, backup, verify, install-deps)
  -BackupOnly          Create backup only
  -VerifyOnly          Verify deployment only
  -InstallDepsOnly     Install dependencies only
  -Help               Show this help message

Examples:
  .\deploy.ps1                    # Full deployment
  .\deploy.ps1 -BackupOnly        # Create backup only
  .\deploy.ps1 -VerifyOnly        # Verify current deployment
  .\deploy.ps1 -InstallDepsOnly   # Install dependencies only

"@
}

# Cleanup function
function Invoke-Cleanup {
    if ($LASTEXITCODE -ne 0) {
        Write-Log "ERROR" "Deployment failed. Check logs for details."
        Write-Output "📋 Troubleshooting:"
        Write-Output "  - Check Docker: docker-compose ps"
        Write-Output "  - Check logs: docker-compose logs"
        Write-Output "  - Check Docker Desktop is running"
        Write-Output "  - Check Windows Defender/Firewall settings"
    }
}

# Main deployment function
function Invoke-Main {
    Write-Output "🚀 Starting Simple Menu deployment for Windows"
    Write-Output "==============================================="
    Write-Output ""
    
    # Create log file
    New-Item -ItemType File -Path $LogFile -Force | Out-Null
    Write-Log "INFO" "Simple Menu Deployment Log - $(Get-Date)"
    Write-Log "INFO" "Log file: $LogFile"
    
    # Change to script directory
    Set-Location $ScriptDir
    
    try {
        # Run deployment steps
        if (-not (Test-Requirements)) {
            throw "System requirements check failed"
        }
        
        if (-not $VerifyOnly -and -not $InstallDepsOnly) {
            New-Backup | Out-Null
        }
        
        if ($InstallDepsOnly) {
            Install-Dependencies
            return
        }
        
        if (-not $BackupOnly -and -not $VerifyOnly) {
            if (-not (Deploy-Application)) {
                throw "Application deployment failed"
            }
        }
        
        if (-not $BackupOnly) {
            if (-not (Test-Deployment)) {
                throw "Deployment verification failed"
            }
        }
        
        Write-Log "SUCCESS" "Deployment completed successfully!"
    } catch {
        Write-Log "ERROR" "Deployment failed: $($_.Exception.Message)"
        Invoke-Cleanup
        exit 1
    }
}

# Handle script arguments
if ($Help) {
    Show-Usage
    exit 0
}

switch ($Command.ToLower()) {
    "backup" { New-Backup }
    "verify" { Test-Deployment }
    "install-deps" { Install-Dependencies }
    "deploy" { 
        if ($BackupOnly) {
            New-Backup
        } elseif ($VerifyOnly) {
            Test-Deployment
        } elseif ($InstallDepsOnly) {
            Install-Dependencies
        } else {
            Invoke-Main
        }
    }
    default { Invoke-Main }
}
