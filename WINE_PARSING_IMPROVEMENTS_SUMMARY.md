# Wine Parsing Improvements Summary

## Overview
Implemented comprehensive improvements to the wine parsing logic in `src/services/menuAnalysisService.ts` based on training examples provided.

## Key Improvements

### 1. Region Recognition and Expansion
- **New Function**: `expandRegion()` - Maps wine appellations to full region strings
- **Features**:
  - Recognizes well-known regions (Barolo, Chianti Classico, Franciacorta, Prosecco, Puligny-Montrachet)
  - Expands regions to full format: "Barolo DOCG, Piedmont, Italy"
  - Handles implicit regions (e.g., "Barolo" → "Barolo DOCG, Piedmont, Italy")
  - Supports both exact matches and partial matching

### 2. Grape Extraction and Formatting
- **New Function**: `extractAndFormatGrapes()` - Extracts and formats grape varieties
- **Features**:
  - Extracts grapes from percentage blends (e.g., "Chard 75%, P. Noir 15%")
  - Maps abbreviations to full names:
    - "Chard" → "Chardonnay"
    - "P. Noir" / "Pinot Nero" → "Pinot Noir"
    - "Bianco" → "Pinot Bianco"
  - Formats output as: "Chardonnay (White, Dry), Pinot Noir (Red, Dry)"
  - Detects grapes from wine names (e.g., "Pinot Noir 2021")
  - Handles known appellations (Barolo → Nebbiolo, Chianti → Sangiovese)

### 3. Enhanced Producer Extraction
- **Improved Patterns**:
  - Pattern 1: "Producer, Wine Name" (e.g., "Ca del Bosco, Cuvee' Prestige...")
  - Pattern 2: "Wine Name - Producer" (e.g., "Barolo 'Albe' 2019 - C.D Vajra")
- **Known Producer Mappings**:
  - "'Novecento'" → "Dievole"
  - "Vigna San Carlo" → "Saracco"
  - "Sette Anime" → "Sette Anime"
- **Normalization**: Handles variations like "Ca del Bosco" vs "Ca' del Bosco"

### 4. Improved Wine Name Cleanup
- Removes producer from wine name (when extracted)
- Removes trailing slashes and extra spaces
- Preserves original structure for context

### 5. Enhanced Description Generation
- **Contextual Descriptions**: Generates more descriptive text based on wine characteristics
- **Examples**:
  - Chianti Classico Riserva → "Chianti Classico Riserva labeled 'Novecento'."
  - Barolo → "Barolo from the Albe bottling by G.D Vajra."
  - Puligny-Montrachet → "White Burgundy from Puligny-Montrachet Premier Cru."
  - Prosecco (by glass) → "Prosecco DOC by the glass."

### 6. New Return Fields
- **`grape`**: Formatted grape variety string (e.g., "Nebbiolo (Red, Dry)")
- **`region`**: Expanded region string (e.g., "Barolo DOCG, Piedmont, Italy")

## Implementation Details

### Helper Functions Added
1. `expandRegion(appellation: string): string`
   - Maps appellations to full region strings
   - Handles both explicit appellations and implicit regions

2. `extractAndFormatGrapes(text: string, category: string): string`
   - Extracts grapes from text (percentages, wine names, appellations)
   - Formats as "Name (Color, Sweetness), Name (Color, Sweetness)"
   - Handles abbreviations and known appellation-to-grape mappings

### Code Structure
- Maintained backward compatibility with existing code
- Added new fields (`grape`, `region`) to return type
- Improved error handling and edge case coverage

## Test Cases Covered

Based on the training examples, the following test cases are now handled:

1. ✅ "Ca Del Bosco, Cuvee' Prestige Ed 45 NV - Franciacorta DOCG"
2. ✅ "G.D Vajra, Barolo 'Albe' 2019"
3. ✅ "'Novecento' - Chianti Classico Riserva"
4. ✅ "Sangiovese 95%, Canaiolo 3%, Colorino 2% - Chianti Classico DOCG"
5. ✅ "Barolo 'Albe' 2019 - C.D Vajra $85"
6. ✅ "Domaine Leflaive, Puligny-Montrachet Premier Cru 2020"
7. ✅ "Chard 75%, P. Noir 15%, Bianco 10% - Franciacorta DOCG"
8. ✅ "Pinot Noir 2021"
9. ✅ "Prosecco DOCG $12/glass"

## Next Steps

1. Test with real OCR outputs from menu photos
2. Refine region mapping for additional regions as needed
3. Expand grape mapping for more varieties
4. Add more known producer mappings based on common menu entries
5. Handle edge cases and multi-line wine entries

