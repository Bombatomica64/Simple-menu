#!/bin/bash

# Performance Monitoring Script for Simple Menu on Raspberry Pi
# Collects metrics and generates performance reports

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
METRICS_DIR="/var/log/simple-menu-metrics"
LOG_FILE="/var/log/simple-menu-performance.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90
ALERT_THRESHOLD_TEMP=75

# Create metrics directory
mkdir -p "$METRICS_DIR"

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

# Collect system metrics
collect_system_metrics() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local metrics_file="$METRICS_DIR/system-$(date +%Y%m%d).csv"
    
    # Create header if file doesn't exist
    if [[ ! -f "$metrics_file" ]]; then
        echo "timestamp,cpu_usage,memory_total,memory_used,memory_free,disk_total,disk_used,disk_free,cpu_temp,load_1m,load_5m,load_15m" > "$metrics_file"
    fi
    
    # Collect CPU usage (1-minute average)
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
    
    # Collect memory info (in MB)
    local memory_info=$(free -m | grep MemTotal -A1)
    local memory_total=$(echo "$memory_info" | grep Mem | awk '{print $2}')
    local memory_used=$(echo "$memory_info" | grep Mem | awk '{print $3}')
    local memory_free=$(echo "$memory_info" | grep Mem | awk '{print $4}')
    
    # Collect disk info (in GB)
    local disk_info=$(df -BG / | tail -1)
    local disk_total=$(echo "$disk_info" | awk '{print $2}' | sed 's/G//')
    local disk_used=$(echo "$disk_info" | awk '{print $3}' | sed 's/G//')
    local disk_free=$(echo "$disk_info" | awk '{print $4}' | sed 's/G//')
    
    # Collect CPU temperature (Raspberry Pi)
    local cpu_temp="N/A"
    if [[ -f /sys/class/thermal/thermal_zone0/temp ]]; then
        cpu_temp=$(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
    fi
    
    # Collect load averages
    local load_averages=$(uptime | awk -F'load average:' '{print $2}' | tr -d ' ')
    local load_1m=$(echo "$load_averages" | cut -d',' -f1)
    local load_5m=$(echo "$load_averages" | cut -d',' -f2)
    local load_15m=$(echo "$load_averages" | cut -d',' -f3)
    
    # Write metrics to CSV
    echo "$timestamp,$cpu_usage,$memory_total,$memory_used,$memory_free,$disk_total,$disk_used,$disk_free,$cpu_temp,$load_1m,$load_5m,$load_15m" >> "$metrics_file"
}

# Collect Docker metrics
collect_docker_metrics() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local metrics_file="$METRICS_DIR/docker-$(date +%Y%m%d).csv"
    
    # Create header if file doesn't exist
    if [[ ! -f "$metrics_file" ]]; then
        echo "timestamp,container,cpu_usage,memory_usage,memory_limit,network_rx,network_tx,block_read,block_write" > "$metrics_file"
    fi
    
    # Get Docker container stats
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | tail -n +2 | while read -r line; do
        local container=$(echo "$line" | awk '{print $1}')
        local cpu_usage=$(echo "$line" | awk '{print $2}' | sed 's/%//')
        local memory_info=$(echo "$line" | awk '{print $3}')
        local memory_usage=$(echo "$memory_info" | cut -d'/' -f1 | sed 's/MiB//')
        local memory_limit=$(echo "$memory_info" | cut -d'/' -f2 | sed 's/MiB//')
        local network_info=$(echo "$line" | awk '{print $4}')
        local network_rx=$(echo "$network_info" | cut -d'/' -f1 | sed 's/kB//')
        local network_tx=$(echo "$network_info" | cut -d'/' -f2 | sed 's/kB//')
        local block_info=$(echo "$line" | awk '{print $5}')
        local block_read=$(echo "$block_info" | cut -d'/' -f1 | sed 's/MB//')
        local block_write=$(echo "$block_info" | cut -d'/' -f2 | sed 's/MB//')
        
        echo "$timestamp,$container,$cpu_usage,$memory_usage,$memory_limit,$network_rx,$network_tx,$block_read,$block_write" >> "$metrics_file"
    done
}

