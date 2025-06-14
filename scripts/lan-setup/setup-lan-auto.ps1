# Simple Menu - LAN Setup Script with Auto-Start
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "   Simple Menu - LAN Setup & Auto-Start" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Get the local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1"} | Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1" -and $_.IPAddress -notlike "127.*"} | Select-Object -First 1).IPAddress
}

Write-Host "Your local IP address is: " -NoNewline
Write-Host $localIP -ForegroundColor Green
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "IMPORTANT: For firewall configuration, run this script as Administrator!" -ForegroundColor Red
    Write-Host ""
}

Write-Host "SETUP OPTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Auto-start both servers (Recommended)" -ForegroundColor White
Write-Host "2. Show manual setup instructions" -ForegroundColor White
Write-Host "3. Configure firewall only" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting servers automatically..." -ForegroundColor Green
        Write-Host ""
        
        # Configure firewall if admin
        if ($isAdmin) {
            Write-Host "Configuring firewall rules..." -ForegroundColor Yellow
            try {
                netsh advfirewall firewall add rule name="Simple Menu Backend" dir=in action=allow protocol=TCP localport=3000 | Out-Null
                netsh advfirewall firewall add rule name="Simple Menu Frontend" dir=in action=allow protocol=TCP localport=4200 | Out-Null
                Write-Host "Firewall rules added successfully!" -ForegroundColor Green
            } catch {
                Write-Host "Error adding firewall rules. You may need to add them manually." -ForegroundColor Red
            }
            Write-Host ""
        }
        
        # Start backend server in new PowerShell window
        Write-Host "Starting backend server..." -ForegroundColor Yellow
        $backendPath = "c:\Users\Lorenzo\source\repos\Simple-menu\Backend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm start"
        
        Start-Sleep -Seconds 2
        
        # Start frontend server in new PowerShell window
        Write-Host "Starting frontend server..." -ForegroundColor Yellow
        $frontendPath = "c:\Users\Lorenzo\source\repos\Simple-menu\Frontend\front"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm start"
        
        Write-Host ""
        Write-Host "Servers are starting in separate windows..." -ForegroundColor Green
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
        Write-Host "Note: Wait 10-30 seconds for servers to fully start before accessing the URLs." -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "MANUAL SETUP INSTRUCTIONS:" -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "1. BACKEND SERVER (Host Machine):" -ForegroundColor White
        Write-Host "   - Open PowerShell as Administrator" -ForegroundColor Gray
        Write-Host "   - Navigate to: c:\Users\Lorenzo\source\repos\Simple-menu\Backend" -ForegroundColor Gray
        Write-Host "   - Run: npm start" -ForegroundColor Gray
        Write-Host "   - Backend will be accessible at: " -NoNewline -ForegroundColor Gray
        Write-Host "http://$localIP:3000" -ForegroundColor Green
        Write-Host ""

        Write-Host "2. FRONTEND SERVER (Host Machine):" -ForegroundColor White
        Write-Host "   - Open another PowerShell window" -ForegroundColor Gray
        Write-Host "   - Navigate to: c:\Users\Lorenzo\source\repos\Simple-menu\Frontend\front" -ForegroundColor Gray
        Write-Host "   - Run: npm start" -ForegroundColor Gray
        Write-Host "   - Frontend will be accessible at: " -NoNewline -ForegroundColor Gray
        Write-Host "http://$localIP:4200" -ForegroundColor Green
        Write-Host ""

        Write-Host "3. ACCESS FROM OTHER COMPUTERS:" -ForegroundColor White
        Write-Host "   - Menu Display: " -NoNewline -ForegroundColor Gray
        Write-Host "http://$localIP:4200" -ForegroundColor Green
        Write-Host "   - Menu Admin: " -NoNewline -ForegroundColor Gray
        Write-Host "http://$localIP:4200/submit" -ForegroundColor Green
        Write-Host ""

        Write-Host "4. FIREWALL CONFIGURATION:" -ForegroundColor White
        Write-Host "   - Run these commands as Administrator to allow the ports:" -ForegroundColor Gray
        Write-Host "   netsh advfirewall firewall add rule name='Simple Menu Backend' dir=in action=allow protocol=TCP localport=3000" -ForegroundColor Yellow
        Write-Host "   netsh advfirewall firewall add rule name='Simple Menu Frontend' dir=in action=allow protocol=TCP localport=4200" -ForegroundColor Yellow
        Write-Host ""

        Write-Host "5. NETWORK REQUIREMENTS:" -ForegroundColor White
        Write-Host "   - All devices must be on the same LAN/WiFi network" -ForegroundColor Gray
        Write-Host "   - No router restrictions on internal communication" -ForegroundColor Gray
        Write-Host ""

        Write-Host "QUICK START COMMANDS:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Backend:" -ForegroundColor White
        Write-Host "cd 'c:\Users\Lorenzo\source\repos\Simple-menu\Backend'; npm start" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Frontend:" -ForegroundColor White
        Write-Host "cd 'c:\Users\Lorenzo\source\repos\Simple-menu\Frontend\front'; npm start" -ForegroundColor Yellow
    }
    
    "3" {
        if ($isAdmin) {
            Write-Host ""
            Write-Host "Configuring firewall rules..." -ForegroundColor Yellow
            try {
                netsh advfirewall firewall add rule name="Simple Menu Backend" dir=in action=allow protocol=TCP localport=3000
                netsh advfirewall firewall add rule name="Simple Menu Frontend" dir=in action=allow protocol=TCP localport=4200
                Write-Host "Firewall rules added successfully!" -ForegroundColor Green
            } catch {
                Write-Host "Error adding firewall rules." -ForegroundColor Red
            }
        } else {
            Write-Host ""
            Write-Host "Please run as Administrator to configure firewall." -ForegroundColor Red
            Write-Host "Manual commands:" -ForegroundColor White
            Write-Host "netsh advfirewall firewall add rule name='Simple Menu Backend' dir=in action=allow protocol=TCP localport=3000" -ForegroundColor Yellow
            Write-Host "netsh advfirewall firewall add rule name='Simple Menu Frontend' dir=in action=allow protocol=TCP localport=4200" -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to exit..." -NoNewline
Read-Host
