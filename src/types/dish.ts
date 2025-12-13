/**
 * Type definitions for dish recommendation system (wine-to-dish pairing)
 */

export interface DishRecommendation {
  complexityLabel: string;
  dishName: string;
  pairingRationale: string;
  pairingPrinciplesApplied: string[];
  ingredients: {
    protein: string[];
    sauce?: string[];
    sides?: string[];
  };
  recipe: string[];
  cookTime: {
    prep: string;
    cook: string;
    total: string;
  };
  servingSuggestion?: string;
  confidence: {
    score: number;
    breakdown: {
      pairingScience: number;
      wineKnowledge: number;
      recipeQuality: number;
    };
    rationale: string;
  };
}

export interface WineAnalysis {
  producer: string;
  region: string;
  vintage: string;
  vintageAge: string;
  color: string;
  structure: {
    body: string;
    acidity: string;
    acidType: string;
    tannin: string;
    tanninCharacter: string;
    sweetness: string;
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
}





