# Simple Menu - LAN Access Setup

This guide explains how to set up the Simple Menu system for access from multiple computers on the same Local Area Network (LAN).

## Quick Setup

1. **Run the setup script:**
   ```powershell
   .\setup-lan.ps1
   ```

2. **Follow the instructions displayed by the script**

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

- **Menu Display:** `http://YOUR_IP:4200`
- **Menu Administration:** `http://YOUR_IP:4200/submit`

Example: If your IP is `192.168.1.100`:
- Menu Display: `http://192.168.1.100:4200`
- Menu Admin: `http://192.168.1.100:4200/submit`

## How It Works

- **Dynamic Configuration:** The frontend automatically detects the hostname and connects to the backend on the same machine
- **Real-time Updates:** All connected devices receive live menu updates via WebSocket
- **Multi-device Support:** Multiple people can view the menu while one person manages it

## Usage Scenarios

1. **Restaurant Display:** Host machine connected to a TV showing the menu (`/`)
2. **Kitchen Updates:** Staff computer for menu management (`/submit`)
3. **Customer Access:** Tablets or phones for customers to view menu

## Troubleshooting

### Cannot Access from Other Computers

1. **Check Firewall:** Ensure ports 3000 and 4200 are allowed
2. **Verify Network:** All devices must be on the same WiFi/LAN
3. **Test Connectivity:** Ping the host machine from other devices
4. **Router Settings:** Some routers block internal communication

### WebSocket Connection Issues

- The frontend automatically adapts to use the correct IP address
- If issues persist, check that both HTTP and WebSocket ports are accessible

### Finding Your IP Address

```powershell
ipconfig | findstr IPv4
```

Look for an address like `192.168.x.x` or `10.x.x.x`

## Security Note

This setup is intended for local network use only. Do not expose these ports to the internet without proper security measures.
