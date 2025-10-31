import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EnhancedError, ErrorRecoveryAction } from '../utils/enhancedErrorHandler';

interface EnhancedErrorDisplayProps {
  error: EnhancedError;
  onDismiss?: () => void;
  style?: any;
  customActions?: Record<string, () => void>;
}

const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  error,
  onDismiss,
  style,
  customActions,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      case 'critical': return '#9C27B0';
      default: return '#FF9800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return 'information-circle';
      case 'medium': return 'warning';
      case 'high': return 'alert-circle';
      case 'critical': return 'close-circle';
      default: return 'warning';
    }
  };

  const handleRecoveryAction = (action: ErrorRecoveryAction) => {
    try {
      // Check if there's a custom action for this label
      const customAction = customActions?.[action.label];
      if (customAction) {
        customAction();
      } else {
        action.action();
      }
      onDismiss?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to execute recovery action');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getSeverityIcon(error.severity)}
            size={24}
            color={getSeverityColor(error.severity)}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{error.title}</Text>
          <Text style={styles.message}>{error.message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color="#6C6C6C" />
          </TouchableOpacity>
        )}
      </View>

      {error.recoveryActions.length > 0 && (
        <View style={styles.actionsContainer}>
          {error.recoveryActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                action.variant === 'primary' && styles.primaryAction,
                action.variant === 'danger' && styles.dangerAction,
              ]}
              onPress={() => handleRecoveryAction(action)}
              accessibilityLabel={action.label}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.actionText,
                  action.variant === 'primary' && styles.primaryActionText,
                  action.variant === 'danger' && styles.dangerActionText,
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)',
    shadowColor: '#BF9694',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B2433',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#6C6C6C',
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)',
    backgroundColor: '#F7F4F0',
  },
  primaryAction: {
    backgroundColor: '#5B2433',
    borderColor: '#5B2433',
  },
  dangerAction: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B2433',
  },
  primaryActionText: {
    color: '#FFFFFF',
  },
  dangerActionText: {
    color: '#FFFFFF',
  },
});

export default EnhancedErrorDisplay;
