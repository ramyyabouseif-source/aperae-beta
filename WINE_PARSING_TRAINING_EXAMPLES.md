# Wine Parsing Training Examples - Current Results

## Instructions
Below are test cases with the **current parsing results**. Please provide the **expected output** for each case so we can improve the parsing logic.

---

## Test Case 1
**Input:** `Ca Del Bosco, Cuvee' Prestige Ed 45 NV - Franciacorta DOCG`  
**Category:** Sparkling

**Current Parsing Result:**
```json
{
  "wineName": "Ca Del Bosco, Cuvee' Prestige Ed 45 NV - Franciacorta DOCG",
  "producer": "Ca' del Bosco",
  "vintage": "NV",
  "servingStyle": "both",
  "category": "Sparkling",
  "description": "Region: Franciacorta DOCG"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Test Case 2
**Input:** `G.D Vajra, Barolo 'Albe' 2019`  
**Category:** Red Wine

**Current Parsing Result:**
```json
{
  "wineName": "G.D Vajra, Barolo 'Albe' 2019",
  "producer": "G.D Vajra",
  "vintage": "2019",
  "servingStyle": "both",
  "category": "Red Wine"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Test Case 3
**Input:** `'Novecento' - Chianti Classico Riserva`  
**Category:** Red Wine

**Current Parsing Result:**
```json
{
  "wineName": "'Novecento' - Chianti Classico Riserva",
  "producer": "Unknown Producer",
  "vintage": "NV",
  "servingStyle": "both",
  "category": "Red Wine"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Test Case 4
**Input:** `Sangiovese 95%, Canaiolo 3%, Colorino 2% - Chianti Classico DOCG`  
**Category:** Red Wine

**Current Parsing Result:**
```json
{
  "wineName": "Sangiovese 95%, Canaiolo 3%, Colorino 2% - Chianti Classico DOCG",
  "producer": "Unknown Producer",
  "vintage": "NV",
  "servingStyle": "both",
  "category": "Red Wine",
  "description": "Region: Chianti Classico DOCG. Grape Blend: Sangiovese 95%, Canaiolo 3%, Colorino 2%"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Test Case 5
**Input:** `Barolo 'Albe' 2019 - C.D Vajra $85`  
**Category:** Red Wine

**Current Parsing Result:**
```json
{
  "wineName": "Barolo 'Albe' 2019 - C.D Vajra",
  "producer": "Unknown Producer",
  "vintage": "2019",
  "servingStyle": "both",
  "category": "Red Wine"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Test Case 6
**Input:** `Domaine Leflaive, Puligny-Montrachet Premier Cru 2020`  
**Category:** White Wine

**Current Parsing Result:**
```json
{
  "wineName": "Domaine Leflaive, Puligny-Montrachet Premier Cru 2020",
  "producer": "Domaine Leflaive",
  "vintage": "2020",
  "servingStyle": "both",
  "category": "White Wine"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Test Case 7
**Input:** `Chard 75%, P. Noir 15%, Bianco 10% - Franciacorta DOCG`  
**Category:** Sparkling

**Current Parsing Result:**
```json
{
  "wineName": "Chard 75%, P. Noir 15%, Bianco 10% - Franciacorta DOCG",
  "producer": "Unknown Producer",
  "vintage": "NV",
  "servingStyle": "both",
  "category": "Sparkling",
  "description": "Region: Franciacorta DOCG. Grape Blend: Chard 75%, Noir 15%, Bianco 10%"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Test Case 8
**Input:** `Pinot Noir 2021`  
**Category:** Red Wine

**Current Parsing Result:**
```json
{
  "wineName": "Pinot Noir 2021",
  "producer": "Unknown Producer",
  "vintage": "2021",
  "servingStyle": "both",
  "category": "Red Wine"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Test Case 9
**Input:** `Prosecco DOCG $12/glass`  
**Category:** Sparkling

**Current Parsing Result:**
```json
{
  "wineName": "Prosecco DOCG /",
  "producer": "Unknown Producer",
  "vintage": "NV",
  "servingStyle": "glass",
  "category": "Sparkling",
  "description": "Region: Prosecco DOCG"
}
```

**Expected Output (Please Fill):**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Additional Test Cases (Feel free to add more)

### Test Case 10
**Input:** `[Please provide additional examples if you have them]`  
**Category:** `[Category]`

**Current Parsing Result:**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": ""
}
```

**Expected Output:**
```json
{
  "wineName": "",
  "producer": "",
  "vintage": "",
  "servingStyle": "",
  "category": "",
  "description": "",
  "grape": "",
  "region": ""
}
```

---

## Notes on Fields

- **wineName**: The full wine name as it should appear
- **producer**: Producer/winery name (or "Unknown Producer" if not available)
- **vintage**: Year (4 digits) or "NV" for non-vintage
- **servingStyle**: "glass", "bottle", or "both"
- **category**: Wine category (e.g., "Red Wine", "White Wine", "Sparkling", "Pinot Noir", "Chardonnay")
- **description**: Technical details, region info, grape blend info (optional)
- **grape**: Grape variety/varieties with color and sweetness (optional, format: "Chardonnay (White, Dry), Pinot Noir (Red, Dry)")
- **region**: Specific region/appellation (optional, format: "Franciacorta DOCG, Lombardy, Italy")



