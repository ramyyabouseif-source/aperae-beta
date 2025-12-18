/**
 * Dish Card Images Utility
 * 
 * Manages cycling through dish card images from the assets folder.
 * Images are organized by complexity: Simple, Moderate, Complex
 * 
 * Images are stored in: assets/images/Dish Recommendation Images/
 */

// Import all dish card images - React Native requires static requires
// Files are organized by complexity

// Simple dish images
const simpleDishImages = [
  require('../../assets/images/Dish Recommendation Images/Simple dish images/Simple dish 1.jpg'),
  require('../../assets/images/Dish Recommendation Images/Simple dish images/Simple dish 2.jpg'),
];

// Moderate dish images
const moderateDishImages = [
  require('../../assets/images/Dish Recommendation Images/Moderate dish images/Moderate dish 1.jpg'),
  require('../../assets/images/Dish Recommendation Images/Moderate dish images/Moderate dish 2.jpg'),
  require('../../assets/images/Dish Recommendation Images/Moderate dish images/Moderate dish 3.jpg'),
  require('../../assets/images/Dish Recommendation Images/Moderate dish images/Moderate dish 4.jpg'),
];

// Complex dish images
const complexDishImages = [
  require('../../assets/images/Dish Recommendation Images/Complex dish images/Complex dish image 1.jpg'),
  require('../../assets/images/Dish Recommendation Images/Complex dish images/Complex dish image 2.jpg'),
  require('../../assets/images/Dish Recommendation Images/Complex dish images/Complex dish image 3.jpg'),
  require('../../assets/images/Dish Recommendation Images/Complex dish images/Complex dish image 4.jpg'),
];

// Filter out any null/undefined entries that might result from failed requires
const validSimpleImages = simpleDishImages.filter((img) => img != null);
const validModerateImages = moderateDishImages.filter((img) => img != null);
const validComplexImages = complexDishImages.filter((img) => img != null);

/**
 * Get a dish card image by complexity and index
 * @param complexity - The complexity level ('simple' | 'moderate' | 'complex')
 * @param index - The index to use (will be modulo'd to cycle through images)
 * @returns Image source object for React Native Image component
 */
export const getDishCardImage = (complexity: 'simple' | 'moderate' | 'complex', index: number) => {
  let imageArray: any[] = [];
  
  switch (complexity) {
    case 'simple':
      imageArray = validSimpleImages;
      break;
    case 'moderate':
      imageArray = validModerateImages;
      break;
    case 'complex':
      imageArray = validComplexImages;
      break;
    default:
      imageArray = validSimpleImages; // Fallback to simple
  }
  
  if (imageArray.length === 0) {
    // Fallback to placeholder if no images available
    return { uri: 'https://via.placeholder.com/400x600/8B0000/FFFFFF?text=Dish' };
  }
  
  const imageIndex = index % imageArray.length;
  return imageArray[imageIndex];
};

/**
 * Get a random dish card image by complexity
 * @param complexity - The complexity level ('simple' | 'moderate' | 'complex')
 * @returns Image source object for React Native Image component
 */
export const getRandomDishCardImage = (complexity: 'simple' | 'moderate' | 'complex') => {
  let imageArray: any[] = [];
  
  switch (complexity) {
    case 'simple':
      imageArray = validSimpleImages;
      break;
    case 'moderate':
      imageArray = validModerateImages;
      break;
    case 'complex':
      imageArray = validComplexImages;
      break;
    default:
      imageArray = validSimpleImages; // Fallback to simple
  }
  
  if (imageArray.length === 0) {
    // Fallback to placeholder if no images available
    return { uri: 'https://via.placeholder.com/400x600/8B0000/FFFFFF?text=Dish' };
  }
  
  const randomIndex = Math.floor(Math.random() * imageArray.length);
  return imageArray[randomIndex];
};

/**
 * Get the total number of available images for a complexity level
 * @param complexity - The complexity level ('simple' | 'moderate' | 'complex')
 */
export const getDishCardImageCount = (complexity: 'simple' | 'moderate' | 'complex'): number => {
  switch (complexity) {
    case 'simple':
      return validSimpleImages.length;
    case 'moderate':
      return validModerateImages.length;
    case 'complex':
      return validComplexImages.length;
    default:
      return 0;
  }
};


