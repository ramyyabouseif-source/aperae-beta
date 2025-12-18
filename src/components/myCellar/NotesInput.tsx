import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../design';

interface NotesInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  maxLength?: number;
  style?: any;
  onBlur?: () => void; // Callback when input loses focus
  onFocus?: () => void; // Callback when input gains focus
  inputRef?: React.RefObject<any>; // Ref to the TextInput
}

/**
 * Notes Input Component
 * A styled text input for notes with character count
 */
const NotesInput: React.FC<NotesInputProps> = ({
  label,
  placeholder = 'Add notes...',
  value,
  onChangeText,
  multiline = true,
  maxLength = 500,
  style,
  onBlur,
  onFocus,
  inputRef,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
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
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    backgroundColor: COLORS.background.primary,
    minHeight: 100,
    padding: 12,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary[500],
    borderWidth: 2,
  },
  input: {
    fontSize: 14,
    color: COLORS.text.primary,
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default NotesInput;

