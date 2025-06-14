# Simple Menu - Path Verification Script
# Verifies that all Docker Compose paths are correct after reorganization

param(
    [switch]$Verbose = $false
)

Write-Host "Simple Menu - Path Verification" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Test Docker Compose file paths
$ComposeFiles = @(
    @{ Path = "docker-compose.yml"; Description = "Main application stack" },
    @{ Path = "docker\docker-compose.unified.yml"; Description = "Unified monitoring stack" },
    @{ Path = "docker\docker-compose.monitoring-simple.yml"; Description = "Simple Prometheus monitoring" },
    @{ Path = "docker\docker-compose.elk-simple.yml"; Description = "Simple ELK logging" },
    @{ Path = "docker\docker-compose.monitoring.yml"; Description = "Advanced Prometheus monitoring" },
    @{ Path = "docker\docker-compose.elk.yml"; Description = "Advanced ELK logging" },
    @{ Path = "docker\docker-compose.override.yml"; Description = "Development overrides" }
)

Write-Host "Docker Compose Files Verification" -ForegroundColor Green
foreach ($file in $ComposeFiles) {
    if (Test-Path $file.Path) {
        Write-Host "   OK $($file.Path)" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "      -> $($file.Description)" -ForegroundColor Gray
            
            # Test if file can be parsed by docker-compose
            try {
                $configTest = docker-compose -f $file.Path config --quiet 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "      -> Valid Docker Compose syntax" -ForegroundColor Green
                } else {
                    Write-Host "      -> Docker Compose syntax warnings" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "      -> Docker Compose syntax error" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "   MISSING $($file.Path)" -ForegroundColor Red
    }
}

Write-Host ""

# Test monitoring configuration paths
$MonitoringConfigs = @(
    @{ Path = "monitoring\unified\prometheus.yml"; Description = "Unified Prometheus config" },
    @{ Path = "monitoring\unified\grafana-datasources.yml"; Description = "Grafana datasources" },
    @{ Path = "monitoring\unified\logstash.conf"; Description = "Logstash pipeline" },
    @{ Path = "monitoring\unified\filebeat.yml"; Description = "Filebeat configuration" },
    @{ Path = "monitoring\simple\prometheus.yml"; Description = "Simple Prometheus config" },
    @{ Path = "monitoring\elk-simple\logstash.conf"; Description = "Simple Logstash config" }
)

Write-Host "Monitoring Configuration Files" -ForegroundColor Green
foreach ($config in $MonitoringConfigs) {
    if (Test-Path $config.Path) {
        Write-Host "   OK $($config.Path)" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "      -> $($config.Description)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   MISSING $($config.Path)" -ForegroundColor Red
    }
}

Write-Host ""

# Test script organization
$ScriptDirs = @(
    @{ Path = "scripts\deployment"; Description = "Deployment scripts" },
    @{ Path = "scripts\monitoring"; Description = "Monitoring scripts" },
    @{ Path = "scripts\lan-setup"; Description = "LAN setup scripts" },
    @{ Path = "scripts\database"; Description = "Database management scripts" }
)

Write-Host "Script Organization" -ForegroundColor Green
foreach ($dir in $ScriptDirs) {
    if (Test-Path $dir.Path) {
        $fileCount = (Get-ChildItem $dir.Path).Count
        Write-Host "   OK $($dir.Path) ($fileCount files)" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "      -> $($dir.Description)" -ForegroundColor Gray
            Get-ChildItem $dir.Path | ForEach-Object {
                Write-Host "         * $($_.Name)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   MISSING $($dir.Path)" -ForegroundColor Red
    }
}

Write-Host ""

# Test startup scripts
$StartupScripts = @(
    @{ Path = "start.ps1"; Description = "Main interactive startup script" },
    @{ Path = "start-unified.ps1"; Description = "Quick unified deployment" },
    @{ Path = "start-unified-safe.ps1"; Description = "Safe unified deployment" },
    @{ Path = "start.sh"; Description = "Linux/macOS startup script" }
)

Write-Host "Startup Scripts" -ForegroundColor Green
foreach ($script in $StartupScripts) {
    if (Test-Path $script.Path) {
        Write-Host "   OK $($script.Path)" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "      -> $($script.Description)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   MISSING $($script.Path)" -ForegroundColor Red
    }
}

Write-Host ""

# Documentation check
$DocsFiles = @(
    @{ Path = "docs\QUICK_START.md"; Description = "Getting started guide" },
    @{ Path = "docs\DEPLOYMENT_GUIDE.md"; Description = "Deployment instructions" },
    @{ Path = "README.md"; Description = "Main project documentation" }
)

Write-Host "Documentation" -ForegroundColor Green
foreach ($doc in $DocsFiles) {
    if (Test-Path $doc.Path) {
        $size = [Math]::Round((Get-Item $doc.Path).Length / 1KB, 1)
        Write-Host "   OK $($doc.Path) ($size KB)" -ForegroundColor Green
        if ($Verbose) {
            Write-Host "      -> $($doc.Description)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   MISSING $($doc.Path)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

$TotalFiles = $ComposeFiles.Count + $MonitoringConfigs.Count + $StartupScripts.Count + $DocsFiles.Count
$FoundFiles = 0

$ComposeFiles + $MonitoringConfigs + $StartupScripts + $DocsFiles | ForEach-Object {
    if (Test-Path $_.Path) { $FoundFiles++ }
}

$Percentage = [Math]::Round(($FoundFiles / $TotalFiles) * 100, 1)

if ($Percentage -eq 100) {
    Write-Host "SUCCESS: All files found and organized correctly! ($FoundFiles/$TotalFiles)" -ForegroundColor Green
} elseif ($Percentage -ge 90) {
    Write-Host "WARNING: Most files organized correctly ($FoundFiles/$TotalFiles - $Percentage%)" -ForegroundColor Yellow
} else {
    Write-Host "ERROR: Issues found with file organization ($FoundFiles/$TotalFiles - $Percentage%)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   Test deployment: .\start.ps1" -ForegroundColor White
Write-Host "   Quick unified start: .\start-unified.ps1" -ForegroundColor White
Write-Host "   View README: Get-Content README.md | Select-Object -First 50" -ForegroundColor White

# Test monitoring configuration paths
$MonitoringConfigs = @(
	@{ Path = "monitoring\unified\prometheus.yml"; Description = "Unified Prometheus config" },
	@{ Path = "monitoring\unified\grafana-datasources.yml"; Description = "Grafana datasources" },
	@{ Path = "monitoring\unified\logstash.conf"; Description = "Logstash pipeline" },
	@{ Path = "monitoring\unified\filebeat.yml"; Description = "Filebeat configuration" },
	@{ Path = "monitoring\simple\prometheus.yml"; Description = "Simple Prometheus config" },
	@{ Path = "monitoring\elk-simple\logstash.conf"; Description = "Simple Logstash config" }
)

Write-Host "📊 Monitoring Configuration Files" -ForegroundColor Green
foreach ($config in $MonitoringConfigs) {
	if (Test-Path $config.Path) {
		Write-Host "   ✅ $($config.Path)" -ForegroundColor Green
		if ($Verbose) {
			Write-Host "      └─ $($config.Description)" -ForegroundColor Gray
		}
	}
 else {
		Write-Host "   ❌ $($config.Path) - NOT FOUND" -ForegroundColor Red
	}
}

Write-Host ""

# Test script organization
$ScriptDirs = @(
	@{ Path = "scripts\deployment"; Description = "Deployment scripts" },
	@{ Path = "scripts\monitoring"; Description = "Monitoring scripts" },
	@{ Path = "scripts\lan-setup"; Description = "LAN setup scripts" },
	@{ Path = "scripts\database"; Description = "Database management scripts" }
)

Write-Host "🛠️  Script Organization" -ForegroundColor Green
foreach ($dir in $ScriptDirs) {
	if (Test-Path $dir.Path) {
		$fileCount = (Get-ChildItem $dir.Path).Count
		Write-Host "   ✅ $($dir.Path) ($fileCount files)" -ForegroundColor Green
		if ($Verbose) {
			Write-Host "      └─ $($dir.Description)" -ForegroundColor Gray
			Get-ChildItem $dir.Path | ForEach-Object {
				Write-Host "         • $($_.Name)" -ForegroundColor Gray
			}
		}
	}
 else {
		Write-Host "   ❌ $($dir.Path) - NOT FOUND" -ForegroundColor Red
	}
}

Write-Host ""

# Test startup scripts
$StartupScripts = @(
	@{ Path = "start.ps1"; Description = "Interactive deployment menu" },
	@{ Path = "start-unified.ps1"; Description = "Quick unified deployment" },
	@{ Path = "start-unified-safe.ps1"; Description = "Safe unified deployment" },
	@{ Path = "start.sh"; Description = "Linux startup script" }
)

Write-Host "🚀 Startup Scripts" -ForegroundColor Green
foreach ($script in $StartupScripts) {
	if (Test-Path $script.Path) {
		Write-Host "   ✅ $($script.Path)" -ForegroundColor Green
		if ($Verbose) {
			Write-Host "      └─ $($script.Description)" -ForegroundColor Gray
            
			# Check for docker\ path references in PowerShell scripts
			if ($script.Path -like "*.ps1") {
				$content = Get-Content $script.Path -Raw
				if ($content -match "docker\\docker-compose") {
					Write-Host "      └─ ✅ Uses updated docker\ paths" -ForegroundColor Green
				}
				elseif ($content -match "docker-compose\.[^\\]") {
					Write-Host "      └─ ⚠️  May need path updates" -ForegroundColor Yellow
				}
			}
		}
	}
 else {
		Write-Host "   ❌ $($script.Path) - NOT FOUND" -ForegroundColor Red
	}
}

Write-Host ""

# Documentation check
$DocsFiles = @(
	@{ Path = "docs\PROJECT_STRUCTURE.md"; Description = "Project organization guide" },
	@{ Path = "docs\QUICK_START.md"; Description = "Getting started guide" },
	@{ Path = "docs\DEPLOYMENT_GUIDE.md"; Description = "Deployment instructions" },
	@{ Path = "README.md"; Description = "Main project documentation" }
)

Write-Host "📚 Documentation" -ForegroundColor Green
foreach ($doc in $DocsFiles) {
	if (Test-Path $doc.Path) {
		$size = [Math]::Round((Get-Item $doc.Path).Length / 1KB, 1)
		Write-Host "   ✅ $($doc.Path) ($size KB)" -ForegroundColor Green
		if ($Verbose) {
			Write-Host "      └─ $($doc.Description)" -ForegroundColor Gray
		}
	}
 else {
		Write-Host "   ❌ $($doc.Path) - NOT FOUND" -ForegroundColor Red
	}
}

Write-Host ""
Write-Host "🎯 Verification Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$TotalFiles = $ComposeFiles.Count + $MonitoringConfigs.Count + $StartupScripts.Count + $DocsFiles.Count
$FoundFiles = 0

$ComposeFiles + $MonitoringConfigs + $StartupScripts + $DocsFiles | ForEach-Object {
	if (Test-Path $_.Path) { $FoundFiles++ }
}

$Percentage = [Math]::Round(($FoundFiles / $TotalFiles) * 100, 1)

if ($Percentage -eq 100) {
	Write-Host "✅ All files found and organized correctly! ($FoundFiles/$TotalFiles)" -ForegroundColor Green
}
elseif ($Percentage -ge 90) {
	Write-Host "⚠️  Most files organized correctly ($FoundFiles/$TotalFiles - $Percentage%)" -ForegroundColor Yellow
}
else {
	Write-Host "❌ Issues found with file organization ($FoundFiles/$TotalFiles - $Percentage%)" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "   • Test deployment: .\start.ps1" -ForegroundColor White
Write-Host "   • Quick unified start: .\start-unified.ps1" -ForegroundColor White
Write-Host "   • View structure guide: Get-Content docs\PROJECT_STRUCTURE.md" -ForegroundColor White
