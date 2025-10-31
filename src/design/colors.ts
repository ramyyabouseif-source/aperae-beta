// PocketSomm Design System - Colors
// Inspired by premium wine and modern app design

export const COLORS = {
  // Primary Brand Colors (Wine-inspired)
  primary: {
    50: '#FFF5F5',
    100: '#FFE5E5',
    200: '#FFCCCC',
    300: '#FF9999',
    400: '#FF6666',
    500: '#8B0000', // Current brand color
    600: '#7A0000',
    700: '#690000',
    800: '#580000',
    900: '#470000',
  },
  
  // Wine-Inspired Accents
  wine: {
    burgundy: '#722F37',
    merlot: '#722F37',
    chardonnay: '#F7E7CE',
    rose: '#F7CAC9',
    champagne: '#F7E7CE',
    cabernet: '#4A1A1A',
    pinot: '#8B3A3A',
  },
  
  // Accent Colors
  accent: {
    gold: '#D4AF37',
    rose: '#F7CAC9',
    burgundy: '#722F37',
    blue: '#4A90E2',
  },
  
  // Neutral Palette
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Semantic Colors
  success: {
    50: '#E8F5E8',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
  },
  warning: {
    50: '#FFF8E1',
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
  },
  error: {
    50: '#FFEBEE',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
  },
  info: {
    50: '#E3F2FD',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    tertiary: '#9E9E9E',
    inverse: '#FFFFFF',
    accent: '#8B0000',
  },
  
  // Border Colors
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
  },
  
  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  },
};

// Legacy color support (for gradual migration)
export const LEGACY_COLORS = {
  primary: COLORS.primary[500],
  secondary: COLORS.neutral[600],
  background: COLORS.background.primary,
  surface: COLORS.background.secondary,
  text: COLORS.text.primary,
  textSecondary: COLORS.text.secondary,
  border: COLORS.border.light,
  error: COLORS.error[500],
  success: COLORS.success[500],
  warning: COLORS.warning[500],
  info: COLORS.info[500],
};

export default COLORS;
