# Quick Test Steps - API Testing

## The Simplest Way: Using Postman

### Step 1: Make Sure Backend is Running

1. Open a terminal/command prompt
2. Go to backend folder:
   ```
   cd backend
   ```
3. Start server:
   ```
   npm start
   ```
4. Wait for: "PocketSomm Backend started"
5. **Keep this window open!**

### Step 2: Download Postman (If You Don't Have It)

1. Go to: https://www.postman.com/downloads/
2. Download and install
3. Open Postman

### Step 3: Create the Test Request

1. Click **"New"** → **"HTTP Request"**

2. Set these values:
   - **Method:** Change to **POST** (dropdown at top)
   - **URL:** `http://localhost:3001/api/recommendations`

3. Click **"Headers"** tab:
   - Add header:
     - Key: `Content-Type`
     - Value: `application/json`

4. Click **"Body"** tab:
   - Select **"raw"** radio button
   - Select **"JSON"** from dropdown (on right)
   - Type this in the box:
     ```json
     {
       "dish": "Grilled ribeye steak"
     }
     ```

5. Click **"Send"** button (big blue button)

### Step 4: See the Results

- The response appears in the bottom panel
- You'll see JSON with wine recommendations
- Scroll down to see all the data

---

## Alternative: Using curl (Command Line)

### Windows (Command Prompt):

1. Open Command Prompt (Windows Key + R, type `cmd`)

2. Make sure backend server is running (see Step 1 above)

3. Type this command (all on one line):
   ```
   curl -X POST http://localhost:3001/api/recommendations -H "Content-Type: application/json" -d "{\"dish\": \"Grilled ribeye steak\"}"
   ```

4. Press Enter

5. You'll see the JSON response printed in the terminal

### Mac/Linux:

1. Open Terminal

2. Make sure backend server is running

3. Type this command:
   ```bash
   curl -X POST http://localhost:3001/api/recommendations \
     -H "Content-Type: application/json" \
     -d '{"dish": "Grilled ribeye steak"}'
   ```

4. Press Enter

5. You'll see the JSON response

---

## What to Look For in the Response

### If Feature Flag is OFF (Legacy Format):
- `"tastingNotes": "Aromas of..."` ← String (text)
- `"servingGuidance": "60-65°F..."` ← String (text)
- `"confidenceScore": 93` ← Number

### If Feature Flag is ON (Enhanced Format):
- `"tastingNotes": { "aromas": [...], "palate": "...", "finish": "..." }` ← Object
- `"servingGuidance": { "temperature": "...", "glassware": "...", "decanting": "..." }` ← Object
- `"confidence": { "score": 88, "breakdown": {...} }` ← Object
- `"alternatives": [...]` ← Array exists
- `"avoid": {...}` ← Object exists

---

## Troubleshooting

**"Connection refused"**
→ Backend server is not running. Start it first!

**"404 Not Found"**
→ Check the URL is exactly: `http://localhost:3001/api/recommendations`

**No response**
→ Check the backend terminal for error messages

**Response is empty or weird**
→ Check that you set `Content-Type: application/json` header

---

## Testing Different Scenarios

### Test Legacy Format:
1. Set: `ENABLE_ENHANCED_PROMPT=false` (or don't set it)
2. Restart backend server
3. Run the test
4. Check response format

### Test Enhanced Format:
1. Set: `ENABLE_ENHANCED_PROMPT=true`
2. Restart backend server
3. Run the test
4. Check response format

### Test Mock Mode:
1. Set: `MOCK_MODE=true`
2. Restart backend server
3. Run the test
4. Should get mock data (faster response)













