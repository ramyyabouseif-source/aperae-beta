import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { UI_CONFIG, hasEnhancedComponents } from '../config/uiConfig';
import SimpleEnhancedButton from './SimpleEnhancedButton';

interface AdaptiveButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const AdaptiveButton: React.FC<AdaptiveButtonProps> = (props) => {
  // Use enhanced component if available and enabled
  if (hasEnhancedComponents()) {
    return <SimpleEnhancedButton {...props} />;
  }

  // Fallback to original TouchableOpacity implementation
  return <OriginalButton {...props} />;
};

// Original button implementation (your current design)
const OriginalButton: React.FC<AdaptiveButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  testID,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: disabled ? '#ccc' : '#8B0000',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    return {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default AdaptiveButton;
