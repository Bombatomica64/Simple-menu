# Simple Menu - Project Cleanup Script
# Helps maintain the organized project structure

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

Write-Host "🧹 Simple Menu - Project Cleanup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Define cleanup tasks
$CleanupTasks = @(
    @{
        Name = "Docker containers and images"
        Command = { 
            docker system prune -af --volumes 2>$null
            docker image prune -af 2>$null
        }
        Description = "Remove unused Docker containers, networks, and images"
    },
    @{
        Name = "Node modules cleanup"
        Command = {
            if (Test-Path "Backend\node_modules") {
                if (-not $DryRun) { Remove-Item "Backend\node_modules" -Recurse -Force }
                Write-Host "   └─ Removed Backend\node_modules" -ForegroundColor Gray
            }
            if (Test-Path "Frontend\front\node_modules") {
                if (-not $DryRun) { Remove-Item "Frontend\front\node_modules" -Recurse -Force }
                Write-Host "   └─ Removed Frontend\front\node_modules" -ForegroundColor Gray
            }
        }
        Description = "Remove node_modules directories"
    },
    @{
        Name = "Log files cleanup"
        Command = {
            Get-ChildItem -Path . -Include "*.log" -Recurse | ForEach-Object {
                Write-Host "   └─ Found log file: $($_.FullName)" -ForegroundColor Gray
                if (-not $DryRun) { Remove-Item $_.FullName -Force }
            }
        }
        Description = "Remove log files throughout the project"
    },
    @{
        Name = "Temporary files cleanup"
        Command = {
            $TempPatterns = @("*.tmp", "*.temp", "*~", ".DS_Store", "Thumbs.db")
            foreach ($pattern in $TempPatterns) {
                Get-ChildItem -Path . -Include $pattern -Recurse | ForEach-Object {
                    Write-Host "   └─ Found temp file: $($_.FullName)" -ForegroundColor Gray
                    if (-not $DryRun) { Remove-Item $_.FullName -Force }
                }
            }
        }
        Description = "Remove temporary and system files"
    },
    @{
        Name = "Database cleanup"
        Command = {
            if (Test-Path "Backend\prisma\dev.db-journal") {
                Write-Host "   └─ Found SQLite journal file" -ForegroundColor Gray
                if (-not $DryRun) { Remove-Item "Backend\prisma\dev.db-journal" -Force }
            }
        }
        Description = "Clean up database temporary files"
    }
)

# Execute cleanup tasks
foreach ($task in $CleanupTasks) {
    Write-Host "🔧 $($task.Name)" -ForegroundColor Green
    Write-Host "   $($task.Description)" -ForegroundColor White
    
    try {
        & $task.Command
        Write-Host "   ✅ Completed" -ForegroundColor Green
    }
    catch {
        Write-Host "   ⚠️  Warning: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Project structure validation
Write-Host "📁 Project Structure Validation" -ForegroundColor Green
Write-Host "Checking organized directory structure..." -ForegroundColor White

$RequiredDirs = @("Backend", "Frontend", "docker", "monitoring", "scripts", "docs")
$MissingDirs = @()

foreach ($dir in $RequiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir (Missing)" -ForegroundColor Red
        $MissingDirs += $dir
    }
}

if ($MissingDirs.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Missing directories detected. Run this to fix:" -ForegroundColor Yellow
    Write-Host "   New-Item -ItemType Directory -Path '$($MissingDirs -join "', '")' -Force" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎯 Project Organization Summary" -ForegroundColor Cyan
Write-Host "==============================="-ForegroundColor Cyan

$RootFiles = Get-ChildItem -Path . -File | Where-Object { $_.Name -notmatch '\.(md|yml|json|ps1|sh|txt|gitignore)$' }
if ($RootFiles.Count -gt 0) {
    Write-Host "⚠️  Files that might need organization:" -ForegroundColor Yellow
    $RootFiles | ForEach-Object {
        Write-Host "   • $($_.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ Root directory is clean and organized" -ForegroundColor Green
}

Write-Host ""
Write-Host "🏁 Cleanup completed!" -ForegroundColor Green

if ($DryRun) {
    Write-Host ""
    Write-Host "💡 To execute the cleanup, run:" -ForegroundColor Cyan
    Write-Host "   .\cleanup.ps1" -ForegroundColor White
}
