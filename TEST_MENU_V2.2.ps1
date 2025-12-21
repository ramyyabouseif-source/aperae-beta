# PowerShell Test Script for Menu Sommelier Prompt V2.2
# Tests: 1) Correct prompt usage, 2) Valid JSON response, 3) No old prompt references, 4) Proper schema

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Menu V2.2 Prompt Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001"
$testResults = @{
    PromptReferences = $false
    MenuContextRequest = $false
    ValidJSON = $false
    SchemaValidation = $false
    RequiredFields = $false
    ExcludedFields = $false
}

# ============================================================================
# TEST 1: Verify no old prompt references exist in codebase
# ============================================================================
Write-Host "[TEST 1] Checking for old MENU_SOMMELIER_PROMPT references..." -ForegroundColor Yellow

$oldPromptRefs = @()
$filesToCheck = @(
    "backend\server.js",
    "backend\prompts\*.js"
)

foreach ($filePattern in $filesToCheck) {
    $files = Get-ChildItem -Path $filePattern -Recurse -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            # Check for actual constant usage (not just comments)
            if ($content -match 'MENU_SOMMELIER_PROMPT') {
                # Check if it's in a comment (starts with //, /*, or *)
                $lines = Get-Content $file.FullName
                $lineNum = 0
                $inMultiLineComment = $false
                foreach ($line in $lines) {
                    $lineNum++
                    
                    # Track multi-line comments
                    if ($line -match '/\*') { $inMultiLineComment = $true }
                    if ($line -match '\*/') { $inMultiLineComment = $false }
                    
                    # Check if line contains MENU_SOMMELIER_PROMPT and is NOT in a comment
                    if ($line -match 'MENU_SOMMELIER_PROMPT' -and -not $inMultiLineComment) {
                        $trimmedLine = $line.Trim()
                        # Skip if it's a comment line
                        if ($trimmedLine -notmatch '^\s*//' -and $trimmedLine -notmatch '^\s*\*' -and $trimmedLine -notmatch '^\s*/\*') {
                            $oldPromptRefs += "$($file.Name):$lineNum - $($line.Trim())"
                        }
                    }
                }
            }
        }
    }
}

if ($oldPromptRefs.Count -eq 0) {
    Write-Host "  ✓ PASS: No old MENU_SOMMELIER_PROMPT constant references found" -ForegroundColor Green
    $testResults.PromptReferences = $true
} else {
    Write-Host "  ✗ FAIL: Found old prompt references:" -ForegroundColor Red
    foreach ($ref in $oldPromptRefs) {
        Write-Host "    - $ref" -ForegroundColor Red
    }
}

Write-Host ""

# ============================================================================
# TEST 2: Verify buildMenuV2Prompt function exists and is imported
# ============================================================================
Write-Host "[TEST 2] Verifying Menu V2.2 prompt builder is properly imported..." -ForegroundColor Yellow

$serverContent = Get-Content "backend\server.js" -Raw
if ($serverContent -match 'buildMenuV2Prompt') {
    Write-Host "  ✓ PASS: buildMenuV2Prompt function is referenced in server.js" -ForegroundColor Green
} else {
    Write-Host "  ✗ FAIL: buildMenuV2Prompt not found in server.js" -ForegroundColor Red
}

# Check if prompt files exist
$promptFiles = @(
    "backend\prompts\menu-v2.2-static-sections.js",
    "backend\prompts\menu-v2.2-dynamic-sections.js",
    "backend\prompts\menu-v2.2-master-prompt.js"
)

