# PowerShell API Testing Guide

## The Problem
PowerShell has an alias `curl` that maps to `Invoke-WebRequest`, which has different syntax than the real curl.exe. This causes errors when trying to use curl commands.

## Solutions

### Option 1: Use curl.exe (Real curl)
```powershell
curl.exe --compressed -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}"
```

### Option 2: Use Invoke-RestMethod (Best for JSON APIs)
```powershell
$body = @{
    dish = "Carbonara Spaghetti with smoked bacon"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/recommendations" -Method Post -Body $body -ContentType "application/json"

# Display response
$response | ConvertTo-Json -Depth 10
```

### Option 3: Use Invoke-WebRequest (For raw HTTP)
```powershell
$body = @{
    dish = "Carbonara Spaghetti with smoked bacon"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/recommendations" -Method Post -Body $body -ContentType "application/json"

# Get response content
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Option 4: Save to File
```powershell
# Using curl.exe
curl.exe --compressed -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}" -o response.json

# Using Invoke-RestMethod
$body = @{ dish = "Carbonara Spaghetti with smoked bacon" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/recommendations" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10 | Out-File response.json
```

## Quick Test Commands

### Test 1: Simple request
```powershell
curl.exe -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Grilled ribeye steak\"}"
```

### Test 2: With compression
```powershell
curl.exe --compressed -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}"
```

### Test 3: Save to file
```powershell
curl.exe --compressed -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}" -o response.json
```

### Test 4: PowerShell native (Invoke-RestMethod)
```powershell
$body = @{ dish = "Carbonara Spaghetti with smoked bacon" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/recommendations" -Method Post -Body $body -ContentType "application/json"
```

## Why This Happens
- PowerShell aliases `curl` to `Invoke-WebRequest`
- `Invoke-WebRequest` has different parameter syntax
- Use `curl.exe` to call the real curl program
- Or use PowerShell's native cmdlets (`Invoke-RestMethod` or `Invoke-WebRequest`)

## Recommendation
**Use `Invoke-RestMethod`** - it's designed for REST APIs and automatically parses JSON responses.










