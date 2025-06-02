Write-Host "=== Digital Menu Application Startup Script ===" -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
	return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to install Node.js using different methods
function Install-NodeJS {
	Write-Host "Node.js is not installed. Attempting automatic installation..." -ForegroundColor Yellow
    
	# Try winget first (Windows 10/11)
	if (Test-Command "winget") {
		Write-Host "Installing Node.js using winget..." -ForegroundColor Cyan
		try {
			winget install OpenJS.NodeJS --silent
			Write-Host "Node.js installed successfully via winget!" -ForegroundColor Green
			Write-Host "Please restart this script or open a new terminal." -ForegroundColor Yellow
			Read-Host "Press Enter to exit"
			exit 0
		}
		catch {
			Write-Host "Winget installation failed." -ForegroundColor Red
		}
	}
    
	# Try chocolatey if available
	if (Test-Command "choco") {
		Write-Host "Installing Node.js using Chocolatey..." -ForegroundColor Cyan
		try {
			choco install nodejs -y
			Write-Host "Node.js installed successfully via Chocolatey!" -ForegroundColor Green
			Write-Host "Please restart this script or open a new terminal." -ForegroundColor Yellow
			Read-Host "Press Enter to exit"
			exit 0
		}
		catch {
			Write-Host "Chocolatey installation failed." -ForegroundColor Red
		}
	}
    
	# Manual installation prompt
	Write-Host "Automatic installation not available. Please install manually:" -ForegroundColor Red
	Write-Host "1. Go to https://nodejs.org/" -ForegroundColor Cyan
	Write-Host "2. Download and install the LTS version" -ForegroundColor Cyan
	Write-Host "3. Restart your terminal and run this script again" -ForegroundColor Cyan
    
	$choice = Read-Host "Press 'o' to open nodejs.org in browser, or Enter to exit"
	if ($choice -eq 'o') {
		Start-Process "https://nodejs.org/"
	}
	exit 1
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Cyan
if (Test-Command "node") {
	try {
		$nodeVersion = node --version
		$npmVersion = npm --version
		Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
		Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
	}
	catch {
		Write-Host "Node.js found but not working properly." -ForegroundColor Red
		Install-NodeJS
	}
}
else {
	Install-NodeJS
}

# Check PowerShell execution policy
$executionPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($executionPolicy -eq "Restricted" -or $executionPolicy -eq "Undefined") {
	Write-Host "Setting PowerShell execution policy for current user..." -ForegroundColor Yellow
	try {
		Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
		Write-Host "✓ Execution policy updated" -ForegroundColor Green
	}
	catch {
		Write-Host "Failed to update execution policy. You may need to run as administrator." -ForegroundColor Red
	}
}

# Store original location
$originalLocation = Get-Location

# Function to safely change directory
function Set-SafeLocation($path) {
	if (Test-Path $path) {
		Set-Location $path
		Write-Host "✓ Changed to: $(Get-Location)" -ForegroundColor Cyan
		return $true
	}
 else {
		Write-Host "✗ Directory not found: $path" -ForegroundColor Red
		return $false
	}
}

# Function to install npm dependencies with error handling
function Install-Dependencies($projectName) {
	Write-Host "Installing $projectName dependencies..." -ForegroundColor Cyan
	try {
		npm install
		if ($LASTEXITCODE -eq 0) {
			Write-Host "✓ $projectName dependencies installed successfully" -ForegroundColor Green
			return $true
		}
		else {
			Write-Host "✗ Failed to install $projectName dependencies" -ForegroundColor Red
			return $false
		}
	}
	catch {
		Write-Host "✗ Error installing $projectName dependencies: $($_.Exception.Message)" -ForegroundColor Red
		return $false
	}
}

# Function to run npm command with error handling
function Invoke-NpmCommand($command, $description) {
	Write-Host "$description..." -ForegroundColor Cyan
	try {
		Invoke-Expression "npm $command"
		if ($LASTEXITCODE -eq 0) {
			Write-Host "✓ $description completed successfully" -ForegroundColor Green
			return $true
		}
		else {
			Write-Host "✗ $description failed" -ForegroundColor Red
			return $false
		}
	}
	catch {
		Write-Host "✗ Error during $description - $($_.Exception.Message)" -ForegroundColor Red
		return $false
	}
}

Write-Host "`n=== Setting up Backend ===" -ForegroundColor Yellow

if (Set-SafeLocation "Backend") {
	# Check if package.json exists
	if (!(Test-Path "package.json")) {
		Write-Host "✗ package.json not found in Backend directory" -ForegroundColor Red
		Set-Location $originalLocation
		Read-Host "Press Enter to exit"
		exit 1
	}

	# Install backend dependencies
	if (!(Test-Path "node_modules") -or !(Test-Path "node_modules\.bin")) {
		if (!(Install-Dependencies "Backend")) {
			Set-Location $originalLocation
			Read-Host "Press Enter to exit"
			exit 1
		}
	}
	else {
		Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
	}

	# Generate Prisma client
	if (!(Invoke-NpmCommand "run generate" "Generating Prisma client")) {
		Write-Host "Prisma generation failed. Attempting to install Prisma CLI..." -ForegroundColor Yellow
		npm install -g prisma
		if (!(Invoke-NpmCommand "run generate" "Retrying Prisma client generation")) {
			Set-Location $originalLocation
			Read-Host "Press Enter to exit"
			exit 1
		}
	}

	# Start backend server in new window
	Write-Host "Starting backend server..." -ForegroundColor Green
	$backendPath = Get-Location
	Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"
    
	Write-Host "✓ Backend server started in new window" -ForegroundColor Green
}
else {
	Write-Host "✗ Backend directory not found" -ForegroundColor Red
	Set-Location $originalLocation
	Read-Host "Press Enter to exit"
	exit 1
}

Write-Host "`n=== Setting up Frontend ===" -ForegroundColor Yellow

# Go back to root and navigate to frontend
Set-Location $originalLocation

if (Set-SafeLocation "Frontend\front") {
	# Check if package.json exists
	if (!(Test-Path "package.json")) {
		Write-Host "✗ package.json not found in Frontend directory" -ForegroundColor Red
		Set-Location $originalLocation
		Read-Host "Press Enter to exit"
		exit 1
	}

	# Install frontend dependencies
	if (!(Test-Path "node_modules") -or !(Test-Path "node_modules\.bin")) {
		if (!(Install-Dependencies "Frontend")) {
			Set-Location $originalLocation
			Read-Host "Press Enter to exit"
			exit 1
		}
	}
	else {
		Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
	}

	# Check if Angular CLI is available locally or globally
	$ngAvailable = $false
	if (Test-Path "node_modules\.bin\ng.cmd") {
		Write-Host "✓ Angular CLI found locally" -ForegroundColor Green
		$ngAvailable = $true
	}
	elseif (Test-Command "ng") {
		Write-Host "✓ Angular CLI found globally" -ForegroundColor Green
		$ngAvailable = $true
	}
	else {
		Write-Host "Angular CLI not found. Installing globally..." -ForegroundColor Yellow
		try {
			npm install -g @angular/cli
			if ($LASTEXITCODE -eq 0) {
				Write-Host "✓ Angular CLI installed globally" -ForegroundColor Green
				$ngAvailable = $true
			}
			else {
				Write-Host "Failed to install Angular CLI globally, will use npx" -ForegroundColor Yellow
			}
		}
		catch {
			Write-Host "Failed to install Angular CLI globally, will use npx" -ForegroundColor Yellow
		}
	}

	# Start frontend server in new window
	Write-Host "Starting frontend server..." -ForegroundColor Green
	$frontendPath = Get-Location
    
	if ($ngAvailable -and (Test-Command "ng")) {
		Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; ng serve"
	}
	else {
		Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npx ng serve"
	}
    
	Write-Host "✓ Frontend server started in new window" -ForegroundColor Green
}
else {
	Write-Host "✗ Frontend directory not found" -ForegroundColor Red
	Set-Location $originalLocation
	Read-Host "Press Enter to exit"
	exit 1
}

# Return to original location
Set-Location $originalLocation

Write-Host "`n=== Startup Complete ===" -ForegroundColor Green
Write-Host "✓ Both servers are starting up..." -ForegroundColor Green
Write-Host "✓ Backend: Check the backend console window (usually http://localhost:3000)" -ForegroundColor Cyan
Write-Host "✓ Frontend: http://localhost:4200 (Angular default)" -ForegroundColor Cyan
Write-Host "`nBoth servers will open in separate PowerShell windows." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow

Write-Host "`nWould you like to:" -ForegroundColor Cyan
Write-Host "1. Open frontend in browser (press '1')" -ForegroundColor White
Write-Host "2. Open backend API (press '2')" -ForegroundColor White
Write-Host "3. Exit (press Enter)" -ForegroundColor White

$choice = Read-Host "Your choice"
switch ($choice) {
	"1" { 
		Start-Sleep 5  # Give Angular time to start
		Start-Process "http://localhost:4200" 
	}
	"2" { 
		Start-Sleep 3  # Give backend time to start
		Start-Process "http://localhost:3000" 
	}
	default { 
		Write-Host "Exiting. Servers will continue running in background windows." -ForegroundColor Green 
	}
}
