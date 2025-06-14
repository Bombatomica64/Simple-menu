#!/bin/bash

# Simple Menu Integration and Final Setup Script
# Ensures all components are properly integrated and configured

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/simple-menu-integration.log"

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
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_success() {
    local message="$*"
    echo -e "${GREEN}✅ $message${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    local message="$*"
    echo -e "${RED}❌ $message${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    local message="$*"
    echo -e "${YELLOW}⚠️ $message${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    local message="$*"
    echo -e "${BLUE}ℹ️ $message${NC}" | tee -a "$LOG_FILE"
}

# Make all scripts executable
setup_script_permissions() {
    log_info "🔧 Setting up script permissions..."
    
    local scripts=(
        "deploy.sh"
        "monitor.sh"
        "db-manager.sh"
        "performance-monitor.sh"
        "test-deployment.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            chmod +x "$script"
            log_success "Made $script executable"
        else
            log_warning "Script not found: $script"
        fi
    done
}

# Setup log directories and files
setup_logging() {
    log_info "📝 Setting up logging infrastructure..."
    
    local log_dirs=(
        "/var/log"
        "/var/log/simple-menu-metrics"
    )
    
    for dir in "${log_dirs[@]}"; do
        sudo mkdir -p "$dir"
        sudo chown "$(whoami):$(whoami)" "$dir" 2>/dev/null || true
    done
    
    local log_files=(
        "/var/log/simple-menu-monitor.log"
        "/var/log/simple-menu-performance.log"
        "/var/log/simple-menu-db.log"
        "/var/log/simple-menu-deploy.log"
        "/var/log/simple-menu-integration.log"
    )
    
    for log_file in "${log_files[@]}"; do
        sudo touch "$log_file"
        sudo chown "$(whoami):$(whoami)" "$log_file" 2>/dev/null || true
        log_success "Created log file: $log_file"
    done
}

# Setup cron jobs
setup_cron_jobs() {
    log_info "⏰ Setting up automated maintenance jobs..."
    
    # Copy cron configuration
    if [[ -f "cron-jobs.txt" ]]; then
        # Update paths in cron file
        sed "s|/home/pi/simple-menu|$SCRIPT_DIR|g" cron-jobs.txt > /tmp/simple-menu-cron
        
        # Install cron jobs
        sudo cp /tmp/simple-menu-cron /etc/cron.d/simple-menu
        sudo chown root:root /etc/cron.d/simple-menu
        sudo chmod 644 /etc/cron.d/simple-menu
        
        log_success "Cron jobs installed"
        rm -f /tmp/simple-menu-cron
    else
        log_warning "Cron configuration file not found"
    fi
}

# Validate Docker configuration
validate_docker_config() {
    log_info "🐳 Validating Docker configuration..."
    
    # Check docker-compose.yml
    if [[ -f "docker-compose.yml" ]]; then
        if docker-compose config >/dev/null 2>&1; then
            log_success "Docker Compose configuration is valid"
        else
            log_error "Docker Compose configuration is invalid"
            return 1
        fi
    else
        log_error "docker-compose.yml not found"
        return 1
    fi
    
    # Check if override file exists and is valid
    if [[ -f "docker-compose.override.yml" ]]; then
        if docker-compose -f docker-compose.yml -f docker-compose.override.yml config >/dev/null 2>&1; then
            log_success "Docker Compose override configuration is valid"
        else
            log_error "Docker Compose override configuration is invalid"
            return 1
        fi
    fi
    
    return 0
}

# Setup environment file
setup_environment() {
    log_info "🌍 Setting up environment configuration..."
    
    if [[ ! -f ".env" ]]; then
        log_info "Creating default .env file..."
        
        cat > .env << 'EOF'
# Simple Menu Environment Configuration
NODE_ENV=production
DATABASE_URL="file:./prisma/dev.db"

# Monitoring Configuration
ALERT_EMAIL=
CHECK_INTERVAL=60
MEMORY_THRESHOLD=80
DISK_THRESHOLD=90
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_TEMP=75

# Application Configuration
PORT=3000
FRONTEND_PORT=4200

# Docker Configuration
COMPOSE_PROJECT_NAME=simple-menu
EOF
        
        log_success "Default .env file created"
    else
        log_success ".env file already exists"
    fi
}

# Initialize database
initialize_database() {
    log_info "💾 Initializing database..."
    
    local db_path="./Backend/prisma/dev.db"
    
    if [[ ! -f "$db_path" ]]; then
        log_info "Database file not found, will be created on first run"
    else
        # Verify database integrity
        if command -v sqlite3 >/dev/null 2>&1; then
            if sqlite3 "$db_path" "PRAGMA integrity_check;" | grep -q "ok"; then
                log_success "Database integrity verified"
            else
                log_warning "Database integrity check failed - may need restoration"
            fi
        else
            log_warning "sqlite3 not available - skipping integrity check"
        fi
    fi
    
    # Ensure proper database directory permissions
    sudo mkdir -p "$(dirname "$db_path")"
    sudo chown -R "$(whoami):$(whoami)" "./Backend/prisma" 2>/dev/null || true
}

# Test all integrations
test_integrations() {
    log_info "🧪 Testing component integrations..."
    
    # Test script functionality
    if [[ -x "./monitor.sh" ]]; then
        if timeout 30 ./monitor.sh --check >/dev/null 2>&1; then
            log_success "Health monitor integration test passed"
        else
            log_warning "Health monitor integration test failed or timed out"
        fi
    fi
    
    if [[ -x "./db-manager.sh" ]]; then
        if timeout 30 ./db-manager.sh verify >/dev/null 2>&1; then
            log_success "Database manager integration test passed"
        else
            log_warning "Database manager integration test failed or timed out"
        fi
    fi
    
    if [[ -x "./performance-monitor.sh" ]]; then
        if timeout 30 ./performance-monitor.sh status >/dev/null 2>&1; then
            log_success "Performance monitor integration test passed"
        else
            log_warning "Performance monitor integration test failed or timed out"
        fi
    fi
}

# Setup systemd services
setup_systemd_services() {
    log_info "⚙️ Setting up systemd services..."
    
    # Update service file paths
    if [[ -f "simple-menu-monitor.service" ]]; then
        # Create a temporary service file with correct paths
        sed "s|/home/pi/simple-menu|$SCRIPT_DIR|g; s|User=pi|User=$(whoami)|g" simple-menu-monitor.service > /tmp/simple-menu-monitor.service
        
        # Install the service
        sudo cp /tmp/simple-menu-monitor.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable simple-menu-monitor.service
        
        log_success "Health monitor service installed and enabled"
        rm -f /tmp/simple-menu-monitor.service
    else
        log_warning "systemd service file not found"
    fi
    
    # Create application service
    sudo tee /etc/systemd/system/simple-menu.service > /dev/null << EOF
[Unit]
Description=Simple Menu Application
Documentation=Simple Menu Docker Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
User=$(whoami)
Group=docker
WorkingDirectory=$SCRIPT_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable simple-menu.service
    
    log_success "Application service installed and enabled"
}

# Create backup directory structure
setup_backup_directories() {
    log_info "📦 Setting up backup directory structure..."
    
    local backup_root="/home/$(whoami)/simple-menu-backups"
    local backup_dirs=(
        "$backup_root"
        "$backup_root/database"
        "$backup_root/configuration"
        "$backup_root/logs"
    )
    
    for dir in "${backup_dirs[@]}"; do
        mkdir -p "$dir"
        log_success "Created backup directory: $dir"
    done
    
    # Set proper permissions
    chmod 755 "$backup_root"
    chmod 750 "$backup_root/database"
}

# Generate startup documentation
generate_documentation() {
    log_info "📚 Generating startup documentation..."
    
    cat > STARTUP_GUIDE.md << 'EOF'
# Simple Menu Quick Start Guide

## 🚀 Starting the Application

### Method 1: Using systemd (Recommended for production)
```bash
sudo systemctl start simple-menu.service
sudo systemctl status simple-menu.service
```

### Method 2: Using Docker Compose directly
```bash
docker-compose up -d
docker-compose ps
```

### Method 3: Using deployment script
```bash
./deploy.sh --verify-only
```

## 📊 Monitoring

### Check Application Status
```bash
# Quick health check
./monitor.sh --check

# Detailed status
./performance-monitor.sh status

# Generate health report
./monitor.sh --report
```

### View Logs
```bash
# Application logs
docker-compose logs -f

# Health monitor logs
sudo journalctl -u simple-menu-monitor.service -f

# System logs
tail -f /var/log/simple-menu-monitor.log
```

## 🛠️ Management Commands

### Restart Services
```bash
docker-compose restart
# or
sudo systemctl restart simple-menu.service
```

### Stop Services
```bash
docker-compose down
# or
sudo systemctl stop simple-menu.service
```

### Update Application
```bash
git pull origin main
docker-compose down
docker-compose up --build -d
```

## 🔧 Troubleshooting

### Service Won't Start
1. Check Docker: `sudo systemctl status docker`
2. Check logs: `docker-compose logs`
3. Check disk space: `df -h`
4. Check memory: `free -h`

### Performance Issues
1. Check system resources: `./performance-monitor.sh status`
2. Check container stats: `docker stats`
3. Check temperature: `cat /sys/class/thermal/thermal_zone0/temp`

### Database Issues
1. Verify database: `./db-manager.sh verify`
2. Create backup: `./db-manager.sh backup emergency`
3. Run maintenance: `./db-manager.sh maintain`

## 📱 Access URLs

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🆘 Emergency Recovery

```bash
# Stop everything
docker-compose down

# Clean system
docker system prune -f

# Restore from backup
./db-manager.sh list
./db-manager.sh restore /path/to/backup.db

# Restart
docker-compose up --build -d
```
EOF
    
    log_success "Startup guide created: STARTUP_GUIDE.md"
}

# Final validation
final_validation() {
    log_info "🔍 Performing final validation..."
    
    local validation_passed=true
    
    # Check required files
    local required_files=(
        "docker-compose.yml"
        "monitor.sh"
        "db-manager.sh"
        "performance-monitor.sh"
        "deploy.sh"
        ".env"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_success "Required file exists: $file"
        else
            log_error "Required file missing: $file"
            validation_passed=false
        fi
    done
    
    # Check script permissions
    for script in monitor.sh db-manager.sh performance-monitor.sh deploy.sh test-deployment.sh; do
        if [[ -f "$script" && -x "$script" ]]; then
            log_success "Script is executable: $script"
        else
            log_error "Script is not executable: $script"
            validation_passed=false
        fi
    done
    
    # Check systemd services
    if systemctl list-unit-files | grep -q simple-menu-monitor; then
        log_success "Health monitor service is installed"
    else
        log_warning "Health monitor service is not installed"
    fi
    
    if systemctl list-unit-files | grep -q "simple-menu.service"; then
        log_success "Application service is installed"
    else
        log_warning "Application service is not installed"
    fi
    
    if $validation_passed; then
        log_success "Final validation passed"
        return 0
    else
        log_error "Final validation failed"
        return 1
    fi
}

# Display completion summary
show_completion_summary() {
    echo
    echo "🎉 Simple Menu Integration Complete!"
    echo "===================================="
    echo
    echo "📋 What's been configured:"
    echo "  ✅ Script permissions and logging"
    echo "  ✅ Environment configuration"
    echo "  ✅ Docker validation"
    echo "  ✅ Database initialization"
    echo "  ✅ Systemd services"
    echo "  ✅ Automated maintenance (cron)"
    echo "  ✅ Backup infrastructure"
    echo "  ✅ Monitoring and alerting"
    echo
    echo "🚀 Ready to deploy:"
    echo "  ./deploy.sh                 - Full deployment"
    echo "  ./test-deployment.sh        - Test everything"
    echo "  docker-compose up -d        - Start services"
    echo
    echo "📊 Monitoring commands:"
    echo "  ./monitor.sh --check        - Health check"
    echo "  ./performance-monitor.sh status - System status"
    echo "  ./db-manager.sh verify      - Database check"
    echo
    echo "📚 Documentation:"
    echo "  DEPLOYMENT_GUIDE.md         - Complete guide"
    echo "  STARTUP_GUIDE.md           - Quick start"
    echo
    echo "🌐 Access URLs (after deployment):"
    echo "  Frontend: http://localhost:4200"
    echo "  Backend:  http://localhost:3000"
    echo "  Health:   http://localhost:3000/health"
    echo
}

# Main integration function
main() {
    echo "🔧 Starting Simple Menu Integration Setup"
    echo "========================================="
    echo
    
    # Setup logging
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    sudo touch "$LOG_FILE"
    sudo chown "$(whoami):$(whoami)" "$LOG_FILE" 2>/dev/null || true
    
    # Change to script directory
    cd "$SCRIPT_DIR"
    
    # Run integration steps
    setup_script_permissions
    setup_logging
    setup_environment
    validate_docker_config
    initialize_database
    setup_backup_directories
    setup_systemd_services
    setup_cron_jobs
    test_integrations
    generate_documentation
    final_validation
    
    show_completion_summary
    
    log_success "Integration setup completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    --validate-only)
        final_validation
        ;;
    --test-only)
        test_integrations
        ;;
    --docs-only)
        generate_documentation
        ;;
    *)
        main
        ;;
esac
