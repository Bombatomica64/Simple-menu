# Simple Menu - LAN Access Setup

This guide explains how to set up the Simple Menu system for access from multiple computers on the same Local Area Network (LAN).

> **Note**: For complete setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md). For production deployment, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Quick Setup

### Using Docker (Recommended)

1. **Deploy with Docker:**
   ```bash
   git clone <repository-url> simple-menu
   cd simple-menu
   docker compose -f docker/docker-compose.unified.yml up -d
   ```

2. **Find your IP address:**
   ```powershell
   ipconfig | findstr IPv4
   ```

3. **Access from any device on your network:**
   - **Menu Display**: `http://YOUR_IP:3000`
   - **Admin Panel**: `http://YOUR_IP:3000/submit`

### Local Development Setup

1. **Run the setup script:**
   ```powershell
   .\setup-lan.ps1
   ```

2. **Or manually start services:**
   ```powershell
   # Backend (in Backend folder)
   npm start
   
   # Frontend (in Frontend/front folder)  
   npm start
   ```

## Manual Setup

### 1. Configure Firewall (Host Machine)

Run these commands as Administrator in PowerShell:

```powershell
# Allow Backend Port (3000)
netsh advfirewall firewall add rule name="Simple Menu Backend" dir=in action=allow protocol=TCP localport=3000

# Allow Frontend Port (4200)  
netsh advfirewall firewall add rule name="Simple Menu Frontend" dir=in action=allow protocol=TCP localport=4200
```

### 2. Start Backend Server (Host Machine)

```powershell
cd "c:\Users\Lorenzo\source\repos\Simple-menu\Backend"
npm start
```

The backend will display your LAN IP addresses when it starts.

### 3. Start Frontend Server (Host Machine)

```powershell
cd "c:\Users\Lorenzo\source\repos\Simple-menu\Frontend\front"
npm start
```

### 4. Access from Other Computers

Find your host machine's IP address (displayed when servers start), then:

- **Menu Display:** `http://YOUR_IP:3000`
- **Menu Administration:** `http://YOUR_IP:3000/submit`

Example: If your IP is `192.168.1.100`:
- Menu Display: `http://192.168.1.100:3000`
- Menu Admin: `http://192.168.1.100:3000/submit`

## How It Works

- **Unified Port**: Both frontend and backend are served through port 3000 in production
- **Real-time Updates**: All connected devices receive live menu updates via WebSocket
- **Multi-device Support**: Multiple people can view the menu while one person manages it
- **Auto-detection**: The frontend automatically connects to the correct backend URL

## Usage Scenarios

1. **Restaurant Display:** Host machine connected to a TV showing the menu (`/`)
2. **Kitchen Updates:** Staff computer for menu management (`/submit`)
3. **Customer Access:** Tablets or phones for customers to view menu

## Troubleshooting

### Cannot Access from Other Computers

1. **Check Firewall:** Ensure port 3000 is allowed through Windows Firewall
2. **Verify Network:** All devices must be on the same WiFi/LAN
3. **Test Connectivity:** Ping the host machine from other devices
4. **Router Settings:** Some routers block internal communication

### WebSocket Connection Issues

- Check that WebSocket connections can be established on port 3000
- Ensure no proxy servers are interfering with WebSocket upgrades
- Verify that the backend WebSocket server is running

### Docker-specific Issues

```bash
# Check if containers are running
docker compose -f docker/docker-compose.unified.yml ps

# Check container logs
docker compose -f docker/docker-compose.unified.yml logs

# Restart services
docker compose -f docker/docker-compose.unified.yml restart
```

---

## Related Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete setup and deployment guide
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Advanced production deployment
- **[API_REFERENCE.md](API_REFERENCE.md)** - API and WebSocket documentation
- **[COMPONENTS.md](COMPONENTS.md)** - Technical component details
