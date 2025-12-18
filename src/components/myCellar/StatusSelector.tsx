import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design';
import StatusBadge from './StatusBadge';

type StatusType = 'wantToTry' | 'haveTried' | 'favorite';

interface StatusSelectorProps {
  currentStatus: StatusType;
  onStatusChange: (status: StatusType) => void;
  style?: any;
}

/**
 * Status Selector Component
 * Allows user to change wine status between Want to Try, Have Tried, and Favorite
 */
const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  style,
}) => {
  // Remove 'favorite' - if it's in My Cellar, it's already a favorite
  const statuses: StatusType[] = ['wantToTry', 'haveTried'];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Status</Text>
      <View style={styles.optionsContainer}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.option,
              currentStatus === status && styles.optionSelected,
            ]}
            onPress={() => onStatusChange(status)}
            activeOpacity={0.7}
          >
            <StatusBadge
              status={status}
              size="small"
              showLabel={true}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
});

export default StatusSelector;

