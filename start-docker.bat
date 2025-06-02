@echo off
echo Starting Digital Menu with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo Building and starting containers...
docker-compose up --build

pause
