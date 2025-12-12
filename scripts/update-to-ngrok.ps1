# Update .env file to use ngrok URL
# This script gets the current ngrok URL and updates .env

Write-Host "`nUpdating to ngrok URL..." -ForegroundColor Cyan

# Get ngrok URL
$ngrokUrl = & "$PSScriptRoot\get-ngrok-url.ps1"

if (-not $ngrokUrl) {
    Write-Host "`n⚠️  Could not get ngrok URL" -ForegroundColor Red
    Write-Host "`nMake sure ngrok is running:" -ForegroundColor Yellow
    Write-Host "  1. Open a new terminal" -ForegroundColor White
    Write-Host "  2. Run: ngrok http 3001" -ForegroundColor White
    Write-Host "  3. Then run this script again" -ForegroundColor White
    Write-Host ""
    exit 1
}

$envFilePath = Join-Path $PSScriptRoot "..\.env"

Write-Host "`nUpdating .env file..." -ForegroundColor Cyan
Write-Host "   File: $envFilePath" -ForegroundColor Gray
Write-Host "   URL: $ngrokUrl" -ForegroundColor Gray

# Check if .env file exists
if (-not (Test-Path $envFilePath)) {
    Write-Host "Creating new .env file..." -ForegroundColor Yellow
    "EXPO_PUBLIC_API_URL=$ngrokUrl" | Out-File -FilePath $envFilePath -Encoding utf8
    Write-Host "Created .env file with ngrok URL" -ForegroundColor Green
} else {
    # Read current .env file
    $envContent = Get-Content $envFilePath -Raw
    
    # Check if EXPO_PUBLIC_API_URL exists
    if ($envContent -match "(?m)^EXPO_PUBLIC_API_URL\s*=.*$") {
        # Replace existing URL
        $envContent = $envContent -replace "(?m)^EXPO_PUBLIC_API_URL\s*=.*$", "EXPO_PUBLIC_API_URL=$ngrokUrl"
        Write-Host "Updated existing EXPO_PUBLIC_API_URL" -ForegroundColor Green
    } else {
        # Add new line if it doesn't exist
        if (-not $envContent.EndsWith("`r`n") -and -not $envContent.EndsWith("`n")) {
            $envContent = $envContent + "`r`n"
        }
        $envContent = $envContent + "EXPO_PUBLIC_API_URL=$ngrokUrl`r`n"
        Write-Host "Added EXPO_PUBLIC_API_URL to .env file" -ForegroundColor Green
    }
    
    # Write back to file
    $envContent | Set-Content $envFilePath -NoNewline
}

Write-Host "`n✅ .env file updated successfully!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart Expo: npx expo start --clear" -ForegroundColor White
Write-Host "   2. Reload app on phone" -ForegroundColor White
Write-Host "`n🔗 Your API URL: $ngrokUrl" -ForegroundColor Yellow
Write-Host ""


