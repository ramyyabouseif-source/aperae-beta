import { StyleSheet } from 'react-native';
import { UI_CONFIG, hasDesignSystem, hasModernLayout } from '../config/uiConfig';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../design';

// Adaptive style system that switches between original and enhanced designs
export const getAdaptiveStyles = () => {
  const useEnhanced = hasDesignSystem();
  const useModern = hasModernLayout();

  return {
    // Container styles
    container: useEnhanced ? {
      flex: 1,
      backgroundColor: COLORS.background.secondary,
    } : {
      flex: 1,
      backgroundColor: '#f8f8f8',
    },

    // Header styles
    header: useEnhanced ? {
      backgroundColor: COLORS.primary[500],
      padding: SPACING.lg,
      alignItems: 'center' as const,
      ...SHADOWS.medium,
    } : {
      backgroundColor: '#8B0000',
      padding: 20,
      alignItems: 'center' as const,
    },

    // Title styles
    title: useEnhanced ? {
      ...TYPOGRAPHY.display.medium,
      color: COLORS.text.inverse,
      marginBottom: SPACING.sm,
    } : {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#fff',
      marginBottom: 8,
    },

    // Subtitle styles
    subtitle: useEnhanced ? {
      ...TYPOGRAPHY.body.large,
      color: COLORS.text.inverse,
      opacity: 0.9,
    } : {
      fontSize: 16,
      color: '#fff',
      textAlign: 'center' as const,
    },

    // Content styles
    content: useEnhanced ? {
      padding: SPACING.lg,
    } : {
      padding: 20,
    },

    // Input styles
    inputContainer: useEnhanced ? {
      marginBottom: SPACING.lg,
    } : {
      marginBottom: 20,
    },

    inputLabel: useEnhanced ? {
      ...TYPOGRAPHY.label.large,
      color: COLORS.text.primary,
      marginBottom: SPACING.sm,
    } : {
      fontSize: 16,
      fontWeight: 'bold' as const,
      color: '#333',
      marginBottom: 8,
    },

    textInput: useEnhanced ? {
      ...TYPOGRAPHY.body.medium,
      backgroundColor: COLORS.background.primary,
      borderWidth: 2,
      borderColor: COLORS.border.light,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      minHeight: 100,
      textAlignVertical: 'top' as const,
      color: COLORS.text.primary,
    } : {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: '#fff',
      textAlignVertical: 'top' as const,
    },

    // Button styles
    button: useEnhanced ? {
      backgroundColor: COLORS.primary[500],
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.component.button,
      alignItems: 'center' as const,
      marginBottom: SPACING.lg,
      ...SHADOWS.light,
    } : {
      backgroundColor: '#8B0000',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center' as const,
      marginBottom: 20,
    },

    buttonDisabled: useEnhanced ? {
      backgroundColor: COLORS.neutral[300],
    } : {
      backgroundColor: '#ccc',
    },

    buttonText: useEnhanced ? {
      ...TYPOGRAPHY.button.medium,
      color: COLORS.text.inverse,
    } : {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold' as const,
    },

    // Card styles
    card: useEnhanced ? {
      backgroundColor: COLORS.background.primary,
      borderRadius: RADIUS.lg,
      padding: SPACING.md,
      margin: SPACING.sm,
      ...SHADOWS.medium,
    } : {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      margin: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    // Error styles
    errorContainer: useEnhanced ? {
      backgroundColor: COLORS.error[50],
      borderColor: COLORS.error[500],
      borderWidth: 1,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
    } : {
      backgroundColor: '#ffebee',
      borderColor: '#f44336',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },

    errorText: useEnhanced ? {
      ...TYPOGRAPHY.body.small,
      color: COLORS.error[700],
      textAlign: 'center' as const,
    } : {
      color: '#d32f2f',
      fontSize: 14,
      textAlign: 'center' as const,
    },

    // Menu styles
    menuContainer: useEnhanced ? {
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    } : {
      gap: 12,
      marginBottom: 20,
    },

    menuButton: useEnhanced ? {
      backgroundColor: COLORS.background.primary,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: COLORS.primary[500],
      alignItems: 'center' as const,
      ...SHADOWS.light,
    } : {
      backgroundColor: '#fff',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#8B0000',
      alignItems: 'center' as const,
    },

    menuButtonText: useEnhanced ? {
      ...TYPOGRAPHY.button.medium,
      color: COLORS.primary[500],
    } : {
      color: '#8B0000',
      fontSize: 16,
      fontWeight: 'bold' as const,
    },
  };
};

// Create StyleSheet from adaptive styles
export const createAdaptiveStyleSheet = () => {
  const styles = getAdaptiveStyles();
  return StyleSheet.create(styles);
};

export default getAdaptiveStyles;




