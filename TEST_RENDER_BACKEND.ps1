# Quick Render Backend Health Check
# Tests if the Render backend is running and accessible

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Render Backend Health Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Production API URL
$productionUrl = "https://api.aperae.com"
$stagingUrl = "https://staging-api.aperae.com"

# Test Production
Write-Host "[PRODUCTION] Testing: $productionUrl" -ForegroundColor Yellow
Write-Host ""
try {
    $health = Invoke-RestMethod -Uri "$productionUrl/api/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  ✓ BACKEND IS RUNNING" -ForegroundColor Green
    Write-Host "    Status: $($health.status)" -ForegroundColor Gray
    Write-Host "    Mock Mode: $($health.mockMode)" -ForegroundColor Gray
    Write-Host "    Uptime: $([math]::Round($health.uptime, 0)) seconds" -ForegroundColor Gray
    Write-Host "    Timestamp: $($health.timestamp)" -ForegroundColor Gray
    
    if ($health.dependencies) {
        Write-Host "    Dependencies:" -ForegroundColor Gray
        foreach ($dep in $health.dependencies.PSObject.Properties) {
            $depName = $dep.Name
            $depStatus = $dep.Value.status
            $statusColor = if ($depStatus -eq 'healthy' -or $depStatus -eq 'skipped') { 'Green' } else { 'Yellow' }
            Write-Host "      - $depName : $depStatus" -ForegroundColor $statusColor
        }
    }
} catch {
    Write-Host "  ✗ BACKEND NOT ACCESSIBLE" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "    HTTP Status: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[STAGING] Testing: $stagingUrl" -ForegroundColor Yellow
Write-Host ""
try {
    $health = Invoke-RestMethod -Uri "$stagingUrl/api/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  ✓ BACKEND IS RUNNING" -ForegroundColor Green
    Write-Host "    Status: $($health.status)" -ForegroundColor Gray
    Write-Host "    Mock Mode: $($health.mockMode)" -ForegroundColor Gray
    Write-Host "    Uptime: $([math]::Round($health.uptime, 0)) seconds" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ BACKEND NOT ACCESSIBLE" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Health Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

