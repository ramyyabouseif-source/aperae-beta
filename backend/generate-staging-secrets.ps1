# Generate JWT Secrets for Staging Environment
# Run this script to generate secure secrets for staging

Write-Host ""
Write-Host "=== Generating Staging JWT Secrets ===" -ForegroundColor Cyan
Write-Host ""

# Check if openssl is available
try {
    $opensslVersion = openssl version 2>&1
    Write-Host "✅ OpenSSL found: $opensslVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ OpenSSL not found!" -ForegroundColor Red
    Write-Host "Please install OpenSSL or use Git Bash/WSL to run: openssl rand -base64 32" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Generating secrets..." -ForegroundColor Yellow
Write-Host ""

# Generate JWT_SECRET
Write-Host "JWT_SECRET:" -ForegroundColor White
$jwtSecret = openssl rand -base64 32
Write-Host $jwtSecret -ForegroundColor Cyan
Write-Host ""

# Generate REFRESH_SECRET
Write-Host "REFRESH_SECRET:" -ForegroundColor White
$refreshSecret = openssl rand -base64 32
Write-Host $refreshSecret -ForegroundColor Cyan
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Secrets Generated!" -ForegroundColor Green
Write-Host ""
Write-Host "Copy these values into Render environment variables:" -ForegroundColor White
Write-Host "  Key: JWT_SECRET" -ForegroundColor Gray
Write-Host "  Value: $jwtSecret" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Key: REFRESH_SECRET" -ForegroundColor Gray
Write-Host "  Value: $refreshSecret" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Save to clipboard (optional)
try {
    "$jwtSecret`n$refreshSecret" | Set-Clipboard
    Write-Host "✅ Secrets copied to clipboard!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not copy to clipboard (manual copy required)" -ForegroundColor Yellow
}

