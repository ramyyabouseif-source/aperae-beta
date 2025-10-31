export interface WineRecommendation {
  wineName: string;
  producer: string;
  vintage: string;
  pricePoint: string; // Can be "unknown" or specific price like "$45"
  rationale: string;
  tastingNotes: string;
  servingGuidance: string;
  confidenceScore: number;
  expertRating: string; // Can be "unknown" or specific rating like "95 (Wine Spectator)"
  retailerSuggestion: string;
  image: string; // Can be "unknown" or specific URL
  storytellingElements: string;
}

export interface WineRecommendationResponse {
  dish: string;
  recommendations: WineRecommendation[];
  closingNarrative?: string;
  disclaimer?: string;
}

export interface FavoriteWine extends WineRecommendation {
  id: string;
  addedAt: string;
}

export interface WinePreferences {
  wineType: string;
  priceRange: string;
  region: string;
  vintage: string;
  body: string;
  acidity: string;
  tannins: string;
  sweetness: string;
  alcoholContent: string;
  foodPairing: string;
  occasion: string;
  experience: string;
}