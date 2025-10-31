import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface SimpleEnhancedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const SimpleEnhancedButton: React.FC<SimpleEnhancedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  testID,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'large':
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 32;
        break;
      default: // medium
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 24;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = disabled ? '#ccc' : '#5B2433'; // Dark tone
        break;
      case 'secondary':
        baseStyle.backgroundColor = disabled ? '#f0f0f0' : '#f8f8f8';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = '#ddd';
        break;
      case 'outline':
        baseStyle.backgroundColor = disabled ? '#f0f0f0' : 'rgba(255, 255, 255, 0.95)';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = disabled ? '#ccc' : 'rgba(91, 36, 51, 0.2)'; // Dark tone border
        baseStyle.shadowColor = '#5B2433'; // Dark tone shadow
        baseStyle.shadowOffset = { width: 0, height: 4 };
        baseStyle.shadowOpacity = 0.2;
        baseStyle.shadowRadius = 8;
        baseStyle.elevation = 6;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'danger':
        baseStyle.backgroundColor = disabled ? '#ccc' : '#f44336';
        break;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default: // medium
        baseStyle.fontSize = 16;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.color = '#fff';
        break;
      case 'secondary':
        baseStyle.color = disabled ? '#999' : '#333';
        break;
      case 'outline':
        baseStyle.color = disabled ? '#ccc' : '#5B2433'; // Dark tone text
        baseStyle.fontWeight = '600';
        break;
      case 'ghost':
        baseStyle.color = disabled ? '#999' : '#5B2433'; // Dark tone text
        break;
      case 'danger':
        baseStyle.color = '#fff';
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#5B2433'} // Dark tone
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default SimpleEnhancedButton;
