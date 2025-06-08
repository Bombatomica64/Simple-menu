#!/bin/bash

# Simple Menu Health Monitor Script for Raspberry Pi
# This script monitors the health of the Simple Menu application and performs automatic recovery

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/simple-menu-monitor.log"
ALERT_EMAIL="${ALERT_EMAIL:-}"
MAX_RESTART_ATTEMPTS=3
CHECK_INTERVAL=60  # seconds
MEMORY_THRESHOLD=80  # percentage
DISK_THRESHOLD=90   # percentage

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

# Health check functions
check_docker_services() {
    log "INFO" "Checking Docker services..."

    local backend_status=$(docker-compose ps -q backend | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")
    local frontend_status=$(docker-compose ps -q frontend | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")

    if [[ "$backend_status" == "healthy" && "$frontend_status" == "healthy" ]]; then
        log "INFO" "✅ All Docker services are healthy"
        return 0
    else
        log "ERROR" "❌ Docker services unhealthy - Backend: $backend_status, Frontend: $frontend_status"
        return 1
    fi
}

check_system_resources() {
    log "INFO" "Checking system resources..."

    # Memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [[ $memory_usage -gt $MEMORY_THRESHOLD ]]; then
        log "WARN" "⚠️  High memory usage: ${memory_usage}%"
    else
        log "INFO" "✅ Memory usage OK: ${memory_usage}%"
    fi

    # Disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -gt $DISK_THRESHOLD ]]; then
        log "WARN" "⚠️  High disk usage: ${disk_usage}%"
    else
        log "INFO" "✅ Disk usage OK: ${disk_usage}%"
    fi

    # CPU temperature (Raspberry Pi specific)
    if [[ -f /sys/class/thermal/thermal_zone0/temp ]]; then
        local cpu_temp=$(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
        if [[ $cpu_temp -gt 70 ]]; then
            log "WARN" "⚠️  High CPU temperature: ${cpu_temp}°C"
        else
            log "INFO" "✅ CPU temperature OK: ${cpu_temp}°C"
        fi
    fi
}

check_network_connectivity() {
    log "INFO" "Checking network connectivity..."

    # Check backend API
    if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
        log "INFO" "✅ Backend API responding"
    else
        log "ERROR" "❌ Backend API not responding"
        return 1
    fi

    # Check frontend
    if curl -sf http://localhost:4200/health >/dev/null 2>&1; then
        log "INFO" "✅ Frontend responding"
    else
        log "ERROR" "❌ Frontend not responding"
        return 1
    fi

    return 0
}

check_websocket_connection() {
    log "INFO" "Checking WebSocket connectivity..."

    # Use wscat if available, otherwise skip
    if command -v wscat >/dev/null 2>&1; then
        if timeout 10 wscat -c ws://localhost:3000/menu-updates --execute 'process.exit(0)' >/dev/null 2>&1; then
            log "INFO" "✅ WebSocket connection OK"
        else
            log "ERROR" "❌ WebSocket connection failed"
            return 1
        fi
    else
        log "INFO" "ℹ️  WebSocket check skipped (wscat not installed)"
    fi

    return 0
}

check_database_health() {
    log "INFO" "Checking database health..."

    # Check if database file exists and is accessible
    local db_path="./Backend/prisma/dev.db"
    if [[ -f "$db_path" && -r "$db_path" ]]; then
        local db_size=$(stat -f%z "$db_path" 2>/dev/null || stat -c%s "$db_path" 2>/dev/null || echo "0")
        if [[ $db_size -gt 0 ]]; then
            log "INFO" "✅ Database file OK (${db_size} bytes)"
        else
            log "ERROR" "❌ Database file is empty"
            return 1
        fi
    else
        log "ERROR" "❌ Database file not found or not readable"
        return 1
    fi

    return 0
}

restart_services() {
    local restart_count="$1"
    log "WARN" "🔄 Attempting service restart (attempt $restart_count/$MAX_RESTART_ATTEMPTS)"

    # Graceful restart
    if docker-compose restart backend frontend; then
        log "INFO" "✅ Services restarted successfully"
        sleep 30  # Wait for services to stabilize
        return 0
    else
        log "ERROR" "❌ Failed to restart services"
        return 1
    fi
}

force_rebuild() {
    log "WARN" "🔨 Performing force rebuild..."

    # Stop services
    docker-compose down

    # Clean up
    docker system prune -f

    # Rebuild and start
    if docker-compose up --build -d; then
        log "INFO" "✅ Force rebuild completed successfully"
        sleep 60  # Wait longer for full startup
        return 0
    else
        log "ERROR" "❌ Force rebuild failed"
        return 1
    fi
}

send_alert() {
    local message="$1"

    # Log alert
    log "ALERT" "$message"

    # Send email if configured
    if [[ -n "$ALERT_EMAIL" ]] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "Simple Menu Alert - $(hostname)" "$ALERT_EMAIL"
        log "INFO" "📧 Alert email sent to $ALERT_EMAIL"
    fi

    # Log to system journal if available
    if command -v logger >/dev/null 2>&1; then
        logger -t simple-menu-monitor "$message"
    fi
}

cleanup_logs() {
    log "INFO" "🧹 Cleaning up old logs..."

    # Keep only last 7 days of monitor logs
    find "$(dirname "$LOG_FILE")" -name "simple-menu-monitor.log.*" -mtime +7 -delete 2>/dev/null || true

    # Rotate current log if it's too large (>10MB)
    if [[ -f "$LOG_FILE" ]]; then
        local log_size=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo "0")
        if [[ $log_size -gt 10485760 ]]; then  # 10MB
            mv "$LOG_FILE" "${LOG_FILE}.$(date +%Y%m%d_%H%M%S)"
            touch "$LOG_FILE"
            log "INFO" "📝 Log file rotated due to size"
        fi
    fi

    # Clean Docker logs if they're too large
    docker system prune -f >/dev/null 2>&1 || true
}

generate_health_report() {
    log "INFO" "📊 Generating health report..."

    local report_file="/tmp/simple-menu-health-report.txt"

    {
        echo "Simple Menu Health Report - $(date)"
        echo "========================================="
        echo

        echo "System Information:"
        echo "- Hostname: $(hostname)"
        echo "- Uptime: $(uptime -p 2>/dev/null || uptime)"
        echo "- Load Average: $(cat /proc/loadavg | cut -d' ' -f1-3)"
        echo

        echo "Resource Usage:"
        echo "- Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
        echo "- Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
        [[ -f /sys/class/thermal/thermal_zone0/temp ]] && echo "- CPU Temp: $(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))°C"
        echo

        echo "Docker Services:"
        docker-compose ps
        echo

        echo "Recent Logs (last 20 lines):"
        tail -20 "$LOG_FILE" 2>/dev/null || echo "No logs available"

    } > "$report_file"

    echo "Health report generated: $report_file"
}

main() {
    log "INFO" "🚀 Starting Simple Menu health monitor"

    # Ensure we're in the right directory
    cd "$SCRIPT_DIR"

    # Create log file if it doesn't exist
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    sudo touch "$LOG_FILE"
    sudo chown "$(whoami):$(whoami)" "$LOG_FILE" 2>/dev/null || true

    local consecutive_failures=0
    local restart_attempts=0

    while true; do
        log "INFO" "🔍 Starting health check cycle"

        local health_ok=true

        # Run all health checks
        check_system_resources || true  # Don't fail on resource warnings

        if ! check_docker_services; then
            health_ok=false
        fi

        if ! check_network_connectivity; then
            health_ok=false
        fi

        if ! check_websocket_connection; then
            health_ok=false
        fi

        if ! check_database_health; then
            health_ok=false
        fi

        if [[ "$health_ok" == true ]]; then
            log "INFO" "✅ All health checks passed"
            consecutive_failures=0
            restart_attempts=0
        else
            consecutive_failures=$((consecutive_failures + 1))
            log "ERROR" "❌ Health check failed (consecutive failures: $consecutive_failures)"

            if [[ $consecutive_failures -ge 3 ]]; then
                if [[ $restart_attempts -lt $MAX_RESTART_ATTEMPTS ]]; then
                    restart_attempts=$((restart_attempts + 1))

                    if [[ $restart_attempts -eq $MAX_RESTART_ATTEMPTS ]]; then
                        force_rebuild
                    else
                        restart_services "$restart_attempts"
                    fi

                    consecutive_failures=0
                else
                    local alert_msg="🚨 CRITICAL: Simple Menu service has failed repeatedly and automatic recovery has been exhausted. Manual intervention required."
                    send_alert "$alert_msg"

                    # Generate health report for debugging
                    generate_health_report

                    # Wait longer before next check when in critical state
                    sleep $((CHECK_INTERVAL * 5))
                    continue
                fi
            fi
        fi

        # Periodic maintenance
        if [[ $(date +%H:%M) == "03:00" ]]; then
            cleanup_logs
        fi

        # Wait before next check
        sleep "$CHECK_INTERVAL"
    done
}

# Handle script termination
trap 'log "INFO" "🛑 Health monitor stopped"; exit 0' SIGTERM SIGINT

# Check if running as daemon
if [[ "${1:-}" == "--daemon" ]]; then
    # Run as daemon
    main &
    echo $! > /var/run/simple-menu-monitor.pid
    log "INFO" "🔄 Health monitor started as daemon (PID: $!)"
elif [[ "${1:-}" == "--report" ]]; then
    # Generate health report only
    generate_health_report
elif [[ "${1:-}" == "--check" ]]; then
    # Run single health check
    check_docker_services && check_network_connectivity && check_websocket_connection && check_database_health
    echo "✅ Health check completed"
else
    # Run in foreground
    main
fi
