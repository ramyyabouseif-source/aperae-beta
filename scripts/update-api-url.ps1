# PowerShell Script to Update API URL in .env file
# This script detects your local IP and updates the EXPO_PUBLIC_API_URL

Write-Host "`nDetecting your local IP address..." -ForegroundColor Cyan

# Get the local IP address (excluding loopback)
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -like "192.168.*" -and 
    $_.InterfaceAlias -notlike "*Loopback*" -and
    $_.PrefixOrigin -eq "Dhcp"
} | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    Write-Host "Could not detect local IP address. Please set it manually." -ForegroundColor Red
    Write-Host "   Run: ipconfig | findstr /i IPv4" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found IP address: $ipAddress" -ForegroundColor Green

$apiUrl = "http://$ipAddress:3001"
$envFilePath = Join-Path $PSScriptRoot "..\.env"

Write-Host "`nUpdating .env file..." -ForegroundColor Cyan
Write-Host "   File: $envFilePath" -ForegroundColor Gray
Write-Host "   URL: $apiUrl" -ForegroundColor Gray

# Check if .env file exists
if (-not (Test-Path $envFilePath)) {
    Write-Host ".env file not found. Creating new .env file..." -ForegroundColor Yellow
    
    # Create .env file with the API URL
    "EXPO_PUBLIC_API_URL=$apiUrl" | Out-File -FilePath $envFilePath -Encoding utf8
    Write-Host "Created .env file with API URL" -ForegroundColor Green
} else {
    # Read current .env file
    $envContent = Get-Content $envFilePath -Raw
    
    # Check if EXPO_PUBLIC_API_URL exists
    if ($envContent -match "EXPO_PUBLIC_API_URL\s*=") {
        # Replace existing URL (match entire line, handle different line endings)
        $envContent = $envContent -replace "(?m)^EXPO_PUBLIC_API_URL\s*=.*$", "EXPO_PUBLIC_API_URL=$apiUrl"
        Write-Host "Updated existing EXPO_PUBLIC_API_URL" -ForegroundColor Green
    } else {
        # Add new line if it doesn't exist
        if (-not $envContent.EndsWith("`n")) {
            $envContent = $envContent + "`n"
        }
        $envContent = $envContent + "EXPO_PUBLIC_API_URL=$apiUrl`n"
        Write-Host "Added EXPO_PUBLIC_API_URL to .env file" -ForegroundColor Green
    }
    
    # Write back to file
    $envContent | Out-File -FilePath $envFilePath -Encoding utf8 -NoNewline
}

Write-Host "`n.env file updated successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "   1. Restart your Expo app (environment variables load on startup)" -ForegroundColor White
Write-Host "   2. Make sure your phone is on the same WiFi network" -ForegroundColor White
Write-Host "   3. Make sure backend is running: cd backend; npm start" -ForegroundColor White
Write-Host "`nYour API URL: $apiUrl" -ForegroundColor Yellow