# Collect application metrics
collect_app_metrics() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local metrics_file="$METRICS_DIR/application-$(date +%Y%m%d).csv"
    
    # Create header if file doesn't exist
    if [[ ! -f "$metrics_file" ]]; then
        echo "timestamp,backend_status,frontend_status,response_time_ms,active_connections,database_size_mb" > "$metrics_file"
    fi
    
    # Check backend status and response time
    local backend_status="DOWN"
    local response_time="N/A"
    if response=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3000/health 2>/dev/null); then
        backend_status="UP"
        response_time=$(echo "$response * 1000" | bc | cut -d'.' -f1)
    fi
    
    # Check frontend status
    local frontend_status="DOWN"
    if curl -sf http://localhost:4200 >/dev/null 2>&1; then
        frontend_status="UP"
    fi
    
    # Get active WebSocket connections (approximate)
    local active_connections=$(docker logs simple-menu-backend 2>&1 | grep -c "WebSocket connection" | tail -1 || echo "0")
    
    # Get database size
    local database_size="N/A"
    if [[ -f "./Backend/prisma/dev.db" ]]; then
        database_size=$(du -m "./Backend/prisma/dev.db" | cut -f1)
    fi
    
    echo "$timestamp,$backend_status,$frontend_status,$response_time,$active_connections,$database_size" >> "$metrics_file"
}

