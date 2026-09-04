# KTX Docker Full Control Script
# Manages both Docker containers and Docker Desktop itself
# Usage: .\start-ktx-docker.ps1 [start|stop|restart|status|build]

$ErrorActionPreference = "Stop"
$ComposeFile = "C:\Users\hp\KingdomTradeX\dockercompose-all.yml"

function Get-DockerState {
    try {
        $info = docker info 2>&1
        if ($info -match "Server Version") {
            return "running"
        }
    } catch {}
    return "stopped"
}

function Start-DockerDesktop {
    Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow
    $dockerExe = "C:\Users\hp\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
    if (Test-Path $dockerExe) {
        Start-Process $dockerExe -WindowStyle Normal
        Write-Host "Docker Desktop launched. Waiting for daemon..." -ForegroundColor Yellow
        
        # Wait up to 120 seconds for Docker to be ready
        $startTime = Get-Date
        while ((Get-DockerState) -eq "stopped") {
            $elapsed = (New-TimeSpan -Start $startTime -End (Get-Date)).TotalSeconds
            if ($elapsed -gt 120) {
                Write-Host "ERROR: Docker Desktop did not start within 120 seconds" -ForegroundColor Red
                return $false
            }
            Write-Host "Waiting for Docker... ($([math]::Round($elapsed,0))s)" -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
        Write-Host "Docker is ready!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Docker Desktop executable not found at expected path" -ForegroundColor Red
        Write-Host "Expected: $dockerExe" -ForegroundColor Red
        return $false
    }
}

function Ensure-Docker {
    $state = Get-DockerState
    if ($state -eq "running") {
        Write-Host "Docker is already running" -ForegroundColor Green
        return $true
    }
    return Start-DockerDesktop
}

function Invoke-DockerCompose {
    param([string]$Action)
    Write-Host "Executing: docker compose -f '$ComposeFile' $Action" -ForegroundColor Cyan
    $result = docker compose -f $ComposeFile $Action 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success" -ForegroundColor Green
    } else {
        Write-Host "Error: $result" -ForegroundColor Red
    }
    return $LASTEXITCODE -eq 0
}

function Show-Status {
    Write-Host ""
    Write-Host "===== KTX Docker Status =====" -ForegroundColor Cyan
    Write-Host "Docker Daemon: $(Get-DockerState)" -ForegroundColor $(if ((Get-DockerState) -eq "running") { "Green" } else { "Red" })
    Write-Host ""
    
    # Show all KTX containers
    docker ps -a --filter "name=kingdomtradex" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>&1
    Write-Host ""
    
    # Show port usage
    Write-Host "Port Status:" -ForegroundColor Yellow
    foreach ($port in @(3000, 3001)) {
        try {
            $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
            Write-Host "  Port $port: IN USE (by PID $($conn.OwningProcess))" -ForegroundColor Red
        } catch {
            Write-Host "  Port $port: FREE" -ForegroundColor Green
        }
    }
    Write-Host ""
    
    # Show container logs summary
    Write-Host "Recent container logs (last 5 lines each):" -ForegroundColor Yellow
    foreach ($name in @("kingdomtradex-main", "kingdomtradex-preview")) {
        Write-Host "--- $name ---" -ForegroundColor Gray
        docker logs --tail 5 $name 2>&1 | Select-Object -Last 5
        Write-Host ""
    }
}

# Main
$action = $args[0]
if (-not $action) { $action = "status" }

Write-Host ""
Write-Host "===== KTX Docker Control =====" -ForegroundColor Cyan
Write-Host ""

# Require Docker for all actions
if ($action -ne "status") {
    if (-not (Ensure-Docker)) {
        Write-Host "Aborting - Docker is not available" -ForegroundColor Red
        exit 1
    }
}

switch ($action) {
    "start" {
        Write-Host "Starting both containers..." -ForegroundColor Yellow
        if (-not (Invoke-DockerCompose "up -d")) {
            exit 1
        }
        Start-Sleep -Seconds 3
        Show-Status
    }
    "stop" {
        Write-Host "Stopping both containers..." -ForegroundColor Yellow
        Invoke-DockerCompose "down"
    }
    "restart" {
        Write-Host "Restarting both containers..." -ForegroundColor Yellow
        Invoke-DockerCompose "down"
        Start-Sleep -Seconds 2
        if (-not (Invoke-DockerCompose "up -d")) {
            exit 1
        }
        Start-Sleep -Seconds 3
        Show-Status
    }
    "build" {
        Write-Host "Rebuilding both Docker images..." -ForegroundColor Yellow
        Invoke-DockerCompose "build"
    }
    "pull-preview" {
        Write-Host "Pulling latest from GitHub into preview folder..." -ForegroundColor Yellow
        Set-Location "C:\Users\hp\KingdomTradeX-GitHub-Site"
        $result = git pull origin master 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Pull successful!" -ForegroundColor Green
            Write-Host "Preview will serve the latest GitHub version after restart" -ForegroundColor Green
        } else {
            Write-Host "Pull failed: $result" -ForegroundColor Red
        }
    }
    "status" {
        Show-Status
    }
    default {
        Write-Host "Unknown action: $action" -ForegroundColor Red
        Write-Host "Usage: .\start-ktx-docker.ps1 [start|stop|restart|build|pull-preview|status]" -ForegroundColor Yellow
        exit 1
    }
}
