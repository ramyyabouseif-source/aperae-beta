# PowerShell curl.exe Fix

## The Problem
PowerShell is parsing the JSON string incorrectly because of quote escaping.

## Solution: Use Single Quotes for the Outer String

### Correct Syntax:
```powershell
curl.exe --compressed -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d '{"dish": "Carbonara Spaghetti with smoked bacon"}' -o response.json
```

**Key:** Use **single quotes** `'...'` around the JSON, so PowerShell doesn't try to parse the double quotes inside.

## Alternative: Escape the Quotes

```powershell
curl.exe --compressed -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}" -o response.json
```

But this is more error-prone. Single quotes are easier.

## Even Better: Use PowerShell Native

```powershell
$body = @{
    dish = "Carbonara Spaghetti with smoked bacon"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/recommendations" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

This automatically handles JSON encoding correctly.









