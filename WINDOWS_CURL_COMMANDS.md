# Windows curl Commands - Quick Reference

## Problem
Windows Command Prompt doesn't support backslash (`\`) for line continuation like Mac/Linux. You need to use different syntax.

---

## ✅ Solution 1: Single Line (Easiest)

**Windows Command Prompt:**
```cmd
curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}"
```

**Important:** Notice the double quotes around the JSON and escaped quotes inside: `\"`

---

## ✅ Solution 2: PowerShell (Better for Multi-line)

**PowerShell** (Windows PowerShell, not Command Prompt):
```powershell
curl -X POST http://localhost:3001/api/recommendations `
  -H "Content-Type: application/json" `
  -d '{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}'
```

**Note:** PowerShell uses backtick `` ` `` (not backslash) for line continuation.

---

## ✅ Solution 3: Command Prompt with Caret (^)

**Windows Command Prompt:**
```cmd
curl -X POST http://localhost:3001/api/recommendations ^
  -H "Content-Type: application/json" ^
  -d "{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}"
```

**Note:** Command Prompt uses `^` for line continuation, but it's finicky. Single line is easier.

---

## ✅ Solution 4: Use a File (For Complex Requests)

1. Create a file `request.json`:
```json
{
  "dish": "Carbonara Spaghetti with smoked bacon"
}
```

2. Run:
```cmd
curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d @request.json
```

---

## Quick Test Commands

### Test 1: Simple Dish
```cmd
curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Grilled ribeye steak\"}"
```

### Test 2: Carbonara
```cmd
curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Carbonara Spaghetti with smoked bacon\"}"
```

### Test 3: With Preferences
```cmd
curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Grilled ribeye steak\", \"preferences\": {\"budget\": \"premium\"}}"
```

---

## How to Tell Which Terminal You're Using

**Command Prompt:**
- Window title says "Command Prompt" or "cmd"
- Prompt looks like: `C:\Users\ramyy>`
- Uses `^` for line continuation (but single line is easier)

**PowerShell:**
- Window title says "PowerShell" or "Windows PowerShell"
- Prompt looks like: `PS C:\Users\ramyy>`
- Uses backtick `` ` `` for line continuation

---

## Common Mistakes

❌ **Wrong (Unix/Mac style):**
```bash
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Carbonara"}'
```
This doesn't work in Windows Command Prompt!

✅ **Correct (Windows Command Prompt):**
```cmd
curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Carbonara\"}"
```

---

## Pro Tip: Use Postman Instead

If curl is giving you trouble, **Postman is much easier** for Windows users:
1. Download Postman
2. Create POST request
3. Set URL: `http://localhost:3001/api/recommendations`
4. Add header: `Content-Type: application/json`
5. Add body: `{"dish": "Carbonara Spaghetti with smoked bacon"}`
6. Click Send

No escaping, no line continuation issues!












