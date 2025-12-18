import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design';

type StatusType = 'wantToTry' | 'haveTried' | 'favorite';

interface StatusBadgeProps {
  status: StatusType;
  onPress?: (status: StatusType) => void;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * Status Badge Component
 * Displays wine status with icon and optional label
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onPress,
  size = 'medium',
  showLabel = true,
}) => {
        const statusConfig = {
          wantToTry: {
            icon: 'bookmark',
            label: 'Want to Try',
            color: '#4A90E2', // Blue
            backgroundColor: 'rgba(74, 144, 226, 0.15)',
            borderColor: '#4A90E2',
          },
          haveTried: {
            icon: 'checkmark-circle',
            label: 'Have Tried',
            color: '#27AE60', // Green
            backgroundColor: 'rgba(39, 174, 96, 0.15)',
            borderColor: '#27AE60',
          },
          favorite: {
            icon: 'heart',
            label: 'Favorite',
            color: '#E74C3C', // Red
            backgroundColor: 'rgba(231, 76, 60, 0.15)',
            borderColor: '#E74C3C',
          },
        };

  const config = statusConfig[status];
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;
  const padding = size === 'small' ? 4 : size === 'large' ? 12 : 8;

  const content = (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: showLabel ? config.backgroundColor : 'transparent',
          borderColor: showLabel ? config.borderColor : 'transparent',
          borderWidth: showLabel ? 1 : 0,
          paddingHorizontal: showLabel ? padding : 0,
          paddingVertical: showLabel ? padding / 2 : 0,
          borderRadius: showLabel ? 16 : 0,
        },
      ]}
    >
      <Ionicons name={config.icon as any} size={iconSize} color={config.color} />
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: config.color,
              fontSize,
              marginLeft: 4,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(status)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  label: {
    fontWeight: '600',
  },
});

export default StatusBadge;

