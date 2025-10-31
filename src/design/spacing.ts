// PocketSomm Design System - Spacing
// Consistent spacing system for layout

export const SPACING = {
  // Base spacing units (4px grid system)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Semantic spacing
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Component-specific spacing
  component: {
    cardPadding: 16,
    buttonPadding: 12,
    inputPadding: 12,
    sectionSpacing: 24,
    itemSpacing: 12,
  },
  
  // Layout spacing
  layout: {
    screenPadding: 20,
    headerHeight: 60,
    tabBarHeight: 80,
    cardSpacing: 12,
    listSpacing: 8,
  },
};

// Border radius system
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
  
  // Component-specific radius
  component: {
    button: 8,
    card: 12,
    input: 8,
    badge: 12,
    avatar: 20,
  },
};

// Shadow system
export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default SPACING;
