import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { UserPreferences, PREFERENCE_CATEGORIES, PreferenceCategory } from '../types/preferences';
import { PreferencesService } from '../services/preferencesService';

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPreferences = await PreferencesService.getPreferences();
      if (savedPreferences) {
        setPreferences(savedPreferences);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load preferences');
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      await PreferencesService.savePreferences(preferences);
      Alert.alert('Success', 'Preferences saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const clearPreferences = () => {
    Alert.alert(
      'Clear Preferences',
      'Are you sure you want to clear all preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await PreferencesService.clearPreferences();
              setPreferences({});
              Alert.alert('Success', 'Preferences cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear preferences');
            }
          }
        }
      ]
    );
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateMultiplePreference = (key: keyof UserPreferences, value: string, isSelected: boolean) => {
    setPreferences(prev => {
      const currentValues = (prev[key] as string[]) || [];
      if (isSelected) {
        return { ...prev, [key]: [...currentValues, value] };
      } else {
        return { ...prev, [key]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const renderPreferenceCategory = (category: PreferenceCategory) => {
    const currentValue = preferences[category.id as keyof UserPreferences];

    return (
      <View key={category.id} style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        
        {category.type === 'boolean' ? (
          <View style={styles.booleanContainer}>
            {category.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.booleanOption,
                  currentValue === option.value && styles.booleanOptionSelected
                ]}
                onPress={() => updatePreference(category.id as keyof UserPreferences, option.value)}
              >
                <Text style={[
                  styles.booleanOptionText,
                  currentValue === option.value && styles.booleanOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : category.type === 'multiple' ? (
          <View style={styles.multipleContainer}>
            {category.options.map((option) => {
              const isSelected = Array.isArray(currentValue) && currentValue.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.multipleOption,
                    isSelected && styles.multipleOptionSelected
                  ]}
                  onPress={() => updateMultiplePreference(
                    category.id as keyof UserPreferences,
                    option.value,
                    !isSelected
                  )}
                >
                  <Text style={[
                    styles.multipleOptionText,
                    isSelected && styles.multipleOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.singleContainer}>
            {category.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.singleOption,
                  currentValue === option.value && styles.singleOptionSelected
                ]}
                onPress={() => updatePreference(category.id as keyof UserPreferences, option.value)}
              >
                <Text style={[
                  styles.singleOptionText,
                  currentValue === option.value && styles.singleOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {option.description && (
                  <Text style={styles.optionDescription}>{option.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wine Preferences</Text>
        <Text style={styles.subtitle}>
          Customize your wine recommendations
        </Text>
      </View>

      {PREFERENCE_CATEGORIES.map(renderPreferenceCategory)}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearPreferences}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  header: {
    backgroundColor: '#8B0000',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  singleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  singleOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  singleOptionSelected: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  singleOptionText: {
    fontSize: 14,
    color: '#333',
  },
  singleOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  multipleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  multipleOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 120,
  },
  multipleOptionSelected: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  multipleOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  multipleOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  booleanOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 4,
  },
  booleanOptionSelected: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  booleanOptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  booleanOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#8B0000',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B0000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButtonText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});