# Quick script to display your local IP address
# Useful for manually updating .env or sharing with team members

Write-Host "`nYour Local IP Addresses:" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Gray

# Get all IPv4 addresses
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and
    $_.InterfaceAlias -notlike "*Loopback*"
} | Select-Object IPAddress, InterfaceAlias, PrefixOrigin | Sort-Object IPAddress

if ($ipAddresses.Count -eq 0) {
    Write-Host "No IP addresses found" -ForegroundColor Red
    exit 1
}

foreach ($ip in $ipAddresses) {
    $isPrimary = $ip.IPAddress -like "192.168.*" -and $ip.PrefixOrigin -eq "Dhcp"
    $color = if ($isPrimary) { "Green" } else { "White" }
    $marker = if ($isPrimary) { "(Recommended)" } else { "           " }
    
    Write-Host "$marker $($ip.IPAddress)" -ForegroundColor $color
    Write-Host "     Interface: $($ip.InterfaceAlias)" -ForegroundColor Gray
    Write-Host "     Origin: $($ip.PrefixOrigin)" -ForegroundColor Gray
    Write-Host ""
}

# Show the primary IP for API URL
$primaryIP = ($ipAddresses | Where-Object { $_.IPAddress -like "192.168.*" -and $_.PrefixOrigin -eq "Dhcp" } | Select-Object -First 1).IPAddress

if ($primaryIP) {
    Write-Host ("=" * 50) -ForegroundColor Gray
    Write-Host "`nRecommended API URL:" -ForegroundColor Cyan
    $apiUrl = "http://$primaryIP:3001"
    Write-Host "   EXPO_PUBLIC_API_URL=$apiUrl" -ForegroundColor Yellow
    Write-Host ""
}
