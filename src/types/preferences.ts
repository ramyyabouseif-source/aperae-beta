export interface UserPreferences {
  budgetSensitivity?: string;
  regionPreferences?: string;
  exploreNewRegions?: boolean;
  grapeVariety?: string[];
  wineStyle?: string[];
  occasion?: string;
  retailAccessibility?: string;
  agingPotential?: string;
  foodPairingRisk?: string;
}

export interface PreferenceCategory {
  id: string;
  title: string;
  description: string;
  options: PreferenceOption[];
  type: 'single' | 'multiple' | 'boolean';
}

export interface PreferenceOption {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export const PREFERENCE_CATEGORIES: PreferenceCategory[] = [
  {
    id: 'budget',
    title: 'Budget Sensitivity',
    description: 'What price range are you comfortable with?',
    type: 'single',
    options: [
      { id: 'budget-1', label: 'Budget ($15-30)', value: '$15-30', description: 'Great value wines' },
      { id: 'budget-2', label: 'Moderate ($30-60)', value: '$30-60', description: 'Quality mid-range wines' },
      { id: 'budget-3', label: 'Premium ($60-150)', value: '$60-150', description: 'High-quality wines' },
      { id: 'budget-4', label: 'Luxury ($150+)', value: '$150+', description: 'Exceptional wines' },
      { id: 'budget-5', label: 'No preference', value: 'any', description: 'Show all price ranges' }
    ]
  },
  {
    id: 'region',
    title: 'Region Preferences',
    description: 'Do you have favorite wine regions?',
    type: 'single',
    options: [
      { id: 'region-1', label: 'Bordeaux, France', value: 'Bordeaux' },
      { id: 'region-2', label: 'Burgundy, France', value: 'Burgundy' },
      { id: 'region-3', label: 'Napa Valley, California', value: 'Napa Valley' },
      { id: 'region-4', label: 'Tuscany, Italy', value: 'Tuscany' },
      { id: 'region-5', label: 'Mendoza, Argentina', value: 'Mendoza' },
      { id: 'region-6', label: 'Rioja, Spain', value: 'Rioja' },
      { id: 'region-7', label: 'Barossa Valley, Australia', value: 'Barossa Valley' },
      { id: 'region-8', label: 'No preference', value: 'any' }
    ]
  },
  {
    id: 'explore',
    title: 'Explore New Regions',
    description: 'Are you open to trying wines from regions you haven\'t explored?',
    type: 'boolean',
    options: [
      { id: 'explore-yes', label: 'Yes, surprise me!', value: 'true' },
      { id: 'explore-no', label: 'Stick to familiar regions', value: 'false' }
    ]
  },
  {
    id: 'grape',
    title: 'Grape Variety',
    description: 'Select your preferred grape varieties (choose multiple)',
    type: 'multiple',
    options: [
      { id: 'grape-1', label: 'Cabernet Sauvignon', value: 'Cabernet Sauvignon' },
      { id: 'grape-2', label: 'Chardonnay', value: 'Chardonnay' },
      { id: 'grape-3', label: 'Pinot Noir', value: 'Pinot Noir' },
      { id: 'grape-4', label: 'Merlot', value: 'Merlot' },
      { id: 'grape-5', label: 'Sauvignon Blanc', value: 'Sauvignon Blanc' },
      { id: 'grape-6', label: 'Riesling', value: 'Riesling' },
      { id: 'grape-7', label: 'Syrah/Shiraz', value: 'Syrah' },
      { id: 'grape-8', label: 'Malbec', value: 'Malbec' },
      { id: 'grape-9', label: 'Sangiovese', value: 'Sangiovese' },
      { id: 'grape-10', label: 'Tempranillo', value: 'Tempranillo' }
    ]
  },
  {
    id: 'style',
    title: 'Wine Style',
    description: 'What wine styles do you prefer? (choose multiple)',
    type: 'multiple',
    options: [
      { id: 'style-1', label: 'Bold & Tannic', value: 'bold-tannic', description: 'Full-bodied reds' },
      { id: 'style-2', label: 'Light & Elegant', value: 'light-elegant', description: 'Delicate and refined' },
      { id: 'style-3', label: 'Aromatic & Floral', value: 'aromatic-floral', description: 'Fragrant whites and roses' },
      { id: 'style-4', label: 'Crisp & Mineral', value: 'crisp-mineral', description: 'High acidity, mineral-driven' },
      { id: 'style-5', label: 'Rich & Creamy', value: 'rich-creamy', description: 'Oaked whites and full reds' },
      { id: 'style-6', label: 'Off-dry/Sweet', value: 'off-dry-sweet', description: 'Slightly sweet to dessert wines' }
    ]
  },
  {
    id: 'occasion',
    title: 'Occasion & Context',
    description: 'What\'s the occasion for this wine?',
    type: 'single',
    options: [
      { id: 'occasion-1', label: 'Casual Dinner', value: 'casual-dinner', description: 'Everyday meals at home' },
      { id: 'occasion-2', label: 'Formal Fine Dining', value: 'formal-dining', description: 'Special restaurant meals' },
      { id: 'occasion-3', label: 'Celebration', value: 'celebration', description: 'Birthdays, anniversaries' },
      { id: 'occasion-4', label: 'Gifting', value: 'gifting', description: 'Wine as a gift' },
      { id: 'occasion-5', label: 'Collector/Investment', value: 'collector', description: 'Cellar-worthy wines' },
      { id: 'occasion-6', label: 'No preference', value: 'any' }
    ]
  },
  {
    id: 'retail',
    title: 'Retail Accessibility',
    description: 'How easy should it be to find these wines?',
    type: 'single',
    options: [
      { id: 'retail-1', label: 'Widely Available', value: 'widely-available', description: 'Wine.com, Total Wine, local stores' },
      { id: 'retail-2', label: 'Specialty Stores', value: 'specialty-stores', description: 'Wine shops and specialty retailers' },
      { id: 'retail-3', label: 'Boutique Wines', value: 'boutique-wines', description: 'Harder to find, unique wines' },
      { id: 'retail-4', label: 'No preference', value: 'any' }
    ]
  },
  {
    id: 'aging',
    title: 'Aging Potential',
    description: 'When do you plan to drink the wine?',
    type: 'single',
    options: [
      { id: 'aging-1', label: 'Drink Now', value: 'drink-now', description: 'Ready to enjoy immediately' },
      { id: 'aging-2', label: 'Short Term (1-3 years)', value: 'short-term', description: 'Can age a few years' },
      { id: 'aging-3', label: 'Long Term (5+ years)', value: 'long-term', description: 'Wines that benefit from cellaring' },
      { id: 'aging-4', label: 'No preference', value: 'any' }
    ]
  },
  {
    id: 'pairing',
    title: 'Food Pairing Style',
    description: 'What type of food pairings do you prefer?',
    type: 'single',
    options: [
      { id: 'pairing-1', label: 'Classic & Safe', value: 'classic-safe', description: 'Traditional, proven pairings' },
      { id: 'pairing-2', label: 'Adventurous', value: 'adventurous', description: 'Surprising, creative matches' },
      { id: 'pairing-3', label: 'No preference', value: 'any' }
    ]
  }
];