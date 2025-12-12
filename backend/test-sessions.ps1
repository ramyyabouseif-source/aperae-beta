# Quick Session Storage Test Script (PowerShell)
# Run this from the backend directory

$baseUrl = "http://localhost:3001"
# Use unique email with timestamp to avoid conflicts
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "test$timestamp@example.com"
$password = "Test1234!"

Write-Host "=== Testing Session Storage ===" -ForegroundColor Cyan
Write-Host "Using email: $email" -ForegroundColor Gray
Write-Host ""

# Test 1: Register
Write-Host "1. Registering user..." -ForegroundColor Yellow
$registerBody = @{
    email = $email
    password = $password
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

# Add headers to bypass CSRF protection (defense in depth)
$registerHeaders = @{
    "Content-Type" = "application/json"
    "X-Requested-With" = "XMLHttpRequest"
}

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -Headers $registerHeaders `
        -Body $registerBody
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "   User ID: $($registerResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.user.email)" -ForegroundColor Gray
    Write-Host ""
    
    $refreshToken = $registerResponse.refreshToken
    $accessToken = $registerResponse.accessToken
    
    # Test 2: Refresh Token
    Write-Host "2. Testing token refresh..." -ForegroundColor Yellow
    $refreshBody = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json
    
    $refreshHeaders = @{
        "Content-Type" = "application/json"
        "X-Requested-With" = "XMLHttpRequest"
    }
    
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" `
        -Method Post `
        -Headers $refreshHeaders `
        -Body $refreshBody
    
    Write-Host "✅ Token refresh successful!" -ForegroundColor Green
    Write-Host "   New access token received" -ForegroundColor Gray
    Write-Host ""
    
    # Test 3: Logout
    Write-Host "3. Testing logout..." -ForegroundColor Yellow
    $logoutHeaders = @{
        "Authorization" = "Bearer $accessToken"
        "X-Requested-With" = "XMLHttpRequest"
    }
    
    $logoutResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/logout" `
        -Method Post `
        -Headers $logoutHeaders
    
    Write-Host "✅ Logout successful!" -ForegroundColor Green
    Write-Host ""
    
    # Test 4: Try to refresh revoked token (should fail)
    Write-Host "4. Testing revoked token (should fail)..." -ForegroundColor Yellow
    try {
        $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" `
            -Method Post `
            -Headers $refreshHeaders `
            -Body $refreshBody `
            -ErrorAction Stop
        
        Write-Host "❌ ERROR: Revoked token still works!" -ForegroundColor Red
    } catch {
        Write-Host "✅ Revoked token correctly rejected!" -ForegroundColor Green
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
    Write-Host ""
    
    Write-Host "=== All Tests Complete ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check database: SELECT * FROM sessions WHERE user_id = '$($registerResponse.user.id)';" -ForegroundColor Gray
    Write-Host "2. Restart server and try refreshing token again (should still work)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get detailed error from response
    if ($_.Exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            
            Write-Host "Response: $responseBody" -ForegroundColor Red
            
            # Try to parse JSON error
            try {
                $errorObj = $responseBody | ConvertFrom-Json
                if ($errorObj.error) {
                    Write-Host "Error message: $($errorObj.error)" -ForegroundColor Yellow
                }
                if ($errorObj.requestId) {
                    Write-Host "Request ID: $($errorObj.requestId)" -ForegroundColor Gray
                }
            } catch {
                # Not JSON, that's okay
            }
        } catch {
            Write-Host "Could not read error response" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "- If 'User already exists': Delete the user from database or wait a moment" -ForegroundColor Gray
    Write-Host "- Check server logs for more details" -ForegroundColor Gray
    Write-Host "- Verify server is running on port 3001" -ForegroundColor Gray
}


