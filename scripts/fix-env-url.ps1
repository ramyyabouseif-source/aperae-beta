# Quick fix script to manually set the API URL in .env
# Use this if the auto-detect script has issues

$ip = "192.168.1.152"
$apiUrl = "http://$ip:3001"

Write-Host "`nSetting EXPO_PUBLIC_API_URL to: $apiUrl" -ForegroundColor Yellow

if (Test-Path .env) {
    $content = Get-Content .env -Raw
    
    if ($content -match "(?m)^EXPO_PUBLIC_API_URL\s*=.*$") {
        $content = $content -replace "(?m)^EXPO_PUBLIC_API_URL\s*=.*$", "EXPO_PUBLIC_API_URL=$apiUrl"
        Write-Host "Replaced existing line" -ForegroundColor Green
    } else {
        $content = $content.TrimEnd() + "`r`nEXPO_PUBLIC_API_URL=$apiUrl`r`n"
        Write-Host "Added new line" -ForegroundColor Green
    }
    
    $content | Set-Content .env -NoNewline
} else {
    "EXPO_PUBLIC_API_URL=$apiUrl" | Set-Content .env
    Write-Host "Created new .env file" -ForegroundColor Green
}

Write-Host "`nVerifying..." -ForegroundColor Cyan
Get-Content .env | Select-String "EXPO_PUBLIC_API_URL"

Write-Host "`n✅ Done! Now RESTART Expo to load the new URL." -ForegroundColor Green
Write-Host "   Run: npx expo start --clear" -ForegroundColor Yellow