$allFilesExist = $true
foreach ($file in $promptFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

# ============================================================================
# TEST 3: Check if server is running
# ============================================================================
Write-Host "[TEST 3] Checking if backend server is running..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✓ PASS: Server is running" -ForegroundColor Green
    Write-Host "    Status: $($healthResponse.status)" -ForegroundColor Gray
    Write-Host "    Mock Mode: $($healthResponse.mockMode)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ FAIL: Cannot connect to server at $baseUrl" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Please start the backend server before running tests." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Test Aborted - Server Not Available" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# ============================================================================
# TEST 4: Test Menu Context Request with availableWines
# ============================================================================
Write-Host "[TEST 4] Testing menu context request with availableWines..." -ForegroundColor Yellow

# Sample menu wines (simulating Google OCR extracted data)
$testDish = "Grilled Ribeye Steak with Herb Butter"
$testWines = @(
    @{
        wineName = "2018 Domaine de la Romanée-Conti La Tâche"
        producer = "Domaine de la Romanée-Conti"
        vintage = "2018"
        pricePoint = "$4,500"
        category = "Red Wine"
        description = "Grand Cru Burgundy"
    },
    @{
        wineName = "2019 Château Mouton Rothschild"
        producer = "Château Mouton Rothschild"
        vintage = "2019"
        pricePoint = "$850"
        category = "Red Wine"
        description = "Premier Cru Classé"
    },
    @{
        wineName = "2020 Opus One"
        producer = "Opus One"
        vintage = "2020"
        pricePoint = "$350"
        category = "Red Wine"
        description = "Napa Valley"
    },
    @{
        wineName = "2021 Domaine Leflaive Puligny-Montrachet"
        producer = "Domaine Leflaive"
        vintage = "2021"
        pricePoint = "$280"
        category = "White Wine"
        description = "Premier Cru"
    },
    @{
        wineName = "NV Veuve Clicquot Yellow Label"
        producer = "Veuve Clicquot"
        vintage = "NV"
        pricePoint = "$85"
        category = "Champagne"
        description = "Brut"
    }
)

$requestBody = @{
    dish = $testDish
    availableWines = $testWines
} | ConvertTo-Json -Depth 10

Write-Host "  Sending request with dish: '$testDish'" -ForegroundColor Cyan
Write-Host "  Menu wines count: $($testWines.Count)" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/recommendations" -Method Post -Body $requestBody -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "  ✓ PASS: Request succeeded" -ForegroundColor Green
    $testResults.MenuContextRequest = $true
    
    # Save full response for inspection
    $response | ConvertTo-Json -Depth 20 | Out-File -FilePath "menu_v2.2_test_response.json" -Encoding utf8
    Write-Host "  Response saved to: menu_v2.2_test_response.json" -ForegroundColor Gray
    
    # ============================================================================
    # TEST 5: Validate JSON structure and required fields
    # ============================================================================
    Write-Host ""
    Write-Host "[TEST 5] Validating JSON response structure..." -ForegroundColor Yellow
    
    # Check if response is valid JSON (already parsed by Invoke-RestMethod)
    if ($response) {
        Write-Host "  ✓ PASS: Response is valid JSON" -ForegroundColor Green
        $testResults.ValidJSON = $true
    } else {
        Write-Host "  ✗ FAIL: Response is not valid JSON" -ForegroundColor Red
    }
    
    # ============================================================================
    # TEST 6: Validate V2.2 Required Fields
    # ============================================================================
    Write-Host ""
    Write-Host "[TEST 6] Validating V2.2 required fields..." -ForegroundColor Yellow
    
    $requiredFields = @{
        "dish" = "string"
        "dishAnalysis" = "object"
        "recommendations" = "array"
    }
    
    $requiredDishAnalysisFields = @(
        "dominantWeight",
        "fatContent",
        "primaryProtein",
        "dominantFlavors",
        "spiceLevel",
        "acidityLevel",
        "applicablePrinciples",
        "keyChallenge",
        "idealProfile"
    )
    
    $requiredRecommendationFields = @(
        "tierLabel",
        "tierRationale",
        "wineName",
        "producer",
        "vintage",
        "grape",
        "region",
        "rationale",
        "pairingPrinciplesApplied",
        "tastingNotes",
        "servingGuidance",
        "confidence",
        "storytellingElements"
    )
    
    $allFieldsPresent = $true
    
    # Check top-level fields
    foreach ($field in $requiredFields.Keys) {
        if ($response.PSObject.Properties.Name -contains $field) {
            $fieldType = $response.$field.GetType().Name
            Write-Host "  ✓ Found: $field ($fieldType)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Missing: $field" -ForegroundColor Red
            $allFieldsPresent = $false
        }
    }
    
    # Check dishAnalysis fields
    if ($response.dishAnalysis) {
        Write-Host "  Validating dishAnalysis fields..." -ForegroundColor Cyan
        foreach ($field in $requiredDishAnalysisFields) {
            if ($response.dishAnalysis.PSObject.Properties.Name -contains $field) {
                Write-Host "    ✓ Found: dishAnalysis.$field" -ForegroundColor Green
            } else {
                Write-Host "    ✗ Missing: dishAnalysis.$field" -ForegroundColor Red
                $allFieldsPresent = $false
            }
        }
        
        # Check that excluded fields are NOT present
        $excludedFields = @(
            "cookingMethod",
            "cookingMethodImpact",
            "sauce",
            "sauceCharacteristic",
            "saucePriority"
        )
        
        $excludedFieldsPresent = $false
        foreach ($field in $excludedFields) {
            if ($response.dishAnalysis.PSObject.Properties.Name -contains $field) {
                Write-Host "    ✗ ERROR: Excluded field found: dishAnalysis.$field" -ForegroundColor Red
                $excludedFieldsPresent = $true
            }
        }
        
        if (-not $excludedFieldsPresent) {
            Write-Host "    ✓ PASS: All excluded fields are absent" -ForegroundColor Green
            $testResults.ExcludedFields = $true
        } else {
            $testResults.ExcludedFields = $false
        }
    }
    
    # Check recommendation fields (check first recommendation)
    if ($response.recommendations -and $response.recommendations.Count -gt 0) {
        Write-Host "  Validating recommendation fields (first recommendation)..." -ForegroundColor Cyan
        $firstRec = $response.recommendations[0]
        
        foreach ($field in $requiredRecommendationFields) {
            if ($firstRec.PSObject.Properties.Name -contains $field) {
                $value = $firstRec.$field
                if ($null -eq $value -or ($value -is [string] -and $value -eq "")) {
                    Write-Host "    ⚠ Warning: $field is null or empty" -ForegroundColor Yellow
                } else {
                    Write-Host "    ✓ Found: $field = $($value -replace '(.{50}).*', '$1...')" -ForegroundColor Green
                }
            } else {
                Write-Host "    ✗ Missing: $field" -ForegroundColor Red
                $allFieldsPresent = $false
            }
        }
        
        # Validate tierLabel values
        if ($firstRec.tierLabel) {
            $validTiers = @("Premium Selection", "Moderate Choice", "Budget-Friendly")
            if ($validTiers -contains $firstRec.tierLabel) {
                Write-Host "    ✓ tierLabel is valid: $($firstRec.tierLabel)" -ForegroundColor Green
            } else {
                Write-Host "    ⚠ Warning: tierLabel has unexpected value: $($firstRec.tierLabel)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  ✗ FAIL: No recommendations in response" -ForegroundColor Red
        $allFieldsPresent = $false
    }
    
    # Check menuLimitations field (optional but should be present in V2.2)
    if ($response.PSObject.Properties.Name -contains "menuLimitations") {
        Write-Host "  ✓ Found: menuLimitations (V2.2 field)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Warning: menuLimitations not found (may be optional)" -ForegroundColor Yellow
    }
    
    if ($allFieldsPresent) {
        Write-Host "  ✓ PASS: All required V2.2 fields are present" -ForegroundColor Green
        $testResults.RequiredFields = $true
    } else {
        Write-Host "  ✗ FAIL: Some required fields are missing" -ForegroundColor Red
    }
    
    # ============================================================================
    # TEST 7: Validate schema structure
    # ============================================================================
    Write-Host ""
    Write-Host "[TEST 7] Validating schema structure..." -ForegroundColor Yellow
    
    $schemaValid = $true
    
    # Validate recommendations array structure
    if ($response.recommendations -is [array] -and $response.recommendations.Count -gt 0) {
        Write-Host "  ✓ Recommendations is an array with $($response.recommendations.Count) items" -ForegroundColor Green
        
        # Validate each recommendation has required nested structures
        $recIndex = 0
        foreach ($rec in $response.recommendations) {
            $recIndex++
            
            # Check tastingNotes structure
            if ($rec.tastingNotes) {
                if ($rec.tastingNotes.aromas -is [array]) {
                    Write-Host "    ✓ Rec $recIndex: tastingNotes.aromas is array" -ForegroundColor Green
                } else {
                    Write-Host "    ✗ Rec $recIndex: tastingNotes.aromas is not an array" -ForegroundColor Red
                    $schemaValid = $false
                }
            }
            
            # Check confidence structure
            if ($rec.confidence) {
                if ($rec.confidence.score -is [int] -and $rec.confidence.score -ge 0 -and $rec.confidence.score -le 100) {
                    Write-Host "    ✓ Rec $recIndex: confidence.score is valid (0-100)" -ForegroundColor Green
                } else {
                    Write-Host "    ✗ Rec $recIndex: confidence.score is invalid" -ForegroundColor Red
                    $schemaValid = $false
                }
                
                if ($rec.confidence.breakdown) {
                    Write-Host "    ✓ Rec $recIndex: confidence.breakdown exists" -ForegroundColor Green
                    
                    # Check for tierAdjustments in breakdown (V2.2 feature)
                    if ($rec.confidence.breakdown.tierAdjustments) {
                        Write-Host "      ✓ Found: tierAdjustments in confidence breakdown (V2.2)" -ForegroundColor Green
                    } else {
                        Write-Host "      ⚠ Warning: tierAdjustments not found in breakdown" -ForegroundColor Yellow
                    }
                }
            }
            
            # Check servingGuidance structure
            if ($rec.servingGuidance) {
                $guidanceFields = @("temperature", "glassware", "decanting")
                foreach ($field in $guidanceFields) {
                    if ($rec.servingGuidance.PSObject.Properties.Name -contains $field) {
                        Write-Host "      ✓ Found: servingGuidance.$field" -ForegroundColor Green
                    }
                }
            }
        }
    } else {
        Write-Host "  ✗ FAIL: Recommendations is not a valid array" -ForegroundColor Red
        $schemaValid = $false
    }
    
    if ($schemaValid) {
        Write-Host "  ✓ PASS: Schema structure is valid" -ForegroundColor Green
        $testResults.SchemaValidation = $true
    } else {
        Write-Host "  ✗ FAIL: Schema structure has issues" -ForegroundColor Red
    }
    
} catch {
    Write-Host "  ✗ FAIL: Request failed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "    Response: $responseBody" -ForegroundColor Red
    }
}

# ============================================================================
# FINAL SUMMARY
# ============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passedTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
$totalTests = $testResults.Values.Count

Write-Host ""
Write-Host "Test Results:" -ForegroundColor White
Write-Host "  1. No Old Prompt References: $(if ($testResults.PromptReferences) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($testResults.PromptReferences) { 'Green' } else { 'Red' })
Write-Host "  2. Prompt Builder Files: $(if ($allFilesExist) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($allFilesExist) { 'Green' } else { 'Red' })
Write-Host "  3. Server Running: ✓ PASS (checked)" -ForegroundColor Green
Write-Host "  4. Menu Context Request: $(if ($testResults.MenuContextRequest) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($testResults.MenuContextRequest) { 'Green' } else { 'Red' })
Write-Host "  5. Valid JSON Response: $(if ($testResults.ValidJSON) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($testResults.ValidJSON) { 'Green' } else { 'Red' })
Write-Host "  6. Schema Validation: $(if ($testResults.SchemaValidation) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($testResults.SchemaValidation) { 'Green' } else { 'Red' })
Write-Host "  7. Required Fields Present: $(if ($testResults.RequiredFields) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($testResults.RequiredFields) { 'Green' } else { 'Red' })
Write-Host "  8. Excluded Fields Absent: $(if ($testResults.ExcludedFields) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($testResults.ExcludedFields) { 'Green' } else { 'Red' })

Write-Host ""
Write-Host "Overall: $passedTests/$totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { 'Green' } else { 'Yellow' })

if ($passedTests -eq $totalTests) {
    Write-Host ""
    Write-Host "✓ ALL TESTS PASSED - Menu V2.2 is properly implemented!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "✗ SOME TESTS FAILED - Please review the issues above" -ForegroundColor Red
    exit 1
}

