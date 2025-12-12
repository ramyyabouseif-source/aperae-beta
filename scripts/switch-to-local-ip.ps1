# Switch back to local IP URL
# This script detects your local IP and updates .env to use it

Write-Host "`nSwitching to local IP..." -ForegroundColor Cyan

# Get the local IP address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -like "192.168.*" -and 
    $_.InterfaceAlias -notlike "*Loopback*" -and
    $_.PrefixOrigin -eq "Dhcp"
} | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    Write-Host "Could not detect local IP address." -ForegroundColor Red
    exit 1
}

$apiUrl = "http://$ipAddress:3001"
$envFilePath = Join-Path $PSScriptRoot "..\.env"

Write-Host "Found IP: $ipAddress" -ForegroundColor Green
Write-Host "Updating .env to: $apiUrl" -ForegroundColor Gray

if (-not (Test-Path $envFilePath)) {
    "EXPO_PUBLIC_API_URL=$apiUrl" | Out-File -FilePath $envFilePath -Encoding utf8
} else {
    $envContent = Get-Content $envFilePath -Raw
    if ($envContent -match "(?m)^EXPO_PUBLIC_API_URL\s*=.*$") {
        $envContent = $envContent -replace "(?m)^EXPO_PUBLIC_API_URL\s*=.*$", "EXPO_PUBLIC_API_URL=$apiUrl"
    } else {
        if (-not $envContent.EndsWith("`r`n") -and -not $envContent.EndsWith("`n")) {
            $envContent = $envContent + "`r`n"
        }
        $envContent = $envContent + "EXPO_PUBLIC_API_URL=$apiUrl`r`n"
    }
    $envContent | Set-Content $envFilePath -NoNewline
}

Write-Host "`n✅ Switched to local IP!" -ForegroundColor Green
Write-Host "   Don't forget to restart Expo" -ForegroundColor Yellow
Write-Host ""


