# API Testing Guide for Beginners

## What is an API Test?

Think of an API (Application Programming Interface) like a waiter at a restaurant:
- You (the client) give the waiter (API) your order (request)
- The waiter takes it to the kitchen (backend server)
- The kitchen prepares your food (processes the request)
- The waiter brings back your food (response)

When we test the API, we're checking if the "waiter" can correctly take orders and bring back the right food.

---

## Where to Run the Test

**Important:** The `curl` command is a **backend test** - it tests the server directly, not the app interface.

You can run it from:
- **Terminal/Command Prompt** on your computer (Windows, Mac, or Linux)
- **NOT from the frontend app** (the mobile app or web interface)
- **NOT from the backend code** (it's a command you type, not code)

---

## Step-by-Step: Testing with curl (Command Line)

### Step 1: Open Terminal/Command Prompt

**On Windows:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. A black window (Command Prompt) will open

**On Mac:**
1. Press `Command + Space`
2. Type `Terminal` and press Enter
3. A window will open

**On Linux:**
1. Press `Ctrl + Alt + T`
2. Terminal will open

### Step 2: Navigate to Your Project (Optional)

You don't need to be in any specific folder for this test, but if you want:
```bash
# Windows
cd C:\Users\ramyy\Production\Aperae

# Mac/Linux
cd ~/Production/Aperae
```

### Step 3: Make Sure Your Backend Server is Running

**Before testing, you MUST have the backend server running!**

1. Open a **separate** terminal/command prompt window
2. Navigate to the backend folder:
   ```bash
   # Windows
   cd C:\Users\ramyy\Production\Aperae\backend
   
   # Mac/Linux
   cd ~/Production/Aperae/backend
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Wait until you see a message like:
   ```
   PocketSomm Backend started
   Health check: http://localhost:3001/api/health
   ```
5. **Keep this window open** - the server must keep running!

### Step 4: Run the curl Command

In your **first terminal window** (not the one running the server), type this command:

**On Windows (Command Prompt):**
```cmd
curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Grilled ribeye steak\"}"
```

**On Windows (PowerShell):**
```powershell
curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d '{\"dish\": \"Grilled ribeye steak\"}'
```

**On Mac/Linux:**
```bash
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Grilled ribeye steak"}'
```

### Step 5: What You Should See

If everything works, you'll see a **long JSON response** that looks like this:

```json
{
  "dish": "Grilled ribeye steak",
  "recommendations": [
    {
      "wineName": "...",
      "producer": "...",
      "vintage": "...",
      ...
    }
  ],
  ...
}
```

This is the server's response - it's the "food" the waiter brought back!

---

## Alternative: Testing with Postman (Easier for Beginners)

If typing commands is confusing, you can use **Postman** - a visual tool for testing APIs.

### Step 1: Download Postman

1. Go to: https://www.postman.com/downloads/
2. Download and install Postman
3. Open Postman

### Step 2: Create a New Request

1. Click **"New"** button (top left)
2. Select **"HTTP Request"**
3. You'll see a new request window

### Step 3: Set Up the Request

1. **Method:** Select **POST** from the dropdown (it might say "GET" by default)
2. **URL:** Type: `http://localhost:3001/api/recommendations`
3. **Headers Tab:**
   - Click the **"Headers"** tab
   - Click **"Add Header"**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body Tab:**
   - Click the **"Body"** tab
   - Select **"raw"** radio button
   - Select **"JSON"** from the dropdown (on the right)
   - In the text box, type:
     ```json
     {
       "dish": "Grilled ribeye steak"
     }
     ```

### Step 4: Send the Request

1. Click the big blue **"Send"** button
2. You'll see the response appear in the bottom panel
3. The response will show the wine recommendations in JSON format

---

## Alternative: Testing with Browser Extension (Simplest)

### Using REST Client Extension (Chrome/Edge)

1. **Install Extension:**
   - Open Chrome or Edge browser
   - Go to: https://chrome.google.com/webstore
   - Search for "REST Client" or "Talend API Tester"
   - Install the extension

2. **Open the Extension:**
   - Click the extension icon in your browser toolbar
   - Or go to the extension's page

3. **Create Request:**
   - Method: Select **POST**
   - URL: `http://localhost:3001/api/recommendations`
   - Headers: Add `Content-Type: application/json`
   - Body: Paste this:
     ```json
     {
       "dish": "Grilled ribeye steak"
     }
     ```

4. **Send:**
   - Click **Send** or **Execute**
   - See the response below

---

## Understanding the Response

When you get a response, you'll see JSON data. Here's what to look for:

### Legacy Format (Feature Flag OFF):
```json
{
  "recommendations": [
    {
      "tastingNotes": "Aromas of blackcurrant...",  // ← String
      "servingGuidance": "60-65°F, serve in...",     // ← String
      "confidenceScore": 93                          // ← Number
    }
  ]
}
```

### Enhanced Format (Feature Flag ON):
```json
{
  "recommendations": [
    {
      "tastingNotes": {                              // ← Object
        "aromas": ["green apple", "lemon"],
        "palate": "piercing acidity...",
        "finish": "long, clean..."
      },
      "servingGuidance": {                           // ← Object
        "temperature": "50-54°F (10-12°C)",
        "glassware": "Burgundy white wine glass",
        "decanting": "No decant needed"
      },
      "confidence": {                                // ← Object
        "score": 88,
        "breakdown": {
          "pairingScience": 45,
          "wineKnowledge": 28,
          "complexityHandling": 15
        }
      },
      "alternatives": [...]                          // ← Array exists
    }
  ],
  "avoid": {                                         // ← Object exists
    "types": [...],
    "reason": "..."
  }
}
```

---

## Testing Both Formats

### Test 1: Legacy Format (Feature Flag OFF)

1. **Set Environment Variable:**
   ```bash
   # Windows Command Prompt
   set ENABLE_ENHANCED_PROMPT=false
   
   # Windows PowerShell
   $env:ENABLE_ENHANCED_PROMPT="false"
   
   # Mac/Linux
   export ENABLE_ENHANCED_PROMPT=false
   ```

2. **Restart Backend Server:**
   - Stop the server (Ctrl+C)
   - Start it again: `npm start`

3. **Run the curl command** (or use Postman)
4. **Check the response** - should have `tastingNotes` as string

### Test 2: Enhanced Format (Feature Flag ON)

1. **Set Environment Variable:**
   ```bash
   # Windows Command Prompt
   set ENABLE_ENHANCED_PROMPT=true
   
   # Windows PowerShell
   $env:ENABLE_ENHANCED_PROMPT="true"
   
   # Mac/Linux
   export ENABLE_ENHANCED_PROMPT=true
   ```

2. **Restart Backend Server:**
   - Stop the server (Ctrl+C)
   - Start it again: `npm start`

3. **Run the curl command** (or use Postman)
4. **Check the response** - should have `tastingNotes` as object with `aromas`, `palate`, `finish`

---

## Common Issues and Solutions

### Issue: "Connection refused" or "Could not connect"

**Problem:** Backend server is not running

**Solution:**
1. Make sure you started the backend server in a separate terminal
2. Check that it's running on port 3001
3. Look for any error messages in the server terminal

### Issue: "404 Not Found"

**Problem:** Wrong URL

**Solution:**
- Make sure the URL is exactly: `http://localhost:3001/api/recommendations`
- Check that the server is running
- Verify the endpoint exists in your backend code

### Issue: "400 Bad Request"

**Problem:** Invalid request format

**Solution:**
- Make sure you're sending JSON format
- Check that `Content-Type: application/json` header is set
- Verify the JSON body is valid (no syntax errors)

### Issue: No Response or Empty Response

**Problem:** Server might be processing or there's an error

**Solution:**
1. Check the backend server terminal for error messages
2. Wait a few seconds (API calls can take time)
3. Try a simpler dish name like "steak"

---

## Quick Reference: curl Commands

### Basic Test (Legacy Format):
```bash
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Grilled ribeye steak"}'
```

### Test with Preferences:
```bash
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Grilled ribeye steak", "preferences": {"budget": "premium"}}'
```

### Test Different Dishes:
```bash
# Simple dish
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Chicken"}'

# Complex dish
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Spicy Thai curry with coconut milk"}'

# Sweet dish
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"dish": "Chocolate lava cake"}'
```

---

## What's the Difference: Frontend vs Backend Testing?

### Backend Testing (What we're doing):
- Tests the **server directly**
- Uses tools like curl, Postman, or browser extensions
- You send requests and see raw JSON responses
- **This is what the curl command does**

### Frontend Testing:
- Tests the **app interface** (what users see)
- You use the actual app (mobile app or website)
- You type in a dish name and see the formatted results
- This is what you do when you use the app normally

**For this API test, we're doing BACKEND testing** - we're checking if the server responds correctly before the app even displays it.

---

## Visual Guide: Testing Flow

```
┌─────────────────┐
│  Your Computer  │
│                 │
│  ┌───────────┐  │
│  │ Terminal  │  │  ← You type curl command here
│  │ (or       │  │
│  │ Postman)  │  │
│  └─────┬─────┘  │
│        │        │
│        │ HTTP   │
│        │ Request│
│        ▼        │
│  ┌───────────┐  │
│  │ Backend   │  │  ← Server processes request
│  │ Server    │  │
│  │ (Port     │  │
│  │  3001)    │  │
│  └─────┬─────┘  │
│        │        │
│        │ JSON   │
│        │ Response│
│        ▼        │
│  ┌───────────┐  │
│  │ You see   │  │  ← Response appears in terminal/Postman
│  │ the JSON  │  │
│  │ response  │  │
│  └───────────┘  │
└─────────────────┘
```

---

## Summary

1. **What:** Testing the API endpoint directly
2. **Where:** Terminal/Command Prompt, Postman, or browser extension
3. **When:** After backend server is running
4. **Why:** To verify the server responds correctly
5. **How:** Send a POST request with a dish name, get wine recommendations back

The easiest way for beginners is **Postman** - it's visual and doesn't require typing commands!













