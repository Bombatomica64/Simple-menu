# Simple Menu - Docker LAN Setup Script for Windows
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Simple Menu - Docker LAN Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed and running
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        throw "Docker not found"
    }
    Write-Host "Docker detected: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not installed or not running!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host "Press Enter to exit..." -NoNewline
    Read-Host
    exit 1
}

# Check if docker compose is available
try {
    $composeVersion = docker compose --version 2>$null
    if (-not $composeVersion) {
        # Try with docker-compose (older versions)
        $composeVersion = docker-compose --version 2>$null
        if (-not $composeVersion) {
            throw "Docker Compose not found"
        }
        $composeCommand = "docker-compose"
    } else {
        $composeCommand = "docker compose"
    }
    Write-Host "Docker Compose detected: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker Compose is not available!" -ForegroundColor Red
    Write-Host "Press Enter to exit..." -NoNewline
    Read-Host
    exit 1
}

Write-Host ""

# Get the local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1"} | Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1" -and $_.IPAddress -notlike "127.*"} | Select-Object -First 1).IPAddress
}

if (-not $localIP) {
    Write-Host "Could not detect LAN IP automatically." -ForegroundColor Yellow
    $localIP = Read-Host "Please enter your LAN IP address"
}

Write-Host "Detected LAN IP: " -NoNewline
Write-Host $localIP -ForegroundColor Green
Write-Host ""

# Set environment variable for docker compose
$env:HOST_IP = $localIP

Write-Host "Building and starting containers..." -ForegroundColor Yellow
Write-Host ""

try {
    # Stop any existing containers
    if ($composeCommand -eq "docker compose") {
        docker compose down 2>$null
        # Build and start the containers
        docker compose up --build -d
    } else {
        docker-compose down 2>$null
        # Build and start the containers
        docker-compose up --build -d
    }

    Write-Host ""
    Write-Host "Containers started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "ACCESS URLS:" -ForegroundColor Cyan
    Write-Host "- Menu Display: " -NoNewline -ForegroundColor Gray
    Write-Host "http://$localIP:4200" -ForegroundColor Green
    Write-Host "- Menu Admin: " -NoNewline -ForegroundColor Gray
    Write-Host "http://$localIP:4200/submit" -ForegroundColor Green
    Write-Host "- Backend API: " -NoNewline -ForegroundColor Gray
    Write-Host "http://$localIP:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Share these URLs with other devices on your network!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "USEFUL COMMANDS:" -ForegroundColor Cyan
    Write-Host "- Stop containers: " -NoNewline -ForegroundColor Gray
    Write-Host "$composeCommand down" -ForegroundColor White
    Write-Host "- View logs: " -NoNewline -ForegroundColor Gray
    Write-Host "$composeCommand logs -f" -ForegroundColor White
    Write-Host "- Restart containers: " -NoNewline -ForegroundColor Gray
    Write-Host "$composeCommand restart" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: Wait 10-30 seconds for containers to fully start before accessing the URLs." -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to start containers!" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker Desktop is running" -ForegroundColor Gray
    Write-Host "2. Check if ports 3000 and 4200 are available" -ForegroundColor Gray
    Write-Host "3. Try running: $composeCommand logs" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to exit..." -NoNewline
Read-Host
