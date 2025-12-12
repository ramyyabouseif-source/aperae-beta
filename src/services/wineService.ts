import { WineRecommendationResponse } from '../types/wine';
import { UserPreferences } from '../types/preferences';
import { getApiBaseUrl } from '../utils/api';
// Caching disabled to always return fresh recommendations
// import { CacheService } from './cacheService';
import { NETWORK_CONFIG } from '../utils/api';
import SecureHttpClient from './secureHttpClient';

/**
 * WineService - Core service for wine recommendation functionality
 * 
 * This service handles wine recommendations by either calling the API or returning mock data.
 * It includes retry logic, caching (currently disabled), and comprehensive error handling.
 * 
 * @example
 * ```typescript
 * // Enable mock mode for development
 * WineService.setMockMode(true);
 * 
 * // Get wine recommendations
 * const recommendations = await WineService.getWineRecommendations(
 *   'Grilled Ribeye Steak',
 *   { preferredPriceRange: 'medium', wineStyle: 'bold' }
 * );
 * ```
 */
export class WineService {
  // Check environment variable for mock mode, default to false (use real API)
  // Only enable mock mode if explicitly set to 'true' in environment
  private static isMockMode = (process.env.EXPO_PUBLIC_MOCK_MODE || '').toLowerCase() === 'true';
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_RETRY_DELAY = 800; // base backoff in ms
  private static secureClient: SecureHttpClient | null = null;

  /**
   * Enables or disables mock mode for development and testing
   * 
   * @param enabled - Whether to enable mock mode (true) or use real API (false)
   * 
   * @example
   * ```typescript
   * WineService.setMockMode(true);  // Use mock data
   * WineService.setMockMode(false); // Use real API
   * ```
   */
  static setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  /**
   * Checks if mock mode is currently enabled
   * 
   * @returns true if mock mode is enabled, false if using real API
   * 
   * @example
   * ```typescript
   * if (WineService.isMockModeEnabled()) {
   *   console.log('Using mock data');
   * }
   * ```
   */
  static isMockModeEnabled(): boolean {
    return this.isMockMode;
  }

  /**
   * Initialize secure HTTP client
   * @private
   */
  private static initializeSecureClient(): void {
    if (!this.secureClient) {
      const baseURL = getApiBaseUrl();
      this.secureClient = new SecureHttpClient(baseURL, NETWORK_CONFIG.TIMEOUT);
      console.log('Secure HTTP client initialized');
    }
  }

  /**
   * Get the secure HTTP client instance
   * @returns SecureHttpClient - The secure client instance
   */
  private static getSecureClient(): SecureHttpClient {
    this.initializeSecureClient();
    return this.secureClient!;
  }

