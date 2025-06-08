#!/bin/bash

# Simple Menu Deployment Test Script
# Comprehensive testing suite for Raspberry Pi deployment validation

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_LOG="/tmp/simple-menu-test-$(date +%Y%m%d_%H%M%S).log"
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:4200"
WS_URL="ws://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$TEST_LOG"
}

log_success() {
    local message="$*"
    echo -e "${GREEN}✅ $message${NC}" | tee -a "$TEST_LOG"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_error() {
    local message="$*"
    echo -e "${RED}❌ $message${NC}" | tee -a "$TEST_LOG"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_warning() {
    local message="$*"
    echo -e "${YELLOW}⚠️ $message${NC}" | tee -a "$TEST_LOG"
}

log_info() {
    local message="$*"
    echo -e "${BLUE}ℹ️ $message${NC}" | tee -a "$TEST_LOG"
}

log_skip() {
    local message="$*"
    echo -e "${YELLOW}⏭️ $message${NC}" | tee -a "$TEST_LOG"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
}

# Test system requirements
test_system_requirements() {
    log_info "🔍 Testing system requirements..."
    
    # Check if we're on Raspberry Pi
    if grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
        log_success "Running on Raspberry Pi"
    else
        log_warning "Not running on Raspberry Pi - some tests may not apply"
    fi
    
    # Check Docker
    if command -v docker >/dev/null 2>&1; then
        log_success "Docker is installed"
        
        # Check Docker daemon
        if docker info >/dev/null 2>&1; then
            log_success "Docker daemon is running"
        else
            log_error "Docker daemon is not running"
            return 1
        fi
    else
        log_error "Docker is not installed"
        return 1
    fi
    
    # Check Docker Compose
    if command -v docker-compose >/dev/null 2>&1; then
        log_success "Docker Compose is installed"
    else
        log_error "Docker Compose is not installed"
        return 1
    fi
    
    # Check if user is in docker group
    if groups | grep -q docker; then
        log_success "User is in docker group"
    else
        log_error "User is not in docker group"
        return 1
    fi
    
    # Check available resources
    local available_memory=$(free -m | grep MemAvailable | awk '{print $2}' || echo "0")
    if [[ $available_memory -gt 512 ]]; then
        log_success "Sufficient memory available: ${available_memory}MB"
    else
        log_warning "Low memory available: ${available_memory}MB"
    fi
    
    local available_disk=$(df . | tail -1 | awk '{print $4}')
    if [[ $available_disk -gt 1048576 ]]; then  # 1GB in KB
        log_success "Sufficient disk space available"
    else
        log_warning "Low disk space available"
    fi
    
    return 0
}

# Test Docker services
test_docker_services() {
    log_info "🐳 Testing Docker services..."
    
    # Change to script directory
    cd "$SCRIPT_DIR"
    
    # Check if docker-compose.yml exists
    if [[ ! -f "docker-compose.yml" ]]; then
        log_error "docker-compose.yml not found"
        return 1
    fi
    
    # Check if services are running
    if ! docker-compose ps | grep -q Up; then
        log_error "Docker services are not running"
        return 1
    fi
    
    log_success "Docker services are running"
    
    # Check individual service health
    local backend_status=$(docker-compose ps -q backend | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    local frontend_status=$(docker-compose ps -q frontend | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    
    if [[ "$backend_status" == "healthy" ]]; then
        log_success "Backend service is healthy"
    else
        log_error "Backend service is not healthy: $backend_status"
    fi
    
    if [[ "$frontend_status" == "healthy" ]]; then
        log_success "Frontend service is healthy"
    else
        log_error "Frontend service is not healthy: $frontend_status"
    fi
    
    # Check container resource usage
    log_info "Container resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | tee -a "$TEST_LOG"
    
    return 0
}

# Test network connectivity
test_network_connectivity() {
    log_info "🌐 Testing network connectivity..."
    
    # Test backend health endpoint
    if curl -sf "$BACKEND_URL/health" >/dev/null 2>&1; then
        log_success "Backend health endpoint is accessible"
        
        # Get detailed health info
        local health_response=$(curl -s "$BACKEND_URL/health" 2>/dev/null)
        if echo "$health_response" | jq . >/dev/null 2>&1; then
            log_success "Backend health endpoint returns valid JSON"
            log_info "Health response: $health_response"
        else
            log_warning "Backend health endpoint response is not valid JSON"
        fi
    else
        log_error "Backend health endpoint is not accessible"
    fi
    
    # Test frontend
    if curl -sf "$FRONTEND_URL" >/dev/null 2>&1; then
        log_success "Frontend is accessible"
    else
        log_error "Frontend is not accessible"
    fi
    
    # Test frontend health endpoint (if exists)
    if curl -sf "$FRONTEND_URL/health" >/dev/null 2>&1; then
        log_success "Frontend health endpoint is accessible"
    else
        log_warning "Frontend health endpoint is not accessible (may not exist)"
    fi
    
    # Test API endpoints
    if curl -sf "$BACKEND_URL/api/auth/status" >/dev/null 2>&1; then
        log_success "Auth API endpoint is accessible"
    else
        log_warning "Auth API endpoint test failed or not implemented"
    fi
    
    return 0
}

# Test WebSocket connectivity
test_websocket_connectivity() {
    log_info "🔌 Testing WebSocket connectivity..."
    
    # Check if wscat is available
    if ! command -v wscat >/dev/null 2>&1; then
        log_skip "wscat not installed - skipping WebSocket tests"
        return 0
    fi
    
    # Test WebSocket connection
    if timeout 10 wscat -c "$WS_URL/menu-updates" --execute 'process.exit(0)' >/dev/null 2>&1; then
        log_success "WebSocket connection successful"
    else
        log_error "WebSocket connection failed"
    fi
    
    return 0
}

# Test database connectivity
test_database() {
    log_info "💾 Testing database connectivity..."
    
    local db_path="./Backend/prisma/dev.db"
    
    # Check if database file exists
    if [[ -f "$db_path" ]]; then
        log_success "Database file exists"
        
        # Check file size
        local db_size=$(stat -f%z "$db_path" 2>/dev/null || stat -c%s "$db_path" 2>/dev/null || echo "0")
        if [[ $db_size -gt 0 ]]; then
            log_success "Database file is not empty (${db_size} bytes)"
        else
            log_error "Database file is empty"
        fi
        
        # Check if sqlite3 is available for further testing
        if command -v sqlite3 >/dev/null 2>&1; then
            # Test database integrity
            if sqlite3 "$db_path" "PRAGMA integrity_check;" | grep -q "ok"; then
                log_success "Database integrity check passed"
            else
                log_error "Database integrity check failed"
            fi
            
            # List tables
            local tables=$(sqlite3 "$db_path" ".tables" 2>/dev/null)
            if [[ -n "$tables" ]]; then
                log_success "Database tables found: $tables"
            else
                log_warning "No tables found in database"
            fi
        else
            log_skip "sqlite3 not available - skipping detailed database tests"
        fi
    else
        log_error "Database file not found: $db_path"
    fi
    
    return 0
}

# Test monitoring scripts
test_monitoring_scripts() {
    log_info "📊 Testing monitoring scripts..."
    
    # Test health monitor script
    if [[ -f "./monitor.sh" ]]; then
        log_success "Health monitor script exists"
        
        if [[ -x "./monitor.sh" ]]; then
            log_success "Health monitor script is executable"
            
            # Test health check
            if timeout 30 ./monitor.sh --check >/dev/null 2>&1; then
                log_success "Health monitor check completed successfully"
            else
                log_error "Health monitor check failed"
            fi
        else
            log_error "Health monitor script is not executable"
        fi
    else
        log_error "Health monitor script not found"
    fi
    
    # Test database manager script
    if [[ -f "./db-manager.sh" ]]; then
        log_success "Database manager script exists"
        
        if [[ -x "./db-manager.sh" ]]; then
            log_success "Database manager script is executable"
            
            # Test database verification
            if timeout 30 ./db-manager.sh verify >/dev/null 2>&1; then
                log_success "Database verification completed successfully"
            else
                log_error "Database verification failed"
            fi
        else
            log_error "Database manager script is not executable"
        fi
    else
        log_error "Database manager script not found"
    fi
    
    # Test performance monitor script
    if [[ -f "./performance-monitor.sh" ]]; then
        log_success "Performance monitor script exists"
        
        if [[ -x "./performance-monitor.sh" ]]; then
            log_success "Performance monitor script is executable"
            
            # Test status check
            if timeout 30 ./performance-monitor.sh status >/dev/null 2>&1; then
                log_success "Performance monitor status check completed"
            else
                log_error "Performance monitor status check failed"
            fi
        else
            log_error "Performance monitor script is not executable"
        fi
    else
        log_error "Performance monitor script not found"
    fi
    
    return 0
}

# Test systemd services
test_systemd_services() {
    log_info "⚙️ Testing systemd services..."
    
    # Test health monitor service
    if systemctl is-active --quiet simple-menu-monitor.service 2>/dev/null; then
        log_success "Health monitor service is active"
    else
        log_warning "Health monitor service is not active"
    fi
    
    if systemctl is-enabled --quiet simple-menu-monitor.service 2>/dev/null; then
        log_success "Health monitor service is enabled"
    else
        log_warning "Health monitor service is not enabled"
    fi
    
    # Test application service
    if systemctl is-active --quiet simple-menu.service 2>/dev/null; then
        log_success "Application service is active"
    else
        log_warning "Application service is not active"
    fi
    
    if systemctl is-enabled --quiet simple-menu.service 2>/dev/null; then
        log_success "Application service is enabled"
    else
        log_warning "Application service is not enabled"
    fi
    
    return 0
}

# Test backup functionality
test_backup_functionality() {
    log_info "💾 Testing backup functionality..."
    
    # Test database backup
    if [[ -f "./db-manager.sh" && -x "./db-manager.sh" ]]; then
        if timeout 60 ./db-manager.sh backup test-backup >/dev/null 2>&1; then
            log_success "Database backup test completed"
            
            # Check if backup was created
            local backup_dir="/home/pi/simple-menu-backups/database"
            if [[ -d "$backup_dir" ]]; then
                local backup_count=$(find "$backup_dir" -name "*test-backup*.db" | wc -l)
                if [[ $backup_count -gt 0 ]]; then
                    log_success "Backup file was created successfully"
                    
                    # Clean up test backup
                    find "$backup_dir" -name "*test-backup*" -delete 2>/dev/null || true
                else
                    log_error "Backup file was not found"
                fi
            else
                log_error "Backup directory not found"
            fi
        else
            log_error "Database backup test failed"
        fi
    else
        log_skip "Database manager script not available for backup test"
    fi
    
    return 0
}

# Test error handling
test_error_handling() {
    log_info "🚨 Testing error handling..."
    
    # Test frontend error pages
    local frontend_container=$(docker-compose ps -q frontend)
    if [[ -n "$frontend_container" ]]; then
        # Test 404 page
        if docker exec "$frontend_container" test -f /usr/share/nginx/html/404.html; then
            log_success "404 error page exists"
        else
            log_error "404 error page not found"
        fi
        
        # Test 50x page
        if docker exec "$frontend_container" test -f /usr/share/nginx/html/50x.html; then
            log_success "50x error page exists"
        else
            log_error "50x error page not found"
        fi
    else
        log_skip "Frontend container not available for error page test"
    fi
    
    # Test nginx configuration
    if docker exec "$frontend_container" nginx -t >/dev/null 2>&1; then
        log_success "Nginx configuration is valid"
    else
        log_error "Nginx configuration is invalid"
    fi
    
    return 0
}

# Test performance
test_performance() {
    log_info "⚡ Testing performance..."
    
    # Test response times
    local backend_response_time=$(curl -w "%{time_total}" -s -o /dev/null "$BACKEND_URL/health" 2>/dev/null || echo "999")
    if (( $(echo "$backend_response_time < 2.0" | bc -l) )); then
        log_success "Backend response time is good: ${backend_response_time}s"
    else
        log_warning "Backend response time is slow: ${backend_response_time}s"
    fi
    
    local frontend_response_time=$(curl -w "%{time_total}" -s -o /dev/null "$FRONTEND_URL" 2>/dev/null || echo "999")
    if (( $(echo "$frontend_response_time < 3.0" | bc -l) )); then
        log_success "Frontend response time is good: ${frontend_response_time}s"
    else
        log_warning "Frontend response time is slow: ${frontend_response_time}s"
    fi
    
    # Test system resources
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
    if (( $(echo "$cpu_usage < 80" | bc -l) )); then
        log_success "CPU usage is acceptable: ${cpu_usage}%"
    else
        log_warning "High CPU usage: ${cpu_usage}%"
    fi
    
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$memory_usage < 85" | bc -l) )); then
        log_success "Memory usage is acceptable: ${memory_usage}%"
    else
        log_warning "High memory usage: ${memory_usage}%"
    fi
    
    return 0
}

# Test security
test_security() {
    log_info "🔒 Testing security configuration..."
    
    # Test if services are running as non-root
    local backend_user=$(docker exec "$(docker-compose ps -q backend)" whoami 2>/dev/null || echo "unknown")
    if [[ "$backend_user" != "root" ]]; then
        log_success "Backend is running as non-root user: $backend_user"
    else
        log_warning "Backend is running as root user"
    fi
    
    # Test nginx security headers
    local security_headers=$(curl -I "$FRONTEND_URL" 2>/dev/null | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection")
    if [[ -n "$security_headers" ]]; then
        log_success "Security headers are configured"
    else
        log_warning "Security headers may not be configured"
    fi
    
    # Test if database file has proper permissions
    if [[ -f "./Backend/prisma/dev.db" ]]; then
        local db_perms=$(stat -c %a "./Backend/prisma/dev.db" 2>/dev/null || stat -f %A "./Backend/prisma/dev.db" 2>/dev/null)
        if [[ "$db_perms" == "644" ]] || [[ "$db_perms" == "664" ]]; then
            log_success "Database file has proper permissions: $db_perms"
        else
            log_warning "Database file permissions may be too permissive: $db_perms"
        fi
    fi
    
    return 0
}

# Generate test report
generate_test_report() {
    local report_file="/tmp/simple-menu-test-report.html"
    
    log_info "📋 Generating test report..."
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Simple Menu Deployment Test Report</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .test-section { margin: 20px 0; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .warning { color: #ff9800; }
        .skipped { color: #9e9e9e; }
        .log-content { background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; white-space: pre-wrap; max-height: 400px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Simple Menu Deployment Test Report</h1>
        <p>Generated: $(date)</p>
        <p>Test Log: $TEST_LOG</p>
    </div>
    
    <div class="summary">
        <h2>📊 Test Summary</h2>
        <p><span class="passed">✅ Passed: $TESTS_PASSED</span></p>
        <p><span class="failed">❌ Failed: $TESTS_FAILED</span></p>
        <p><span class="skipped">⏭️ Skipped: $TESTS_SKIPPED</span></p>
        <p><strong>Total Tests: $((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))</strong></p>
    </div>
    
    <div class="test-section">
        <h2>📝 Detailed Test Log</h2>
        <div class="log-content">$(cat "$TEST_LOG" | sed 's/</\&lt;/g; s/>/\&gt;/g')</div>
    </div>
</body>
</html>
EOF
    
    log_success "Test report generated: $report_file"
    echo "📊 View report: file://$report_file"
}

# Main test function
main() {
    echo "🧪 Starting Simple Menu Deployment Test Suite"
    echo "=============================================="
    echo
    
    # Initialize log file
    echo "Simple Menu Deployment Test Log - $(date)" > "$TEST_LOG"
    echo "=========================================" >> "$TEST_LOG"
    echo >> "$TEST_LOG"
    
    # Change to script directory
    cd "$SCRIPT_DIR"
    
    # Run all tests
    test_system_requirements
    test_docker_services
    test_network_connectivity
    test_websocket_connectivity
    test_database
    test_monitoring_scripts
    test_systemd_services
    test_backup_functionality
    test_error_handling
    test_performance
    test_security
    
    # Generate report
    generate_test_report
    
    echo
    echo "🎯 Test Results Summary"
    echo "======================"
    echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
    echo -e "${YELLOW}⏭️ Skipped: $TESTS_SKIPPED${NC}"
    echo "📋 Total Tests: $((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))"
    echo
    
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}🎉 All tests passed! Deployment is ready for production.${NC}"
        exit 0
    else
        echo -e "${RED}⚠️ Some tests failed. Please review the results and fix issues before production deployment.${NC}"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --quick)
        # Run only essential tests
        test_docker_services
        test_network_connectivity
        test_database
        ;;
    --monitoring)
        # Test only monitoring components
        test_monitoring_scripts
        test_systemd_services
        ;;
    --performance)
        # Test only performance aspects
        test_performance
        test_security
        ;;
    *)
        # Run full test suite
        main
        ;;
esac
