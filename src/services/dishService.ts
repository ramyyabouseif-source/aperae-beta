/**
 * DishService - Service for dish recommendation functionality (wine-to-dish pairing)
 * 
 * This service handles dish recommendations by either calling the API or returning mock data.
 * It includes retry logic and comprehensive error handling.
 * 
 * @example
 * ```typescript
 * // Enable mock mode for development
 * DishService.setMockMode(true);
 * 
 * // Get dish recommendations for a wine
 * const recommendations = await DishService.getDishRecommendations(
 *   '2016 Clos de Oro Malbec Reserva'
 * );
 * ```
 */

import { getApiBaseUrl } from '../utils/api';
import type {
  DishRecommendation,
  WineAnalysis,
  WineServingGuidance,
  DishRecommendationResponse
} from '../types/dish';
import { NETWORK_CONFIG } from '../utils/api';
import SecureHttpClient from './secureHttpClient';

export class DishService {
  // Check environment variable for mock mode, default to false (use real API)
  private static isMockMode = (process.env.EXPO_PUBLIC_MOCK_MODE || '').toLowerCase() === 'true';
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_RETRY_DELAY = 800; // base backoff in ms
  private static secureClient: SecureHttpClient | null = null;

  /**
   * Enables or disables mock mode for development and testing
   * 
   * @param enabled - Whether to enable mock mode (true) or use real API (false)
   */
  static setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  /**
   * Checks if mock mode is currently enabled
   * 
   * @returns true if mock mode is enabled, false otherwise
   */
  static isMockModeEnabled(): boolean {
    return this.isMockMode;
  }

  /**
   * Gets or creates the secure HTTP client instance
   * 
   * @returns SecureHttpClient instance
   * @private
   */
  private static getSecureClient(): SecureHttpClient {
    if (!this.secureClient) {
      const API_BASE_URL = getApiBaseUrl();
      this.secureClient = new SecureHttpClient(API_BASE_URL, NETWORK_CONFIG.timeout);
    }
    return this.secureClient;
  }

