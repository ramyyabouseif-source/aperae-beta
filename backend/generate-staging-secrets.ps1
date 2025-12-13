# Generate JWT Secrets for Staging Environment
# Run this script to generate secure secrets for staging
# Uses PowerShell/.NET cryptographic functions (no OpenSSL required)

Write-Host ""
Write-Host "=== Generating Staging JWT Secrets ===" -ForegroundColor Cyan
Write-Host ""

# Function to generate secure random base64 string (equivalent to openssl rand -base64 32)
function Generate-SecureBase64 {
    param([int]$Length = 32)
    
    # Generate cryptographically secure random bytes
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    
    # Convert to base64
    return [Convert]::ToBase64String($bytes)
}

Write-Host "Generating secrets using .NET cryptographic functions..." -ForegroundColor Yellow
Write-Host ""

# Generate JWT_SECRET
Write-Host "JWT_SECRET:" -ForegroundColor White
$jwtSecret = Generate-SecureBase64 -Length 32
Write-Host $jwtSecret -ForegroundColor Cyan
Write-Host ""

# Generate REFRESH_SECRET
Write-Host "REFRESH_SECRET:" -ForegroundColor White
$refreshSecret = Generate-SecureBase64 -Length 32
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

