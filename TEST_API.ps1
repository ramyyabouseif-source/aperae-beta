# PowerShell script to test the API
# Run this with: .\TEST_API.ps1

$body = @{
    dish = "Carbonara Spaghetti with smoked bacon"
} | ConvertTo-Json

Write-Host "Sending request to API..."
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/recommendations" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
    Write-Host "Response received!"
    Write-Host "`nDish: $($response.dish)"
    Write-Host "Recommendations: $($response.recommendations.Count)"
    
    # Display first recommendation
    if ($response.recommendations.Count -gt 0) {
        Write-Host "`nFirst Recommendation:" -ForegroundColor Yellow
        $first = $response.recommendations[0]
        Write-Host "  Wine: $($first.wineName)"
        Write-Host "  Producer: $($first.producer)"
        Write-Host "  Price: $($first.pricePoint)"
    }
    
    # Save to file
    $response | ConvertTo-Json -Depth 10 | Out-File -FilePath "response.json" -Encoding utf8
    Write-Host "`nResponse saved to response.json" -ForegroundColor Green
    
} catch {
    Write-Host "`n=== ERROR ===" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}










