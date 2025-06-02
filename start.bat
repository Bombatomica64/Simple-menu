@echo off
echo Starting Digital Menu Application...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Backend setup
echo Setting up Backend...
cd Backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
)

echo Generating Prisma client...
npm run generate

echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

REM Frontend setup
echo Setting up Frontend...
cd ..\Frontend\front
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)

echo Starting frontend server...
start "Frontend Server" cmd /k "npm start"

echo Both servers are starting...
echo Backend: http://localhost:3000 (check your index.js for actual port)
echo Frontend: http://localhost:4200 (default Angular port)
pause
