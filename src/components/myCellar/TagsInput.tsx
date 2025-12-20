import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design';

interface TagsInputProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  style?: any;
}

/**
 * Tags Input Component
 * Allows users to add/remove tags with suggestions
 */
const TagsInput: React.FC<TagsInputProps> = ({
  label,
  tags = [],
  onTagsChange,
  placeholder = 'Add a tag...',
  suggestions = [],
  style,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(suggestion)
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      
      {/* Current Tags */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveTag(tag)}
                style={styles.tagRemoveButton}
              >
                <Ionicons name="close-circle" size={16} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.tertiary}
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            setShowSuggestions(text.length > 0);
          }}
          onSubmitEditing={() => handleAddTag(inputValue)}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
        />
        {inputValue.trim() && (
          <TouchableOpacity
            onPress={() => handleAddTag(inputValue)}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.primary[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionTag}
                onPress={() => handleAddTag(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  tagText: {
    fontSize: 14,
    color: COLORS.primary[700],
    fontWeight: '500',
  },
  tagRemoveButton: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background.primary,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
    paddingVertical: 8,
  },
  addButton: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionTag: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default TagsInput;



