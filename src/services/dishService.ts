import { DishRecommendationResponse } from '../types/dish';
import { getApiBaseUrl } from '../utils/api';
import { NETWORK_CONFIG } from '../utils/api';
import SecureHttpClient from './secureHttpClient';

/**
 * DishService - Service for reverse pairing (Wine-to-Dish) functionality
 * 
 * This service handles dish recommendations by calling the API endpoint.
 * It includes retry logic and comprehensive error handling.
 */
export class DishService {
  private static isMockMode = (process.env.EXPO_PUBLIC_MOCK_MODE || '').toLowerCase() === 'true';
  private static readonly MAX_RETRIES = 3;
  private static readonly BASE_RETRY_DELAY = 800;
  private static secureClient: SecureHttpClient | null = null;

  /**
   * Enables or disables mock mode for development and testing
   */
  static setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  /**
   * Checks if mock mode is currently enabled
   */
  static isMockModeEnabled(): boolean {
    return this.isMockMode;
  }

  /**
   * Initialize secure HTTP client
   */
  private static initializeSecureClient(): void {
    if (!this.secureClient) {
      const baseURL = getApiBaseUrl();
      this.secureClient = new SecureHttpClient(baseURL, NETWORK_CONFIG.timeout);
      console.log('Secure HTTP client initialized for DishService');
    }
  }

  /**
   * Get the secure HTTP client instance
   */
  private static getSecureClient(): SecureHttpClient {
    this.initializeSecureClient();
    return this.secureClient!;
  }

  /**
   * Gets dish recommendations for a specific wine
   * 
   * @param wine - The wine name/description (e.g., "2016 Clos de Oro Malbec Reserva")
   * @returns Promise resolving to dish recommendation response
   * 
   * @throws {Error} If the API call fails after all retries
   */
  static async getDishRecommendations(
    wine: string
  ): Promise<DishRecommendationResponse> {
    if (!wine || !wine.trim()) {
      throw new Error('Wine parameter is required');
    }

    // If mock mode is enabled, return mock data without calling the API
    if (this.isMockMode) {
      console.log('DishService: Using mock mode - returning mock data');
      return this.getMockDishRecommendations(wine.trim());
    }

    // Call the backend API
    const client = this.getSecureClient();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const response = await client.post<DishRecommendationResponse>(
          '/dish-recommendations',
          { wine: wine.trim() },
          {
            timeout: NETWORK_CONFIG.timeout,
          }
        );

        // Validate response structure
        if (!response) {
          throw new Error('No response received from dish recommendations API');
        }

        if (!response.dishRecommendations) {
          console.error('DishService: Response missing dishRecommendations field:', JSON.stringify(response, null, 2));
          throw new Error('Invalid response format: missing dishRecommendations field');
        }

        if (!Array.isArray(response.dishRecommendations)) {
          console.error('DishService: dishRecommendations is not an array:', typeof response.dishRecommendations, response.dishRecommendations);
          throw new Error('Invalid response format: dishRecommendations is not an array');
        }

        if (response.dishRecommendations.length === 0) {
          console.error('DishService: dishRecommendations array is empty');
          throw new Error('Invalid response format: dishRecommendations array is empty');
        }

        return response;
      } catch (error: any) {
        lastError = error;
        console.warn(`DishService: Attempt ${attempt + 1} failed:`, error.message);

        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.MAX_RETRIES - 1) {
          const delay = this.BASE_RETRY_DELAY * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, throw the error
    throw lastError || new Error('Dish recommendations API call failed after all retries');
  }

