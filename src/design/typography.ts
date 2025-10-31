// PocketSomm Design System - Typography
// Modern, readable typography system

export const TYPOGRAPHY = {
  // Display Fonts (Headlines)
  display: {
    large: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    medium: {
      fontSize: 28,
      fontWeight: '600' as const,
      lineHeight: 36,
      letterSpacing: -0.25,
    },
    small: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
  },
  
  // Headline Fonts
  headline: {
    large: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    medium: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    small: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },
  
  // Body Text
  body: {
    large: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    medium: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    small: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
  },
  
  // Labels & Captions
  label: {
    large: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    medium: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
    },
  },
  
  // Button Text
  button: {
    large: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    medium: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 18,
    },
  },
  
  // Caption & Overline
  caption: {
    small: {
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 14,
    },
    medium: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    large: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
  },
  overline: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};

// Font weight constants
export const FONT_WEIGHTS = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Text alignment
export const TEXT_ALIGN = {
  left: 'left' as const,
  center: 'center' as const,
  right: 'right' as const,
  justify: 'justify' as const,
};

export default TYPOGRAPHY;
