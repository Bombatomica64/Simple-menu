#!/bin/bash

# Simple Menu Deployment Script for Raspberry Pi
# This script automates the complete deployment process

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/simple-menu-deploy.log"
BACKUP_DIR="/home/pi/simple-menu-backups"
DEPLOY_USER="pi"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}${timestamp}${NC} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_error() {
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}${timestamp} [ERROR] ${message}${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}${timestamp} [WARN] ${message}${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root. Please run as the deployment user ($DEPLOY_USER)."
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    log "INFO" "🔍 Checking system requirements..."
    
    # Check if we're on Raspberry Pi
    if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
        log_warning "Not running on Raspberry Pi. Some optimizations may not apply."
    fi
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if user is in docker group
    if ! groups | grep -q docker; then
        log_error "User is not in docker group. Please add user to docker group: sudo usermod -aG docker $USER"
        exit 1
    fi
    
    # Check available disk space (at least 2GB)
    local available_space=$(df . | tail -1 | awk '{print $4}')
    if [[ $available_space -lt 2097152 ]]; then  # 2GB in KB
        log_warning "Low disk space available. Consider freeing up space before deployment."
    fi
    
    # Check available memory (at least 512MB)
    local available_memory=$(free -m | grep MemAvailable | awk '{print $2}')
    if [[ $available_memory -lt 512 ]]; then
        log_warning "Low memory available. Consider increasing swap or freeing memory."
    fi
    
    log "INFO" "✅ System requirements check completed"
}

# Create backup of existing deployment
create_backup() {
    log "INFO" "📦 Creating backup of existing deployment..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/simple-menu-backup-$backup_timestamp"
    
    # Create backup directory
    mkdir -p "$backup_path"
    
    # Backup database
    if [[ -f "./Backend/prisma/dev.db" ]]; then
        cp "./Backend/prisma/dev.db" "$backup_path/dev.db.backup"
        log "INFO" "✅ Database backed up"
    fi
    
    # Backup configuration files
    if [[ -f "./docker-compose.yml" ]]; then
        cp "./docker-compose.yml" "$backup_path/"
    fi
    
    if [[ -f "./docker-compose.override.yml" ]]; then
        cp "./docker-compose.override.yml" "$backup_path/"
    fi
    
    # Backup environment files
    if [[ -f "./.env" ]]; then
        cp "./.env" "$backup_path/"
    fi
    
    # Create backup manifest
    {
        echo "Simple Menu Backup - $backup_timestamp"
        echo "======================================="
        echo "Backup created: $(date)"
        echo "Git commit: $(git rev-parse HEAD 2>/dev/null || echo 'Unknown')"
        echo "Files backed up:"
        ls -la "$backup_path/"
    } > "$backup_path/MANIFEST.txt"
    
    log "INFO" "✅ Backup created at: $backup_path"
    
    # Clean old backups (keep last 5)
    ls -1t "$BACKUP_DIR" | tail -n +6 | xargs -r -I {} rm -rf "$BACKUP_DIR/{}"
}

# Install system dependencies
install_dependencies() {
    log "INFO" "📦 Installing system dependencies..."
    
    # Update package list
    sudo apt-get update
    
    # Install required packages
    sudo apt-get install -y \
        curl \
        wget \
        git \
        jq \
        htop \
        iotop \
        netcat-openbsd \
        mailutils \
        logrotate \
        cron
    
    # Install Node.js if not present (for wscat)
    if ! command -v node >/dev/null 2>&1; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install wscat for WebSocket testing
    if ! command -v wscat >/dev/null 2>&1; then
        sudo npm install -g wscat
    fi
    
    log "INFO" "✅ System dependencies installed"
}

# Setup log rotation
setup_log_rotation() {
    log "INFO" "📝 Setting up log rotation..."
    
    # Create logrotate configuration
    sudo tee /etc/logrotate.d/simple-menu > /dev/null << 'EOF'
/var/log/simple-menu*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 pi pi
    postrotate
        # Restart monitor if running
        if [ -f /var/run/simple-menu-monitor.pid ]; then
            kill -HUP $(cat /var/run/simple-menu-monitor.pid) 2>/dev/null || true
        fi
    endscript
}
EOF
    
    log "INFO" "✅ Log rotation configured"
}

