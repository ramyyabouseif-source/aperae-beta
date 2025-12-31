/**
 * Menu Analysis Service
 * Combines OCR processing with wine recommendation engine
 */

import * as Crypto from 'expo-crypto';
import { OCRService, OCRResult, MenuItem } from './ocrService';
import { CameraService, PhotoResult } from './cameraService';
import { WineService } from './wineService';

import { DishAnalysis } from '../types/wine';

export interface WineListAnalysisResult {
  availableWines: Array<{
    wineName: string;
    producer: string;
    vintage: string;
    servingStyle: 'glass' | 'bottle' | 'both';
    category: string;
    description?: string;
    grape?: string;
    region?: string;
    price?: string; // Price as extracted from OCR
    rawOcrLine?: string; // Original OCR line for debugging
  }>;
  wineRecommendations: Array<{
    wine: {
      wineName: string;
      producer: string;
      vintage: string;
      servingStyle: 'glass' | 'bottle' | 'both';
      category: string;
      description?: string;
      grape?: string;
      region?: string;
    };
    pairingRationale: string;
    confidenceScore: number;
    confidence?: {
      score: number;
      breakdown: {
        pairingScience: number;
        wineKnowledge: number;
        complexityHandling: number;
        tierAdjustments?: number;
      };
      rationale: string;
    };
    servingGuidance: string;
    tastingNotes?: string;
    storytellingElements?: string;
    tierLabel?: string;
    tierRationale?: string;
    pairingPrinciplesApplied?: string[];
  }>;
  processingTime: number;
  ocrConfidence: number;
  dishAnalyzed: string;
  servingStylePreference: 'glass' | 'bottle' | 'both';
  dishAnalysis?: DishAnalysis;
  closingNarrative?: string;
  menuLimitations?: string;
}

export interface MenuAnalysisOptions {
  includeWineRecommendations?: boolean;
  maxRecommendationsPerItem?: number;
  preferredPriceRange?: 'budget' | 'moderate' | 'premium' | 'luxury';
}

export interface MenuAnalysisResult {
  menuItems: MenuItem[];
  wineRecommendations: Array<{
    menuItem: MenuItem;
    wines: any[];
  }>;
  processingTime: number;
  ocrConfidence: number;
  // Additional fields for compatibility with MenuResults component
  dishAnalyzed?: string;
  availableWines?: WineListAnalysisResult['availableWines'];
}

export class MenuAnalysisService {
  private static readonly DEFAULT_OPTIONS: MenuAnalysisOptions = {
    includeWineRecommendations: true,
    maxRecommendationsPerItem: 2,
    preferredPriceRange: 'moderate',
  };

