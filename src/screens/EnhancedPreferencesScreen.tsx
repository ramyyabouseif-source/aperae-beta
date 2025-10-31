import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PreferencesService } from '../services/preferencesService';
import { WinePreferences } from '../types/wine';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../design';
import AdaptiveButton from '../components/AdaptiveButton';

const EnhancedPreferencesScreen: React.FC = () => {
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
          <Ionicons name={icon as any} size={20} color={COLORS.primary[500]} />
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
              <Ionicons name="checkmark" size={16} color={COLORS.primary[500]} />
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
          <Ionicons name="wine" size={20} color={COLORS.primary[500]} />
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
          <Ionicons name="snow" size={20} color={COLORS.primary[500]} />
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
          <Ionicons name="diamond" size={20} color={COLORS.primary[500]} />
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
          <Ionicons name="wallet" size={20} color={COLORS.primary[500]} />
          <Text style={styles.quickActionText}>Budget Friendly</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="settings" size={48} color={COLORS.primary[500]} />
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="person-circle" size={32} color={COLORS.primary[500]} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Wine Preferences</Text>
              <Text style={styles.headerSubtitle}>
                Tell us about your taste to get better recommendations
              </Text>
            </View>
          </View>
        </View>

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
          <AdaptiveButton
            title="Save Preferences"
            onPress={handleSavePreferences}
            variant="primary"
            size="large"
            loading={saving}
            fullWidth
            style={styles.saveButton}
          />
          
          <AdaptiveButton
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
    backgroundColor: COLORS.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body.large,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading.large,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.secondary,
  },
  quickActionsContainer: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.md,
    ...SHADOWS.light,
  },
  quickActionsTitle: {
    ...TYPOGRAPHY.heading.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.xs,
  },
  quickActionText: {
    ...TYPOGRAPHY.button.small,
    color: COLORS.primary[500],
    marginLeft: SPACING.sm,
  },
  sectionContainer: {
    backgroundColor: COLORS.background.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading.medium,
    color: COLORS.text.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[500],
  },
  optionText: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  optionTextSelected: {
    color: COLORS.primary[500],
    fontWeight: '600',
  },
  actionButtonsContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  saveButton: {
    marginBottom: SPACING.md,
  },
  clearButton: {
    borderColor: COLORS.error[500],
  },
});

export default EnhancedPreferencesScreen;




