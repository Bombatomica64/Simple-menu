#!/bin/bash
# Simple Menu - Unified Startup Script (Linux/macOS)
# Handles all deployment options in one script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

MODE="${1:-menu}"

write_header() {
    echo -e "${CYAN}============================================================${NC}"
    echo -e "${CYAN}   $1${NC}"
    echo -e "${CYAN}============================================================${NC}"
    echo ""
}

write_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

write_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

write_error() {
    echo -e "${RED}✗ $1${NC}"
}

write_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

write_accent() {
    echo -e "${MAGENTA}$1${NC}"
}

test_docker() {
    if docker info >/dev/null 2>&1; then
        write_success "Docker is running"
        return 0
    else
        write_error "Docker is not running or not installed"
        write_info "Please start Docker or install it from: https://docs.docker.com/get-docker/"
        return 1
    fi
}

get_system_info() {
    local memory_kb
    local memory_gb
    local cpu_cores
    local os_name
    
    # Get memory in GB
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        memory_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        memory_gb=$(echo "scale=1; $memory_kb / 1024 / 1024" | bc)
        cpu_cores=$(nproc)
        os_name=$(lsb_release -d 2>/dev/null | cut -f2 || echo "Linux")
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        memory_bytes=$(sysctl -n hw.memsize)
        memory_gb=$(echo "scale=1; $memory_bytes / 1024 / 1024 / 1024" | bc)
        cpu_cores=$(sysctl -n hw.ncpu)
        os_name="macOS $(sw_vers -productVersion)"
    else
        memory_gb="Unknown"
        cpu_cores="Unknown"
        os_name="Unknown"
    fi
    
    echo "$memory_gb:$cpu_cores:$os_name"
}

show_system_info() {
    local sys_info
    sys_info=$(get_system_info)
    IFS=':' read -r memory cpu_cores os_name <<< "$sys_info"
    
    write_info "System Information:"
    echo -e "   • OS: $os_name"
    echo -e "   • Memory: ${memory} GB"
    echo -e "   • CPU Cores: $cpu_cores"
    echo ""
}

show_menu() {
    write_header "Simple Menu - Unified Startup"
    show_system_info
    
    write_accent "Available Options:"
    echo ""
    echo -e "${MAGENTA}1.${NC} Basic Setup"
    echo -e "${GRAY}   └─ Just the Simple Menu application${NC}"
    echo -e "${GRAY}   └─ Resource usage: ~200MB RAM${NC}"
    echo ""
    
    echo -e "${MAGENTA}2.${NC} Prometheus + Grafana Monitoring (Recommended)"
    echo -e "${GRAY}   └─ System metrics, performance monitoring, dashboards${NC}"
    echo -e "${GRAY}   └─ Resource usage: ~512MB RAM${NC}"
    echo ""
    
    echo -e "${MAGENTA}3.${NC} ELK Stack Monitoring"
    echo -e "${GRAY}   └─ Log analysis, debugging, full-text search${NC}"
    echo -e "${GRAY}   └─ Resource usage: ~2GB RAM${NC}"
    echo ""
    
    echo -e "${MAGENTA}4.${NC} Stop All Services"
    echo -e "${GRAY}   └─ Stop and clean up all running containers${NC}"
    echo ""
    
    echo -e "${MAGENTA}5.${NC} View Service Status"
    echo -e "${GRAY}   └─ Check running containers and their status${NC}"
    echo ""
    
    echo -e "${MAGENTA}6.${NC} Exit"
    echo ""
}

get_user_choice() {
    while true; do
        read -p "Select an option (1-6): " choice
        if [[ "$choice" =~ ^[1-6]$ ]]; then
            echo "$choice"
            return
        fi
        write_warning "Please enter a number between 1 and 6"
    done
}

start_basic_setup() {
    write_header "Starting Basic Simple Menu"
    
    write_info "Starting Simple Menu application..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        sleep 5
        write_success "Simple Menu started successfully!"
        echo ""
        write_accent "📱 Access Point:"
        echo "   • Simple Menu: http://localhost:3000"
        echo ""
    else
        write_error "Failed to start Simple Menu"
    fi
}

