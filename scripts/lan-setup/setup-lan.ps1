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
                # Remove existing rules first (ignore errors)
                netsh advfirewall firewall delete rule name="Simple Menu Backend" 2>$null | Out-Null
                netsh advfirewall firewall delete rule name="Simple Menu Frontend" 2>$null | Out-Null
                
                # Add new rules
                netsh advfirewall firewall add rule name="Simple Menu Backend" dir=in action=allow protocol=TCP localport=3000 | Out-Null
                netsh advfirewall firewall add rule name="Simple Menu Frontend" dir=in action=allow protocol=TCP localport=4200 | Out-Null
                Write-Host "Firewall rules configured successfully!" -ForegroundColor Green
            } catch {
                Write-Host "Warning: Could not configure firewall rules automatically." -ForegroundColor Yellow
                Write-Host "You may need to allow ports 3000 and 4200 manually in Windows Firewall." -ForegroundColor Yellow
            }
            Write-Host ""
        }
        
        # Check if servers are already running
        $backendRunning = Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.Path -like "*Simple-menu*Backend*"}
        $frontendRunning = Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue
        
        if ($backendRunning -or $frontendRunning) {
            Write-Host "Warning: Some servers might already be running." -ForegroundColor Yellow
            Write-Host "Close any existing server windows before proceeding." -ForegroundColor Yellow
            Write-Host ""
        }
        
        # Create backend startup script
        $backendPath = "c:\Users\Lorenzo\source\repos\Simple-menu\Backend"
        $backendScript = @"
Write-Host '===========================================' -ForegroundColor Cyan
Write-Host '   Simple Menu - Backend Server' -ForegroundColor Cyan  
Write-Host '===========================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Starting backend server on all network interfaces...' -ForegroundColor Green
Write-Host 'Backend will be accessible at: http://$localIP:3000' -ForegroundColor Yellow
Write-Host ''
cd '$backendPath'
npm start
"@
        
        # Create frontend startup script  
        $frontendPath = "c:\Users\Lorenzo\source\repos\Simple-menu\Frontend\front"
        $frontendScript = @"
