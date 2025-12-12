/**
 * Wine Card Images Utility
 * 
 * Manages cycling through wine card images from the assets folder.
 * Images are stored in: assets/images/Wine card images/
 * 
 * Note: Some very long file names may cause bundler issues. If a file fails to load,
 * it will be skipped and the next image will be used.
 */

// Import all wine card images - React Native requires static requires
// Files are organized by region
const wineCardImages = [
  // Burgundy, France
  require('../../assets/images/Wine card images/Burgundy, France/Iconic Burgundy vineyard with limestone walls 1.jpg'),
  require('../../assets/images/Wine card images/Burgundy, France/Iconic Burgundy vineyard with limestone walls 2.jpg'),
  require('../../assets/images/Wine card images/Burgundy, France/Iconic Burgundy vineyard with limestone walls 3.jpg'),
  require('../../assets/images/Wine card images/Burgundy, France/Iconic Burgundy vineyard with limestone walls 4.png'),
  require('../../assets/images/Wine card images/Burgundy, France/Traditional Burgundy wine cellar interior 1.jpg'),
  require('../../assets/images/Wine card images/Burgundy, France/Traditional Burgundy wine cellar interior 2.jpg'),
  require('../../assets/images/Wine card images/Burgundy, France/Traditional Burgundy wine cellar interior 3.png'),
  
  // Champagne, France
  require('../../assets/images/Wine card images/Champagne, France/Chalky Champagne vineyards at dawn 1.jpg'),
  require('../../assets/images/Wine card images/Champagne, France/Chalky Champagne vineyards at dawn 2.jpg'),
  require('../../assets/images/Wine card images/Champagne, France/Chalky Champagne vineyards at dawn 3.jpg'),
  require('../../assets/images/Wine card images/Champagne, France/Chalky Champagne vineyards at dawn 4.png'),
  
  // Douro Valley, Portugal
  require('../../assets/images/Wine card images/Douro Valley, Portugal/Terraced Douro Valley vineyards 1.jpg'),
  require('../../assets/images/Wine card images/Douro Valley, Portugal/Terraced Douro Valley vineyards 2.jpg'),
  
  // Generic
  require('../../assets/images/Wine card images/Generic/Abstract wine pour in motion 1.jpg'),
  require('../../assets/images/Wine card images/Generic/Abstract wine pour in motion 2.png'),
  require('../../assets/images/Wine card images/Generic/Generic elegant vineyard landscape at golden hour 1.jpg'),
  require('../../assets/images/Wine card images/Generic/Generic elegant vineyard landscape at golden hour 2.jpg'),
  require('../../assets/images/Wine card images/Generic/Generic elegant vineyard landscape at golden hour 3.png'),
  require('../../assets/images/Wine card images/Generic/Intimate bistro table setting with wine glass 1.jpg'),
  require('../../assets/images/Wine card images/Generic/Intimate bistro table setting with wine glass 2.png'),
  require('../../assets/images/Wine card images/Generic/Sun-drenched vineyard at midday 1.jpg'),
  require('../../assets/images/Wine card images/Generic/Sun-drenched vineyard at midday 2.jpg'),
  require('../../assets/images/Wine card images/Generic/Sun-drenched vineyard at midday 3.jpg'),
  require('../../assets/images/Wine card images/Generic/Sun-drenched vineyard at midday 4.jpg'),
  require('../../assets/images/Wine card images/Generic/Traditional wine cellar interior 1.jpg'),
  require('../../assets/images/Wine card images/Generic/Traditional wine cellar interior 2.jpg'),
  require('../../assets/images/Wine card images/Generic/Traditional wine cellar interior 3.png'),
  require('../../assets/images/Wine card images/Generic/Vineyard at dawn with soft morning mist 1.jpg'),
  require('../../assets/images/Wine card images/Generic/Vineyard at dawn with soft morning mist 2.jpg'),
  require('../../assets/images/Wine card images/Generic/Vineyard at golden hour transitioning to dusk 1.jpg'),
  require('../../assets/images/Wine card images/Generic/Vineyard at golden hour transitioning to dusk 2.jpg'),
  
  // Loire Valley, France
  require('../../assets/images/Wine card images/Loire Valley, France/Loire Valley chateau vineyard at sunset 1.jpg'),
  require('../../assets/images/Wine card images/Loire Valley, France/Loire Valley chateau vineyard at sunset 2.jpg'),
  require('../../assets/images/Wine card images/Loire Valley, France/Loire Valley chateau vineyard at sunset 3.jpg'),
  
  // Mendoza, Argentina
  require('../../assets/images/Wine card images/Mendoza, Argentina/High-altitude Mendoza vineyards 1.jpg'),
  require('../../assets/images/Wine card images/Mendoza, Argentina/High-altitude Mendoza vineyards 2.jpg'),
  require('../../assets/images/Wine card images/Mendoza, Argentina/High-altitude Mendoza vineyards 3.png'),
  
  // Mosel, Germany
  require('../../assets/images/Wine card images/Mosel, Germany/Steep Mosel River valley vineyards 1.jpg'),
  require('../../assets/images/Wine card images/Mosel, Germany/Steep Mosel River valley vineyards 2.jpg'),
  
  // Napa, California
  require('../../assets/images/Wine card images/Napa, California/Sun-drenched Napa Valley vineyards at golden hour 1.jpg'),
  require('../../assets/images/Wine card images/Napa, California/Sun-drenched Napa Valley vineyards at golden hour 2.jpg'),
  
  // New Zealand
  require('../../assets/images/Wine card images/New Zealand/Pristine Marlborough vineyards 1.jpg'),
  require('../../assets/images/Wine card images/New Zealand/Pristine Marlborough vineyards 2.jpg'),
  
  // Piedmont, Italy
  require('../../assets/images/Wine card images/Piedmont, Italy/Close-up of ancient Nebbiolo grapevines in Barolo vineyards 1.jpg'),
  require('../../assets/images/Wine card images/Piedmont, Italy/Close-up of ancient Nebbiolo grapevines in Barolo vineyards 2.jpg'),
  require('../../assets/images/Wine card images/Piedmont, Italy/Rolling hills of Piedmont vineyards at golden hour.jpg'),
  
  // Rhone Valley, France
  require('../../assets/images/Wine card images/Rhone Valley, France/Southern Rhone garrigue landscape 1.jpg'),
  require('../../assets/images/Wine card images/Rhone Valley, France/Southern Rhone garrigue landscape 2.jpg'),
  
  // Rioja, Spain
  require('../../assets/images/Wine card images/Rioja, Spain/Traditional Rioja vineyard landscape 1.jpg'),
  require('../../assets/images/Wine card images/Rioja, Spain/Traditional Rioja vineyard landscape 2.jpg'),
  
  // Sonoma, California
  require('../../assets/images/Wine card images/Sonoma, California/Coastal Sonoma vineyards 1.jpg'),
  require('../../assets/images/Wine card images/Sonoma, California/Coastal Sonoma vineyards 2.jpg'),
  require('../../assets/images/Wine card images/Sonoma, California/Coastal Sonoma vineyards 3.jpg'),
  
  // Tuscany, Italy
  require('../../assets/images/Wine card images/Tuscany, Italy/Rolling Tuscan hills with Sangiovese vineyards 1.jpg'),
  require('../../assets/images/Wine card images/Tuscany, Italy/Rolling Tuscan hills with Sangiovese vineyards 2.jpg'),
  require('../../assets/images/Wine card images/Tuscany, Italy/Rolling Tuscan hills with Sangiovese vineyards 3.jpg'),
  require('../../assets/images/Wine card images/Tuscany, Italy/Rolling Tuscan hills with Sangiovese vineyards 4.jpg'),
  require('../../assets/images/Wine card images/Tuscany, Italy/Rolling Tuscan hills with Sangiovese vineyards 5.png'),
  
  // Veneto, Italy
  require('../../assets/images/Wine card images/Veneto, Italy/Veneto vineyard landscape 1.jpg'),
  require('../../assets/images/Wine card images/Veneto, Italy/Veneto vineyard landscape 2.jpg'),
  require('../../assets/images/Wine card images/Veneto, Italy/Veneto vineyard landscape 3.jpg'),
  require('../../assets/images/Wine card images/Veneto, Italy/Veneto vineyard landscape 4.jpg'),
  
  // Willamette Valley, Oregon
  require('../../assets/images/Wine card images/Willamette Valley, Oregon/Misty Willamette Valley hillside vineyard 1.jpg'),
  require('../../assets/images/Wine card images/Willamette Valley, Oregon/Misty Willamette Valley hillside vineyard 2.jpg'),
  require('../../assets/images/Wine card images/Willamette Valley, Oregon/Misty Willamette Valley hillside vineyard 3.png'),
];

// Filter out any null/undefined entries that might result from failed requires
const validWineCardImages = wineCardImages.filter((img) => img != null);

/**
 * Get a wine card image by index
 * @param index - The index to use (will be modulo'd to cycle through images)
 * @returns Image source object for React Native Image component
 */
export const getWineCardImage = (index: number) => {
  if (validWineCardImages.length === 0) {
    // Fallback to placeholder if no images available
    return { uri: 'https://via.placeholder.com/400x600/8B0000/FFFFFF?text=Wine' };
  }
  const imageIndex = index % validWineCardImages.length;
  return validWineCardImages[imageIndex];
};

/**
 * Get a random wine card image
 * @returns Image source object for React Native Image component
 */
export const getRandomWineCardImage = () => {
  if (validWineCardImages.length === 0) {
    // Fallback to placeholder if no images available
    return { uri: 'https://via.placeholder.com/400x600/8B0000/FFFFFF?text=Wine' };
  }
  const randomIndex = Math.floor(Math.random() * validWineCardImages.length);
  return validWineCardImages[randomIndex];
};

/**
 * Get the total number of available wine card images
 */
export const getWineCardImageCount = () => validWineCardImages.length;