start_prometheus_setup() {
    write_header "Starting Simple Menu with Prometheus + Grafana"
    
    local sys_info memory
    sys_info=$(get_system_info)
    memory=$(echo "$sys_info" | cut -d':' -f1)
    
    if (( $(echo "$memory < 1" | bc -l) )); then
        write_warning "Low memory detected (${memory}GB). This might affect performance."
        read -p "Continue anyway? (y/N): " continue_choice
        if [[ "$continue_choice" != "y" && "$continue_choice" != "Y" ]]; then
            return
        fi
    fi
    
    write_info "Starting Simple Menu application..."
    docker-compose up -d
    
    if [ $? -ne 0 ]; then
        write_error "Failed to start Simple Menu application"
        return
    fi
    
    write_info "Waiting for main application to start..."
    sleep 10
    
    write_info "Starting Prometheus + Grafana monitoring..."
    docker-compose -f docker-compose.monitoring-simple.yml up -d
    
    if [ $? -eq 0 ]; then
        write_info "Waiting for monitoring services to be ready..."
        sleep 30
        
        write_success "Simple Menu with Prometheus + Grafana started successfully!"
        echo ""
        write_accent "📊 Access Points:"
        echo "   • Simple Menu: http://localhost:3000"
        echo "   • Grafana: http://localhost:3001 (admin/admin123)"
        echo "   • Prometheus: http://localhost:9090"
        echo "   • Node Exporter: http://localhost:9100"
        echo "   • cAdvisor: http://localhost:8080"
        echo ""
    else
        write_error "Failed to start monitoring services"
    fi
}

start_elk_setup() {
    write_header "Starting Simple Menu with ELK Stack"
    
    local sys_info memory
    sys_info=$(get_system_info)
    memory=$(echo "$sys_info" | cut -d':' -f1)
    
    if (( $(echo "$memory < 4" | bc -l) )); then
        write_warning "ELK Stack requires at least 4GB RAM. You have ${memory}GB"
        read -p "Continue anyway? (y/N): " continue_choice
        if [[ "$continue_choice" != "y" && "$continue_choice" != "Y" ]]; then
            write_info "Consider using Prometheus + Grafana monitoring instead (option 2)"
            return
        fi
    fi
    
    write_info "Starting Simple Menu application..."
    docker-compose up -d
    
    if [ $? -ne 0 ]; then
        write_error "Failed to start Simple Menu application"
        return
    fi
    
    write_info "Waiting for main application to start..."
    sleep 10
    
    write_info "Starting ELK Stack monitoring (this may take a few minutes)..."
    docker-compose -f docker-compose.elk-simple.yml up -d
    
    if [ $? -eq 0 ]; then
        write_info "Waiting for ELK services to be ready (this can take 2-3 minutes)..."
        sleep 90
        
        write_success "Simple Menu with ELK Stack started successfully!"
        echo ""
        write_accent "📊 Access Points:"
        echo "   • Simple Menu: http://localhost:3000"
        echo "   • Kibana: http://localhost:5601"
        echo "   • Elasticsearch: http://localhost:9200"
        echo ""
        write_warning "Note: ELK Stack uses significant resources. Monitor system performance."
    else
        write_error "Failed to start ELK services"
    fi
}

stop_all_services() {
    write_header "Stopping All Services"
    
    write_info "Stopping monitoring services..."
    docker-compose -f docker-compose.monitoring-simple.yml down 2>/dev/null || true
    docker-compose -f docker-compose.elk-simple.yml down 2>/dev/null || true
    docker-compose -f docker-compose.monitoring.yml down 2>/dev/null || true
    docker-compose -f docker-compose.elk.yml down 2>/dev/null || true
    
    write_info "Stopping Simple Menu application..."
    docker-compose down
    
    write_info "Cleaning up unused containers and networks..."
    docker system prune -f >/dev/null 2>&1 || true
    
    write_success "All services stopped successfully!"
}

show_service_status() {
    write_header "Service Status"
    
    write_info "Running containers:"
    local containers
    containers=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null)
    
    if [ -n "$containers" ]; then
        echo "$containers"
    else
        write_warning "No containers are currently running"
    fi
    
    echo ""
    write_info "Docker system information:"
    docker system df 2>/dev/null | grep -E "^(TYPE|Images|Containers|Local Volumes)" || true
}

wait_for_keypress() {
    echo ""
    echo -e "${GRAY}Press any key to continue...${NC}"
    read -n 1 -s
    echo ""
}

# Main execution
if ! test_docker; then
    exit 1
fi

# Handle command line parameters
case "$MODE" in
    "basic")
        start_basic_setup
        exit 0
        ;;
    "prometheus")
        start_prometheus_setup
        exit 0
        ;;
    "elk")
        start_elk_setup
        exit 0
        ;;
    "menu")
        # Continue to interactive menu
        ;;
esac

# Interactive menu
while true; do
    show_menu
    choice=$(get_user_choice)
    
    case $choice in
        1)
            start_basic_setup
            wait_for_keypress
            ;;
        2)
            start_prometheus_setup
            wait_for_keypress
            ;;
        3)
            start_elk_setup
            wait_for_keypress
            ;;
        4)
            stop_all_services
            wait_for_keypress
            ;;
        5)
            show_service_status
            wait_for_keypress
            ;;
        6)
            echo -e "${GREEN}Goodbye! 👋${NC}"
            exit 0
            ;;
    esac
done