  /**
   * Generate a unique request ID for tracking
   */
  private static async generateRequestId(): Promise<string> {
    // Generate a base64url-encoded random ID (similar to backend)
    // Use expo-crypto for React Native compatibility
    const randomBytes = new Uint8Array(12);
    const randomValues = await Crypto.getRandomBytesAsync(12);
    randomBytes.set(randomValues);
    return btoa(String.fromCharCode(...randomBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Store parsed menu wines to database via API
   */
  private static async storeParsedMenuWines(
    parsedWines: WineListAnalysisResult['availableWines'],
    requestId: string,
    dish: string,
    ocrConfidence: number
  ): Promise<void> {
    try {
      const { getApiBaseUrl } = require('../utils/api');
      const apiBaseUrl = getApiBaseUrl();
      const url = `${apiBaseUrl}/menu-wines`;

      // Prepare wines for API (include all fields)
      const winesForApi = parsedWines.map(wine => ({
        wineName: wine.wineName,
        producer: wine.producer,
        vintage: wine.vintage,
        grape: wine.grape,
        region: wine.region,
        price: wine.price,
        category: wine.category,
        servingStyle: wine.servingStyle,
        description: wine.description,
        rawOcrLine: wine.rawOcrLine
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection header
        },
        body: JSON.stringify({
          parsedWines: winesForApi,
          requestId,
          dish,
          ocrConfidence
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Parsed menu wines stored successfully:', result);
    } catch (error: any) {
      const errorMessage = error?.message || (typeof error === 'string' ? error : error?.toString() || 'Unknown error');
      console.error('Error storing parsed menu wines:', errorMessage);
      // Don't throw - this is non-blocking
      throw error;
    }
  }

  /**
   * Analyze wine list from photo with dish context
   */
  static async analyzeWineListFromPhoto(
    photo: PhotoResult | null,
    dish: string,
    servingStylePreference: 'glass' | 'bottle' | 'both' = 'both',
    winePreferences?: any
  ): Promise<WineListAnalysisResult> {
    const startTime = Date.now();

    try {
      console.log('Starting wine list analysis from photo...');
      console.log('Dish:', dish);
      console.log('Serving style preference:', servingStylePreference);
      console.log('Wine preferences:', winePreferences);

      // Check if mock mode is enabled
      const isMockMode = WineService.isMockModeEnabled();
      console.log('Mock mode enabled:', isMockMode);

      let ocrResult: OCRResult;
      let availableWines: WineListAnalysisResult['availableWines'];

      if (isMockMode) {
        // In mock mode, skip all processing and return mock data directly
        console.log('Mock mode enabled - skipping all processing and using mock recommendations directly');
        
        // Get mock recommendations from WineService (which returns instantly in mock mode)
        // Pass a dummy wine to trigger Menu V2.2 mock data (Menu V2.2 is used when availableWines.length > 0)
        const dummyWine = [{ wineName: 'Mock', producer: 'Mock', vintage: 'NV', category: 'Red Wine' }];
        const wineResponse = await WineService.getWineRecommendations(dish, winePreferences, dummyWine);
        
        // Extract available wines from the mock recommendations (Menu V2.2 format)
        const mockAvailableWines: WineListAnalysisResult['availableWines'] = (wineResponse.recommendations || []).map((rec: any) => ({
          wineName: rec.wineName || 'Unknown Wine',
          producer: rec.producer || 'Unknown Producer',
          vintage: rec.vintage || 'NV',
          servingStyle: 'both' as const,
          category: rec.category || 'Unknown',
          description: typeof rec.tastingNotes === 'string' ? rec.tastingNotes : '',
          grape: rec.grape,
          region: rec.region,
        }));
        
        const filteredWines = this.filterWinesByServingStyle(mockAvailableWines, servingStylePreference);
        
        // Convert WineRecommendationResponse to WineListAnalysisResult format directly
        const wineRecommendations: WineListAnalysisResult['wineRecommendations'] = (wineResponse.recommendations || []).map((rec: any) => {
          return {
            wine: {
              wineName: rec.wineName || 'Unknown Wine',
              producer: rec.producer || 'Unknown Producer',
              vintage: rec.vintage || 'NV',
              servingStyle: 'both' as const,
              category: rec.category || 'Unknown',
              description: typeof rec.tastingNotes === 'string' ? rec.tastingNotes : '',
              grape: rec.grape,
              region: rec.region,
            },
            pairingRationale: rec.rationale || rec.pairingRationale || '',
            confidenceScore: rec.confidenceScore || (rec.confidence?.score || 75),
            confidence: rec.confidence,
            servingGuidance: typeof rec.servingGuidance === 'string' 
              ? rec.servingGuidance 
              : (typeof rec.servingGuidance === 'object' && rec.servingGuidance?.temperature
                  ? `${rec.servingGuidance.temperature}${rec.servingGuidance.glassware ? ` | ${rec.servingGuidance.glassware}` : ''}${rec.servingGuidance.decanting ? ` | ${rec.servingGuidance.decanting}` : ''}`
                  : 'Serve at recommended temperature'),
            tastingNotes: typeof rec.tastingNotes === 'string' ? rec.tastingNotes : undefined,
            storytellingElements: rec.storytellingElements,
            tierLabel: rec.tierLabel,
            tierRationale: rec.tierRationale,
            pairingPrinciplesApplied: rec.pairingPrinciplesApplied,
          };
        });
        
        const processingTime = Date.now() - startTime;
        return {
          availableWines: filteredWines,
          wineRecommendations,
          processingTime,
          ocrConfidence: 100,
          dishAnalyzed: dish,
          servingStylePreference,
          dishAnalysis: wineResponse.dishAnalysis,
          closingNarrative: wineResponse.closingNarrative,
          menuLimitations: (wineResponse as any).menuLimitations,
        };
      } else {
        // Step 1: Extract text using OCR (with fallback)
        if (!photo) {
          throw new Error('Photo is required when mock mode is disabled');
        }

        try {
          ocrResult = await OCRService.extractTextFromImage(photo.uri);
          console.log('OCR completed, confidence:', ocrResult.confidence);
          console.log('=== RAW OCR TEXT OUTPUT ===');
          console.log(ocrResult.text);
          console.log('=== END OCR TEXT ===');
        } catch (error: any) {
          console.log('OCR failed, using fallback mock wine list:', error.message);
          // Use empty OCR result to trigger mock wine list fallback
          ocrResult = {
            text: '',
            confidence: 0,
            boundingBoxes: []
          };
        }

        // Step 2: Parse wine list items
        availableWines = this.parseWineListText(ocrResult);
        console.log('Parsed wine list items:', availableWines.length);
        
        // If no wines were parsed, use a mock wine list for testing
        if (availableWines.length === 0) {
          console.log('No wines parsed from OCR, using mock wine list for testing');
          availableWines = this.getMockWineList();
        }
      }

      // Step 2.5: Generate request ID and store parsed wines to database (skip in mock mode)
      // This happens BEFORE getting recommendations, as requested
      const requestId = await this.generateRequestId();
      if (!isMockMode) {
        try {
          await this.storeParsedMenuWines(availableWines, requestId, dish, ocrResult.confidence);
          console.log('Parsed menu wines stored to database with request ID:', requestId);
        } catch (storeError: any) {
          const errorMessage = storeError?.message || (typeof storeError === 'string' ? storeError : storeError?.toString() || 'Unknown error');
          console.error('Failed to store parsed menu wines (non-blocking):', errorMessage);
          // Continue even if storage fails - this is non-blocking
        }
      }

      // Step 3: Filter wines by serving style preference
      const filteredWines = this.filterWinesByServingStyle(availableWines, servingStylePreference);
      console.log('Filtered wines:', filteredWines.length);

      // Step 4: Get AI-powered wine recommendations for the dish
      // Pass requestId to link recommendations with parsed wines
      const { recommendations: wineRecommendations, dishAnalysis } = await this.getWineRecommendationsFromAvailableWines(
        dish,
        filteredWines,
        winePreferences,
        requestId
      );

      const processingTime = Date.now() - startTime;

      return {
        availableWines: filteredWines,
        wineRecommendations,
        processingTime,
        ocrConfidence: ocrResult.confidence,
        dishAnalyzed: dish,
        servingStylePreference,
        dishAnalysis,
      };
    } catch (error: any) {
      console.error('Wine list analysis error:', error);
      throw new Error(`Wine list analysis failed: ${error.message}`);
    }
  }

  /**
   * Pick photo and analyze wine list
   */
  static async pickPhotoAndAnalyzeWineList(
    dish: string,
    servingStylePreference: 'glass' | 'bottle' | 'both' = 'both'
  ): Promise<WineListAnalysisResult> {
    try {
      // Pick photo
      const photo = await CameraService.pickPhoto();
      if (!photo) {
        throw new Error('Photo selection was cancelled');
      }

      // Analyze wine list
      return await this.analyzeWineListFromPhoto(photo, dish, servingStylePreference);
    } catch (error: any) {
      console.error('Pick photo and analyze wine list error:', error);
      throw new Error(`Photo selection and wine list analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze menu from photo
   */
  static async analyzeMenuFromPhoto(
    photo: PhotoResult,
    options: MenuAnalysisOptions = {}
  ): Promise<MenuAnalysisResult> {
    const startTime = Date.now();
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      console.log('Starting menu analysis from photo...');

      // Step 1: Extract text using OCR
      const ocrResult = await OCRService.extractTextFromImage(photo.uri);
      console.log('OCR completed, confidence:', ocrResult.confidence);

      // Step 2: Parse menu items
      const menuItems = OCRService.parseMenuText(ocrResult);
      console.log('Parsed menu items:', menuItems.length);

      // Step 3: Get wine recommendations for each item
      let wineRecommendations: MenuAnalysisResult['wineRecommendations'] = [];
      
      if (finalOptions.includeWineRecommendations && menuItems.length > 0) {
        wineRecommendations = await this.getWineRecommendationsForMenu(
          menuItems,
          finalOptions
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        menuItems,
        wineRecommendations,
        processingTime,
        ocrConfidence: ocrResult.confidence,
      };
    } catch (error: any) {
      console.error('Menu analysis error:', error);
      throw new Error(`Menu analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze menu from text input
   */
  static async analyzeMenuFromText(
    menuText: string,
    options: MenuAnalysisOptions = {}
  ): Promise<MenuAnalysisResult> {
    const startTime = Date.now();
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };

    try {
      console.log('Starting menu analysis from text...');

      // Step 1: Parse menu items from text
      const ocrResult: OCRResult = {
        text: menuText,
        confidence: 1.0, // Manual input has high confidence
      };
      
      const menuItems = OCRService.parseMenuText(ocrResult);
      console.log('Parsed menu items:', menuItems.length);

      // Step 2: Get wine recommendations for each item
      let wineRecommendations: MenuAnalysisResult['wineRecommendations'] = [];
      
      if (finalOptions.includeWineRecommendations && menuItems.length > 0) {
        wineRecommendations = await this.getWineRecommendationsForMenu(
          menuItems,
          finalOptions
        );
      }

      const processingTime = Date.now() - startTime;

      return {
        menuItems,
        wineRecommendations,
        processingTime,
        ocrConfidence: 1.0,
      };
    } catch (error: any) {
      console.error('Menu analysis error:', error);
      throw new Error(`Menu analysis failed: ${error.message}`);
    }
  }

  /**
   * Parse wine list text to extract available wines
   * 
   * DATA LAYER: Preserves EXACT text from OCR
   * 
   * This function extracts wine information from OCR text and preserves it EXACTLY as parsed.
   * No formatting normalization is performed here - we maintain the original capitalization,
   * punctuation, and structure as captured by OCR for accurate matching later.
   * 
   * Example: If OCR returns "FAMIGLIA PASQUA", we store "FAMIGLIA PASQUA" (not "Famiglia Pasqua").
   * Display sanitization happens later in MenuResults.tsx convertToWineRecommendation().
   */
  private static parseWineListText(ocrResult: OCRResult): WineListAnalysisResult['availableWines'] {
    try {
      const text = ocrResult.text;
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      const wines: WineListAnalysisResult['availableWines'] = [];
      let currentCategory = '';
      
      // First pass: identify category headers, wine lines, and price lines
      // Separate wines from prices (prices often appear at the end in a column format)
      const wineLines: Array<{line: string, category: string, index: number}> = [];
      const priceLines: number[] = [];
      const categoryLines: Array<{index: number, category: string}> = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Check if line is just a price (standalone number)
        const isPriceOnly = /^\s*\d{1,4}(?:,\d{3})*\s*$/.test(line);
        
        if (isPriceOnly) {
          // This is a price - store its index and value
          priceLines.push(i);
        } else if (this.isWineCategoryHeader(line)) {
          // This is a category header
          currentCategory = line;
          categoryLines.push({ index: i, category: line });
        } else {
          // This might be a wine line (contains producer, region, vintage, etc.)
          // Check if it looks like a wine entry (has producer name pattern, region, vintage)
          const looksLikeWine = this.looksLikeWineLine(line);
          if (looksLikeWine) {
            wineLines.push({ line, category: currentCategory, index: i });
          }
        }
      }
      
      console.log(`Found ${wineLines.length} wine lines and ${priceLines.length} price lines`);
      
      // Match wines with prices using section-aware matching
      // Strategy: Identify price blocks (consecutive price lines) and match them to wines in the same section
      if (priceLines.length > 0 && wineLines.length > 0) {
        console.log(`Matching ${wineLines.length} wines with ${priceLines.length} prices using section-aware algorithm`);
        
        // Identify price blocks by analyzing wine sections first
        // Strategy: Group wines by section (using category headers), then match prices to sections
        // Prices typically appear in columns after each section
        const priceBlocks: Array<{
          startIndex: number, 
          endIndex: number, 
          prices: string[], 
          wineStartIndex: number,
          wineEndIndex: number
        }> = [];
        
        // First, identify wine sections by finding category headers
        // Track sections with their headers and boundaries
        const wineSections: Array<{startIndex: number, endIndex: number, categoryHeader: string}> = [];
        let currentSectionStart = 0;
        let currentSectionHeader = '';
        const firstPriceLine = priceLines.length > 0 ? priceLines[0] : lines.length;
        
        // Check if first line is a header
        let firstLineIsHeader = false;
        if (lines.length > 0 && this.isWineCategoryHeader(lines[0].trim())) {
          firstLineIsHeader = true;
          currentSectionHeader = lines[0].trim();
          currentSectionStart = 1;
        }
        
        // Process all lines before prices
        for (let i = firstLineIsHeader ? 1 : 0; i < lines.length && i < firstPriceLine; i++) {
          const line = lines[i].trim();
          if (this.isWineCategoryHeader(line)) {
            // End previous section (if any)
            if (currentSectionStart < i) {
              wineSections.push({
                startIndex: currentSectionStart,
                endIndex: i - 1,
                categoryHeader: currentSectionHeader || 'Unknown'
              });
            }
            // Start new section after this header
            currentSectionStart = i + 1;
            currentSectionHeader = line;
          }
        }
        // Add final section (everything from last header to first price)
        if (currentSectionStart < firstPriceLine) {
          wineSections.push({
            startIndex: currentSectionStart,
            endIndex: firstPriceLine - 1,
            categoryHeader: currentSectionHeader || 'Unknown'
          });
        }
        
        // If no sections found, treat all wines as one section
        if (wineSections.length === 0) {
          wineSections.push({
            startIndex: 0,
            endIndex: firstPriceLine - 1,
            categoryHeader: 'All Wines'
          });
        }
        
        console.log(`Found ${wineSections.length} wine section(s)`);
        
        // Count wines in each section (including wines that might not have been parsed yet)
        const winesPerSection: number[] = [];
        for (let sectionIdx = 0; sectionIdx < wineSections.length; sectionIdx++) {
          const section = wineSections[sectionIdx];
          let wineCount = 0;
          // Count all wine-like lines in this section
          for (let i = section.startIndex; i <= section.endIndex && i < firstPriceLine; i++) {
            const line = lines[i]?.trim();
            if (!line) continue;
            const isPriceOnly = /^\s*\d{1,4}(?:,\d{3})*\s*$/.test(line);
            const isCategory = this.isWineCategoryHeader(line);
            if (!isPriceOnly && !isCategory && this.looksLikeWineLine(line)) {
              wineCount++;
            }
          }
          winesPerSection.push(wineCount);
          console.log(`  Section ${sectionIdx + 1} (${section.categoryHeader}): ${wineCount} wines (lines ${section.startIndex}-${section.endIndex})`);
        }
        
        // Split prices into blocks based on wine counts
        // Prices are listed sequentially matching the order of wines
        let priceIndex = 0;
        for (let sectionIdx = 0; sectionIdx < wineSections.length && priceIndex < priceLines.length; sectionIdx++) {
          const section = wineSections[sectionIdx];
          const wineCount = winesPerSection[sectionIdx];
          
          if (wineCount === 0) continue; // Skip sections with no wines
          
          // Collect prices for this section
          const sectionPrices: string[] = [];
          const sectionPriceStart = priceIndex < priceLines.length ? priceLines[priceIndex] : lines.length;
          let pricesCollected = 0;
          
          while (pricesCollected < wineCount && priceIndex < priceLines.length) {
            const priceIndex_line = priceLines[priceIndex];
            const priceText = lines[priceIndex_line].trim();
            const priceNum = parseInt(priceText.replace(/,/g, ''));
            
            if (priceNum >= 5 && priceNum <= 500) {
              sectionPrices.push(`$${priceNum}`);
              pricesCollected++;
            }
            priceIndex++;
          }
          
          if (sectionPrices.length > 0) {
            const sectionPriceEnd = priceIndex > 0 ? priceLines[priceIndex - 1] : sectionPriceStart;
            
            // Find the actual end of wines in this section (before prices start)
            let wineEndIndex = Math.min(section.endIndex, firstPriceLine - 1);
            
            priceBlocks.push({
              startIndex: sectionPriceStart,
              endIndex: sectionPriceEnd,
              prices: sectionPrices,
              wineStartIndex: section.startIndex,
              wineEndIndex: wineEndIndex
            });
            
            console.log(`  Created price block for section ${sectionIdx + 1}: ${sectionPrices.length} prices matching ${wineCount} wines`);
          }
        }
        
        console.log(`Found ${priceBlocks.length} price block(s):`, priceBlocks.map(b => `${b.prices.length} prices`));
        priceBlocks.forEach((block, idx) => {
          console.log(`  Block ${idx + 1}: ${block.prices.length} prices, wines ${block.wineStartIndex}-${block.wineEndIndex}, prices at lines ${block.startIndex}-${block.endIndex}`);
        });
        
        // Match wines to prices within each price block
        // Wines that appear before a price block should be matched to that block's prices
        for (const wineLine of wineLines) {
          let matchedPrice = 'Price not listed';
          let matchedBlock = null;
          
          // Find which price block this wine belongs to
          // A wine belongs to a price block if it appears between wineStartIndex and wineEndIndex
          for (const block of priceBlocks) {
            if (wineLine.index >= block.wineStartIndex && wineLine.index <= block.wineEndIndex) {
              matchedBlock = block;
              break;
            }
          }
          
          // If no block found, try to match to the nearest price block
          if (!matchedBlock && priceBlocks.length > 0) {
            // Find the price block that starts closest after this wine
            let closestBlock = null;
            let minDistance = Infinity;
            for (const block of priceBlocks) {
              if (block.startIndex > wineLine.index) {
                const distance = block.startIndex - wineLine.index;
                if (distance < minDistance) {
                  minDistance = distance;
                  closestBlock = block;
                }
              }
            }
            // Only use closest block if it's reasonably close (within 50 lines)
            if (closestBlock && minDistance < 50) {
              matchedBlock = closestBlock;
            }
          }
          
          if (matchedBlock) {
            // Count all wine-like lines (including unparsed ones) in this block's wine range before this wine
            let totalWineLikeInBlock = 0;
            for (let i = matchedBlock.wineStartIndex; i < wineLine.index && i <= matchedBlock.wineEndIndex; i++) {
              const line = lines[i]?.trim();
              if (!line) continue;
              const isPriceOnly = /^\s*\d{1,4}(?:,\d{3})*\s*$/.test(line);
              const isCategory = this.isWineCategoryHeader(line);
              if (!isPriceOnly && !isCategory && this.looksLikeWineLine(line)) {
                totalWineLikeInBlock++;
              }
            }
            
            // Match to price at this index
            const priceIndex = totalWineLikeInBlock;
            if (priceIndex < matchedBlock.prices.length) {
              matchedPrice = matchedBlock.prices[priceIndex];
              console.log(`✓ Matched "${wineLine.line.substring(0, 40)}..." at line ${wineLine.index} → ${matchedPrice} (price index ${priceIndex}/${matchedBlock.prices.length - 1})`);
            } else {
              console.log(`⚠ Wine at line ${wineLine.index} - price index ${priceIndex} exceeds block size ${matchedBlock.prices.length}`);
            }
          } else {
            console.log(`⚠ No price block found for wine at line ${wineLine.index}`);
          }
          
          const wine = this.extractWineFromLine(wineLine.line, wineLine.category, ocrResult.confidence, matchedPrice);
          if (wine) {
            // Add price and raw OCR line to wine object
            if (matchedPrice && matchedPrice !== 'Price not listed') {
              wine.price = matchedPrice;
            }
            wine.rawOcrLine = wineLine.line;
            wines.push(wine);
          }
        }
      } else if (priceLines.length === 0 && wineLines.length > 0) {
        // No prices found at bottom, extract wines without prices
        console.log('No prices found at bottom, extracting wines without prices');
        for (const wineLine of wineLines) {
          const wine = this.extractWineFromLine(wineLine.line, wineLine.category, ocrResult.confidence);
          if (wine) {
            wine.rawOcrLine = wineLine.line;
            wines.push(wine);
          }
        }
      } else {
        // Fall back to original parsing method for inline prices or mixed format
        console.log('Fallback: using inline price detection');
        const processedLines: Array<{line: string, isCategory: boolean, isPriceOnly: boolean}> = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const isPriceOnly = /^\s*\d{1,4}(?:,\d{3})*\s*$/.test(line);
          const isCategory = this.isWineCategoryHeader(line);
          
          processedLines.push({ line, isCategory, isPriceOnly });
        }
        
        let currentCategoryFallback = '';
        for (let i = 0; i < processedLines.length; i++) {
          const { line, isCategory, isPriceOnly } = processedLines[i];
          
          if (isCategory) {
            currentCategoryFallback = line;
            continue;
          }
          
          // Skip standalone price lines if we already processed them
          if (isPriceOnly && priceLines.includes(i)) {
            continue; // Already processed in price matching above
          }
          
          if (isPriceOnly) {
            // Skip price-only lines (no longer extracting prices)
            continue;
          }
          
          // Only process if it looks like a wine line and we haven't already processed it
          const alreadyProcessed = wineLines.some(wl => wl.index === i);
          if (!alreadyProcessed) {
            const wine = this.extractWineFromLine(line, currentCategoryFallback, ocrResult.confidence);
            if (wine) {
              wines.push(wine);
            }
          }
        }
      }
      
      console.log(`Parsed ${wines.length} wines from wine list`);
      return wines;
    } catch (error: any) {
      console.error('Wine list parsing error:', error);
      return [];
    }
  }

  /**
   * Filter wines by serving style preference
   */
  private static filterWinesByServingStyle(
    wines: WineListAnalysisResult['availableWines'],
    preference: 'glass' | 'bottle' | 'both'
  ): WineListAnalysisResult['availableWines'] {
    if (preference === 'both') {
      return wines;
    }
    
    return wines.filter(wine => 
      wine.servingStyle === preference || wine.servingStyle === 'both'
    );
  }

  /**
   * Get AI-powered wine recommendations from available wines
   * Uses Claude API via WineService for intelligent pairing recommendations
   */
  private static async getWineRecommendationsFromAvailableWines(
    dish: string,
    availableWines: WineListAnalysisResult['availableWines'],
    winePreferences?: any,
    requestId?: string
  ): Promise<{ recommendations: WineListAnalysisResult['wineRecommendations'], dishAnalysis?: DishAnalysis }> {
    try {
      console.log('Getting AI recommendations for dish:', dish);
      console.log('Available wines:', availableWines.length);
      console.log('Wine preferences:', winePreferences);
      console.log('Request ID:', requestId);

      // Convert available wines list to a summary for the AI prompt
      const availableWinesSummary = availableWines.map(w => 
        `${w.wineName}${w.producer !== 'Unknown Producer' ? ` (${w.producer})` : ''}${w.vintage !== 'NV' ? ` ${w.vintage}` : ''} - ${w.category}`
      ).join('\n');

      // Use WineService to get AI recommendations with enhanced prompt
      // Pass available wines to constrain recommendations to menu wines only
      // Pass requestId to link recommendations with parsed wines
      const wineResponse = await WineService.getWineRecommendations(dish, winePreferences, availableWines, requestId);

      if (!wineResponse || !wineResponse.recommendations || wineResponse.recommendations.length === 0) {
        console.warn('No recommendations from WineService, returning empty array');
        return { recommendations: [], dishAnalysis: wineResponse?.dishAnalysis };
      }

      // CRITICAL: Only recommend wines that are actually on the menu
      // Score and rank available wines based on AI's pairing logic, but ONLY use menu wines
      const recommendations: WineListAnalysisResult['wineRecommendations'] = [];

      /**
       * DATA LAYER: Preserve Exact Text for Matching Accuracy
       * 
       * The menuWine objects contain EXACT text as parsed from OCR (preserving capitalization,
       * punctuation, quotes, abbreviations). This is critical for:
       * 1. Accurate matching against AI recommendations
       * 2. Preserving menu authenticity (what the restaurant actually shows)
       * 3. Avoiding false negatives in matching algorithms
       * 
       * NOTE: We use case-insensitive matching below to handle formatting differences between
       * AI output and menu text, but the underlying data preserves exact menu formatting.
       * Display sanitization happens later in MenuResults.tsx convertToWineRecommendation().
       */
      
      // Score each available wine based on AI recommendations
      // Sort wines first to prioritize best matches for AI recommendations
      const winesWithScores = availableWines.map((menuWine, wineIndex) => {
        let bestScore = 0;
        let bestRationale = '';
        let bestServingGuidance = 'Serve at recommended temperature';
        let bestAiConfidence = 75;
        let bestAiIndex = -1;

        /**
         * MATCHING LOGIC: Case-Insensitive for Formatting Tolerance
         * 
         * We convert to lowercase for comparison to handle cases where:
         * - Menu shows "FAMIGLIA PASQUA" but AI returns "Famiglia Pasqua"
         * - OCR parses inconsistently formatted menu text
         * - Menu uses mixed case but AI standardizes formatting
         * 
         * The original menuWine objects (with exact text) are preserved and passed
         * to the recommendations, ensuring data integrity while allowing matching flexibility.
         */
        // Check each AI recommendation for relevance to this menu wine
        for (let aiIndex = 0; aiIndex < wineResponse.recommendations.length; aiIndex++) {
          const aiRec = wineResponse.recommendations[aiIndex];
          // Normalize wine names (remove quotes, extra spaces, etc.)
          const normalizeWineName = (name: string): string => {
            return name.toLowerCase()
              .replace(/["""]/g, '') // Remove quotes
              .replace(/\s+/g, ' ') // Normalize spaces
              .trim();
          };
          
          const aiNameLower = normalizeWineName(aiRec.wineName || '');
          const aiProducerLower = (aiRec.producer || '').toLowerCase().trim();
          const menuWineNameLower = normalizeWineName(menuWine.wineName);
          const menuProducerLower = menuWine.producer.toLowerCase().trim();
          
          // Calculate match score
          let matchScore = 0;
          
          // Exact name match (highest priority) - after normalization
          if (aiNameLower === menuWineNameLower) {
            matchScore += 200; // Very high score for exact match
          }
          // Also check if names match when removing common prefixes/suffixes
          else if (aiNameLower.replace(/^(the\s+|\s+the\s+)/, '') === menuWineNameLower.replace(/^(the\s+|\s+the\s+)/, '')) {
            matchScore += 195; // Near-exact match
          }
          // Exact producer + vintage match
          else if (aiProducerLower && aiProducerLower !== 'unknown' && menuProducerLower !== 'unknown producer' &&
                   aiProducerLower === menuProducerLower &&
                   aiRec.vintage && aiRec.vintage !== 'unknown' && menuWine.vintage !== 'NV' &&
                   aiRec.vintage === menuWine.vintage) {
            matchScore += 180;
          }
          // Producer + wine name match
          else if (aiProducerLower && menuProducerLower !== 'unknown producer' && 
                   (aiProducerLower === menuProducerLower || aiProducerLower.includes(menuProducerLower) || menuProducerLower.includes(aiProducerLower)) &&
                   (aiNameLower.includes(menuWineNameLower) || menuWineNameLower.includes(aiNameLower))) {
            matchScore += 150;
          }
          // Producer match alone
          else if (aiProducerLower && menuProducerLower !== 'unknown producer' && 
                   (aiProducerLower.includes(menuProducerLower) || menuProducerLower.includes(aiProducerLower))) {
            matchScore += 60;
          }
          // Strong partial name match
          else if (aiNameLower.includes(menuWineNameLower) || menuWineNameLower.includes(aiNameLower)) {
            // Check if it's a substantial match (not just a single word)
            const aiWords = aiNameLower.split(/\s+/);
            const menuWords = menuWineNameLower.split(/\s+/);
            if (aiWords.length > 1 && menuWords.length > 1) {
              matchScore += 80; // Strong match for multi-word names
            } else {
              matchScore += 40;
            }
          }
          // Word overlap (partial matches)
          else {
            const aiWords = aiNameLower.split(/\s+/).filter(w => w.length > 3);
            const menuWords = menuWineNameLower.split(/\s+/).filter(w => w.length > 3);
            const commonWords = aiWords.filter(w => menuWords.includes(w));
            matchScore += commonWords.length * 15;
          }

          // Category/type match - check if both are the same wine type
          // In V2.2, use grape field for wine type; fallback to wineName if grape not available
          const aiCategorySource = typeof aiRec.grape === 'string' 
            ? aiRec.grape 
            : (typeof aiRec.tastingNotes === 'string' 
                ? aiRec.tastingNotes 
                : aiRec.wineName || '');
          const aiCategory = aiCategorySource.toLowerCase().trim();
          const menuCategory = menuWine.category.toLowerCase().trim();
          
          // Check for specific wine type matches
          const wineTypes = ['pinot noir', 'chardonnay', 'cabernet', 'sauvignon blanc', 'merlot', 'syrah', 'riesling', 'rosé'];
          for (const wineType of wineTypes) {
            const aiHasType = aiCategory.includes(wineType) || aiNameLower.includes(wineType);
            const menuHasType = menuCategory.includes(wineType) || menuWineNameLower.includes(wineType);
            if (aiHasType && menuHasType) {
              matchScore += 50; // Strong category match
              break;
            }
          }
          
          // Generic color match
          if (menuCategory.includes('red') && (aiCategory.includes('red') || aiNameLower.includes('red'))) {
            matchScore += 20;
          } else if (menuCategory.includes('white') && (aiCategory.includes('white') || aiNameLower.includes('white'))) {
            matchScore += 20;
          }

          // Use the best matching AI recommendation for this wine (prefer unused ones)
          if (matchScore > bestScore) {
            bestScore = matchScore;
            // Use AI's rationale if it matches well, otherwise we'll generate one
            bestRationale = aiRec.rationale || '';
            // Use AI's serving guidance - it should be detailed for menu wines
            // Handle both string (legacy) and object (V2.2) formats
            if (typeof aiRec.servingGuidance === 'string') {
              bestServingGuidance = aiRec.servingGuidance;
            } else if (aiRec.servingGuidance && typeof aiRec.servingGuidance === 'object') {
              // V2.2 format: convert object to string format
              const parts = [];
              if (aiRec.servingGuidance.temperature) parts.push(`Temperature: ${aiRec.servingGuidance.temperature}`);
              if (aiRec.servingGuidance.glassware) parts.push(`Glassware: ${aiRec.servingGuidance.glassware}`);
              if (aiRec.servingGuidance.decanting) parts.push(aiRec.servingGuidance.decanting);
              bestServingGuidance = parts.length > 0 ? parts.join('. ') : 'Serve at recommended temperature';
            } else {
              bestServingGuidance = 'Serve at recommended temperature';
            }
            
            // Extract confidence score - handle both legacy (number) and V2.2 (object) formats
            let aiConfidenceValue: number | undefined;
            if (typeof aiRec.confidence === 'object' && aiRec.confidence !== null && 'score' in aiRec.confidence) {
              // V2.2 format: confidence is an object with score property
              aiConfidenceValue = aiRec.confidence.score;
            } else if (typeof aiRec.confidenceScore === 'number') {
              // Legacy format: confidenceScore is a number
              aiConfidenceValue = aiRec.confidenceScore;
            }
            
            // Improved confidence scoring for menu wines
            // Menu wines should have higher base confidence since they're verified to be on the menu
            if (matchScore > 200) {
              // Exact match - very high confidence
              bestAiConfidence = aiConfidenceValue !== undefined && aiConfidenceValue >= 85 ? aiConfidenceValue : 95;
            } else if (matchScore > 180) {
              // Producer + vintage match - high confidence
              bestAiConfidence = aiConfidenceValue !== undefined && aiConfidenceValue >= 80 ? aiConfidenceValue : 90;
            } else if (matchScore > 150) {
              // Producer + name match - good confidence
              bestAiConfidence = aiConfidenceValue !== undefined && aiConfidenceValue >= 75 ? aiConfidenceValue : 85;
            } else if (matchScore > 100) {
              // Strong partial match - moderate-high confidence
              bestAiConfidence = aiConfidenceValue !== undefined && aiConfidenceValue >= 70 ? aiConfidenceValue : 80;
            } else if (matchScore > 50) {
              // Partial match - moderate confidence
              bestAiConfidence = Math.max(aiConfidenceValue || 75, 75);
            } else {
              // Weak match - but still menu wine, so base confidence
              bestAiConfidence = 70;
            }
            bestAiIndex = aiIndex;
          }
        }

        // Customize rationale to be specific to this wine
        let customizedRationale = bestRationale;
        if (bestRationale && bestScore > 0) {
          // Personalize the rationale with specific wine details
          const wineDetails = [];
          if (menuWine.producer !== 'Unknown Producer') {
            wineDetails.push(`${menuWine.producer}'s ${menuWine.wineName}`);
          } else {
            wineDetails.push(menuWine.wineName);
          }
          
          if (menuWine.vintage && menuWine.vintage !== 'NV') {
            wineDetails.push(`from ${menuWine.vintage}`);
          }
          
          const wineDescription = wineDetails.join(' ');
          
          // Check if rationale mentions a different wine that's not in our menu
          const mentionedWineNames = bestRationale.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g) || [];
          let mentionsDifferentWine = false;
          
          // Check if rationale mentions a wine name that's not our menu wine
          for (const mentioned of mentionedWineNames) {
            const mentionedLower = mentioned.toLowerCase();
            const menuWineNameLower = menuWine.wineName.toLowerCase();
            const menuProducerLower = menuWine.producer.toLowerCase();
            
            // If it mentions a wine name/producer that's not our menu wine, replace it
            if (mentionedLower.length > 3 && 
                !menuWineNameLower.includes(mentionedLower) && 
                !menuProducerLower.includes(mentionedLower) &&
                !mentionedLower.includes(menuWineNameLower) &&
                !mentionedLower.includes(menuProducerLower) &&
                !['ribeye', 'steak', 'wine', 'this', 'that', 'the', 'rich', 'bold', 'caymus'].includes(mentionedLower)) {
              mentionsDifferentWine = true;
              // Replace the mentioned wine with our menu wine
              customizedRationale = bestRationale.replace(new RegExp(mentioned, 'gi'), wineDescription);
              break;
            }
          }
          
          // If no different wine mentioned, do standard replacement
          if (!mentionsDifferentWine) {
            customizedRationale = bestRationale
              .replace(/this (wine|selection)/gi, wineDescription)
              .replace(/the \w+ wine/gi, wineDescription)
              .replace(/\b(cabernet|pinot|chardonnay|bordeaux|caymus)\b/gi, (match, wineType) => {
                // Only replace if it matches the menu wine category
                const menuCategory = menuWine.category.toLowerCase();
                const menuWineName = menuWine.wineName.toLowerCase();
                if (menuCategory.includes(wineType.toLowerCase()) || menuWineName.includes(wineType.toLowerCase())) {
                  return wineDescription;
                }
                // If it doesn't match (like Caymus), replace with our wine to avoid confusion
                return wineDescription;
              });
          }
          
          // Clean up redundant text - remove duplicate producer/wine name mentions
          const wineNameLower = menuWine.wineName.toLowerCase().replace(/[""]/g, '');
          const producerLower = menuWine.producer.toLowerCase();
          const rationaleLower = customizedRationale.toLowerCase();
          
          // Extract dish name words for sentence fragment detection
          const dishNamePattern = dish.toLowerCase().replace(/[^a-z0-9\s]/g, '');
          const dishNameWords = dishNamePattern.split(/\s+/).filter(w => w.length > 2);
          
          // Remove redundant mentions if wine name is already in rationale
          if (rationaleLower.includes(wineNameLower) || rationaleLower.includes(producerLower)) {
            // Don't add wine description at start if it's already mentioned
            // But clean up any duplicate patterns
            
            // Pattern: "Producer's Wine Producer's Wine" or "The \"Wine Name\" Producer's \"Wine Name\""
            // Remove duplicate producer/wine name combinations
            const producerEscaped = menuWine.producer.replace(/[""]/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wineNameEscaped = menuWine.wineName.replace(/[""]/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Pattern: "Producer's Wine Producer's Wine" (duplicate producer + wine)
            const duplicateProducerWinePattern = new RegExp(
              `(${producerEscaped}'s\\s+${wineNameEscaped})(?:\\s+[^.]*?\\s+)?\\1`,
              'gi'
            );
            customizedRationale = customizedRationale.replace(duplicateProducerWinePattern, '$1');
            
            // Pattern: "The \"Wine Name\" Producer's \"Wine Name\"" - remove duplicate wine name
            const duplicateWineNamePattern = new RegExp(
              `(?:the\\s+)?[""]?${wineNameEscaped}[""]?\\s+[^.]*?[""]?${wineNameEscaped}[""]?`,
              'gi'
            );
            customizedRationale = customizedRationale.replace(duplicateWineNamePattern, (match) => {
              // Keep only the first occurrence with context
              const parts = match.split(new RegExp(wineNameEscaped, 'i'));
              return parts[0] + menuWine.wineName + (parts[parts.length - 1] || '');
            });
            
            // Pattern: "Producer's Producer's" - remove duplicate producer
            const duplicateProducerPattern = new RegExp(
              `(${producerEscaped}'s)(?:\\s+[^.]*?\\s+)?\\1`,
              'gi'
            );
            customizedRationale = customizedRationale.replace(duplicateProducerPattern, '$1');
            
            // Pattern: "Producer's Wine from Year ... Producer's Wine from Year"
            const duplicatePattern = new RegExp(
              `(${wineDescription.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?:\\s+[^.]*\\.)*\\s*\\1`,
              'gi'
            );
            customizedRationale = customizedRationale.replace(duplicatePattern, '$1');
            
            // Pattern: "Producer's Wine from Year ... from Year"
            customizedRationale = customizedRationale.replace(
              new RegExp(`\\bfrom\\s+${menuWine.vintage}\\s+[^.]*\\.\\s*from\\s+${menuWine.vintage}`, 'gi'),
              `from ${menuWine.vintage}`
            );
            
            // Pattern: duplicate producer names
            customizedRationale = customizedRationale.replace(
              new RegExp(`\\b(${menuWine.producer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})'?s?\\s+[^.]*\\.\\s*\\1'?s?`, 'gi'),
              '$1\'s'
            );
            
            // Fix common sentence fragments where dish name appears without verb
            // Pattern: "wine dish" or "wine from year dish" -> add verb
            // Fix patterns like "wine [dish word]" where dish word appears without connecting verb
            for (const dishWord of dishNameWords) {
              if (dishWord.length < 3) continue;
              
              // Pattern: "...wine [dish word]" without verb before it
              const pattern = new RegExp(`(\\b${wineNameEscaped}|\\b${producerEscaped}'s|wine|wine's|it's|its)\\s+([^.,]{0,50}?)\\s+${dishWord}\\b`, 'gi');
              customizedRationale = customizedRationale.replace(pattern, (match, winePart, middlePart) => {
                const middleLower = middlePart.toLowerCase().trim();
                const hasConnectingVerb = /(pairs|complements|enhances|matches|works|goes|with|to|for|cuts|cleanses|through)/i.test(middleLower);
                if (!hasConnectingVerb && middlePart.length < 20) {
                  // Add appropriate verb based on context
                  if (middleLower.includes('acidity') || middleLower.includes('bubbles')) {
                    return `${winePart} ${middlePart} complements ${dish}`;
                  }
                  return `${winePart} ${middlePart} pairs well with ${dish}`;
                }
                return match;
              });
            }
            
            // Fix incomplete sentences: "wine dish." -> "wine complements dish."
            customizedRationale = customizedRationale.replace(
              new RegExp(`\\b(${wineNameEscaped}|${producerEscaped}'s|The\\s+[^,]+?)\\s+(${dishNamePattern})\\s*[,\.]`, 'gi'),
              (match, winePart, dishPart) => {
                // Check if there's already a verb in the sentence before this
                const sentenceBefore = customizedRationale.substring(0, customizedRationale.indexOf(match));
                const hasVerb = /(pairs|complements|enhances|matches|works|goes|brings|offers|provides|delivers|cuts|cleanses)/i.test(sentenceBefore);
                if (!hasVerb) {
                  return `${winePart} complements ${dishPart}.`;
                }
                return match;
              }
            );
          } else {
            // Only add wine description at start if not already mentioned
            customizedRationale = `${wineDescription} ${customizedRationale}`;
          }
          
          // Clean up multiple spaces and redundant phrases
          customizedRationale = customizedRationale
            .replace(/\s+/g, ' ')
            .replace(/\b(\w+)\s+\1\b/gi, '$1') // Remove duplicate consecutive words
            .trim();
          
          // Final pass: ensure sentences are grammatically complete
          // Fix common patterns where dish name appears without proper verb connection
          const sentences = customizedRationale.split(/[\.!?]\s+/);
          const fixedSentences = sentences.map(sentence => {
            // Check if sentence mentions dish but lacks connecting verb
            const sentenceLower = sentence.toLowerCase();
            const mentionsDish = dishNameWords.some(word => sentenceLower.includes(word.toLowerCase()));
            const hasConnectingVerb = /(pairs|complements|enhances|matches|works|goes|with|to|for|cuts|cleanses|through|bringing)/i.test(sentence);
            
            if (mentionsDish && !hasConnectingVerb && sentence.length > 15) {
              // Try to fix by adding verb before dish mention
              for (const dishWord of dishNameWords) {
                if (dishWord.length < 3) continue;
                const dishWordPattern = new RegExp(`\\b([^,]{10,})\\s+${dishWord}\\b`, 'i');
                if (dishWordPattern.test(sentence)) {
                  sentence = sentence.replace(dishWordPattern, (match, before) => {
                    const beforeTrim = before.trim();
                    // Add appropriate verb based on context
                    if (beforeTrim.toLowerCase().includes('acidity') || beforeTrim.toLowerCase().includes('bubbles')) {
                      return `${beforeTrim} complements ${dish}`;
                    } else if (beforeTrim.toLowerCase().includes('rich') || beforeTrim.toLowerCase().includes('bold')) {
                      return `${beforeTrim} pairs well with ${dish}`;
                    }
                    return `${beforeTrim} pairs with ${dish}`;
                  });
                }
              }
            }
            return sentence;
          });
          customizedRationale = fixedSentences.join('. ').trim();
        } else {
          // If no AI match found, create a unique pairing rationale based on wine type and characteristics
          const wineType = menuWine.category.toLowerCase();
          const wineNameWithDetails = menuWine.producer !== 'Unknown Producer' 
            ? `${menuWine.producer}'s ${menuWine.wineName}`
            : menuWine.wineName;
            
          if (wineType.includes('red')) {
            if (wineType.includes('cabernet') || menuWine.wineName.toLowerCase().includes('cabernet')) {
              customizedRationale = `${wineNameWithDetails} brings bold tannins and dark fruit flavors that stand up to the rich, marbled texture of ${dish}. The wine's structure complements the meat's intensity.`;
            } else if (wineType.includes('pinot') || menuWine.wineName.toLowerCase().includes('pinot')) {
              customizedRationale = `${wineNameWithDetails} offers an elegant pairing with ${dish}, providing earthy notes and bright acidity that cut through the richness without overpowering the dish.`;
            } else if (wineType.includes('amarone') || menuWine.wineName.toLowerCase().includes('amarone')) {
              customizedRationale = `${wineNameWithDetails} delivers rich, concentrated fruit and warming alcohol that matches the bold flavors of ${dish}. The wine's intensity pairs beautifully with hearty dishes.`;
            } else {
              customizedRationale = `${wineNameWithDetails} is a red wine that complements the rich flavors of ${dish}. The wine's body and structure enhance the dining experience.`;
            }
            bestServingGuidance = 'Serve at room temperature (18-20°C)';
          } else if (wineType.includes('white')) {
            if (wineType.includes('chardonnay') || menuWine.wineName.toLowerCase().includes('chardonnay')) {
              customizedRationale = `${wineNameWithDetails} provides a creamy, textural contrast to ${dish}. The wine's body and richness balance the dish's flavors.`;
            } else {
              customizedRationale = `${wineNameWithDetails} offers a refreshing, crisp pairing with ${dish}. The wine's acidity brightens the dish and cleanses the palate.`;
            }
            bestServingGuidance = 'Serve chilled (8-12°C)';
          } else if (wineType.includes('sparkling') || wineType.includes('brut')) {
            customizedRationale = `${wineNameWithDetails} adds elegance and celebration to ${dish}. The bubbles provide a palate-cleansing effect that refreshes between bites.`;
            bestServingGuidance = 'Serve well chilled (6-8°C)';
          } else {
            customizedRationale = `${wineNameWithDetails} offers a harmonious pairing with ${dish}, balancing flavors and enhancing the overall dining experience.`;
            bestServingGuidance = 'Serve at recommended temperature';
          }
        }

        /**
         * Return recommendation with EXACT menu wine data preserved.
         * The menuWine object contains original OCR text (exact capitalization, formatting).
         * Display layer (MenuResults.tsx) will sanitize this for UX purposes.
         */
        return {
          wine: menuWine, // EXACT text from menu (data layer - preserved as-is)
          wineIndex,
          score: bestScore + bestAiConfidence,
          rationale: customizedRationale,
          servingGuidance: bestServingGuidance,
          aiIndex: bestAiIndex,
          aiConfidence: bestAiConfidence, // Store AI confidence separately
          aiRecommendation: wineResponse.recommendations[bestAiIndex] || null // Store full AI recommendation for tasting notes, etc.
        };
      });
      
      // Sort by score first
      winesWithScores.sort((a, b) => b.score - a.score);
      
      // Assign AI recommendations uniquely - each AI rec should ideally go to a different wine
      const usedAiIndices = new Set<number>();
      const scoredWines: Array<{
        wine: WineListAnalysisResult['availableWines'][0];
        score: number;
        rationale: string;
        servingGuidance: string;
        aiConfidence: number;
        aiRecommendation?: any; // Full AI recommendation with tasting notes, expert rating, etc.
      }> = [];
      
      // First pass: assign best matches that haven't been used (unique AI recommendations)
      for (const wineScore of winesWithScores) {
        if (wineScore.aiIndex >= 0 && !usedAiIndices.has(wineScore.aiIndex)) {
          scoredWines.push({
            wine: wineScore.wine,
            score: wineScore.score,
            rationale: wineScore.rationale,
            servingGuidance: wineScore.servingGuidance,
            aiConfidence: wineScore.aiConfidence || 75,
            aiRecommendation: wineScore.aiRecommendation || null
          });
          usedAiIndices.add(wineScore.aiIndex);
        }
      }
      
        // Second pass: for wines that didn't get a unique AI rec, create more specific rationales
        for (const wineScore of winesWithScores) {
          // Skip if already added
          if (scoredWines.some(sw => sw.wine.wineName === wineScore.wine.wineName)) {
            continue;
          }
        
        // Create a unique rationale based on wine characteristics
        const wineType = wineScore.wine.category.toLowerCase();
        const wineNameWithDetails = wineScore.wine.producer !== 'Unknown Producer' 
          ? `${wineScore.wine.producer}'s ${wineScore.wine.wineName}`
          : wineScore.wine.wineName;
        
        let uniqueRationale = wineScore.rationale;
        let uniqueConfidence = wineScore.aiConfidence || 75;
        
        // Enhance rationale based on specific wine type
        if (wineType.includes('red')) {
          if (wineType.includes('amarone') || wineScore.wine.wineName.toLowerCase().includes('amarone')) {
            uniqueRationale = `${wineNameWithDetails} delivers bold, concentrated fruit and warming alcohol that matches the intensity of ${dish}. This full-bodied Italian wine provides depth and richness.`;
          } else if (wineType.includes('barolo') || wineScore.wine.wineName.toLowerCase().includes('barolo')) {
            uniqueRationale = `${wineNameWithDetails} brings Nebbiolo's distinctive tannins and tar-like complexity to ${dish}. The wine's elegance and power complement hearty dishes beautifully.`;
          } else if (wineType.includes('brunello') || wineScore.wine.wineName.toLowerCase().includes('brunello')) {
            uniqueRationale = `${wineNameWithDetails} offers Sangiovese's classic structure and cherry notes, creating a harmonious pairing with ${dish}. The wine's Italian character enhances the meal.`;
          } else if (wineType.includes('chianti') || wineScore.wine.wineName.toLowerCase().includes('chianti')) {
            uniqueRationale = `${wineNameWithDetails} provides a traditional Tuscan pairing with ${dish}, offering bright acidity and red fruit that balance the dish's richness.`;
          } else if (wineType.includes('super tuscan') || wineScore.wine.wineName.toLowerCase().includes('super tuscan')) {
            uniqueRationale = `${wineNameWithDetails} combines international varietals with Italian terroir, creating a modern approach to pairing with ${dish}. The wine's complexity elevates the dining experience.`;
          } else if (wineType.includes('cabernet') || wineScore.wine.wineName.toLowerCase().includes('cabernet')) {
            uniqueRationale = `${wineNameWithDetails} brings structured tannins and dark fruit flavors that complement the richness of ${dish}. The wine's power stands up to bold flavors.`;
          } else if (wineType.includes('pinot') || wineScore.wine.wineName.toLowerCase().includes('pinot')) {
            uniqueRationale = `${wineNameWithDetails} offers an elegant pairing with ${dish}, providing earthy complexity and bright acidity that enhance the dish without overpowering it.`;
          }
        } else if (wineType.includes('white')) {
          if (wineType.includes('chardonnay') || wineScore.wine.wineName.toLowerCase().includes('chardonnay')) {
            uniqueRationale = `${wineNameWithDetails} provides a creamy, oak-influenced texture that complements ${dish}. The wine's body and richness create a luxurious pairing.`;
          } else if (wineType.includes('soave') || wineScore.wine.wineName.toLowerCase().includes('soave')) {
            uniqueRationale = `${wineNameWithDetails} offers Italian elegance with crisp minerality, providing a refreshing counterpoint to ${dish}. The wine's lightness enhances the dish.`;
          } else if (wineType.includes('gruner') || wineScore.wine.wineName.toLowerCase().includes('gruner')) {
            uniqueRationale = `${wineNameWithDetails} brings Austrian freshness with white pepper notes to ${dish}. The wine's distinctive character adds interest to the pairing.`;
          } else if (wineType.includes('sauvignon') || wineScore.wine.wineName.toLowerCase().includes('sauvignon')) {
            uniqueRationale = `${wineNameWithDetails} offers vibrant acidity and citrus notes that brighten ${dish}. The wine's crispness provides a refreshing contrast.`;
          }
        } else if (wineType.includes('sparkling') || wineType.includes('brut')) {
          uniqueRationale = `${wineNameWithDetails} adds effervescence and celebration to ${dish}. The bubbles provide a palate-cleansing effect that refreshes between bites.`;
        }
        
        // If rationale wasn't customized, ensure it's unique by including wine name
        if (uniqueRationale === wineScore.rationale) {
          uniqueRationale = `${wineNameWithDetails} ${wineScore.rationale}`;
        }
        
        scoredWines.push({
          wine: wineScore.wine,
          score: wineScore.score,
          rationale: uniqueRationale,
          servingGuidance: wineScore.servingGuidance,
          aiConfidence: uniqueConfidence,
          aiRecommendation: wineScore.aiRecommendation || null
        });
      }

      // Sort by score and take top 3
      scoredWines.sort((a, b) => b.score - a.score);
      const topWines = scoredWines.slice(0, 3);

      // Convert to recommendation format with full AI data
      for (const scored of topWines) {
        const aiRec = scored.aiRecommendation;
        // Merge menu wine data with AI recommendation data (grape, region from AI)
        const wineWithAiData = {
          ...scored.wine,
          // Add grape and region from AI recommendation if available
          ...(aiRec?.grape && { grape: aiRec.grape }),
          ...(aiRec?.region && { region: aiRec.region })
        };
        
        // Extract confidence - handle both object (V2.2) and number (legacy) formats
        let confidenceValue: number;
        let confidenceObject: any = undefined;
        
        if (aiRec?.confidence && typeof aiRec.confidence === 'object' && 'score' in aiRec.confidence) {
          // V2.2 format: confidence is an object with score and breakdown
          confidenceValue = aiRec.confidence.score;
          confidenceObject = aiRec.confidence; // Pass full confidence object including breakdown
        } else {
          // Legacy format or calculated: just use the score
          confidenceValue = scored.aiConfidence || 
            (scored.score > 150 ? 95 : 
             scored.score > 100 ? 88 : 
             scored.score > 50 ? 80 : 75);
        }
        
        recommendations.push({
          wine: wineWithAiData,
          pairingRationale: scored.rationale,
          // Store both confidenceScore (for compatibility) and confidence (for V2.2 breakdown)
          confidenceScore: confidenceValue,
          confidence: confidenceObject, // Pass full confidence object if available (V2.2 format)
          servingGuidance: scored.servingGuidance,
          // Pass through AI recommendation data for tasting notes, etc.
          tastingNotes: aiRec?.tastingNotes || '',
          storytellingElements: aiRec?.storytellingElements || scored.rationale,
          tierLabel: aiRec?.tierLabel,
          tierRationale: aiRec?.tierRationale,
          pairingPrinciplesApplied: aiRec?.pairingPrinciplesApplied
        });
      }

      // Sort by confidence score (highest first)
      recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);

      console.log('Generated recommendations:', recommendations.length);
      const result: { recommendations: WineListAnalysisResult['wineRecommendations'], dishAnalysis?: DishAnalysis, closingNarrative?: string, menuLimitations?: string } = {
        recommendations,
        dishAnalysis: wineResponse.dishAnalysis,
      };
      
      if (wineResponse.closingNarrative) {
        result.closingNarrative = wineResponse.closingNarrative;
      }
      if (wineResponse.menuLimitations) {
        result.menuLimitations = wineResponse.menuLimitations;
      }
      
      return result;
    } catch (error: any) {
      console.error('AI wine recommendation error:', error);
      console.error('Error details:', error);
      // Return empty array on error - the UI will handle it gracefully
      return { recommendations: [] };
    }
  }

  /**
   * Get mock wine list for testing when OCR doesn't parse wines
   */
  private static getMockWineList(): WineListAnalysisResult['availableWines'] {
    return [
      {
        wineName: 'Cabernet Sauvignon',
        producer: 'Napa Valley Reserve',
        vintage: '2019',
        servingStyle: 'bottle',
        category: 'Red Wine',
        description: 'Full-bodied with notes of blackberry and oak'
      },
      {
        wineName: 'Chardonnay',
        producer: 'Sonoma Coast',
        vintage: '2020',
        servingStyle: 'glass',
        category: 'White Wine',
        description: 'Crisp and refreshing with citrus notes'
      },
      {
        wineName: 'Pinot Noir',
        producer: 'Willamette Valley',
        vintage: '2018',
        servingStyle: 'bottle',
        category: 'Red Wine',
        description: 'Elegant and smooth with cherry flavors'
      },
      {
        wineName: 'Sauvignon Blanc',
        producer: 'New Zealand',
        vintage: '2021',
        servingStyle: 'glass',
        category: 'White Wine',
        description: 'Bright and zesty with tropical fruit'
      },
      {
        wineName: 'Prosecco',
        producer: 'Veneto',
        vintage: 'NV',
        servingStyle: 'glass',
        category: 'Sparkling Wine',
        description: 'Light and bubbly, perfect for celebrations'
      }
    ];
  }

  /**
   * Check if a line looks like a wine entry (has producer, region, vintage patterns)
   */
  private static looksLikeWineLine(line: string): boolean {
    // Skip if it's a category header
    if (this.isWineCategoryHeader(line)) {
      return false;
    }
    
    // Skip if it's just a price
    if (/^\s*\d{1,4}(?:,\d{3})*\s*$/.test(line)) {
      return false;
    }
    
    // Wine lines typically contain:
    // - Producer names (capitalized words, may contain quotes, apostrophes)
    // - Regions (ITALY, CALIFORNIA, FRANCE, etc.)
    // - Vintages (4-digit years: 2018, 2019, etc.) or MV/NV for non-vintage
    // - Wine types (CHARDONNAY, PINOT NOIR, etc.)
    // - Appellations (SOAVE, CHIANTI CLASSICO, etc.)
    
    const hasVintage = /\b(19|20)\d{2}\b/.test(line) || /\b(MV|NV)\b/.test(line);
    const hasRegion = /\b(ITALY|FRANCE|CALIFORNIA|SPAIN|AUSTRIA|GERMANY|BORDEAUX|TUSCANY|NAPA|SONOMA|VENETO|PIEDMONT|LOMBARDY|BURGENLAND|ALEXANDER VALLEY|RUSSIAN RIVER|FRANCIACORTA|LOMBARDY|SAINT-ESTEPHE)\b/i.test(line);
    const hasProducerPattern = /^[A-Z][A-Z\s\'"\.]+,/.test(line) || /^[A-Z][A-Z\s\'"\.]+\s+[A-Z]/.test(line) || /^[A-Z][A-Z\s\'"]+"/.test(line);
    const hasWineType = /\b(BRUT|CHARDONNAY|PINOT|CABERNET|SAUVIGNON|MERLOT|ROSE|ROSÉ|AMARONE|BAROLO|BRUNELLO|CHIANTI|SOAVE|VERMENTINO|VELTLINER|SUPER TUSCAN|GARGANEGA)\b/i.test(line);
    const hasAppellation = /\b(SOAVE|CHIANTI|CLASSICO|AMARONE|BAROLO|BRUNELLO|MONTALCINO|FRANCIACORTA|SAINT-ESTEPHE)\b/i.test(line);
    
    // Must have at least 2 of these characteristics (including appellations as a valid indicator)
    const matches = [hasVintage, hasRegion, hasProducerPattern, hasWineType, hasAppellation].filter(Boolean).length;
    return matches >= 2 && line.length > 10;
  }

  /**
   * Check if a line is a wine category header
   */
  private static isWineCategoryHeader(line: string): boolean {
    // Skip numeric-only lines (these are likely prices, not categories)
    if (/^\s*\d+\s*$/.test(line)) {
      return false;
    }
    
    const wineCategories = [
      'red wine', 'white wine', 'rosé', 'sparkling', 'dessert wine',
      'by the glass', 'by the bottle', 'house wines', 'premium wines',
      'chardonnay', 'cabernet', 'pinot noir', 'sauvignon blanc',
      'italian', 'reserve', 'wines', 'wine', 'wines from around the world'
    ];
    
    // Check for common header patterns
    const isHeaderPattern = /^(SPARKLING|WHITE|RED|ROSÉ|WINES|ITALIAN|RESERVE)/i.test(line.trim());
    const isShort = line.length < 80; // Increased from 50 to catch "WINES FROM AROUND THE WORLD"
    const isCaps = line === line.toUpperCase() || line.trim() === line.trim().toUpperCase();
    const hasWineCategory = wineCategories.some(category => 
      line.toLowerCase().includes(category.toLowerCase())
    );
    
    // Don't treat standalone numbers as categories
    const isNumeric = /^\s*\d+\s*$/.test(line);
    if (isNumeric) return false;
    
    // Don't treat wine entries as categories (they have commas, regions, vintages)
    const looksLikeWineEntry = /,/.test(line) && (/\b(19|20)\d{2}\b/.test(line) || /\b(ITALY|FRANCE|CALIFORNIA|SPAIN|AUSTRIA|GERMANY)\b/i.test(line));
    if (looksLikeWineEntry) return false;
    
    return isShort && (isCaps || hasWineCategory || isHeaderPattern) && !isNumeric;
  }

  /**
   * Map wine regions/appellations to full region strings
   */
  private static expandRegion(appellation: string): string {
    const regionMap: { [key: string]: string } = {
      'Barolo': 'Barolo DOCG, Piedmont, Italy',
      'Barolo DOCG': 'Barolo DOCG, Piedmont, Italy',
      'Chianti Classico': 'Chianti Classico DOCG, Tuscany, Italy',
      'Chianti Classico DOCG': 'Chianti Classico DOCG, Tuscany, Italy',
      'Chianti Classico Riserva': 'Chianti Classico DOCG, Tuscany, Italy',
      'Franciacorta': 'Franciacorta DOCG, Lombardy, Italy',
      'Franciacorta DOCG': 'Franciacorta DOCG, Lombardy, Italy',
      'Prosecco DOCG': 'Prosecco DOCG, Veneto, Italy',
      'Prosecco DOC': 'Prosecco DOC, Treviso, Italy',
      'Puligny-Montrachet': 'Puligny-Montrachet Premier Cru, Côte de Beaune, Burgundy, France',
      'Puligny-Montrachet Premier Cru': 'Puligny-Montrachet Premier Cru, Côte de Beaune, Burgundy, France',
      'Piemonte': 'Piedmont, Italy',
      'Piemonte DOP': 'Piedmont, Italy',
    };

    // Try exact match first
    if (regionMap[appellation]) {
      return regionMap[appellation];
    }

    // Try case-insensitive match
    const lowerAppellation = appellation.toLowerCase();
    for (const [key, value] of Object.entries(regionMap)) {
      if (key.toLowerCase() === lowerAppellation) {
        return value;
      }
    }

    // Try partial match for appellations
    if (lowerAppellation.includes('barolo') && !lowerAppellation.includes('barbaresco')) {
      return 'Barolo DOCG, Piedmont, Italy';
    }
    if (lowerAppellation.includes('chianti classico')) {
      return 'Chianti Classico DOCG, Tuscany, Italy';
    }
    if (lowerAppellation.includes('franciacorta')) {
      return 'Franciacorta DOCG, Lombardy, Italy';
    }
    if (lowerAppellation.includes('prosecco')) {
      if (lowerAppellation.includes('docg')) {
        return 'Prosecco DOCG, Veneto, Italy';
      }
      return 'Prosecco DOC, Treviso, Italy';
    }
    if (lowerAppellation.includes('puligny-montrachet')) {
      return 'Puligny-Montrachet Premier Cru, Côte de Beaune, Burgundy, France';
    }

    // Return original if no match
    return appellation;
  }

  /**
   * Extract and format grape varieties from text
   */
  private static extractAndFormatGrapes(text: string, category: string): string {
    const grapeMap: { [key: string]: { name: string; color: string; sweetness: string } } = {
      'chardonnay': { name: 'Chardonnay', color: 'White', sweetness: 'Dry' },
      'chard': { name: 'Chardonnay', color: 'White', sweetness: 'Dry' },
      'pinot noir': { name: 'Pinot Noir', color: 'Red', sweetness: 'Dry' },
      'pinot nero': { name: 'Pinot Noir', color: 'Red', sweetness: 'Dry' },
      'p. noir': { name: 'Pinot Noir', color: 'Red', sweetness: 'Dry' },
      'pinot n': { name: 'Pinot Noir', color: 'Red', sweetness: 'Dry' },
      'pinot bianco': { name: 'Pinot Bianco', color: 'White', sweetness: 'Dry' },
      'bianco': { name: 'Pinot Bianco', color: 'White', sweetness: 'Dry' },
      'nebbiolo': { name: 'Nebbiolo', color: 'Red', sweetness: 'Dry' },
      'sangiovese': { name: 'Sangiovese', color: 'Red', sweetness: 'Dry' },
      'canaiolo': { name: 'Canaiolo', color: 'Red', sweetness: 'Dry' },
      'cannalolo': { name: 'Canaiolo', color: 'Red', sweetness: 'Dry' },
      'colorino': { name: 'Colorino', color: 'Red', sweetness: 'Dry' },
      'glera': { name: 'Glera', color: 'White', sweetness: 'Dry' },
      'cabernet sauvignon': { name: 'Cabernet Sauvignon', color: 'Red', sweetness: 'Dry' },
      'cabernet': { name: 'Cabernet Sauvignon', color: 'Red', sweetness: 'Dry' },
      'cab. sauv': { name: 'Cabernet Sauvignon', color: 'Red', sweetness: 'Dry' },
      'merlot': { name: 'Merlot', color: 'Red', sweetness: 'Dry' },
      'corvina': { name: 'Corvina', color: 'Red', sweetness: 'Dry' },
      'rondinella': { name: 'Rondinella', color: 'Red', sweetness: 'Dry' },
      'rond.': { name: 'Rondinella', color: 'Red', sweetness: 'Dry' },
      'rond': { name: 'Rondinella', color: 'Red', sweetness: 'Dry' },
      'molinara': { name: 'Molinara', color: 'Red', sweetness: 'Dry' },
      'oseleta': { name: 'Oseleta', color: 'Red', sweetness: 'Dry' },
      'syrah': { name: 'Syrah', color: 'Red', sweetness: 'Dry' },
    };

    const grapes: Array<{ name: string; color: string; sweetness: string }> = [];
    const textLower = text.toLowerCase();

    // Extract grape percentages (e.g., "Chard 75%, P. Noir 15%, Bianco 10%", "Corvina 70%, Rond. 20%")
    // Improved pattern to handle abbreviations and punctuation
    const grapePercentagePattern = /([A-Za-z]+(?:\.[A-Za-z]*)?(?:\s+[A-Za-z]+)*)\s+(\d+)%/g;
    let match;
    const foundGrapes = new Set<string>();

    while ((match = grapePercentagePattern.exec(text)) !== null) {
      const grapeText = match[1].toLowerCase().trim();
      // Map abbreviations to full names - check for exact matches first (including abbreviations)
      let matched = false;
      for (const [key, grapeInfo] of Object.entries(grapeMap)) {
        // Check for exact match or if the key is contained in the grapeText (handles abbreviations)
        if (grapeText === key || grapeText.includes(key) || key.includes(grapeText)) {
          const grapeKey = grapeInfo.name;
          if (!foundGrapes.has(grapeKey)) {
            grapes.push(grapeInfo);
            foundGrapes.add(grapeKey);
          }
          matched = true;
          break;
        }
      }
      // If no match found, try to match without punctuation (e.g., "Rond." -> "rond")
      if (!matched && grapeText.includes('.')) {
        const grapeTextNoPunct = grapeText.replace(/\./g, '');
        for (const [key, grapeInfo] of Object.entries(grapeMap)) {
          if (grapeTextNoPunct === key || grapeTextNoPunct.includes(key) || key.includes(grapeTextNoPunct)) {
            const grapeKey = grapeInfo.name;
            if (!foundGrapes.has(grapeKey)) {
              grapes.push(grapeInfo);
              foundGrapes.add(grapeKey);
            }
            break;
          }
        }
      }
    }

    // If no percentages found, try to detect single grapes from text
    // Look for complete word matches first (more specific)
    if (grapes.length === 0) {
      // Sort by key length (longer first) to match more specific terms first
      const sortedGrapeEntries = Object.entries(grapeMap).sort((a, b) => b[0].length - a[0].length);
      
      for (const [key, grapeInfo] of sortedGrapeEntries) {
        // Use word boundaries for more accurate matching
        const pattern = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (pattern.test(textLower)) {
          const grapeKey = grapeInfo.name;
          if (!foundGrapes.has(grapeKey)) {
            grapes.push(grapeInfo);
            foundGrapes.add(grapeKey);
          }
        }
      }
    }

    // Special handling for known appellations (only if no grapes found from percentages)
    if (grapes.length === 0) {
      if (textLower.includes('amarone') || textLower.includes('valpolicella')) {
        // Amarone/Valpolicella wines are typically blends of Corvina, Rondinella, Molinara
        grapes.push(
          { name: 'Corvina', color: 'Red', sweetness: 'Dry' },
          { name: 'Rondinella', color: 'Red', sweetness: 'Dry' },
          { name: 'Molinara', color: 'Red', sweetness: 'Dry' }
        );
      } else if (textLower.includes('barolo') || textLower.includes('barbaresco')) {
        grapes.push({ name: 'Nebbiolo', color: 'Red', sweetness: 'Dry' });
      } else if (textLower.includes('chianti') || textLower.includes('brunello')) {
        grapes.push({ name: 'Sangiovese', color: 'Red', sweetness: 'Dry' });
      } else if (textLower.includes('prosecco')) {
        grapes.push({ name: 'Glera', color: 'White', sweetness: 'Dry' });
      } else if (textLower.includes('franciacorta')) {
        // Franciacorta is typically Chardonnay, Pinot Noir, Pinot Bianco blend
        grapes.push(
          { name: 'Chardonnay', color: 'White', sweetness: 'Dry' },
          { name: 'Pinot Noir', color: 'Red', sweetness: 'Dry' },
          { name: 'Pinot Bianco', color: 'White', sweetness: 'Dry' }
        );
      } else if (textLower.includes('puligny-montrachet') || (textLower.includes('montrachet') && category && category.toLowerCase().includes('white'))) {
        grapes.push({ name: 'Chardonnay', color: 'White', sweetness: 'Dry' });
      } else if (category && category.toLowerCase().includes('pinot noir')) {
        grapes.push({ name: 'Pinot Noir', color: 'Red', sweetness: 'Dry' });
      } else if (category && category.toLowerCase().includes('chardonnay')) {
        grapes.push({ name: 'Chardonnay', color: 'White', sweetness: 'Dry' });
      }
    }

    // Format grapes as "Name (Color, Sweetness), Name (Color, Sweetness)"
    if (grapes.length > 0) {
      return grapes.map(g => `${g.name} (${g.color}, ${g.sweetness})`).join(', ');
    }

    return '';
  }

  /**
   * Extract wine information from a line of text
   */
  private static extractWineFromLine(
    line: string, 
    category: string, 
    confidence: number,
    priceFromContext?: string // Kept for backward compatibility but no longer used
  ): WineListAnalysisResult['availableWines'][0] | null {
    // Skip lines that are too short or don't look like wine entries
    if (line.length < 5) return null;
    
    // Determine serving style - check for explicit indicators
    let servingStyle: 'glass' | 'bottle' | 'both' = 'both';
    const lowerLine = line.toLowerCase();
    
    // Explicit glass indicators
    if (lowerLine.includes('/glass') || lowerLine.includes('by the glass') || 
        lowerLine.match(/\bglass\s*(only)?\b/)) {
      servingStyle = 'glass';
    } 
    // Explicit bottle indicators
    else if (lowerLine.includes('/btl') || lowerLine.includes('/bottle') || 
             lowerLine.includes('by the bottle') || lowerLine.match(/\bbottle\s*(only)?\b/)) {
      servingStyle = 'bottle';
    }
    // If line has both glass and bottle prices, it's 'both'
    else if ((lowerLine.includes('glass') && lowerLine.includes('bottle')) ||
             (lowerLine.match(/\$\d+\s*\/\s*glass/i) && lowerLine.match(/\$\d+\s*\/\s*(btl|bottle)/i))) {
      servingStyle = 'both';
    }
    // Check category header context - if category says "by the glass" or "by the bottle"
    else {
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes('by the glass') || categoryLower.includes('glass')) {
        servingStyle = 'glass';
      } else if (categoryLower.includes('by the bottle') || categoryLower.includes('bottle') && !categoryLower.includes('glass')) {
        servingStyle = 'bottle';
      }
    }
    
    // Remove price and serving style indicators from line to get wine name
    let wineText = line;
    
    // Remove price patterns ($XX, standalone numbers that look like prices)
    wineText = wineText.replace(/\$\s*[\d,]+(?:\.\d{2})?/g, '').trim();
    // Remove standalone numbers at end that might be prices (but keep vintages)
    wineText = wineText.replace(/\s+(\d{2,3})\s*$/g, (match, num) => {
      const numValue = parseInt(num);
      // If it's a year (1900-2099), keep it; otherwise remove if it looks like a price
      if (numValue >= 1900 && numValue <= 2099) return match;
      if (numValue >= 5 && numValue <= 500) return ''; // Likely a price
      return match;
    }).trim();
    // Remove price/serving style patterns like "$XX/glass" or "$XX/btl"
    wineText = wineText.replace(/\$\d+\s*\/(?:glass|btl|bottle)/gi, '').trim();
    
    // Remove serving style indicators
    wineText = wineText.replace(/\b(glass|bottle|by the glass|by the bottle)\b/gi, '').trim();
    
    // Clean up multiple spaces
    wineText = wineText.replace(/\s+/g, ' ').trim();
    
    // PRESERVE ORIGINAL FULL WINE NAME TEXT (before removing technical details)
    // This preserves the complete original text including producer, wine name, appellation
    const fullWineNameOriginal = wineText.replace(/\s+/g, ' ').trim();
    
    // Extract vintage (4-digit year, usually 19xx or 20xx)
    const vintageMatch = wineText.match(/\b(19|20)\d{2}\b/);
    const vintage = vintageMatch ? vintageMatch[0] : 'NV';
    
    // Extract technical details (appellations, grape percentages) to move to description
    const technicalDetails: string[] = [];
    
    // Extract appellation patterns (DOCG, DOC, AOC, IGT, AVA, etc.)
    const appellationPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+DOCG?|AOC|IGT|AVA|DOP|DO|DOQ|VdP|VdT))\b/g;
    const appellationMatches = wineText.match(appellationPattern);
    if (appellationMatches) {
      technicalDetails.push(...appellationMatches);
      // Remove appellations from wine text for parsing
      wineText = wineText.replace(appellationPattern, '').trim();
    }
    
    // Extract grape percentages (e.g., "Sangiovese 95%, Canaiolo 3%", "Corvina 70%, Rond. 20%")
    const grapePercentagePattern = /([A-Za-z]+(?:\s+[A-Za-z]+)*(?:\s+[A-Z][a-z]+)*)\s+\d+%/g;
    const grapeMatches = wineText.match(grapePercentagePattern);
    if (grapeMatches && grapeMatches.length > 0) {
      technicalDetails.push(grapeMatches.join(', '));
      // Remove grape percentages from wine text
      wineText = wineText.replace(grapePercentagePattern, '').trim();
    }
    
    // Extract blend information patterns (e.g., "Chard 75%, P. Noir 15%/Bianco 10%")
    const blendPattern = /\b([A-Z][a-z]+(?:\s*[A-Z][a-z]+)*)\s+\d+%[,\s]*([A-Z][a-z]+(?:\s*[A-Z][a-z]+)*)\s+\d+%/g;
    const blendMatches = wineText.match(blendPattern);
    if (blendMatches) {
      technicalDetails.push(...blendMatches);
      wineText = wineText.replace(blendPattern, '').trim();
    }
    
    // Extract "100%" grape indicators and move to description
    const singleGrapePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+100%\b/g;
    const singleGrapeMatches = wineText.match(singleGrapePattern);
    if (singleGrapeMatches && singleGrapeMatches.length === 1) {
      // Single grape at 100% - this is likely category info, remove from text
      wineText = wineText.replace(singleGrapePattern, '').trim();
    } else if (singleGrapeMatches && singleGrapeMatches.length > 1) {
      // Multiple grapes - this is blend info for description
      technicalDetails.push(singleGrapeMatches.join(', '));
      wineText = wineText.replace(singleGrapePattern, '').trim();
    }
    
    // Extract producer from the original full text
    // Patterns: 
    // 1. "Producer, Wine Name" (common in Italian menus)
    // 2. "Wine Name - Producer" (alternate format)
    // Examples: 
    //   "Ca del Bosco, Cuvee' Prestige Ed 45 NV - Franciacorta DOCG"
    //   "G.D Vajra, Barolo 'Albe' 2019"
    //   "Barolo 'Albe' 2019 - C.D Vajra"
    let producer = 'Unknown Producer';
    let description = '';
    
    // Known producer mappings for specific wines
    const knownProducers: { [key: string]: string } = {
      "'novecento'": 'Dievole',
      'novecento': 'Dievole',
      'vigna san carlo': 'Saracco',
      'sette anime': 'Sette Anime',
    };
    
    // Try to extract producer name - look for common producer patterns
    let producerFound = false;
    const originalLower = fullWineNameOriginal.toLowerCase();
    
    // Check known producers first
    for (const [key, prod] of Object.entries(knownProducers)) {
      if (originalLower.includes(key)) {
        producer = prod;
        producerFound = true;
        break;
      }
    }
    
    // Pattern 1: Producer followed by comma: "Producer, Wine Name"
    if (!producerFound) {
      const commaPattern = /^([A-Z][A-Za-z'.\s-]+?),\s+(.+)$/;
      const commaMatch = fullWineNameOriginal.match(commaPattern);
      if (commaMatch && commaMatch[1]) {
        const potentialProducer = commaMatch[1].trim();
        // Check if it looks like a producer (has keywords or is reasonably short)
        const producerKeywords = ['tenuta', 'fattoria', 'cantina', 'domaine', 'chateau', 'estate', 'vineyard', 'del', 'della', 'di', 'da', 'vajra', 'leflaive'];
        const potentialProducerLower = potentialProducer.toLowerCase();
        const looksLikeProducer = producerKeywords.some(keyword => potentialProducerLower.includes(keyword)) ||
                                  (potentialProducer.length < 40 && !potentialProducer.match(/\b(19|20)\d{2}\b/));
        
        if (looksLikeProducer || potentialProducer.length < 25) {
          producer = potentialProducer;
          producerFound = true;
        }
      }
    }
    
    // Pattern 2: "Wine Name - Producer" (producer at the end after dash)
    if (!producerFound) {
      const dashPattern = /^(.+?)\s*-\s*([A-Z][A-Za-z'.\s-]+?)$/;
      const dashMatch = fullWineNameOriginal.match(dashPattern);
      if (dashMatch && dashMatch[2]) {
        const potentialProducer = dashMatch[2].trim();
        // Remove any trailing appellations from producer
        const producerClean = potentialProducer.replace(/\s+(DOCG?|AOC|IGT|AVA|DOP|DO)\s*$/i, '').trim();
        if (producerClean.length > 2 && producerClean.length < 40) {
          // Check if it's not an appellation (ends with common wine region terms)
          const isAppellation = /(DOCG?|AOC|IGT|AVA|DOP|DO|DOCG|DOC|Italy|France)$/i.test(producerClean);
          if (!isAppellation) {
            producer = producerClean;
            producerFound = true;
          }
        }
      }
    }
    
    // Normalize producer name (handle variations like "Ca del Bosco" vs "Ca' del Bosco")
    if (producer !== 'Unknown Producer') {
      producer = producer.replace(/\bCa\s+del\b/gi, "Ca' del");
      producer = producer.replace(/\s+/g, ' ').trim();
    }
    
    // Extract region/appellation information
    const regionInfo: string[] = [];
    // Look for DOCG, DOC, AOC, IGT, AVA patterns in the full original wine name
    const regionMatches = fullWineNameOriginal.match(appellationPattern);
    if (regionMatches) {
      regionMatches.forEach(match => {
        if (!regionInfo.includes(match)) {
          regionInfo.push(match);
        }
      });
    }
    
    // Also check for well-known regions without explicit appellations
    const wellKnownRegions: { [key: string]: string } = {
      'barolo': 'Barolo',
      'barbaresco': 'Barolo', // Similar region
      'chianti classico': 'Chianti Classico',
      'puligny-montrachet': 'Puligny-Montrachet Premier Cru',
      'franciacorta': 'Franciacorta',
      'prosecco': 'Prosecco DOC',
    };
    
    for (const [key, region] of Object.entries(wellKnownRegions)) {
      if (fullWineNameOriginal.toLowerCase().includes(key) && !regionInfo.some(r => r.toLowerCase().includes(key))) {
        regionInfo.push(region);
      }
    }
    
    // Expand regions to full format
    let expandedRegion = '';
    if (regionInfo.length > 0) {
      // Use the first/most specific region
      expandedRegion = this.expandRegion(regionInfo[0]);
    }
    
    // Extract and format grapes
    const grapeText = this.extractAndFormatGrapes(fullWineNameOriginal, category);
    
    // Build wine name - remove producer from it
    let wineName = fullWineNameOriginal;
    
    // Remove producer from wine name if found
    if (producerFound && producer !== 'Unknown Producer') {
      // Remove producer followed by comma
      wineName = wineName.replace(new RegExp(`^${producer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*,\\s*`, 'i'), '');
      // Remove producer at end after dash
      wineName = wineName.replace(new RegExp(`\\s*-\\s*${producer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i'), '');
      wineName = wineName.trim();
    }
    
    // Clean up wine name - remove trailing slashes and extra spaces
    wineName = wineName.replace(/\s*\/\s*$/, '').replace(/\s+/g, ' ').trim();
    
    // Build description - more descriptive text based on wine characteristics
    const descriptionParts: string[] = [];
    const wineNameLowerTemp = wineName.toLowerCase();
    const producerLowerTemp = producer.toLowerCase();
    
    // Specific descriptions based on wine characteristics
    if (wineNameLowerTemp.includes("'novecento'") || wineNameLowerTemp.includes('novecento')) {
      descriptionParts.push("Chianti Classico Riserva labeled 'Novecento'.");
    } else if (wineNameLowerTemp.includes("barolo") && wineNameLowerTemp.includes("'albe'")) {
      descriptionParts.push(`Barolo from the Albe bottling by ${producer !== 'Unknown Producer' ? producer : 'G.D Vajra'}.`);
    } else if (wineNameLowerTemp.includes('barolo') && producerLowerTemp.includes('vajra')) {
      descriptionParts.push(`Barolo from the Albe bottling by ${producer}.`);
    } else if (wineNameLowerTemp.includes('puligny-montrachet')) {
      descriptionParts.push("White Burgundy from Puligny-Montrachet Premier Cru.");
    } else if (wineNameLowerTemp.includes('prosecco') && servingStyle === 'glass') {
      descriptionParts.push(`Prosecco ${expandedRegion && expandedRegion.includes('DOCG') ? 'DOCG' : 'DOC'} by the glass.`);
    } else if (wineNameLowerTemp.includes('pinot noir') && vintage !== 'NV') {
      descriptionParts.push(`Red wine labeled Pinot Noir ${vintage}.`);
    } else if (expandedRegion) {
      // Default: use the appellation name
      const appellationName = regionInfo[0];
      if (appellationName) {
        descriptionParts.push(`Region: ${appellationName}.`);
      }
    }
    
    if (descriptionParts.length > 0) {
      description = descriptionParts.join(' ');
    } else if (expandedRegion) {
      description = `Region: ${expandedRegion.split(',')[0]}.`;
    }
    
    // Skip if wine name is too short or looks invalid
    if (wineName.length < 2) return null;
    if (wineName.toLowerCase() === 'wine' || wineName.toLowerCase() === 'wines') return null;
    
    // Auto-detect wine category from wine name if category wasn't set or is generic
    // Skip if category looks like a price (starts with $ or is just numbers/dots)
    let detectedCategory = category;
    if (category && (category.trim().startsWith('$') || /^[\d\.\s]+$/.test(category.trim()))) {
      detectedCategory = ''; // Clear price-like categories
    }
    
    // Clean text for category detection (remove technical details)
    const cleanWineName = wineName.replace(/\b\d+%\b/g, '').replace(/\b(DOCG|DOC|AOC|IGT|AVA|DOP|DO)\b/gi, '').trim();
    const cleanDescription = (description || '').replace(/\b\d+%\b/g, '').replace(/\b(DOCG|DOC|AOC|IGT|AVA|DOP|DO)\b/gi, '').trim();
    
    const wineNameLower = cleanWineName.toLowerCase();
    const producerLower = producer.toLowerCase();
    const descriptionLower = cleanDescription.toLowerCase();
    const combinedText = `${wineNameLower} ${producerLower} ${descriptionLower}`;
    
    // Check for specific wine types in the cleaned wine name/producer/description
    // Prioritize actual grape names over appellations
    if ((combinedText.includes('pinot noir') || (combinedText.includes('pinot') && !combinedText.includes('pinot grigio') && !combinedText.includes('pinot gris')))) {
      detectedCategory = 'Pinot Noir';
    } else if (combinedText.includes('chardonnay')) {
      detectedCategory = 'Chardonnay';
    } else if (combinedText.includes('cabernet')) {
      detectedCategory = 'Cabernet Sauvignon';
    } else if (combinedText.includes('sauvignon blanc')) {
      detectedCategory = 'Sauvignon Blanc';
    } else if (combinedText.includes('merlot')) {
      detectedCategory = 'Merlot';
    } else if (combinedText.includes('syrah') || combinedText.includes('shiraz')) {
      detectedCategory = 'Syrah';
    } else if (combinedText.includes('riesling')) {
      detectedCategory = 'Riesling';
    } else if (combinedText.includes('rosé') || combinedText.includes('rose')) {
      detectedCategory = 'Rosé';
    } else if (combinedText.includes('sparkling') || combinedText.includes('champagne') || combinedText.includes('brut') || combinedText.includes('prosecco') || combinedText.includes('franciacorta')) {
      detectedCategory = 'Sparkling';
    } else if (combinedText.includes('nebbiolo')) {
      detectedCategory = 'Red Wine'; // Nebbiolo is red
    } else if (combinedText.includes('sangiovese')) {
      detectedCategory = 'Red Wine'; // Sangiovese is red
    } else if (!detectedCategory || detectedCategory.trim().length < 2) {
      // If category is still not determined, try to infer from context
      if (producerLower.includes('burgundy') || wineNameLower.includes('bourgogne')) {
        detectedCategory = 'Pinot Noir'; // Default Burgundy red
      } else if (producerLower.includes('bordeaux') || wineNameLower.includes('bordeaux')) {
        detectedCategory = 'Cabernet Sauvignon'; // Default Bordeaux red
      } else if (combinedText.includes('barolo') || combinedText.includes('barbaresco')) {
        detectedCategory = 'Red Wine'; // Barolo/Barbaresco are Nebbiolo
      } else if (combinedText.includes('chianti') || combinedText.includes('brunello')) {
        detectedCategory = 'Red Wine'; // Chianti/Brunello are Sangiovese
      } else if (combinedText.includes('amarone')) {
        detectedCategory = 'Red Wine'; // Amarone is red
      } else {
        // Validate category before using it - reject if it looks like a wine name
        const categoryIsValid = category && 
          category.length < 50 && // Categories should be short
          !category.includes(',') && // Categories shouldn't have commas
          !category.match(/\b(19|20)\d{2}\b/) && // Categories shouldn't have vintages
          !category.match(/\b(DOCG?|DOC|AOC|IGT|AVA)\b/i) && // Categories shouldn't be appellations alone
          !category.toLowerCase().includes('chardonnay') && // Categories shouldn't be grape names alone
          !category.toLowerCase().includes('pinot noir') &&
          !category.toLowerCase().includes('tenuta') && // Categories shouldn't be producer names
          !category.toLowerCase().includes('fattoria');
        detectedCategory = categoryIsValid ? category : 'Wine'; // Use validated category or fallback
      }
    }
    
    // If producer is empty or too short, try to extract from wine name
    if (!producer || producer.length < 3) {
      // Some wine names have producer first (e.g., "CA 'DEL BOSCO, BRUT")
      const producerMatch = wineName.match(/^([A-Z'.\s]+),?\s+/);
      if (producerMatch && producerMatch[1].length > 2) {
        producer = producerMatch[1].trim();
        wineName = wineName.replace(producerMatch[0], '').trim();
      } else {
        producer = 'Unknown Producer';
      }
    }
    
    // Helper function to convert all caps to proper case
    const sanitizeText = (text: string): string => {
      if (!text || text.length < 2) return text;
      // Check if text is all caps (excluding common abbreviations)
      const isAllCaps = /^[A-Z\s.,'\-"()]+$/.test(text) && text === text.toUpperCase() && text.length > 3;
      if (isAllCaps) {
        // Convert to title case, preserving common wine terms
        return text.toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase())
          .replace(/\b(Mv|Nv|Cv|Brut|Rose|Rosé)\b/gi, (match) => match.toUpperCase())
          .replace(/\b(D'|L'|De|La|Le|Les|Du|Des|Del|Di|Da|Von|Van)\b/gi, (match) => match.toLowerCase());
      }
      return text;
    };

    return {
      wineName: sanitizeText(wineName) || 'Unknown Wine',
      producer: sanitizeText(producer) || 'Unknown Producer',
      vintage: vintage,
      servingStyle,
      category: sanitizeText(detectedCategory) || 'Wine',
      description: description ? sanitizeText(description) : undefined,
      grape: grapeText || undefined,
      region: expandedRegion || undefined,
    };
  }

  /**
   * Get wine recommendations for menu items
   */
  private static async getWineRecommendationsForMenu(
    menuItems: MenuItem[],
    options: MenuAnalysisOptions
  ): Promise<MenuAnalysisResult['wineRecommendations']> {
    const recommendations: MenuAnalysisResult['wineRecommendations'] = [];

    for (const menuItem of menuItems) {
      try {
        console.log(`Getting wine recommendations for: ${menuItem.name}`);
        
        // Create user preferences based on options
        const userPreferences: any = {
          budget: options.preferredPriceRange || 'moderate',
          // Add more preferences based on menu item analysis
        };

        // Get wine recommendations
        const wineResponse = await WineService.getWineRecommendations(
          menuItem.name,
          userPreferences
        );

        if (wineResponse && wineResponse.recommendations) {
          // Limit recommendations per item
          const limitedWines = wineResponse.recommendations.slice(
            0,
            options.maxRecommendationsPerItem || 2
          );

          recommendations.push({
            menuItem,
            wines: limitedWines,
          });
        }
      } catch (error: any) {
        console.error(`Failed to get wine recommendations for ${menuItem.name}:`, error);
        // Continue with other items even if one fails
      }
    }

    return recommendations;
  }

  /**
   * Take photo and analyze menu in one step
   */
  static async takePhotoAndAnalyze(
    options: MenuAnalysisOptions = {}
  ): Promise<MenuAnalysisResult> {
    try {
      // Take photo
      const photo = await CameraService.takePhoto();
      if (!photo) {
        throw new Error('Photo capture was cancelled');
      }

      // Analyze menu
      return await this.analyzeMenuFromPhoto(photo, options);
    } catch (error: any) {
      console.error('Take photo and analyze error:', error);
      throw new Error(`Photo capture and analysis failed: ${error.message}`);
    }
  }

  /**
   * Pick photo and analyze menu in one step
   */
  static async pickPhotoAndAnalyze(
    options: MenuAnalysisOptions = {}
  ): Promise<MenuAnalysisResult> {
    try {
      // Pick photo
      const photo = await CameraService.pickPhoto();
      if (!photo) {
        throw new Error('Photo selection was cancelled');
      }

      // Analyze menu
      return await this.analyzeMenuFromPhoto(photo, options);
    } catch (error: any) {
      console.error('Pick photo and analyze error:', error);
      throw new Error(`Photo selection and analysis failed: ${error.message}`);
    }
  }

  /**
   * Check if menu analysis service is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const ocrAvailable = OCRService.isAvailable();
      const cameraStatus = await CameraService.getStatus();
      
      return ocrAvailable && cameraStatus.cameraAvailable;
    } catch (error: any) {
      console.error('Service availability check error:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  static async getStatus(): Promise<{
    ocrAvailable: boolean;
    cameraAvailable: boolean;
    cameraPermission: boolean;
    mediaLibraryPermission: boolean;
    overallAvailable: boolean;
  }> {
    try {
      const ocrStatus = OCRService.getStatus();
      const cameraStatus = await CameraService.getStatus();
      
      return {
        ocrAvailable: ocrStatus.available,
        cameraAvailable: cameraStatus.cameraAvailable,
        cameraPermission: cameraStatus.cameraPermission.granted,
        mediaLibraryPermission: cameraStatus.mediaLibraryPermission,
        overallAvailable: ocrStatus.available && cameraStatus.cameraAvailable,
      };
    } catch (error: any) {
      console.error('Service status check error:', error);
      return {
        ocrAvailable: false,
        cameraAvailable: false,
        cameraPermission: false,
        mediaLibraryPermission: false,
        overallAvailable: false,
      };
    }
  }
}
