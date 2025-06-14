#!/bin/bash
# Docker LAN setup script for Linux/Mac

echo "=========================================="
echo "   Simple Menu - Docker LAN Setup"
echo "=========================================="
echo ""

# Get the local IP address
if command -v ip &> /dev/null; then
    # Linux
    HOST_IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+')
elif command -v ifconfig &> /dev/null; then
    # Mac/BSD
    HOST_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
else
    echo "Could not determine IP address automatically."
    read -p "Please enter your LAN IP address: " HOST_IP
fi

echo "Detected LAN IP: $HOST_IP"
echo ""

# Export the HOST_IP for docker-compose
export HOST_IP=$HOST_IP

echo "Building and starting containers..."
echo ""

# Build and start the containers
docker-compose up --build -d

echo ""
echo "Containers started successfully!"
echo ""
echo "ACCESS URLS:"
echo "- Menu Display: http://$HOST_IP:4200"
echo "- Menu Admin: http://$HOST_IP:4200/submit"
echo "- Backend API: http://$HOST_IP:3000"
echo ""
echo "Share these URLs with other devices on your network!"
echo ""
echo "To stop the containers: docker-compose down"
echo "To view logs: docker-compose logs -f"
