# Verification script for Digital Menu setup
Write-Host "=== Digital Menu Setup Verification ===" -ForegroundColor Green

$errors = @()
$warnings = @()

# Check current directory structure
Write-Host "`nChecking directory structure..." -ForegroundColor Cyan

$requiredDirs = @("Backend", "Frontend\front")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✓ Found: $dir" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing: $dir" -ForegroundColor Red
        $errors += "Missing directory: $dir"
    }
}

# Check required files
Write-Host "`nChecking required files..." -ForegroundColor Cyan

$requiredFiles = @(
    "Backend\package.json",
    "Frontend\front\package.json",
    "start.ps1",
    "start.bat",
    "Start Digital Menu.bat",
    "docker-compose.yml"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing: $file" -ForegroundColor Red
        $errors += "Missing file: $file"
    }
}

# Check Node.js installation
Write-Host "`nChecking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠ Node.js not found (will be auto-installed)" -ForegroundColor Yellow
        $warnings += "Node.js not installed"
    }
} catch {
    Write-Host "⚠ Node.js not found (will be auto-installed)" -ForegroundColor Yellow
    $warnings += "Node.js not installed"
}

# Check npm
Write-Host "`nChecking npm..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠ npm not found" -ForegroundColor Yellow
        $warnings += "npm not installed"
    }
} catch {
    Write-Host "⚠ npm not found" -ForegroundColor Yellow
    $warnings += "npm not installed"
}

# Check PowerShell execution policy
Write-Host "`nChecking PowerShell execution policy..." -ForegroundColor Cyan
$policy = Get-ExecutionPolicy -Scope CurrentUser
if ($policy -eq "RemoteSigned" -or $policy -eq "Unrestricted" -or $policy -eq "Bypass") {
    Write-Host "✓ PowerShell execution policy: $policy" -ForegroundColor Green
} else {
    Write-Host "⚠ PowerShell execution policy may block scripts: $policy" -ForegroundColor Yellow
    $warnings += "PowerShell execution policy restrictive: $policy"
}

# Summary
Write-Host "`n=== Verification Summary ===" -ForegroundColor Green

if ($errors.Count -eq 0) {
    Write-Host "✓ No critical errors found!" -ForegroundColor Green
    Write-Host "You can run the startup script with confidence." -ForegroundColor Green
} else {
    Write-Host "✗ Critical errors found:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`nWarnings (will be handled automatically):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "1. Double-click 'Start Digital Menu.bat' to start the application" -ForegroundColor White
    Write-Host "2. Or run: powershell -ExecutionPolicy Bypass -File start.ps1" -ForegroundColor White
    Write-Host "3. The script will handle any missing dependencies automatically" -ForegroundColor White
} else {
    Write-Host "1. Fix the critical errors listed above" -ForegroundColor White
    Write-Host "2. Run this verification script again" -ForegroundColor White
    Write-Host "3. Then start the application" -ForegroundColor White
}

Write-Host "`nPress Enter to exit..."
Read-Host