  /**
   * Get mock dish recommendations for testing
   * Uses the same structure as backend/mockDishData.json
   */
  private static getMockDishRecommendations(wine: string): DishRecommendationResponse {
    // Helper functions to transform the mock data structure
    const getComplexityLevel = (label: string): 'simple' | 'moderate' | 'complex' => {
      const lower = label.toLowerCase();
      if (lower.includes('complex')) return 'complex';
      if (lower.includes('moderate')) return 'moderate';
      if (lower.includes('simple')) return 'simple';
      return 'moderate';
    };

    const combineIngredients = (ingredients: { protein?: string[]; sauce?: string[]; sides?: string[] }): string[] => {
      const all: string[] = [];
      if (ingredients.protein) all.push(...ingredients.protein);
      if (ingredients.sauce) all.push(...ingredients.sauce);
      if (ingredients.sides) all.push(...ingredients.sides);
      return all;
    };

    const cleanSteps = (steps: string[]): string[] => {
      return steps.map(step => step.replace(/^Step \d+:\s*/, ''));
    };

    const estimateServings = (ingredients: { protein?: string[]; sauce?: string[]; sides?: string[] }): number => {
      const allIngredients = combineIngredients(ingredients);
      for (const ing of allIngredients) {
        if (ing.toLowerCase().includes('8 lamb rib chops') || ing.toLowerCase().includes('8-12 pieces')) {
          return 4;
        }
        if (ing.toLowerCase().includes('2 duck breasts') || ing.toLowerCase().includes('2 bone-in pork chops')) {
          return 2;
        }
      }
      return 2;
    };

    // Mock data based on backend/mockDishData.json structure
    const mockDishEntry = {
      wine: "2016 Clos de Oro Malbec Reserva",
      wineAnalysis: {
        producer: "unknown",
        region: "unknown",
        vintage: "2016",
        vintageAge: "9 years",
        color: "red" as 'red',
        structure: {
          body: "medium-full" as 'medium-full',
          acidity: "medium" as 'medium',
          acidType: "balanced",
          tannin: "medium" as 'medium',
          tanninCharacter: "polished",
          sweetness: "dry" as 'dry',
          abv: "14.5%"
        },
        aromaticProfile: {
          primaryAromas: ["blackberry", "plum", "dark cherry"],
          secondaryAromas: ["vanilla", "toast", "cocoa"],
          tertiaryAromas: ["leather", "dried herbs"],
          dominantCompounds: [] as string[]
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
          ingredients: {
            protein: ["2 duck breasts (8 oz each, skin-on)", "Salt and black pepper"],
            sauce: ["1 cup fresh blackberries", "1/2 cup ruby port", "1/4 cup chicken stock", "2 tbsp honey", "1 tbsp butter", "1 tsp fresh thyme leaves"],
            sides: ["1 lb fingerling potatoes, halved", "2 tbsp olive oil", "3 cloves garlic, smashed", "2 sprigs fresh rosemary"]
          },
          recipe: [
            "Step 1: Preheat oven to 400°F. Toss potatoes with olive oil, garlic, rosemary, salt, and pepper. Roast 30-35 minutes until golden and crispy.",
            "Step 2: Score duck skin in crosshatch pattern. Season both sides generously with salt and pepper.",
            "Step 3: Place duck breasts skin-side down in cold skillet. Turn heat to medium and render fat 8-10 minutes until skin is deep golden and crispy. Flip and cook 3-4 minutes for medium-rare (135°F internal). Rest 8 minutes.",
            "Step 4: Make sauce: In same pan, add blackberries, port, stock, honey, and thyme. Simmer 8-10 minutes until reduced by half and syrupy. Strain through fine-mesh sieve, pressing berries. Whisk in butter off heat.",
            "Step 5: Slice duck breasts on bias. Plate with roasted potatoes, drizzle blackberry reduction over duck."
          ],
          cookTime: { prep: "15 minutes", cook: "45 minutes", total: "60 minutes" },
          servingSuggestion: "Garnish with fresh thyme sprigs and a few whole blackberries for visual appeal.",
          confidence: {
            score: 92,
            breakdown: { pairingScience: 47, wineKnowledge: 25, recipeQuality: 20 },
            rationale: "Excellent structural compatibility with duck's moderate protein-fat profile matching medium tannins. Strong Tier 2 aromatic bridge with blackberry. Wine knowledge reduced due to unknown producer/region, but typical Malbec structure assumed. Recipe well-developed with clear multi-step technique."
          }
        },
        {
          complexityLabel: "Moderate Pairing",
          dishName: "Grilled Pork Chops with Mushroom-Herb Pan Sauce",
          pairingRationale: "Congruent: pork's moderate protein and marbling bind polished tannins without drying (Tannin-Protein). Mid-aged wine's polymerized tannins safely pair with mushroom umami. Balanced acidity refreshes against pan sauce richness (Acidity-Fat).",
          ingredients: {
            protein: ["2 bone-in pork chops (10 oz each, 1-inch thick)", "2 tbsp olive oil", "Salt and black pepper"],
            sauce: ["8 oz cremini mushrooms, sliced", "2 tbsp butter", "2 cloves garlic, minced", "1/2 cup beef stock", "1/4 cup heavy cream", "1 tbsp fresh thyme leaves", "1 tsp Dijon mustard"]
          },
          recipe: [
            "Step 1: Remove pork chops from refrigerator 20 minutes before cooking. Pat dry, brush with olive oil, season generously with salt and pepper.",
            "Step 2: Preheat grill to medium-high heat (400°F). Grill pork chops 5-6 minutes per side until internal temperature reaches 145°F. Rest 5 minutes.",
            "Step 3: While chops rest, heat butter in skillet over medium-high. Sauté mushrooms 5-6 minutes until golden. Add garlic, cook 1 minute.",
            "Step 4: Add stock, scraping browned bits. Simmer 3 minutes until reduced by half. Stir in cream, thyme, and mustard. Season with salt and pepper.",
            "Step 5: Plate pork chops, spoon mushroom sauce over top."
          ],
          cookTime: { prep: "10 minutes", cook: "20 minutes", total: "30 minutes" },
          servingSuggestion: "Serve with roasted green beans or mashed potatoes to complete the meal.",
          confidence: {
            score: 89,
            breakdown: { pairingScience: 45, wineKnowledge: 25, recipeQuality: 19 },
            rationale: "Strong pairing with proper tannin-protein match and aged wine allowing safe mushroom pairing. Medium acidity balances cream sauce. Wine knowledge reduced due to unknown provenance. Recipe solid with clear pan sauce technique."
          }
        },
        {
          complexityLabel: "Simple Pairing",
          dishName: "Grilled Lamb Chops with Herb Oil",
          pairingRationale: "Congruent: lamb's natural fat and protein bind medium tannins effectively (Tannin-Protein). Simple preparation highlights wine's fruit and tertiary complexity without competition. Medium body matches straightforward grilled preparation (Weight Match).",
          ingredients: {
            protein: ["8 lamb rib chops (3-4 oz each)", "2 tbsp olive oil", "Salt and black pepper"],
            sauce: ["1/4 cup olive oil", "2 tbsp fresh rosemary, chopped", "2 tbsp fresh parsley, chopped", "2 cloves garlic, minced", "1/2 tsp sea salt"]
          },
          recipe: [
            "Step 1: Remove lamb chops from refrigerator 20 minutes before cooking. Pat dry, brush with 2 tbsp olive oil, season generously with salt and pepper.",
            "Step 2: Make herb oil: Whisk together 1/4 cup olive oil, rosemary, parsley, garlic, and sea salt. Set aside.",
            "Step 3: Preheat grill to high heat (450-500°F). Oil grates well.",
            "Step 4: Grill lamb chops 3-4 minutes per side for medium-rare (130-135°F internal). Rest 3 minutes.",
            "Step 5: Drizzle herb oil over lamb chops before serving."
          ],
          cookTime: { prep: "10 minutes", cook: "10 minutes", total: "20 minutes" },
          servingSuggestion: "Pair with grilled asparagus or a simple arugula salad.",
          confidence: {
            score: 90,
            breakdown: { pairingScience: 46, wineKnowledge: 25, recipeQuality: 19 },
            rationale: "Classic pairing with lamb's fat-protein profile perfectly matching medium tannins. Simple preparation allows wine's complexity to shine. Wine knowledge reduced due to unknown producer/region. Recipe straightforward and easily executable."
          }
        }
      ]
    };

    // Transform the mock data to match the expected response structure
    const transformedRecommendations = mockDishEntry.dishRecommendations.map(dish => {
      const complexityLevel = getComplexityLevel(dish.complexityLabel);
      const complexityLabel = dish.complexityLabel.replace(' Pairing', '');

      return {
        dishName: dish.dishName,
        complexity: {
          level: complexityLevel,
          label: complexityLabel
        },
        recipe: {
          ingredients: combineIngredients(dish.ingredients),
          steps: cleanSteps(dish.recipe),
          cookTime: dish.cookTime.total,
          servings: estimateServings(dish.ingredients),
          difficulty: complexityLabel === 'Complex' ? 'Advanced' : complexityLabel === 'Moderate' ? 'Medium' : 'Easy'
        },
        pairingRationale: dish.pairingRationale,
        servingSuggestion: dish.servingSuggestion || '',
        confidenceScore: dish.confidence.score,
        confidence: dish.confidence
      };
    });

    return {
      wine: wine,
      wineAnalysis: mockDishEntry.wineAnalysis,
      wineServingGuidance: mockDishEntry.wineServingGuidance,
      dishRecommendations: transformedRecommendations,
      closingNarrative: `These dishes showcase the versatility of ${wine}, from simple grilling to complex braising techniques. Each recommendation highlights different aspects of the wine's profile, from its structured tannins to its aromatic complexity.`
    };
  }

}