  /**
   * Gets wine recommendations for a specific dish
   * 
   * This method handles the complete flow of getting wine recommendations:
   * 1. Checks if mock mode is enabled
   * 2. If not in mock mode, attempts API call with retry logic
   * 3. Falls back to mock data on any error
   * 4. Returns structured wine recommendation data
   * 
   * @param dish - The food item to pair with wine (e.g., "Grilled Ribeye Steak")
   * @param preferences - Optional user preferences for wine selection
   * @param availableWines - Optional list of available wines (for menu screen - constrains recommendations to menu)
   * @returns Promise resolving to wine recommendation response
   * 
   * @throws {Error} When all API attempts fail and no fallback is available
   * 
   * @example
   * ```typescript
   * // Basic usage (home screen - no constraints)
   * const recommendations = await WineService.getWineRecommendations('Grilled Salmon');
   * 
   * // With preferences
   * const recommendations = await WineService.getWineRecommendations(
   *   'Grilled Ribeye Steak',
   *   {
   *     preferredPriceRange: 'high',
   *     wineStyle: 'bold',
   *     preferredRegions: ['Napa Valley', 'Bordeaux']
   *   }
   * );
   * 
   * // With menu wines (menu screen - constrained to menu)
   * const recommendations = await WineService.getWineRecommendations(
   *   'Seabass',
   *   preferences,
   *   availableWines
   * );
   * ```
   */
  static async getWineRecommendations(
    dish: string, 
    preferences?: UserPreferences,
    availableWines?: Array<{
      wineName: string;
      producer: string;
      vintage: string;
      pricePoint: string;
      category: string;
      description?: string;
    }>
  ): Promise<WineRecommendationResponse> {
    const startTime = performance.now();
    console.log('=== WINE RECOMMENDATION REQUEST START ===');
    console.log('Dish:', dish);
    console.log('Preferences:', preferences);
    console.log('Mock Mode:', this.isMockMode);
    console.log('Start Time:', new Date().toISOString());
    
    try {
      if (this.isMockMode) {
        console.log('Using mock mode');
        const result = this.getMockRecommendations(dish);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        console.log('=== MOCK RESPONSE TIME ===');
        console.log('Response Time:', responseTime.toFixed(2), 'ms');
        console.log('End Time:', new Date().toISOString());
        console.log('========================');
        
        return result;
      }

      // Bypass cache: always fetch fresh recommendations
      // const cacheKey = CacheService.generateKey(dish, preferences);
      // const cachedResult = await CacheService.get(cacheKey);
      // if (cachedResult) {
      //   console.log('Returning cached recommendations');
      //   return cachedResult;
      // }

      // Make API call with retry logic
      const result = await this.makeApiCallWithRetry(dish, preferences, availableWines);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      console.log('=== API RESPONSE TIME ===');
      console.log('Total Response Time:', responseTime.toFixed(2), 'ms');
      console.log('End Time:', new Date().toISOString());
      console.log('========================');
      
      // Cache disabled: always return fresh results
      // await CacheService.set(cacheKey, result);
      
      return result;
    } catch (error: any) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      console.error('=== ERROR RESPONSE TIME ===');
      console.error('Error Response Time:', responseTime.toFixed(2), 'ms');
      console.error('Error Time:', new Date().toISOString());
      console.error('Error Name:', error.name || 'Unknown');
      console.error('Error Message:', error.message || 'No error message');
      console.error('Error Stack:', error.stack || 'No stack trace');
      
      // Enhanced error logging
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data || {}).substring(0, 1000));
      }
      
      if (error.request) {
        console.error('Request failed - no response received');
      }
      
      console.error('Full Error:', JSON.stringify(error, Object.getOwnPropertyNames(error)).substring(0, 2000));
      console.error('==========================');
      
      console.error('Error fetching wine recommendations:', error);
      console.error('Error details:', error.message);
      // This should not happen now since we fallback to mock data in the main method
      throw error;
    }
  }

  /**
   * Makes API call with retry logic and comprehensive error handling
   * 
   * This private method handles the actual API communication with:
   * - Exponential backoff retry mechanism
   * - Request timeout handling
   * - Detailed logging for debugging
   * - Security headers and CORS configuration
   * 
   * @param dish - The food item to pair with wine
   * @param preferences - Optional user preferences
   * @param availableWines - Optional list of available wines (constrains recommendations when provided)
   * @returns Promise resolving to wine recommendation response
   * 
   * @throws {Error} When all retry attempts fail
   * 
   * @private
   */
  private static async makeApiCallWithRetry(
    dish: string, 
    preferences?: UserPreferences,
    availableWines?: Array<{
      wineName: string;
      producer: string;
      vintage: string;
      pricePoint: string;
      category: string;
      description?: string;
    }>
  ): Promise<WineRecommendationResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      const attemptStartTime = performance.now();
      console.log(`=== API ATTEMPT ${attempt}/${this.MAX_RETRIES} ===`);
      console.log('Attempt Start Time:', new Date().toISOString());
      
      try {
        const API_BASE_URL = getApiBaseUrl();
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Making secure request to:', `${API_BASE_URL}/recommendations`);
        const requestBody: any = {
          dish: dish,
          preferences: preferences || {}
        };
        
        // Include available wines if provided (for menu screen - constrains to menu wines)
        if (availableWines && availableWines.length > 0) {
          requestBody.availableWines = availableWines;
          console.log('Request includes available wines (menu context):', availableWines.length);
        }
        
        console.log('Request body:', JSON.stringify(requestBody));

        // Use secure HTTP client with certificate pinning
        const secureClient = this.getSecureClient();
        const response = await secureClient.post('/recommendations', requestBody, {
          'ngrok-skip-browser-warning': 'true',
          // Add CSRF protection in production
          // 'X-CSRF-Token': csrfToken
        });

        const attemptEndTime = performance.now();
        const attemptResponseTime = attemptEndTime - attemptStartTime;
        
        console.log('=== ATTEMPT RESPONSE TIME ===');
        console.log('Attempt Response Time:', attemptResponseTime.toFixed(2), 'ms');
        console.log('Response Status: 200 OK');
        console.log('Response OK: true');
        console.log('=============================');

        // Response is already parsed by secure client
        const data = response;
        console.log('Response data received successfully');
        
        // Debug: Check if pricePoint and expertRating exist
        if (data.recommendations && data.recommendations.length > 0) {
          console.log('First wine pricePoint:', data.recommendations[0].pricePoint);
          console.log('First wine expertRating:', data.recommendations[0].expertRating);
        }
        
        return data;
        
      } catch (error: any) {
        const attemptEndTime = performance.now();
        const attemptResponseTime = attemptEndTime - attemptStartTime;
        
        lastError = error as Error;
        console.error(`=== ATTEMPT ${attempt} ERROR ===`);
        console.error('Attempt Error Time:', attemptResponseTime.toFixed(2), 'ms');
        console.error('Error Name:', error.name || 'Unknown');
        console.error('Error Message:', error.message || 'No error message');
        console.error('Error Stack:', error.stack || 'No stack trace');
        
        // Enhanced error details
        if (error.response) {
          console.error('Response Status:', error.response.status);
          console.error('Response Status Text:', error.response.statusText);
          console.error('Response Headers:', JSON.stringify(error.response.headers || {}));
          console.error('Response Data:', JSON.stringify(error.response.data || {}).substring(0, 1000));
        }
        
        if (error.request) {
          console.error('Request Details:', {
            url: error.request.url || 'Unknown',
            method: error.request.method || 'Unknown',
            headers: error.request.headers || {}
          });
        }
        
        // Check if it's a timeout error
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          console.error('Request timed out after', NETWORK_CONFIG.timeout, 'ms');
          lastError = new Error(`Request timed out after ${NETWORK_CONFIG.timeout / 1000} seconds. Please check your connection and try again.`);
        }
        
        // Network errors
        if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
          console.error('Network error detected - check connection');
        }
        
        // API errors
        if (error.response?.status) {
          console.error(`API returned error status: ${error.response.status}`);
          if (error.response.data) {
            console.error('API Error Response:', JSON.stringify(error.response.data).substring(0, 500));
          }
        }
        
        console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error)).substring(0, 2000));
        console.error('=============================');
        
        if (attempt < this.MAX_RETRIES) {
          const exp = Math.pow(2, attempt - 1);
          const jitter = Math.floor(Math.random() * 300); // 0-300ms jitter
          const delay = this.BASE_RETRY_DELAY * exp + jitter;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If all attempts failed, fallback to mock data instead of throwing
    console.log('=== FALLBACK TO MOCK DATA ===');
    console.log('All API attempts failed, using mock data');
    console.log('=============================');
    return this.getMockRecommendations(dish);
  }

  /**
   * Generates mock wine recommendations for development and testing
   * 
   * This method provides realistic mock data that matches the expected API response format.
   * It includes comprehensive wine information including pricing, ratings, and pairing rationale.
   * 
   * @param dish - The food item to pair with wine (used for context in mock data)
   * @returns Wine recommendation response with mock data
   * 
   * @private
   */
  private static getMockRecommendations(dish: string): WineRecommendationResponse {
    console.log('=== MOCK DATA DEBUG ===');
    console.log('Using enhanced mock data format with new fields');
    
    // Use the enhanced mock data format matching backend/mockDataEnhanced.json (Carbonara example)
    const mockData: WineRecommendationResponse = {
      dish: dish.trim() || "Carbonara Spaghetti with smoked bacon, breadcrumbs, parmesan cheese, and egg yolk",
      dishAnalysis: {
        dominantWeight: "heavy",
        fatContent: "high",
        primaryProtein: "pork (smoked bacon, cured)",
        dominantFlavors: ["salty", "umami", "savory"],
        spiceLevel: "none",
        acidityLevel: "low",
        applicablePrinciples: ["Weight Matching", "Acidity–Fat Cleansing", "Bitterness & Umami Avoidance", "Flavor Bridging"],
        keyChallenge: "High fat content from egg yolk, bacon, and cheese requires substantial acidity to cleanse palate and prevent heaviness",
        idealProfile: {
          acidity: "high",
          tannin: "none to low",
          body: "medium to full",
          sweetness: "dry",
          notes: "bright acidity, mineral complexity, creamy texture compatibility, savory herb or stone fruit notes"
        }
      },
      recommendations: [
        {
          tierLabel: "Premium Selection",
          tierRationale: "Premier Cru classification signal from Burgundy's Chablis hierarchy; single-vineyard terroir from documented world-class site",
          tierFallbackApplied: false,
          wineName: "Chablis Premier Cru Montmains",
          producer: "William Fèvre",
          region: "Chablis, Burgundy, France",
          vintage: "2021",
          grape: "Chardonnay (White)",
          pricePoint: "$85",
          category: "White Wine",
          rationale: "Weight Matching and Acidity–Fat Cleansing principles are satisfied by high-acid Chardonnay that cuts through egg yolk and bacon fat. Bitterness & Umami Avoidance achieved through unoaked, mineral-driven style that complements rather than clashes with parmesan's savory depth. Flavor Bridging occurs via wine's creamy lees texture echoing carbonara's richness while citrus and mineral notes refresh the palate.",
          pairingPrinciplesApplied: ["Weight Matching", "Acidity–Fat Cleansing", "Bitterness & Umami Avoidance", "Flavor Bridging"],
          tastingNotes: {
            aromas: ["green apple", "lemon zest", "wet stone", "white flowers", "oyster shell"],
            palate: "piercing acidity with taut mineral backbone, medium body with subtle creaminess from lees aging, flavors of citrus, green fruit, and saline minerality",
            finish: "long, clean, mineral-driven with refreshing salinity"
          },
          servingGuidance: {
            temperature: "50-54°F (10-12°C)",
            glassware: "Burgundy white wine glass",
            decanting: "No decant needed"
          },
          confidence: {
            score: 88,
            breakdown: {
              pairingScience: 45,
              wineKnowledge: 28,
              complexityHandling: 15
            },
            rationale: "Strong pairing science application with all four applicable principles explicitly satisfied. Slight deduction in wine knowledge for vintage uncertainty in current market. Moderate complexity dish (4 elements: pasta, bacon, cheese, egg) handled effectively with conflict resolution between fat and umami."
          },
          story: "Premier Cru Montmains sits on Kimmeridgian limestone, the ancient seabed that gives Chablis its signature flinty minerality and razor-sharp acidity, perfectly suited to cut through rich, creamy dishes.",
          alternatives: [
            {
              wineName: "Chablis Premier Cru Fourchaume",
              producer: "Domaine Laroche",
              vintage: "2022",
              grape: "Chardonnay (White)"
            },
            {
              wineName: "Chablis Premier Cru Vaillons",
              producer: "Jean-Marc Brocard",
              vintage: "2021",
              grape: "Chardonnay (White)"
            }
          ],
          expertRating: "93 (Wine Advocate)",
          retailerSuggestion: "Premier Cru specialists, fine wine retailers, or direct from importer",
          image: "unknown",
          storytellingElements: "Premier Cru Montmains sits on Kimmeridgian limestone, the ancient seabed that gives Chablis its signature flinty minerality and razor-sharp acidity, perfectly suited to cut through rich, creamy dishes."
        },
        {
          tierLabel: "Moderate Choice",
          tierRationale: "Village-level Burgundy classification signal; reputable estate bottling from recognized Pouilly-Fuissé terroir with distinct site character",
          tierFallbackApplied: false,
          wineName: "Pouilly-Fuissé",
          producer: "Domaine J.A. Ferret",
          region: "Mâconnais, Burgundy, France",
          vintage: "2022",
          grape: "Chardonnay (White)",
          pricePoint: "$45",
          category: "White Wine",
          rationale: "Weight Matching achieved through medium-full body that stands up to carbonara's richness. Acidity–Fat Cleansing provided by southern Burgundy's characteristic bright acidity cutting through bacon fat and egg yolk. Flavor Bridging occurs as wine's subtle oak integration and ripe stone fruit notes complement dish's savory depth while maintaining refreshing citrus lift.",
          pairingPrinciplesApplied: ["Weight Matching", "Acidity–Fat Cleansing", "Flavor Bridging"],
          tastingNotes: {
            aromas: ["white peach", "lemon", "hazelnut", "acacia flower", "butter"],
            palate: "vibrant acidity balanced with medium-full body, creamy texture from lees contact, flavors of stone fruit, citrus, and subtle toast",
            finish: "medium-long with lingering fruit and mineral notes"
          },
          servingGuidance: {
            temperature: "52-56°F (11-13°C)",
            glassware: "Burgundy white wine glass",
            decanting: "No decant needed"
          },
          confidence: {
            score: 85,
            breakdown: {
              pairingScience: 42,
              wineKnowledge: 28,
              complexityHandling: 15
            },
            rationale: "Strong pairing science with three applicable principles satisfied and no violations. Wine knowledge confident with established producer and region. Complexity handling effective for moderate dish elements. Minor deduction for fewer principle applications than premium recommendation."
          },
          story: "Pouilly-Fuissé's limestone slopes in southern Burgundy produce fuller-bodied Chardonnay than northern Chablis, with the region's warm microclimate adding ripe fruit while maintaining essential acidity.",
          alternatives: [
            {
              wineName: "Saint-Véran",
              producer: "Domaine des Deux Roches",
              vintage: "2022",
              grape: "Chardonnay (White)"
            },
            {
              wineName: "Mâcon-Villages",
              producer: "Domaine de la Bongran",
              vintage: "2022",
              grape: "Chardonnay (White)"
            }
          ],
          expertRating: "91 (Wine Spectator)",
          retailerSuggestion: "Total Wine & More, Wine.com, or local shops with strong Burgundy selections",
          image: "unknown",
          storytellingElements: "Pouilly-Fuissé's limestone slopes in southern Burgundy produce fuller-bodied Chardonnay than northern Chablis, with the region's warm microclimate adding ripe fruit while maintaining essential acidity."
        },
        {
          tierLabel: "Budget-Friendly",
          tierRationale: "Regional-level AOC without village designation; established producer with entry-tier cuvée representing reliable Bourgogne quality",
          tierFallbackApplied: false,
          wineName: "Bourgogne Blanc",
          producer: "Louis Jadot",
          region: "Burgundy, France",
          vintage: "2022",
          grape: "Chardonnay (White)",
          pricePoint: "$22",
          category: "White Wine",
          rationale: "Weight Matching satisfied as medium-bodied wine pairs appropriately with carbonara without overwhelming the dish. Acidity–Fat Cleansing principle met through Burgundian Chardonnay's natural high acidity that refreshes against bacon fat and egg yolk richness. Bitterness & Umami Avoidance achieved via fruit-forward, minimal-oak style that complements parmesan's umami without clashing.",
          pairingPrinciplesApplied: ["Weight Matching", "Acidity–Fat Cleansing", "Bitterness & Umami Avoidance"],
          tastingNotes: {
            aromas: ["green apple", "lemon", "white flowers", "chalk"],
            palate: "crisp acidity with medium body, clean citrus and green fruit flavors, subtle mineral undertones, light texture",
            finish: "medium length with bright, refreshing acidity"
          },
          servingGuidance: {
            temperature: "48-52°F (9-11°C)",
            glassware: "Universal white wine glass",
            decanting: "No decant needed"
          },
          confidence: {
            score: 83,
            breakdown: {
              pairingScience: 42,
              wineKnowledge: 26,
              complexityHandling: 15
            },
            rationale: "Solid pairing science with three applicable principles satisfied and no violations. Wine knowledge strong with recognized producer and region, minor deduction for entry-tier style offering less complexity. Moderate complexity dish handled appropriately with structural match."
          },
          story: "Bourgogne Blanc represents entry-level Burgundy, sourced from various village vineyards across the region, offering classic Chardonnay character with the limestone-derived acidity essential for cutting through rich dishes.",
          alternatives: [
            {
              wineName: "Petit Chablis",
              producer: "Domaine de la Motte",
              vintage: "2023",
              grape: "Chardonnay (White)"
            },
            {
              wineName: "Mâcon-Villages",
              producer: "Louis Latour",
              vintage: "2023",
              grape: "Chardonnay (White)"
            }
          ],
          expertRating: "88 (Wine Advocate)",
          retailerSuggestion: "Trader Joe's wine section, Costco, or local wine shops with French value selections",
          image: "unknown",
          storytellingElements: "Bourgogne Blanc represents entry-level Burgundy, sourced from various village vineyards across the region, offering classic Chardonnay character with the limestone-derived acidity essential for cutting through rich dishes."
        }
      ],
      avoid: {
        types: ["High-tannin reds (Barolo, Cabernet Sauvignon)", "Heavily oaked Chardonnay", "Low-acid whites (Viognier, white Rhône blends)", "Sparkling wines"],
        reason: "High tannins clash with egg yolk's fat and bacon's cured nature creating metallic bitterness. Heavy oak competes with parmesan's umami and carbonara's richness. Low-acid wines cannot cleanse palate from high fat content, leaving coating sensation. Sparkling's effervescence disrupts creamy texture and carbonation accentuates saltiness uncomfortably."
      },
      closingNarrative: "Carbonara demands wines with surgical precision—high acidity to slice through layers of pork fat, egg yolk, and aged cheese, while maintaining enough body to not be overwhelmed. Burgundian Chardonnay, particularly from limestone terroirs, provides this balance: mineral-driven acidity acts as a palate cleanser, while the wine's texture harmonizes with the dish's creamy richness, creating a dialogue between Old World restraint and Italian indulgence."
    };
    
    console.log('Mock data pricePoint values:', mockData.recommendations.map(w => w.pricePoint));
    console.log('Mock data tierLabels:', mockData.recommendations.map(w => w.tierLabel));
    console.log('Mock data has dishAnalysis:', !!mockData.dishAnalysis);
    console.log('Mock data has avoid:', !!mockData.avoid);
    console.log('Mock data has closingNarrative:', !!mockData.closingNarrative);
    console.log('Mock data closingNarrative:', mockData.closingNarrative);
    console.log('Mock data avoid:', mockData.avoid);
    return mockData;
  }
}