Write-Host '===========================================' -ForegroundColor Cyan
Write-Host '   Simple Menu - Frontend Server' -ForegroundColor Cyan
Write-Host '===========================================' -ForegroundColor Cyan  
Write-Host ''
Write-Host 'Starting frontend server on all network interfaces...' -ForegroundColor Green
Write-Host 'Frontend will be accessible at: http://$localIP:4200' -ForegroundColor Yellow
Write-Host ''
cd '$frontendPath'
npm start
"@
        
        # Start backend server in new PowerShell window
        Write-Host "Opening backend server window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
        
        Start-Sleep -Seconds 3
        
        # Start frontend server in new PowerShell window  
        Write-Host "Opening frontend server window..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
        
        Write-Host ""
        Write-Host "SUCCESS! Two server windows have been opened:" -ForegroundColor Green
        Write-Host "1. Backend Server Window (Node.js)" -ForegroundColor White
        Write-Host "2. Frontend Server Window (Angular)" -ForegroundColor White
        Write-Host ""
        Write-Host "ACCESS URLS (share these with other devices):" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📱 Menu Display: " -NoNewline -ForegroundColor White
        Write-Host "http://$localIP:4200" -ForegroundColor Green
        Write-Host "⚙️  Menu Admin: " -NoNewline -ForegroundColor White  
        Write-Host "http://$localIP:4200/submit" -ForegroundColor Green
        Write-Host "🔧 Backend API: " -NoNewline -ForegroundColor White
        Write-Host "http://$localIP:3000" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 INSTRUCTIONS:" -ForegroundColor Yellow
        Write-Host "• Wait 10-30 seconds for servers to fully start" -ForegroundColor Gray
        Write-Host "• Use the 'Menu Display' URL on devices that will show the menu" -ForegroundColor Gray  
        Write-Host "• Use the 'Menu Admin' URL on devices that will manage the menu" -ForegroundColor Gray
        Write-Host "• Keep both server windows open while using the system" -ForegroundColor Gray
        Write-Host "• To stop servers, close both PowerShell windows" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✅ LAN setup complete! The menu system is now accessible from other devices." -ForegroundColor Green
    }
    
    "2" {
        # Show manual instructions (existing code)
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

Write-Host "QUICK START COMMANDS:" -ForegroundColor Magenta
Write-Host ""
Write-Host "Backend:" -ForegroundColor White
Write-Host "cd 'c:\Users\Lorenzo\source\repos\Simple-menu\Backend'; npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend:" -ForegroundColor White  
Write-Host "cd 'c:\Users\Lorenzo\source\repos\Simple-menu\Frontend\front'; npm start" -ForegroundColor Yellow
Write-Host ""

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
    }
    
    "3" {
        Write-Host ""
        Write-Host "CONFIGURING FIREWALL RULES..." -ForegroundColor Yellow
        Write-Host ""
        
        if ($isAdmin) {
            try {
                Write-Host "Removing any existing rules..." -ForegroundColor Gray
                netsh advfirewall firewall delete rule name="Simple Menu Backend" 2>$null | Out-Null
                netsh advfirewall firewall delete rule name="Simple Menu Frontend" 2>$null | Out-Null
                
                Write-Host "Adding firewall rules for ports 3000 and 4200..." -ForegroundColor Gray
                netsh advfirewall firewall add rule name="Simple Menu Backend" dir=in action=allow protocol=TCP localport=3000 | Out-Null
                netsh advfirewall firewall add rule name="Simple Menu Frontend" dir=in action=allow protocol=TCP localport=4200 | Out-Null
                
                Write-Host "✅ Firewall rules configured successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "The following rules were added:" -ForegroundColor White
                Write-Host "• Simple Menu Backend (Port 3000)" -ForegroundColor Gray
                Write-Host "• Simple Menu Frontend (Port 4200)" -ForegroundColor Gray
                
            } catch {
                Write-Host "❌ Error configuring firewall rules." -ForegroundColor Red
                Write-Host "Please run these commands manually as Administrator:" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "netsh advfirewall firewall add rule name='Simple Menu Backend' dir=in action=allow protocol=TCP localport=3000" -ForegroundColor White
                Write-Host "netsh advfirewall firewall add rule name='Simple Menu Frontend' dir=in action=allow protocol=TCP localport=4200" -ForegroundColor White
            }
        } else {
            Write-Host "❌ Administrator privileges required for firewall configuration." -ForegroundColor Red
            Write-Host ""
            Write-Host "Please run this script as Administrator, or manually add these firewall rules:" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "1. Open Windows Defender Firewall with Advanced Security" -ForegroundColor White
            Write-Host "2. Click 'Inbound Rules' in the left panel" -ForegroundColor White
            Write-Host "3. Click 'New Rule...' in the right panel" -ForegroundColor White
            Write-Host "4. Select 'Port' and click Next" -ForegroundColor White
            Write-Host "5. Select 'TCP' and enter '3000' in Specific local ports" -ForegroundColor White
            Write-Host "6. Select 'Allow the connection' and click Next" -ForegroundColor White
            Write-Host "7. Check all three options (Domain, Private, Public) and click Next" -ForegroundColor White
            Write-Host "8. Name it 'Simple Menu Backend' and click Finish" -ForegroundColor White
            Write-Host "9. Repeat steps 3-8 for port '4200' with name 'Simple Menu Frontend'" -ForegroundColor White
        }
        
        Write-Host ""
        Write-Host "After configuring firewall, run option 1 to start the servers." -ForegroundColor Cyan
    }
    
    default {
        Write-Host ""
        Write-Host "Invalid option. Please run the script again and choose 1, 2, or 3." -ForegroundColor Red
    }
}
