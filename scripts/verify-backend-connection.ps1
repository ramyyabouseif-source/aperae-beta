# Script to verify backend is accessible from network
# Tests if the backend can be reached from other devices

param(
    [string]$BackendUrl = "http://192.168.1.152:3001"
)

Write-Host "`nVerifying Backend Connection" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Gray

Write-Host "`nTesting: $BackendUrl" -ForegroundColor Yellow

# Test health endpoint
$healthUrl = "$BackendUrl/api/health"

try {
    Write-Host "`nTesting health endpoint..." -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 5 -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend is accessible!" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
        Write-Host "`nYour phone should be able to connect!" -ForegroundColor Green
    } else {
        Write-Host "Backend responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    $errorMessage = $_.Exception.Message
    Write-Host "Backend is NOT accessible" -ForegroundColor Red
    Write-Host "   Error: $errorMessage" -ForegroundColor Red
    
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Is the backend running? (cd backend; npm start)" -ForegroundColor White
    Write-Host "   2. Does it listen on 0.0.0.0? (check server.js line 1464)" -ForegroundColor White
    Write-Host "   3. Is Windows Firewall blocking port 3001?" -ForegroundColor White
    Write-Host "   4. Are you on the same WiFi network?" -ForegroundColor White
    
    exit 1
}

Write-Host "`nAll checks passed!" -ForegroundColor Green
