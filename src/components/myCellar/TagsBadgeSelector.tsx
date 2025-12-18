import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../design';

interface TagsBadgeSelectorProps {
  label: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
  style?: any;
}

/**
 * Tags Badge Selector Component
 * Allows users to select tags from a predefined list of badges
 */
const TagsBadgeSelector: React.FC<TagsBadgeSelectorProps> = ({
  label,
  selectedTags = [],
  onTagsChange,
  availableTags = [],
  style,
}) => {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      // Add tag
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesContainer}
      >
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.badge,
                isSelected && styles.badgeSelected,
              ]}
              onPress={() => handleTagToggle(tag)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.badgeText,
                isSelected && styles.badgeTextSelected,
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedTags.length === 0 && (
        <Text style={styles.hint}>Tap badges to add tags</Text>
      )}
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
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  badgeSelected: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  badgeTextSelected: {
    color: COLORS.text.inverse,
  },
  hint: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default TagsBadgeSelector;


