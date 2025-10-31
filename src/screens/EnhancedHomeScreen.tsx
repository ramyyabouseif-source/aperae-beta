import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WineService } from '../services/wineService';
import { WineRecommendationResponse } from '../types/wine';
import EnhancedWineCard from '../components/EnhancedWineCard';
import EnhancedButton from '../components/EnhancedButton';
import MockModeToggle from '../components/MockModeToggle';
import { PreferencesService } from '../services/preferencesService';
import { FavoritesService } from '../services/favoritesService';
import { UserPreferences } from '../types/preferences';
import { InputValidator } from '../utils/validation';
import { SecureErrorHandler } from '../utils/errorHandler';
import { sortWinesForAPIMode, sortWinesForMockMode } from '../utils/wineSorting';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../design';

const { width } = Dimensions.get('window');

export default function EnhancedHomeScreen() {
  const [dish, setDish] = useState('');
  const [recommendations, setRecommendations] = useState<WineRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const handleGetRecommendations = async () => {
    setError(null);
    
    if (!dish.trim()) {
      Alert.alert('Error', 'Please enter a dish or food item');
      return;
    }

    const validation = InputValidator.validateDishInput(dish);
    if (!validation.isValid) {
      Alert.alert('Invalid Input', validation.errors.join('\n'));
      return;
    }

    const sanitizedDish = InputValidator.sanitizeInput(dish);

    try {
      setLoading(true);
      setRecommendations(null);
      
      // Animate loading state
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      const userPreferences = await PreferencesService.getPreferences();
      
      if (userPreferences) {
        const prefValidation = InputValidator.validatePreferences(userPreferences);
        if (!prefValidation.isValid) {
          Alert.alert('Invalid Preferences', prefValidation.errors.join('\n'));
          return;
        }
      }
      
      const result = await WineService.getWineRecommendations(sanitizedDish, userPreferences);
      
      if (result && result.dish && result.recommendations && Array.isArray(result.recommendations)) {
        // Apply sorting based on mode
        const isMockMode = WineService.isMockModeEnabled();
        const sortedRecommendations = isMockMode 
          ? sortWinesForMockMode(result.recommendations)
          : sortWinesForAPIMode(result.recommendations);
        
        setRecommendations({
          ...result,
          recommendations: sortedRecommendations
        });
        
        // Animate results appearance
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        throw new Error('Received invalid recommendations data');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      const errorMessage = SecureErrorHandler.getErrorMessage(error, 'HomeScreen.getRecommendations');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (wine: any) => {
    try {
      await FavoritesService.addToFavorites(wine);
      Alert.alert('Success', 'Wine added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Failed to add wine to favorites');
    }
  };

  const handleRemoveFromFavorites = async (wine: any) => {
    try {
      if (wine.id) {
        await FavoritesService.removeFromFavorites(wine.id);
        Alert.alert('Success', 'Wine removed from favorites!');
      } else {
        Alert.alert('Error', 'Cannot remove wine - missing ID');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      Alert.alert('Error', 'Failed to remove wine from favorites');
    }
  };

  const quickDishes = [
    'Grilled Salmon',
    'Ribeye Steak',
    'Lobster Bisque',
    'Chocolate Cake',
    'Caesar Salad',
    'Pasta Carbonara',
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Discover Perfect Wine Pairings</Text>
            <Text style={styles.heroSubtitle}>
              AI-powered recommendations from our master sommelier
            </Text>
          </View>
          <View style={styles.heroDecoration}>
            <Text style={styles.heroEmoji}>🍷</Text>
          </View>
        </View>

        {/* Mock Mode Toggle */}
        <View style={styles.mockModeContainer}>
          <MockModeToggle />
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>What are you pairing?</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={dish}
              onChangeText={setDish}
              placeholder="e.g., Ribeye steak with creamed spinach"
              placeholderTextColor={COLORS.text.tertiary}
              multiline
              numberOfLines={3}
              maxLength={500}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Dish description input"
              accessibilityHint="Enter the name of a dish or food item to get wine recommendations"
            />
            <View style={styles.inputFooter}>
              <Text style={styles.characterCount}>{dish.length}/500</Text>
            </View>
          </View>

          {/* Quick Dish Suggestions */}
          <View style={styles.quickDishesContainer}>
            <Text style={styles.quickDishesTitle}>Popular dishes:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickDishesScroll}
            >
              {quickDishes.map((quickDish, index) => (
                <EnhancedButton
                  key={index}
                  title={quickDish}
                  onPress={() => setDish(quickDish)}
                  variant="outline"
                  size="small"
                  style={styles.quickDishButton}
                />
              ))}
            </ScrollView>
          </View>

          {/* Error Display */}
          {error && (
            <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Get Recommendations Button */}
          <EnhancedButton
            title={loading ? 'Finding Perfect Wines...' : 'Get Wine Recommendations'}
            onPress={handleGetRecommendations}
            variant="primary"
            size="large"
            loading={loading}
            disabled={loading || !dish.trim()}
            fullWidth
            style={styles.recommendButton}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <EnhancedButton
              title="📋 Menu"
              onPress={() => navigation.navigate('Menu')}
              variant="secondary"
              size="medium"
              style={styles.quickActionButton}
            />
            <EnhancedButton
              title="❤️ Favorites"
              onPress={() => navigation.navigate('Favorites')}
              variant="secondary"
              size="medium"
              style={styles.quickActionButton}
            />
            <EnhancedButton
              title="🍷 Preferences"
              onPress={() => navigation.navigate('Preferences')}
              variant="secondary"
              size="medium"
              style={styles.quickActionButton}
            />
          </View>
        </View>

        {/* Recommendations */}
        {recommendations && (
          <Animated.View
            style={[
              styles.recommendationsSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <View style={styles.recommendationsHeader}>
              <Text style={styles.sectionTitle}>
                Perfect Pairings for {recommendations.dish}
              </Text>
              <Text style={styles.recommendationsSubtitle}>
                {recommendations.recommendations.length} expertly curated recommendations
              </Text>
            </View>

            {recommendations.recommendations.map((wine, index) => (
              <EnhancedWineCard
                key={index}
                wine={wine}
                onAddToFavorites={handleAddToFavorites}
                onRemoveFromFavorites={handleRemoveFromFavorites}
              />
            ))}

            {recommendations.closingNarrative && (
              <View style={styles.closingNarrative}>
                <Text style={styles.narrativeText}>
                  {recommendations.closingNarrative}
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  
  // Hero Section
  heroSection: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    ...TYPOGRAPHY.display.medium,
    color: COLORS.text.inverse,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body.large,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  heroDecoration: {
    marginLeft: SPACING.lg,
  },
  heroEmoji: {
    fontSize: 64,
  },
  
  // Mock Mode
  mockModeContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  
  // Search Section
  searchSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  textInput: {
    ...TYPOGRAPHY.body.medium,
    backgroundColor: COLORS.background.primary,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minHeight: 100,
    textAlignVertical: 'top',
    color: COLORS.text.primary,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  characterCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  
  // Quick Dishes
  quickDishesContainer: {
    marginBottom: SPACING.lg,
  },
  quickDishesTitle: {
    ...TYPOGRAPHY.label.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  quickDishesScroll: {
    paddingRight: SPACING.lg,
  },
  quickDishButton: {
    marginRight: SPACING.sm,
  },
  
  // Error
  errorContainer: {
    backgroundColor: COLORS.error[50],
    borderColor: COLORS.error[500],
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.error[700],
    textAlign: 'center',
  },
  
  // Button
  recommendButton: {
    marginBottom: SPACING.xl,
  },
  
  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    minWidth: (width - SPACING.lg * 2 - SPACING.sm * 2) / 3,
  },
  
  // Recommendations
  recommendationsSection: {
    paddingHorizontal: SPACING.lg,
  },
  recommendationsHeader: {
    marginBottom: SPACING.lg,
  },
  recommendationsSubtitle: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  closingNarrative: {
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.light,
  },
  narrativeText: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.secondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
