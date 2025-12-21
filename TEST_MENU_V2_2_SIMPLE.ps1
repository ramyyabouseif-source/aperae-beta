# Simple Menu V2.2 Test Script
# Tests Menu Sommelier Prompt V2.2 with production backend

$baseUrl = "https://api.aperae.com"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Menu V2.2 Prompt Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Menu Context Request
Write-Host "[TEST] Testing menu context request with availableWines..." -ForegroundColor Yellow

$testDish = "Grilled Ribeye Steak with Herb Butter"
$testWines = @(
    @{
        wineName = "2018 Domaine de la Romanee-Conti La Tache"
        producer = "Domaine de la Romanee-Conti"
        vintage = "2018"
        pricePoint = "$4,500"
        category = "Red Wine"
        description = "Grand Cru Burgundy"
    },
    @{
        wineName = "2019 Chateau Mouton Rothschild"
        producer = "Chateau Mouton Rothschild"
        vintage = "2019"
        pricePoint = "$850"
        category = "Red Wine"
        description = "Premier Cru Classe"
    },
    @{
        wineName = "2020 Opus One"
        producer = "Opus One"
        vintage = "2020"
        pricePoint = "$350"
        category = "Red Wine"
        description = "Napa Valley"
    }
)

$requestBody = @{
    dish = $testDish
    availableWines = $testWines
} | ConvertTo-Json -Depth 10

Write-Host "  Dish: $testDish" -ForegroundColor Cyan
Write-Host "  Menu wines: $($testWines.Count)" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "  Sending request..." -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri "$baseUrl/api/recommendations" -Method Post -Body $requestBody -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "  [SUCCESS] Request completed" -ForegroundColor Green
    Write-Host ""
    
    # Save response
    $response | ConvertTo-Json -Depth 20 | Out-File -FilePath "menu_v2.2_test_response.json" -Encoding utf8
    Write-Host "  Response saved to: menu_v2.2_test_response.json" -ForegroundColor Gray
    Write-Host ""
    
    # Validate V2.2 fields
    Write-Host "[VALIDATION] Checking V2.2 required fields..." -ForegroundColor Yellow
    Write-Host ""
    
    $issues = @()
    
    # Check top-level fields
    if (-not $response.dish) { $issues += "Missing: dish" }
    if (-not $response.dishAnalysis) { $issues += "Missing: dishAnalysis" }
    if (-not $response.recommendations) { $issues += "Missing: recommendations" }
    
    # Check dishAnalysis
    if ($response.dishAnalysis) {
        $requiredAnalysisFields = @("dominantWeight", "fatContent", "primaryProtein", "dominantFlavors", "spiceLevel", "acidityLevel", "applicablePrinciples", "keyChallenge", "idealProfile")
        foreach ($field in $requiredAnalysisFields) {
            if (-not $response.dishAnalysis.$field) {
                $issues += "Missing: dishAnalysis.$field"
            }
        }
        
        # Check excluded fields
        $excludedFields = @("cookingMethod", "cookingMethodImpact", "sauce", "sauceCharacteristic", "saucePriority")
        foreach ($field in $excludedFields) {
            if ($response.dishAnalysis.$field) {
                $issues += "ERROR: Excluded field present: dishAnalysis.$field"
            }
        }
    }
    
    # Check recommendations
    if ($response.recommendations -and $response.recommendations.Count -gt 0) {
        $firstRec = $response.recommendations[0]
        $requiredRecFields = @("tierLabel", "tierRationale", "wineName", "producer", "vintage", "grape", "region", "rationale", "pairingPrinciplesApplied", "tastingNotes", "servingGuidance", "confidence", "storytellingElements")
        
        foreach ($field in $requiredRecFields) {
            if (-not $firstRec.$field) {
                $issues += "Missing: recommendations[0].$field"
            }
        }
        
        # Validate tierLabel
        if ($firstRec.tierLabel) {
            $validTiers = @("Premium Selection", "Moderate Choice", "Budget-Friendly")
            if ($validTiers -notcontains $firstRec.tierLabel) {
                $issues += "Invalid tierLabel: $($firstRec.tierLabel)"
            }
        }
        
        Write-Host "  Recommendations: $($response.recommendations.Count)" -ForegroundColor Green
        Write-Host "  First wine: $($firstRec.wineName)" -ForegroundColor Gray
        Write-Host "  Tier: $($firstRec.tierLabel)" -ForegroundColor Gray
    } else {
        $issues += "No recommendations in response"
    }
    
    # Check menuLimitations
    if ($response.menuLimitations) {
        Write-Host "  menuLimitations: Present" -ForegroundColor Green
    } else {
        Write-Host "  menuLimitations: Not found (optional)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    if ($issues.Count -eq 0) {
        Write-Host "[RESULT] ALL CHECKS PASSED" -ForegroundColor Green
        Write-Host ""
        Write-Host "Menu V2.2 implementation appears correct!" -ForegroundColor Green
    } else {
        Write-Host "[RESULT] ISSUES FOUND:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "  [ERROR] Request failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