# Deploy application
deploy_application() {
    log "INFO" "🚀 Deploying Simple Menu application..."
    
    # Stop existing services
    if docker-compose ps | grep -q Up; then
        log "INFO" "Stopping existing services..."
        docker-compose down --remove-orphans
    fi
    
    # Pull latest images
    log "INFO" "Pulling latest Docker images..."
    docker-compose pull
    
    # Build and start services
    log "INFO" "Building and starting services..."
    docker-compose up --build -d
    
    # Wait for services to start
    log "INFO" "Waiting for services to start..."
    sleep 30
    
    # Check if services are healthy
    local max_wait=300  # 5 minutes
    local wait_time=0
    while [[ $wait_time -lt $max_wait ]]; do
        local backend_status=$(docker-compose ps -q backend | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
        local frontend_status=$(docker-compose ps -q frontend | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
        
        if [[ "$backend_status" == "healthy" && "$frontend_status" == "healthy" ]]; then
            log "INFO" "✅ All services are healthy"
            break
        fi
        
        log "INFO" "Waiting for services to become healthy... (${wait_time}s)"
        sleep 10
        wait_time=$((wait_time + 10))
    done
    
    if [[ $wait_time -ge $max_wait ]]; then
        log_error "Services failed to become healthy within timeout"
        return 1
    fi
    
    log "INFO" "✅ Application deployed successfully"
}

# Setup systemd service
setup_systemd_service() {
    log "INFO" "⚙️  Setting up systemd service..."
    
    # Copy service file
    sudo cp "$SCRIPT_DIR/simple-menu-monitor.service" /etc/systemd/system/
    
    # Make monitor script executable
    chmod +x "$SCRIPT_DIR/monitor.sh"
    
    # Update service file with correct paths
    sudo sed -i "s|/home/pi/simple-menu|$SCRIPT_DIR|g" /etc/systemd/system/simple-menu-monitor.service
    sudo sed -i "s|User=pi|User=$USER|g" /etc/systemd/system/simple-menu-monitor.service
    
    # Reload systemd
    sudo systemctl daemon-reload
    
    # Enable and start service
    sudo systemctl enable simple-menu-monitor.service
    sudo systemctl start simple-menu-monitor.service
    
    # Check service status
    if sudo systemctl is-active --quiet simple-menu-monitor.service; then
        log "INFO" "✅ Health monitor service started successfully"
    else
        log_error "Failed to start health monitor service"
        sudo systemctl status simple-menu-monitor.service
        return 1
    fi
}

# Setup autostart on boot
setup_autostart() {
    log "INFO" "🔄 Setting up autostart on boot..."
    
    # Create systemd service for the application
    sudo tee /etc/systemd/system/simple-menu.service > /dev/null << EOF
[Unit]
Description=Simple Menu Application
Documentation=Simple Menu Docker Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
User=$USER
Group=docker
WorkingDirectory=$SCRIPT_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable the service
    sudo systemctl enable simple-menu.service
    
    log "INFO" "✅ Autostart configured"
}

# Verify deployment
verify_deployment() {
    log "INFO" "🔍 Verifying deployment..."
    
    # Check Docker services
    if ! docker-compose ps | grep -q "Up"; then
        log_error "Docker services are not running"
        return 1
    fi
    
    # Check API endpoint
    if ! curl -sf http://localhost:3000/health >/dev/null 2>&1; then
        log_error "Backend API is not responding"
        return 1
    fi
    
    # Check frontend
    if ! curl -sf http://localhost:4200 >/dev/null 2>&1; then
        log_error "Frontend is not responding"
        return 1
    fi
    
    # Check systemd service
    if ! sudo systemctl is-active --quiet simple-menu-monitor.service; then
        log_error "Health monitor service is not running"
        return 1
    fi
    
    log "INFO" "✅ Deployment verification successful"
    
    # Display service information
    echo
    echo "🎉 Simple Menu has been successfully deployed!"
    echo "============================================="
    echo "🌐 Frontend URL: http://localhost:4200"
    echo "🔧 Backend API: http://localhost:3000"
    echo "📊 Health Check: http://localhost:3000/health"
    echo
    echo "📋 Service Status:"
    docker-compose ps
    echo
    echo "🔍 Monitor Status:"
    sudo systemctl status simple-menu-monitor.service --no-pager -l
    echo
    echo "📝 Logs:"
    echo "  - Application: docker-compose logs -f"
    echo "  - Monitor: sudo journalctl -u simple-menu-monitor.service -f"
    echo "  - Monitor file: tail -f /var/log/simple-menu-monitor.log"
    echo
    echo "🛠️  Management Commands:"
    echo "  - Restart: docker-compose restart"
    echo "  - Stop: docker-compose down"
    echo "  - Health check: $SCRIPT_DIR/monitor.sh --check"
    echo "  - Health report: $SCRIPT_DIR/monitor.sh --report"
    echo
}

# Cleanup function
cleanup() {
    if [[ $? -ne 0 ]]; then
        log_error "Deployment failed. Check logs for details."
        echo "📋 Troubleshooting:"
        echo "  - Check Docker: docker-compose ps"
        echo "  - Check logs: docker-compose logs"
        echo "  - Check system: systemctl status simple-menu-monitor.service"
    fi
}

# Main deployment function
main() {
    log "INFO" "🚀 Starting Simple Menu deployment for Raspberry Pi"
    
    # Set up error handling
    trap cleanup EXIT
    
    # Change to script directory
    cd "$SCRIPT_DIR"
    
    # Create log file
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    sudo touch "$LOG_FILE"
    sudo chown "$USER:$USER" "$LOG_FILE" 2>/dev/null || true
    
    # Run deployment steps
    check_root
    check_requirements
    create_backup
    install_dependencies
    setup_log_rotation
    deploy_application
    setup_systemd_service
    setup_autostart
    verify_deployment
    
    log "INFO" "✅ Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    --backup-only)
        create_backup
        ;;
    --verify-only)
        verify_deployment
        ;;
    --install-deps-only)
        install_dependencies
        ;;
    *)
        main
        ;;
esac
