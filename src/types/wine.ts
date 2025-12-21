// Legacy tasting notes (string)
type LegacyTastingNotes = string;

// New tasting notes (object)
interface NewTastingNotes {
  aromas: string[];
  palate: string;
  finish: string;
}

// Union type for backward compatibility
export type TastingNotes = LegacyTastingNotes | NewTastingNotes;

// Type guard
export function isNewTastingNotes(notes: TastingNotes): notes is NewTastingNotes {
  return typeof notes === 'object' && notes !== null && 'aromas' in notes;
}

// Legacy confidence (number)
type LegacyConfidence = number;

// New confidence (object)
interface NewConfidence {
  score: number;
  breakdown: {
    pairingScience: number;
    wineKnowledge: number;
    complexityHandling: number;
  };
  rationale: string;
}

// Union type
export type Confidence = LegacyConfidence | NewConfidence;

// Type guard
export function isNewConfidence(conf: Confidence): conf is NewConfidence {
  return typeof conf === 'object' && conf !== null && 'breakdown' in conf;
}

export interface DishAnalysis {
  dominantWeight: "light" | "medium" | "heavy";
  fatContent: "none" | "low" | "medium" | "high";
  primaryProtein: string;
  dominantFlavors: string[];
  spiceLevel: "none" | "mild" | "moderate" | "hot";
  applicablePrinciples: string[];
  // New optional fields
  acidityLevel?: "low" | "medium" | "high";
  keyChallenge?: string;
  idealProfile?: {
    acidity: string;
    tannin: string;
    body: string;
    sweetness: string;
    notes: string;
  };
}

export interface WineRecommendation {
  wineName: string;
  producer: string;
  vintage: string;
  rationale: string;
  tastingNotes: TastingNotes; // Union type for backward compatibility
  servingGuidance: string | {
    temperature: string;
    glassware: string;
    decanting: string;
  };
  confidenceScore?: number; // Legacy - deprecated but kept for compatibility
  confidence?: Confidence; // New format
  confidenceRationale?: string; // Legacy - deprecated
  image: string; // Can be "unknown" or specific URL
  storytellingElements: string;
  // Existing optional fields
  tierLabel?: string; // "Premium Selection" | "Moderate Choice" | "Budget-Friendly"
  tierRationale?: string; // Menu V2.2: Explanation of why this tier was assigned
  category?: string; // "Sparkling" | "White Wine" | "Red Wine" | "Rosé" | "Dessert"
  grape?: string; // e.g., "Chardonnay (White)", "Cabernet Sauvignon (Red)"
  pairingPrinciplesApplied?: string[]; // e.g., ["Weight Matching", "Acidity-Fat Cleansing"]
  // New optional fields
  region?: string;
  tierFallbackApplied?: boolean;
  story?: string;
  alternatives?: Array<{
    wineName: string;
    producer: string;
    vintage: string;
    grape: string;
  }>;
}

export interface WineRecommendationResponse {
  dish: string;
  recommendations: WineRecommendation[];
  closingNarrative?: string;
  disclaimer?: string;
  dishAnalysis?: DishAnalysis;
  pairingNotes?: string;
  menuLimitations?: string; // Menu V2.2: Overall menu limitations/observations
  // New optional field
  avoid?: {
    types: string[];
    reason: string;
  };
}

// Pairing experience tracking
export interface PairedDish {
  dish: string;
  rating: number; // 1-5 stars
  notes?: string;
  date: string;
}

// My Cellar Wine (rebranded from FavoriteWine)
export interface MyCellarWine extends WineRecommendation {
  id: string;
  addedAt: string;
  
  // Status tracking
  status: 'wantToTry' | 'haveTried' | 'favorite';
  hasTried: boolean;
  triedDate?: string;
  wantsToTry: boolean;
  
  // Pairing experience tracking
  pairingRating?: number; // 1-5 stars
  pairingNotes?: string; // User notes about the pairing
  pairedDishes?: PairedDish[]; // Array of dishes paired with this wine
  
  // Wine experience
  wineRating?: number; // Overall wine rating 1-5
  wineNotes?: string; // Tasting notes from user
  purchaseLocation?: string;
  purchasePrice?: string;
  purchaseDate?: string;
  
  // Collection/organization
  tags?: string[]; // e.g., ["Special Occasions", "Dinner Parties"]
  occasion?: string; // "Date Night", "Dinner Party", etc.
}

// Legacy alias for backward compatibility during migration
export type FavoriteWine = MyCellarWine;

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