import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PreferencesService } from '../services/preferencesService';
import { WinePreferences } from '../types/wine';
import SimpleEnhancedButton from '../components/SimpleEnhancedButton';

const SimpleEnhancedPreferencesScreen: React.FC = () => {
  const [preferences, setPreferences] = useState<WinePreferences>({
    wineType: '',
    priceRange: '',
    region: '',
    vintage: '',
    body: '',
    acidity: '',
    tannins: '',
    sweetness: '',
    alcoholContent: '',
    foodPairing: '',
    occasion: '',
    experience: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const savedPreferences = await PreferencesService.getPreferences();
      setPreferences(savedPreferences || {});
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await PreferencesService.savePreferences(preferences);
      Alert.alert('Success', 'Your wine preferences have been saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleClearPreferences = () => {
    Alert.alert(
      'Clear Preferences',
      'Are you sure you want to clear all your wine preferences?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await PreferencesService.clearPreferences();
              setPreferences({});
              Alert.alert('Success', 'Preferences cleared successfully');
            } catch (error) {
              console.error('Error clearing preferences:', error);
              Alert.alert('Error', 'Failed to clear preferences');
            }
          },
        },
      ]
    );
  };

  const updatePreference = (key: keyof WinePreferences, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const renderPreferenceSection = (
    title: string,
    key: keyof WinePreferences,
    options: string[],
    icon: string
  ) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Ionicons name={icon as any} size={20} color="#8B0000" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              preferences[key] === option && styles.optionButtonSelected,
            ]}
            onPress={() => updatePreference(key, option)}
          >
            <Text
              style={[
                styles.optionText,
                preferences[key] === option && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
            {preferences[key] === option && (
              <Ionicons name="checkmark" size={16} color="#8B0000" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            setPreferences({
              wineType: 'Red',
              priceRange: '$20-$50',
              body: 'Medium',
              acidity: 'Medium',
              tannins: 'Medium',
            });
          }}
        >
          <Ionicons name="wine" size={20} color="#8B0000" />
          <Text style={styles.quickActionText}>Red Wine Lover</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            setPreferences({
              wineType: 'White',
              priceRange: '$15-$40',
              body: 'Light',
              acidity: 'High',
              sweetness: 'Dry',
            });
          }}
        >
          <Ionicons name="snow" size={20} color="#8B0000" />
          <Text style={styles.quickActionText}>White Wine Fan</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            setPreferences({
              priceRange: '$50+',
              region: 'Bordeaux',
              vintage: '2015-2020',
              body: 'Full',
            });
          }}
        >
          <Ionicons name="diamond" size={20} color="#8B0000" />
          <Text style={styles.quickActionText}>Premium Seeker</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            setPreferences({
              priceRange: 'Under $20',
              body: 'Light',
              acidity: 'Medium',
              tannins: 'Low',
            });
          }}
        >
          <Ionicons name="wallet" size={20} color="#8B0000" />
          <Text style={styles.quickActionText}>Budget Friendly</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="settings" size={48} color="#8B0000" />
          <Text style={styles.loadingText}>Loading your preferences...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Wine Type */}
        {renderPreferenceSection(
          'Wine Type',
          'wineType',
          ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'],
          'wine'
        )}

        {/* Price Range */}
        {renderPreferenceSection(
          'Price Range',
          'priceRange',
          ['Under $20', '$20-$50', '$50-$100', '$100+', 'Any'],
          'cash'
        )}

        {/* Region */}
        {renderPreferenceSection(
          'Preferred Region',
          'region',
          ['Bordeaux', 'Burgundy', 'Tuscany', 'Napa Valley', 'Barossa Valley', 'Any'],
          'globe'
        )}

        {/* Body */}
        {renderPreferenceSection(
          'Wine Body',
          'body',
          ['Light', 'Medium', 'Full', 'Any'],
          'fitness'
        )}

        {/* Acidity */}
        {renderPreferenceSection(
          'Acidity Level',
          'acidity',
          ['Low', 'Medium', 'High', 'Any'],
          'flash'
        )}

        {/* Tannins */}
        {renderPreferenceSection(
          'Tannin Level',
          'tannins',
          ['Low', 'Medium', 'High', 'Any'],
          'leaf'
        )}

        {/* Sweetness */}
        {renderPreferenceSection(
          'Sweetness',
          'sweetness',
          ['Dry', 'Off-Dry', 'Semi-Sweet', 'Sweet', 'Any'],
          'heart'
        )}

        {/* Occasion */}
        {renderPreferenceSection(
          'Occasion',
          'occasion',
          ['Casual Dinner', 'Special Celebration', 'Gift', 'Cellaring', 'Any'],
          'calendar'
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <SimpleEnhancedButton
            title="Save Preferences"
            onPress={handleSavePreferences}
            variant="primary"
            size="large"
            loading={saving}
            fullWidth
            style={styles.saveButton}
          />
          
          <SimpleEnhancedButton
            title="Clear All Preferences"
            onPress={handleClearPreferences}
            variant="outline"
            size="medium"
            fullWidth
            style={styles.clearButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4F0', // Light tone
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4F0', // Light tone
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#5B2433', // Dark tone
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone
    padding: 24,
    marginBottom: 16,
    shadowColor: '#BF9694', // Metallic accent
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F7F4F0', // Light tone
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5B2433', // Dark tone
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#5B2433', // Dark tone
  },
  quickActionsContainer: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone
    padding: 24,
    marginBottom: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: '#BF9694', // Metallic accent
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5B2433', // Dark tone
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F4F0', // Light tone
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B2433', // Dark tone
    marginLeft: 8,
  },
  sectionContainer: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#BF9694', // Metallic accent
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7F4F0', // Light tone
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5B2433', // Dark tone
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F4F0', // Light tone
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(191, 150, 148, 0.1)', // Light metallic accent
    borderColor: '#BF9694', // Metallic accent
  },
  optionText: {
    fontSize: 14,
    color: '#5B2433', // Dark tone
    marginRight: 8,
  },
  optionTextSelected: {
    color: '#5B2433', // Dark tone
    fontWeight: '600',
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  saveButton: {
    marginBottom: 16,
  },
  clearButton: {
    borderColor: '#f44336',
  },
});

export default SimpleEnhancedPreferencesScreen;
