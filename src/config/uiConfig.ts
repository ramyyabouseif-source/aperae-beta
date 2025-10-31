// UI Configuration - Toggle between Original and Enhanced designs
// This allows easy switching between design versions for A/B testing

export type UIVersion = 'original' | 'enhanced';

export interface UIConfig {
  version: UIVersion;
  features: {
    enhancedComponents: boolean;
    animations: boolean;
    modernLayout: boolean;
    microInteractions: boolean;
    designSystem: boolean;
  };
}

// 🎛️ **MAIN TOGGLE - Change this to switch between designs**
export const UI_VERSION: UIVersion = 'enhanced'; // Change to 'original' to revert

// Configuration based on UI version
export const UI_CONFIG: UIConfig = {
  version: UI_VERSION,
  features: {
    enhancedComponents: UI_VERSION === 'enhanced',
    animations: UI_VERSION === 'enhanced',
    modernLayout: UI_VERSION === 'enhanced',
    microInteractions: UI_VERSION === 'enhanced',
    designSystem: UI_VERSION === 'enhanced',
  },
};

// Helper functions for conditional rendering
export const useEnhancedUI = () => UI_CONFIG.version === 'enhanced';
export const useOriginalUI = () => UI_CONFIG.version === 'original';

// Feature flags for granular control
export const hasEnhancedComponents = () => UI_CONFIG.features.enhancedComponents;
export const hasAnimations = () => UI_CONFIG.features.animations;
export const hasModernLayout = () => UI_CONFIG.features.modernLayout;
export const hasMicroInteractions = () => UI_CONFIG.features.microInteractions;
export const hasDesignSystem = () => UI_CONFIG.features.designSystem;

// Component selection helpers
export const getButtonComponent = () => {
  return hasEnhancedComponents() ? 'EnhancedButton' : 'TouchableOpacity';
};

export const getWineCardComponent = () => {
  return hasEnhancedComponents() ? 'EnhancedWineCard' : 'WineCard';
};

export const getHomeScreenComponent = () => {
  return hasEnhancedComponents() ? 'EnhancedHomeScreen' : 'HomeScreen';
};

// Style selection helpers
export const getColorPalette = () => {
  return hasDesignSystem() ? 'enhanced' : 'legacy';
};

export const getTypography = () => {
  return hasDesignSystem() ? 'enhanced' : 'legacy';
};

export const getSpacing = () => {
  return hasDesignSystem() ? 'enhanced' : 'legacy';
};

// Animation configuration
export const getAnimationConfig = () => {
  return hasAnimations() ? {
    duration: 300,
    useNativeDriver: true,
    tension: 300,
    friction: 10,
  } : {
    duration: 0,
    useNativeDriver: false,
  };
};

// Layout configuration
export const getLayoutConfig = () => {
  return hasModernLayout() ? {
    heroSection: true,
    quickActions: true,
    cardDesign: 'enhanced',
    spacing: 'enhanced',
  } : {
    heroSection: false,
    quickActions: false,
    cardDesign: 'original',
    spacing: 'original',
  };
};

export default UI_CONFIG;




