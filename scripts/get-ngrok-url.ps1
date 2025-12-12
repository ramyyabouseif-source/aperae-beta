# Get the current ngrok URL from ngrok web interface
# This script parses the ngrok web interface to get the current URL

Write-Host "`nGetting ngrok URL..." -ForegroundColor Cyan

try {
    # Try to get URL from ngrok web interface
    $ngrokApiResponse = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -Method GET -ErrorAction Stop
    
    if ($ngrokApiResponse.tunnels -and $ngrokApiResponse.tunnels.Length -gt 0) {
        # Find HTTPS tunnel (preferred)
        $httpsTunnel = $ngrokApiResponse.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
        
        if ($httpsTunnel) {
            $ngrokUrl = $httpsTunnel.public_url
            Write-Host "Found ngrok URL: $ngrokUrl" -ForegroundColor Green
            return $ngrokUrl
        }
        
        # Fall back to HTTP tunnel if no HTTPS
        $httpTunnel = $ngrokApiResponse.tunnels | Where-Object { $_.proto -eq "http" } | Select-Object -First 1
        if ($httpTunnel) {
            $ngrokUrl = $httpTunnel.public_url
            Write-Host "Found ngrok URL: $ngrokUrl" -ForegroundColor Green
            return $ngrokUrl
        }
    }
    
    Write-Host "No ngrok tunnels found" -ForegroundColor Yellow
    return $null
} catch {
    Write-Host "Could not connect to ngrok API (http://127.0.0.1:4040)" -ForegroundColor Red
    Write-Host "Make sure ngrok is running: ngrok http 3001" -ForegroundColor Yellow
    return $null
}


