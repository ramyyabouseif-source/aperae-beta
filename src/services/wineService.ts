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
  private static isMockMode = true;
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
   * @returns Promise resolving to wine recommendation response
   * 
   * @throws {Error} When all API attempts fail and no fallback is available
   * 
   * @example
   * ```typescript
   * // Basic usage
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
   * ```
   */
  static async getWineRecommendations(
    dish: string, 
    preferences?: UserPreferences
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
      const result = await this.makeApiCallWithRetry(dish, preferences);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      console.log('=== API RESPONSE TIME ===');
      console.log('Total Response Time:', responseTime.toFixed(2), 'ms');
      console.log('End Time:', new Date().toISOString());
      console.log('========================');
      
      // Cache disabled: always return fresh results
      // await CacheService.set(cacheKey, result);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      console.error('=== ERROR RESPONSE TIME ===');
      console.error('Error Response Time:', responseTime.toFixed(2), 'ms');
      console.error('Error Time:', new Date().toISOString());
      console.error('Error:', error.message);
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
   * @returns Promise resolving to wine recommendation response
   * 
   * @throws {Error} When all retry attempts fail
   * 
   * @private
   */
  private static async makeApiCallWithRetry(
    dish: string, 
    preferences?: UserPreferences
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
        console.log('Request body:', JSON.stringify({ dish, preferences }));

        // Use secure HTTP client with certificate pinning
        const secureClient = this.getSecureClient();
        const response = await secureClient.post('/recommendations', {
          dish: dish,
          preferences: preferences || {}
        }, {
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
        
      } catch (error) {
        const attemptEndTime = performance.now();
        const attemptResponseTime = attemptEndTime - attemptStartTime;
        
        lastError = error as Error;
        console.error(`=== ATTEMPT ${attempt} ERROR ===`);
        console.error('Attempt Error Time:', attemptResponseTime.toFixed(2), 'ms');
        console.error('Error:', error.message);
        
        // Check if it's a timeout error
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          console.error('Request timed out after', NETWORK_CONFIG.timeout, 'ms');
          lastError = new Error(`Request timed out after ${NETWORK_CONFIG.timeout / 1000} seconds. Please check your connection and try again.`);
        }
        
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
    console.log('This should show the NEW mock data with $145, $59, $40');
    
    const mockData: WineRecommendationResponse = {
      dish: dish,
      recommendations: [
        {
          wineName: "Château Léoville Barton",
          producer: "Léoville Barton",
          vintage: "2016",
          pricePoint: "$145",
          rationale: "The ribeye's marbling and char demand a structured Bordeaux with balance between tannins and freshness. This wine's power complements the richness while its acidity cuts through the fat.",
          tastingNotes: "Aromas of cassis, cedar, and graphite. On the palate, concentrated dark fruits, firm tannins, and a long, savory finish with tobacco and spice.",
          servingGuidance: "Serve at 60–62°F in a Bordeaux glass to allow full aeration.",
          confidenceScore: 98,
          expertRating: "97 (Wine Spectator)",
          retailerSuggestion: "Berry Bros. & Rudd (UK), Wine.com (US)",
          image: "https://example.com/leoville-barton-2016.jpg",
          storytellingElements: "Léoville Barton, a historic 1855 Second Growth, embodies Saint-Julien's elegance and power. This vintage reflects the estate's centuries of winemaking, perfect for celebratory steak dinners."
        },
        {
          wineName: "Ridge Vineyards 'Lytton Springs'",
          producer: "Ridge Vineyards",
          vintage: "2019",
          pricePoint: "$59",
          rationale: "Zinfandel's fruit-forward energy and subtle spice balance the ribeye's boldness while adding an approachable, distinctly Californian twist.",
          tastingNotes: "Ripe blackberry, raspberry compote, and black pepper. Medium-plus body with lively acidity, framed by supple tannins and a lingering finish.",
          servingGuidance: "Serve slightly cooler than room temperature (58–60°F) in a universal red wine glass.",
          confidenceScore: 95,
          expertRating: "94 (Wine Spectator)",
          retailerSuggestion: "K&L Wines, Total Wine & More",
          image: "https://example.com/ridge-lytton-2019.jpg",
          storytellingElements: "Ridge has championed old-vine Zinfandel since the 1960s. Lytton Springs comes from gnarly 100-year-old vines, offering a piece of California history in every bottle."
        },
        {
          wineName: "Catena Zapata 'Catena Alta'",
          producer: "Catena Zapata",
          vintage: "2020",
          pricePoint: "$40",
          rationale: "Malbec's plush fruit and smoky undertones harmonize with grilled ribeye, bringing balance between dark fruit and char.",
          tastingNotes: "Notes of plum, violet, and cocoa. Juicy mid-palate with soft tannins, finishing with spice and mineral lift from high-altitude vineyards.",
          servingGuidance: "Serve at 60°F in a Malbec or Bordeaux-style glass.",
          confidenceScore: 92,
          expertRating: "93 (James Suckling)",
          retailerSuggestion: "Wine.com, Vivino Marketplace",
          image: "https://example.com/catena-alta-2020.jpg",
          storytellingElements: "The Catena family revolutionized Argentine winemaking through high-altitude viticulture, producing wines of remarkable purity and energy."
        }
      ]
    };
    
    console.log('Mock data pricePoint values:', mockData.recommendations.map(w => w.pricePoint));
    return mockData;
  }
}