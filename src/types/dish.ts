/**
 * Dish Recommendation Types
 * 
 * Types for the reverse pairing system (Wine-to-Dish)
 */

export interface DishComplexity {
  level: 'simple' | 'moderate' | 'complex';
  label: string;
}

export interface DishRecipe {
  ingredients: string[];
  steps: string[];
  cookTime: string;
  servings?: number;
  difficulty?: string;
}

export interface DishRecommendation {
  dishName: string;
  complexity: DishComplexity;
  recipe: DishRecipe;
  pairingRationale: string;
  servingSuggestion?: string;
  confidenceScore?: number;
  confidence?: {
    score: number;
    breakdown: {
      pairingScience: number;
      wineKnowledge: number;
      complexityHandling: number;
    };
    rationale: string;
  };
  image?: string;
  alternatives?: Array<{
    dishName: string;
    complexity: DishComplexity;
    pairingRationale: string;
  }>;
}

export interface WineAnalysis {
  producer: string;
  region: string;
  vintage: string;
  vintageAge: string;
  color: 'red' | 'white' | 'rosé' | 'sparkling' | 'dessert' | 'fortified';
  structure: {
    body: 'light' | 'medium' | 'full' | 'medium-full' | 'light-medium';
    acidity: 'low' | 'medium' | 'medium-high' | 'high';
    acidType: string;
    tannin: 'none' | 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high';
    tanninCharacter: string;
    sweetness: 'dry' | 'off-dry' | 'sweet';
    abv: string;
  };
  aromaticProfile: {
    primaryAromas: string[];
    secondaryAromas: string[];
    tertiaryAromas: string[];
    dominantCompounds: string[];
  };
  keyStrength: string;
  idealDishProfile: string;
}

export interface WineServingGuidance {
  temperature: string;
  glassware: string;
  decanting: string;
}

export interface DishRecommendationResponse {
  wine: string;
  wineAnalysis: WineAnalysis;
  wineServingGuidance: WineServingGuidance;
  dishRecommendations: DishRecommendation[];
  closingNarrative?: string;
  disclaimer?: string;
}
