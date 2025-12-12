# Test if phone can reach backend
# This helps diagnose network connectivity issues

param(
    [string]$BackendUrl = "http://192.168.1.152:3001"
)

Write-Host "`nPhone Connection Diagnostic Tool" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host ""

Write-Host "This script helps diagnose why your phone can't connect to the backend." -ForegroundColor Yellow
Write-Host ""

# Get network info
Write-Host "1. Your Computer Network Info:" -ForegroundColor Cyan
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -like "192.168.*" -and 
    $_.InterfaceAlias -notlike "*Loopback*" -and
    $_.PrefixOrigin -eq "Dhcp"
} | Select-Object -First 1)

if ($ipAddress) {
    Write-Host "   IP Address: $($ipAddress.IPAddress)" -ForegroundColor Green
    Write-Host "   Interface: $($ipAddress.InterfaceAlias)" -ForegroundColor Gray
    Write-Host "   Network: $($ipAddress.IPAddress -replace '\.\d+$', '.x')" -ForegroundColor Gray
} else {
    Write-Host "   Could not detect IP address" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing Backend from Computer:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "   Status: Accessible ($($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   Status: NOT accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Network Connectivity Checklist:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   [ ] Phone is on the SAME WiFi network as your computer" -ForegroundColor Yellow
Write-Host "   [ ] Phone is NOT on a guest network (guest networks are isolated)" -ForegroundColor Yellow
Write-Host "   [ ] Router allows device-to-device communication" -ForegroundColor Yellow
Write-Host "   [ ] Windows Firewall allows connections on port 3001" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. Common Solutions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   If phone is on guest network:" -ForegroundColor White
Write-Host "   → Switch phone to the main WiFi network (same as computer)" -ForegroundColor Gray
Write-Host ""
Write-Host "   If router blocks device communication:" -ForegroundColor White
Write-Host "   → Check router settings for 'AP Isolation' or 'Client Isolation'" -ForegroundColor Gray
Write-Host "   → Disable these features for your WiFi network" -ForegroundColor Gray
Write-Host ""
Write-Host "   To test from phone:" -ForegroundColor White
Write-Host "   → Open browser on phone" -ForegroundColor Gray
Write-Host "   → Navigate to: $BackendUrl/api/health" -ForegroundColor Gray
Write-Host "   → Should see: `{\"status\":\"healthy\",...}`" -ForegroundColor Gray
Write-Host ""

Write-Host ("=" * 60) -ForegroundColor Gray