  /**
   * Gets dish recommendations for a specific wine
   * 
   * This method handles the complete flow of getting dish recommendations:
   * 1. Checks if mock mode is enabled
   * 2. If not in mock mode, attempts API call with retry logic
   * 3. Falls back to mock data on any error
   * 4. Returns structured dish recommendation data
   * 
   * @param wine - The wine to pair with dishes (e.g., "2016 Clos de Oro Malbec Reserva")
   * @returns Promise resolving to dish recommendation response
   * 
   * @throws {Error} When all API attempts fail and no fallback is available
   * 
   * @example
   * ```typescript
   * // Basic usage
   * const recommendations = await DishService.getDishRecommendations('2016 Clos de Oro Malbec Reserva');
   * ```
   */
  static async getDishRecommendations(
    wine: string
  ): Promise<DishRecommendationResponse> {
    const startTime = performance.now();
    console.log('=== DISH RECOMMENDATION REQUEST START ===');
    console.log('Wine:', wine);
    console.log('Mock Mode:', this.isMockMode);
    console.log('Start Time:', new Date().toISOString());
    
    try {
      if (this.isMockMode) {
        console.log('Using mock mode');
        const result = this.getMockRecommendations(wine);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        console.log('=== MOCK RESPONSE TIME ===');
        console.log('Response Time:', responseTime.toFixed(2), 'ms');
        console.log('End Time:', new Date().toISOString());
        console.log('========================');
        
        return result;
      }

      // Make API call with retry logic
      const result = await this.makeApiCallWithRetry(wine);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      console.log('=== API RESPONSE TIME ===');
      console.log('Response Time:', responseTime.toFixed(2), 'ms');
      console.log('End Time:', new Date().toISOString());
      console.log('========================');
      
      return result;
      
    } catch (error: any) {
      console.error('=== ERROR IN DISH RECOMMENDATION ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      return this.getMockRecommendations(wine);
    }
  }

  /**
   * Makes API call with retry logic and comprehensive error handling
   * 
   * @param wine - The wine to get dish recommendations for
   * @returns Promise resolving to dish recommendation response
   * 
   * @throws {Error} When all retry attempts fail
   * 
   * @private
   */
  private static async makeApiCallWithRetry(
    wine: string
  ): Promise<DishRecommendationResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      const attemptStartTime = performance.now();
      console.log(`=== API ATTEMPT ${attempt}/${this.MAX_RETRIES} ===`);
      console.log('Attempt Start Time:', new Date().toISOString());
      
      try {
        const API_BASE_URL = getApiBaseUrl();
        console.log('API_BASE_URL:', API_BASE_URL);
        console.log('Making secure request to:', `${API_BASE_URL}/dish-recommendations`);
        const requestBody = {
          wine: wine
        };
        
        console.log('Request body:', JSON.stringify(requestBody));

        // Use secure HTTP client
        const secureClient = this.getSecureClient();
        const response = await secureClient.post('/dish-recommendations', requestBody, {
          'ngrok-skip-browser-warning': 'true',
        });

        const attemptEndTime = performance.now();
        const attemptResponseTime = attemptEndTime - attemptStartTime;
        
        console.log('=== ATTEMPT RESPONSE TIME ===');
        console.log('Attempt Response Time:', attemptResponseTime.toFixed(2), 'ms');
        console.log('Response Status: 200 OK');
        console.log('=============================');

        // Response is already parsed by secure client
        const data = response;
        console.log('Response data received successfully');
        
        return data;
        
      } catch (error: any) {
        const attemptEndTime = performance.now();
        const attemptResponseTime = attemptEndTime - attemptStartTime;
        
        lastError = error;
        console.error(`=== ATTEMPT ${attempt} FAILED ===`);
        console.error('Attempt Response Time:', attemptResponseTime.toFixed(2), 'ms');
        console.error('Error:', error.message);
        
        // If this is not the last attempt, wait before retrying
        if (attempt < this.MAX_RETRIES) {
          const delay = this.BASE_RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All attempts failed
    console.error('All API attempts failed, throwing error');
    throw lastError || new Error('Failed to get dish recommendations after all retries');
  }

  /**
   * Generates mock dish recommendations for development and testing
   * 
   * This returns a standardized mock response that matches the API structure.
   * Used for development, testing, and as a fallback when API calls fail.
   * 
   * @param wine - The wine name (used for logging, but returns same mock data)
   * @returns Mock dish recommendation response
   * 
   * @private
   */
  private static getMockRecommendations(wine: string): DishRecommendationResponse {
    console.log('Generating mock dish recommendations for wine:', wine);
    
    // Return the mock data structure matching the provided example
    const mockData: DishRecommendationResponse = {
      wine: "2016 Clos de Oro Malbec Reserva",
      wineAnalysis: {
        producer: "unknown",
        region: "unknown",
        vintage: "2016",
        vintageAge: "9 years",
        color: "red",
        structure: {
          body: "medium-full",
          acidity: "medium",
          acidType: "balanced",
          tannin: "medium",
          tanninCharacter: "polished",
          sweetness: "dry",
          abv: "14.5%"
        },
        aromaticProfile: {
          primaryAromas: ["blackberry", "plum", "dark cherry"],
          secondaryAromas: ["vanilla", "toast", "cocoa"],
          tertiaryAromas: ["leather", "dried herbs"],
          dominantCompounds: []
        },
        keyStrength: "This mid-aged Malbec offers polished, integrated tannins that bind moderately fatty proteins without astringency. The 9-year age has softened the tannic structure and developed tertiary complexity (leather, herbs) while maintaining fruit core. Medium body and balanced acidity allow versatility with moderately rich preparations without overwhelming dishes.",
        idealDishProfile: "Requires moderate-protein dishes with moderate fat—duck, pork, lamb, or grilled chicken thigh work well. The polished tannins and medium body suit roasted or grilled preparations with light to moderate sauces. Aged tertiary notes accommodate earthy ingredients like mushrooms without tannin-umami clash due to mid-age polymerization."
      },
      wineServingGuidance: {
        temperature: "58-62°F (14-17°C)",
        glassware: "Bordeaux or Universal red wine glass",
        decanting: "30 minutes recommended to open tertiary notes"
      },
      dishRecommendations: [
        {
          complexityLabel: "Complex Pairing",
          dishName: "Duck Breast with Blackberry-Port Reduction and Roasted Fingerling Potatoes",
          pairingRationale: "Congruent: duck's moderate fat and protein match medium tannins perfectly (Tannin-Protein, Weight Match). Blackberry reduction mirrors wine's dark fruit aromatics (Tier 2 bridge). Mid-aged tertiary notes complement caramelized duck skin and roasted elements.",
          pairingPrinciplesApplied: ["Tannin-Protein Binding", "Weight Matching", "Aromatic Family Bridge"],
          ingredients: {
            protein: [
              "2 duck breasts (8 oz each, skin-on)",
              "Salt and black pepper"
            ],
            sauce: [
              "1 cup fresh blackberries",
              "1/2 cup ruby port",
              "1/4 cup chicken stock",
              "2 tbsp honey",
              "1 tbsp butter",
              "1 tsp fresh thyme leaves"
            ],
            sides: [
              "1 lb fingerling potatoes, halved",
              "2 tbsp olive oil",
              "3 cloves garlic, smashed",
              "2 sprigs fresh rosemary"
            ]
          },
          recipe: [
            "Step 1: Preheat oven to 400°F. Toss potatoes with olive oil, garlic, rosemary, salt, and pepper. Roast 30-35 minutes until golden and crispy.",
            "Step 2: Score duck skin in crosshatch pattern. Season both sides generously with salt and pepper.",
            "Step 3: Place duck breasts skin-side down in cold skillet. Turn heat to medium and render fat 8-10 minutes until skin is deep golden and crispy. Flip and cook 3-4 minutes for medium-rare (135°F internal). Rest 8 minutes.",
            "Step 4: Make sauce: In same pan, add blackberries, port, stock, honey, and thyme. Simmer 8-10 minutes until reduced by half and syrupy. Strain through fine-mesh sieve, pressing berries. Whisk in butter off heat.",
            "Step 5: Slice duck breasts on bias. Plate with roasted potatoes, drizzle blackberry reduction over duck."
          ],
          cookTime: {
            prep: "15 minutes",
            cook: "45 minutes",
            total: "60 minutes"
          },
          servingSuggestion: "Garnish with fresh thyme sprigs and a few whole blackberries for visual appeal.",
          confidence: {
            score: 92,
            breakdown: {
              pairingScience: 47,
              wineKnowledge: 25,
              recipeQuality: 20
            },
            rationale: "Excellent structural compatibility with duck's moderate protein-fat profile matching medium tannins. Strong Tier 2 aromatic bridge with blackberry. Wine knowledge reduced due to unknown producer/region, but typical Malbec structure assumed. Recipe well-developed with clear multi-step technique."
          }
        },
        {
          complexityLabel: "Moderate Pairing",
          dishName: "Grilled Pork Chops with Mushroom-Herb Pan Sauce",
          pairingRationale: "Congruent: pork's moderate protein and marbling bind polished tannins without drying (Tannin-Protein). Mid-aged wine's polymerized tannins safely pair with mushroom umami. Balanced acidity refreshes against pan sauce richness (Acidity-Fat).",
          pairingPrinciplesApplied: ["Tannin-Protein Binding", "Acidity-Fat Balance", "Aged Wine-Umami Safety"],
          ingredients: {
            protein: [
              "2 bone-in pork chops (10 oz each, 1-inch thick)",
              "2 tbsp olive oil",
              "Salt and black pepper"
            ],
            sauce: [
              "8 oz cremini mushrooms, sliced",
              "2 tbsp butter",
              "2 cloves garlic, minced",
              "1/2 cup beef stock",
              "1/4 cup heavy cream",
              "1 tbsp fresh thyme leaves",
              "1 tsp Dijon mustard"
            ]
          },
          recipe: [
            "Step 1: Remove pork chops from refrigerator 20 minutes before cooking. Pat dry, brush with olive oil, season generously with salt and pepper.",
            "Step 2: Preheat grill to medium-high heat (400°F). Grill pork chops 5-6 minutes per side until internal temperature reaches 145°F. Rest 5 minutes.",
            "Step 3: While chops rest, heat butter in skillet over medium-high. Sauté mushrooms 5-6 minutes until golden. Add garlic, cook 1 minute.",
            "Step 4: Add stock, scraping browned bits. Simmer 3 minutes until reduced by half. Stir in cream, thyme, and mustard. Season with salt and pepper.",
            "Step 5: Plate pork chops, spoon mushroom sauce over top."
          ],
          cookTime: {
            prep: "10 minutes",
            cook: "20 minutes",
            total: "30 minutes"
          },
          servingSuggestion: "Serve with roasted green beans or mashed potatoes to complete the meal.",
          confidence: {
            score: 89,
            breakdown: {
              pairingScience: 45,
              wineKnowledge: 25,
              recipeQuality: 19
            },
            rationale: "Strong pairing with proper tannin-protein match and aged wine allowing safe mushroom pairing. Medium acidity balances cream sauce. Wine knowledge reduced due to unknown provenance. Recipe solid with clear pan sauce technique."
          }
        },
        {
          complexityLabel: "Simple Pairing",
          dishName: "Grilled Lamb Chops with Herb Oil",
          pairingRationale: "Congruent: lamb's natural fat and protein bind medium tannins effectively (Tannin-Protein). Simple preparation highlights wine's fruit and tertiary complexity without competition. Medium body matches straightforward grilled preparation (Weight Match).",
          pairingPrinciplesApplied: ["Tannin-Protein Binding", "Weight Matching", "Simplicity Allows Wine Focus"],
          ingredients: {
            protein: [
              "8 lamb rib chops (3-4 oz each)",
              "2 tbsp olive oil",
              "Salt and black pepper"
            ],
            sauce: [
              "1/4 cup olive oil",
              "2 tbsp fresh rosemary, chopped",
              "2 tbsp fresh parsley, chopped",
              "2 cloves garlic, minced",
              "1/2 tsp sea salt"
            ]
          },
          recipe: [
            "Step 1: Remove lamb chops from refrigerator 20 minutes before cooking. Pat dry, brush with 2 tbsp olive oil, season generously with salt and pepper.",
            "Step 2: Make herb oil: Whisk together 1/4 cup olive oil, rosemary, parsley, garlic, and sea salt. Set aside.",
            "Step 3: Preheat grill to high heat (450-500°F). Oil grates well.",
            "Step 4: Grill lamb chops 3-4 minutes per side for medium-rare (130-135°F internal). Rest 3 minutes.",
            "Step 5: Drizzle herb oil over lamb chops before serving."
          ],
          cookTime: {
            prep: "10 minutes",
            cook: "10 minutes",
            total: "20 minutes"
          },
          servingSuggestion: "Pair with grilled asparagus or a simple arugula salad.",
          confidence: {
            score: 90,
            breakdown: {
              pairingScience: 46,
              wineKnowledge: 25,
              recipeQuality: 19
            },
            rationale: "Classic pairing with lamb's fat-protein profile perfectly matching medium tannins. Simple preparation allows wine's complexity to shine. Wine knowledge reduced due to unknown producer/region. Recipe straightforward and easily executable."
          }
        }
      ]
    };
    
    console.log('Mock data generated:', mockData);
    return mockData;
  }
}

export default DishService;

