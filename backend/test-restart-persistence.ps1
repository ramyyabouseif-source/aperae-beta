# Test Server Restart Persistence
# This script tests that sessions persist in the database after server restart
# Run this from the backend directory

$baseUrl = "http://localhost:3001"
# Use unique email with timestamp to avoid conflicts
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "test$timestamp@example.com"
$password = "Test1234!"

Write-Host "=== Testing Server Restart Persistence ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This test verifies that sessions survive server restarts" -ForegroundColor Gray
Write-Host "because they're stored in the database (not in memory)." -ForegroundColor Gray
Write-Host ""
Write-Host "Using email: $email" -ForegroundColor Yellow
Write-Host ""

# Headers for API requests
$headers = @{
    "Content-Type" = "application/json"
    "X-Requested-With" = "XMLHttpRequest"
}

try {
    # Step 1: Register a new user
    Write-Host "Step 1: Registering user..." -ForegroundColor Yellow
    $registerBody = @{
        email = $email
        password = $password
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -Headers $headers `
        -Body $registerBody
    
    Write-Host "✅ User registered successfully!" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.user.email)" -ForegroundColor Gray
    
    $refreshToken = $registerResponse.refreshToken
    $accessToken = $registerResponse.accessToken
    
    Write-Host ""
    Write-Host "Step 2: Verifying initial token refresh works..." -ForegroundColor Yellow
    $refreshBody = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json
    
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" `
        -Method Post `
        -Headers $headers `
        -Body $refreshBody
    
    Write-Host "✅ Token refresh successful!" -ForegroundColor Green
    $refreshToken = $refreshResponse.refreshToken  # Update to new token
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "⚠️  IMPORTANT: Please do the following now:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to your SERVER WINDOW (where 'npm start' is running)" -ForegroundColor White
    Write-Host "2. Press Ctrl+C to stop the server" -ForegroundColor White
    Write-Host "3. Wait 2-3 seconds" -ForegroundColor White
    Write-Host "4. Start the server again: npm start" -ForegroundColor White
    Write-Host "5. Wait for 'PocketSomm Backend started' message" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Enter AFTER you've restarted the server..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Read-Host
    
    Write-Host ""
    Write-Host "Step 3: Testing token refresh AFTER server restart..." -ForegroundColor Yellow
    Write-Host "   (This should work because the session is in the database)" -ForegroundColor Gray
    
    Start-Sleep -Seconds 2  # Give server a moment to fully start
    
    $refreshBody = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json
    
    try {
        $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" `
            -Method Post `
            -Headers $headers `
            -Body $refreshBody `
            -ErrorAction Stop
        
        Write-Host ""
        Write-Host "✅✅✅ SUCCESS! Token refresh worked after server restart!" -ForegroundColor Green
        Write-Host "   This proves sessions are persisted in the database!" -ForegroundColor Gray
        Write-Host ""
        Write-Host "New refresh token received: $($refreshResponse.refreshToken.Substring(0, 20))..." -ForegroundColor Gray
        
    } catch {
        Write-Host ""
        Write-Host "❌ FAILED: Token refresh failed after server restart" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                $reader.Close()
                Write-Host "   Response: $responseBody" -ForegroundColor Red
            } catch {
                # Ignore
            }
        }
        
        Write-Host ""
        Write-Host "This means sessions are NOT persisting correctly." -ForegroundColor Yellow
        Write-Host "Check:" -ForegroundColor Yellow
        Write-Host "- Is the sessions table created in Supabase?" -ForegroundColor Gray
        Write-Host "- Are you using the correct DATABASE_URL?" -ForegroundColor Gray
        Write-Host "- Check server logs for database connection errors" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Step 4: Verifying session in database..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run this query in Supabase SQL Editor to verify:" -ForegroundColor Gray
    Write-Host "SELECT * FROM sessions WHERE user_id = '$($registerResponse.user.id)';" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You should see:" -ForegroundColor Gray
    Write-Host "- At least one active session" -ForegroundColor Gray
    Write-Host "- Device and IP information" -ForegroundColor Gray
    Write-Host "- Expiration date in the future" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "=== Test Complete ===" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "❌ Test failed during setup!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        } catch {
            # Ignore
        }
    }
}


