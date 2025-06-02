@echo off
echo ===========================================
echo    Simple Menu - LAN Setup Instructions
echo ===========================================
echo.

REM Get the local IP address
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        set LOCAL_IP=%%j
        goto :found_ip
    )
)

:found_ip
echo Your local IP address is: %LOCAL_IP%
echo.
echo SETUP INSTRUCTIONS:
echo.
echo 1. BACKEND SERVER (Host Machine):
echo    - Navigate to: c:\Users\Lorenzo\source\repos\Simple-menu\Backend
echo    - Run: npm start
echo    - Backend will be accessible at: http://%LOCAL_IP%:3000
echo.
echo 2. FRONTEND SERVER (Host Machine):
echo    - Navigate to: c:\Users\Lorenzo\source\repos\Simple-menu\Frontend\front
echo    - Run: npm start
echo    - Frontend will be accessible at: http://%LOCAL_IP%:4200
echo.
echo 3. ACCESS FROM OTHER COMPUTERS:
echo    - Menu Display: http://%LOCAL_IP%:4200
echo    - Menu Admin: http://%LOCAL_IP%:4200/submit
echo.
echo 4. FIREWALL CONFIGURATION:
echo    - Make sure Windows Firewall allows ports 3000 and 4200
echo    - Or temporarily disable firewall for testing
echo.
echo 5. NETWORK REQUIREMENTS:
echo    - All devices must be on the same LAN/WiFi network
echo    - No router restrictions on internal communication
echo.
echo ===========================================
echo.
pause