# Generate performance report
generate_performance_report() {
    local report_file="/tmp/simple-menu-performance-report.html"
    local today=$(date +%Y%m%d)
    
    log "INFO" "📊 Generating performance report..."
    
    # Start HTML report
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Simple Menu Performance Report</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .metric { background-color: #f9f9f9; padding: 10px; margin: 5px 0; border-left: 4px solid #007acc; }
        .alert { border-left-color: #ff6b6b; background-color: #fff5f5; }
        .warning { border-left-color: #feca57; background-color: #fffbf0; }
        .good { border-left-color: #48dbfb; background-color: #f0f9ff; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .chart { background-color: #f9f9f9; padding: 20px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎛️ Simple Menu Performance Report</h1>
        <p>Generated: $(date)</p>
        <p>Raspberry Pi System Monitoring</p>
    </div>
EOF
    
    # Add current system status
    echo '    <div class="section">' >> "$report_file"
    echo '        <h2>📈 Current System Status</h2>' >> "$report_file"
    
    # CPU status
    local current_cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
    local cpu_class="good"
    if (( $(echo "$current_cpu > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        cpu_class="alert"
    elif (( $(echo "$current_cpu > 60" | bc -l) )); then
        cpu_class="warning"
    fi
    echo "        <div class=\"metric $cpu_class\">CPU Usage: ${current_cpu}%</div>" >> "$report_file"
    
    # Memory status
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local memory_class="good"
    if (( $(echo "$memory_usage > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
        memory_class="alert"
    elif (( $(echo "$memory_usage > 70" | bc -l) )); then
        memory_class="warning"
    fi
    echo "        <div class=\"metric $memory_class\">Memory Usage: ${memory_usage}%</div>" >> "$report_file"
    
    # Disk status
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    local disk_class="good"
    if [[ $disk_usage -gt $ALERT_THRESHOLD_DISK ]]; then
        disk_class="alert"
    elif [[ $disk_usage -gt 75 ]]; then
        disk_class="warning"
    fi
    echo "        <div class=\"metric $disk_class\">Disk Usage: ${disk_usage}%</div>" >> "$report_file"
    
    # Temperature status
    if [[ -f /sys/class/thermal/thermal_zone0/temp ]]; then
        local cpu_temp=$(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
        local temp_class="good"
        if [[ $cpu_temp -gt $ALERT_THRESHOLD_TEMP ]]; then
            temp_class="alert"
        elif [[ $cpu_temp -gt 65 ]]; then
            temp_class="warning"
        fi
        echo "        <div class=\"metric $temp_class\">CPU Temperature: ${cpu_temp}°C</div>" >> "$report_file"
    fi
    
    echo '    </div>' >> "$report_file"
    
    # Add Docker status
    echo '    <div class="section">' >> "$report_file"
    echo '        <h2>🐳 Docker Services</h2>' >> "$report_file"
    echo '        <table>' >> "$report_file"
    echo '            <tr><th>Container</th><th>Status</th><th>CPU</th><th>Memory</th></tr>' >> "$report_file"
    
    docker-compose ps --format table | tail -n +2 | while read -r line; do
        local container=$(echo "$line" | awk '{print $1}')
        local status=$(echo "$line" | awk '{print $2}')
        echo "            <tr><td>$container</td><td>$status</td><td>-</td><td>-</td></tr>" >> "$report_file"
    done
    
    echo '        </table>' >> "$report_file"
    echo '    </div>' >> "$report_file"
    
    # Add historical data if available
    if [[ -f "$METRICS_DIR/system-$today.csv" ]]; then
        echo '    <div class="section">' >> "$report_file"
        echo '        <h2>📊 Today'\''s Metrics Summary</h2>' >> "$report_file"
        
        # Calculate averages for today
        local avg_cpu=$(tail -n +2 "$METRICS_DIR/system-$today.csv" | awk -F',' '{sum+=$2; count++} END {printf "%.1f", sum/count}')
        local avg_memory=$(tail -n +2 "$METRICS_DIR/system-$today.csv" | awk -F',' '{sum+=$4/$3*100; count++} END {printf "%.1f", sum/count}')
        local max_temp=$(tail -n +2 "$METRICS_DIR/system-$today.csv" | awk -F',' '{if($9>max) max=$9} END {print max}')
        
        echo "        <div class=\"metric good\">Average CPU Usage: ${avg_cpu}%</div>" >> "$report_file"
        echo "        <div class=\"metric good\">Average Memory Usage: ${avg_memory}%</div>" >> "$report_file"
        [[ "$max_temp" != "N/A" ]] && echo "        <div class=\"metric good\">Peak Temperature: ${max_temp}°C</div>" >> "$report_file"
        
        echo '    </div>' >> "$report_file"
    fi
    
    # Add recommendations
    echo '    <div class="section">' >> "$report_file"
    echo '        <h2>💡 Recommendations</h2>' >> "$report_file"
    
    if (( $(echo "$current_cpu > 70" | bc -l) )); then
        echo '        <div class="metric warning">Consider optimizing CPU-intensive processes</div>' >> "$report_file"
    fi
    
    if (( $(echo "$memory_usage > 75" | bc -l) )); then
        echo '        <div class="metric warning">Consider increasing swap space or optimizing memory usage</div>' >> "$report_file"
    fi
    
    if [[ $disk_usage -gt 80 ]]; then
        echo '        <div class="metric warning">Consider cleaning up log files or expanding storage</div>' >> "$report_file"
    fi
    
    if [[ -f /sys/class/thermal/thermal_zone0/temp ]]; then
        local cpu_temp=$(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
        if [[ $cpu_temp -gt 70 ]]; then
            echo '        <div class="metric alert">Check cooling system - CPU temperature is high</div>' >> "$report_file"
        fi
    fi
    
    echo '    </div>' >> "$report_file"
    
    # Close HTML
    echo '</body></html>' >> "$report_file"
    
    log "INFO" "✅ Performance report generated: $report_file"
    echo "📊 View report: file://$report_file"
}

# Check for performance alerts
check_alerts() {
    local alerts=()
    
    # Check CPU
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        alerts+=("High CPU usage: ${cpu_usage}%")
    fi
    
    # Check memory
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$memory_usage > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
        alerts+=("High memory usage: ${memory_usage}%")
    fi
    
    # Check disk
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -gt $ALERT_THRESHOLD_DISK ]]; then
        alerts+=("High disk usage: ${disk_usage}%")
    fi
    
    # Check temperature
    if [[ -f /sys/class/thermal/thermal_zone0/temp ]]; then
        local cpu_temp=$(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
        if [[ $cpu_temp -gt $ALERT_THRESHOLD_TEMP ]]; then
            alerts+=("High CPU temperature: ${cpu_temp}°C")
        fi
    fi
    
    # Send alerts if any
    if [[ ${#alerts[@]} -gt 0 ]]; then
        local alert_message="🚨 Performance Alert - $(hostname)\n"
        for alert in "${alerts[@]}"; do
            alert_message="${alert_message}⚠️ $alert\n"
        done
        
        log "ALERT" "$alert_message"
        
        # Send email if configured
        if [[ -n "${ALERT_EMAIL:-}" ]] && command -v mail >/dev/null 2>&1; then
            echo -e "$alert_message" | mail -s "Simple Menu Performance Alert - $(hostname)" "$ALERT_EMAIL"
        fi
    fi
}

# Cleanup old metrics
cleanup_metrics() {
    log "INFO" "🧹 Cleaning up old metrics files..."
    
    # Keep last 30 days of metrics
    find "$METRICS_DIR" -name "*.csv" -type f -mtime +30 -delete 2>/dev/null || true
    
    log "INFO" "✅ Metrics cleanup completed"
}

# Show current status
show_status() {
    echo "🎛️ Simple Menu Performance Status"
    echo "=================================="
    echo
    
    # System info
    echo "📱 System Information:"
    echo "  Hostname: $(hostname)"
    echo "  Uptime: $(uptime -p 2>/dev/null || uptime)"
    echo "  Load: $(cat /proc/loadavg | cut -d' ' -f1-3)"
    echo
    
    # Current metrics
    echo "📊 Current Metrics:"
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 | cut -d',' -f1)
    echo "  CPU Usage: ${cpu_usage}%"
    
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    echo "  Memory Usage: ${memory_usage}%"
    
    local disk_usage=$(df / | tail -1 | awk '{print $5}')
    echo "  Disk Usage: ${disk_usage}"
    
    if [[ -f /sys/class/thermal/thermal_zone0/temp ]]; then
        local cpu_temp=$(($(cat /sys/class/thermal/thermal_zone0/temp) / 1000))
        echo "  CPU Temperature: ${cpu_temp}°C"
    fi
    echo
    
    # Docker status
    echo "🐳 Docker Services:"
    docker-compose ps
    echo
    
    # Application status
    echo "🌐 Application Status:"
    if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
        echo "  Backend: ✅ Running"
    else
        echo "  Backend: ❌ Not responding"
    fi
    
    if curl -sf http://localhost:4200 >/dev/null 2>&1; then
        echo "  Frontend: ✅ Running"
    else
        echo "  Frontend: ❌ Not responding"
    fi
    echo
}

# Main function
main() {
    local command="${1:-collect}"
    
    case "$command" in
        collect)
            collect_system_metrics
            collect_docker_metrics
            collect_app_metrics
            check_alerts
            ;;
        report)
            generate_performance_report
            ;;
        status)
            show_status
            ;;
        cleanup)
            cleanup_metrics
            ;;
        alert-check)
            check_alerts
            ;;
        *)
            echo "Usage: $0 {collect|report|status|cleanup|alert-check}"
            echo
            echo "Commands:"
            echo "  collect     - Collect current metrics"
            echo "  report      - Generate performance report"
            echo "  status      - Show current system status"
            echo "  cleanup     - Clean up old metric files"
            echo "  alert-check - Check for performance alerts"
            exit 1
            ;;
    esac
}

# Setup logging
sudo mkdir -p "$(dirname "$LOG_FILE")"
sudo touch "$LOG_FILE"
sudo chown "$(whoami):$(whoami)" "$LOG_FILE" 2>/dev/null || true

# Run main function
main "$@"
