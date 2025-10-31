import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WineService } from '../services/wineService';
import { WineRecommendationResponse } from '../types/wine';
import AdaptiveWineCard from '../components/AdaptiveWineCard';
import SimpleEnhancedButton from '../components/SimpleEnhancedButton';
import MockModeToggle from '../components/MockModeToggle';
import { PreferencesService } from '../services/preferencesService';
import { FavoritesService } from '../services/favoritesService';
import { InputValidator } from '../utils/validation';
import { SecureErrorHandler } from '../utils/errorHandler';
// Enhanced foundation components
import { SkeletonWineCard, ProgressIndicator } from '../components/LoadingStates';
import EnhancedErrorDisplay from '../components/EnhancedErrorDisplay';
import { EnhancedErrorHandler, EnhancedError } from '../utils/enhancedErrorHandler';
import performanceMonitor from '../utils/performanceMonitor';
import privacyManager from '../utils/privacyManager';
import { sortWinesForAPIMode, sortWinesForMockMode } from '../utils/wineSorting';

export default function SimpleEnhancedHomeScreen() {
  const [dish, setDish] = useState('');
  const [recommendations, setRecommendations] = useState<WineRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Enhanced state for better UX
  const [enhancedError, setEnhancedError] = useState<EnhancedError | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const navigation = useNavigation();
  
  // Ref for dish input field
  const dishInputRef = useRef<TextInput>(null);

  const handleGetRecommendations = async () => {
    const timingId = performanceMonitor.startTiming('wine_recommendations', {
      dish,
      timestamp: new Date().toISOString(),
    });

    setError(null);
    setEnhancedError(null);

    // Check privacy consent for wine recommendations
    try {
      if (!privacyManager.hasConsentFor('wine_recommendations')) {
        const consent = await privacyManager.requestConsent();
        if (!consent) {
          console.log('User declined privacy consent for wine recommendations');
          return;
        }
      }
    } catch (error) {
      console.warn('Privacy consent check failed:', error);
      // Continue without privacy check if it fails
    }
    
    if (!dish.trim()) {
      const validationError = EnhancedErrorHandler.createEnhancedError(
        new Error('Please enter a dish or food item to get wine recommendations'),
        {
          operation: 'validateInput',
          component: 'SimpleEnhancedHomeScreen',
          userAction: 'getRecommendations',
        }
      );
      setEnhancedError(validationError);
      return;
    }

    const validation = InputValidator.validateDishInput(dish);
    if (!validation.isValid) {
      const validationError = EnhancedErrorHandler.createEnhancedError(
        new Error(validation.errors?.[0] || 'Please enter a valid dish name to get wine recommendations'),
        {
          operation: 'validateDishInput',
          component: 'SimpleEnhancedHomeScreen',
          userAction: 'getRecommendations',
        }
      );
      setEnhancedError(validationError);
      return;
    }

    setLoading(true);
    setProgress(0);
    // Add a gentle expectation alongside existing skeletons
    const startTs = Date.now();
    setLoadingMessage('Generating recommendations (10–30s)...');

    try {
      // Simulate progress updates + dynamic ETA for better UX
      const progressInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTs) / 1000);
        const estTotal = 30; // upper-bound estimate
        const remaining = Math.max(3, estTotal - elapsedSec);
        setLoadingMessage(`Generating recommendations (~${remaining}s remaining)...`);
        setProgress(prev => {
          if (prev >= 0.9) {
            clearInterval(progressInterval);
            return 0.9;
          }
          return prev + 0.1;
        });
      }, 1000);

      setProgress(0.2);
      setLoadingMessage('Analyzing dish...');

      setProgress(0.3);
      setLoadingMessage('Finding perfect wine pairings...');

      const preferences = await PreferencesService.getPreferences();
      const response = await WineService.getWineRecommendations(dish, preferences || undefined);
      
      clearInterval(progressInterval);
      setProgress(1.0);
      setLoadingMessage('Complete!');
      
      // Apply sorting based on mode
      if (response && response.recommendations && Array.isArray(response.recommendations)) {
        const isMockMode = WineService.isMockModeEnabled();
        const sortedRecommendations = isMockMode 
          ? sortWinesForMockMode(response.recommendations)
          : sortWinesForAPIMode(response.recommendations);
        
        setRecommendations({
          ...response,
          recommendations: sortedRecommendations
        });
      } else {
        setRecommendations(response);
      }

      // Record data collection for privacy compliance
      try {
        await privacyManager.recordDataCollection('wine_recommendations', 'personalization', {
          dish: dish,
          recommendationCount: response?.recommendations?.length || 0,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('Failed to record data collection:', error);
      }

      // Track successful API call
      performanceMonitor.trackApiCall(
        '/recommendations',
        'POST',
        performance.now() - 1000, // Approximate start time
        performance.now(),
        200,
        JSON.stringify(response).length
      );

    } catch (error) {
      console.error('Error fetching wine recommendations:', error);
      
      // Create enhanced error with recovery actions
      const enhancedError = EnhancedErrorHandler.createEnhancedError(error, {
        operation: 'getWineRecommendations',
        component: 'SimpleEnhancedHomeScreen',
        userAction: 'getRecommendations',
        retryable: true,
      });

      setEnhancedError(enhancedError);
      
      // Log error for monitoring
      EnhancedErrorHandler.logError(enhancedError);

      // Fallback to basic error for compatibility
      const safeError = SecureErrorHandler.sanitizeError(error);
      setError(safeError);
    } finally {
      setLoading(false);
      setProgress(0);
      setLoadingMessage('');
      
      // End performance timing
      performanceMonitor.endTiming(timingId, {
        success: !error && !enhancedError,
        recommendationCount: recommendations?.recommendations?.length || 0,
      });
    }
  };

  const handleDismissError = () => {
    setEnhancedError(null);
  };

  const handleFocusDishInput = () => {
    dishInputRef.current?.focus();
    setIsInputFocused(true);
    setEnhancedError(null); // Also dismiss the error when focusing
    // Clear the field if it's empty to give user a fresh start
    if (!dish.trim()) {
      setDish('');
    }
  };

  const handleAddToFavorites = async (wine: any) => {
    try {
      await FavoritesService.addToFavorites(wine);
      Alert.alert('Success', 'Wine added to favorites!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add wine to favorites');
    }
  };

  const handleRemoveFromFavorites = async (wine: any) => {
    try {
      await FavoritesService.removeFromFavorites(wine);
      Alert.alert('Success', 'Wine removed from favorites!');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove wine from favorites');
    }
  };


  return (
    <View style={styles.pageContainer}>
      {/* Transparent Status Bar */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      
      {/* Vineyard Hero Background - Using local vineyard image */}
      <Animated.Image
        source={require('../../assets/images/vineyard-hero-background.jpg')}
        style={styles.wineCellarBackground}
        resizeMode="cover"
      />
      <View style={styles.wineCellarOverlay} />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Logo Header */}
        <View style={styles.logoHeaderContainer}>
          <Image
            source={require('../../assets/images/pocketsomm-logo.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Hero Section - Wine red background */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Discover Your Perfect Wine</Text>
            <Text style={styles.heroSubtitle}>
              Get AI-powered wine recommendations tailored to your taste and food pairings
            </Text>
            <View style={styles.heroAccent} />
          </View>
        </View>

        {/* Mock Mode Toggle */}
        <MockModeToggle />

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>What are you eating?</Text>
          <TextInput
            ref={dishInputRef}
            style={[
              styles.textInput,
              isInputFocused && styles.textInputFocused
            ]}
            value={dish}
            onChangeText={setDish}
            placeholder="Enter a dish, food item, or cuisine..."
            placeholderTextColor="#999"
            multiline
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            accessibilityLabel="Dish input"
            accessibilityHint="Enter the dish you want wine recommendations for"
            accessibilityRole="text"
          />
          <SimpleEnhancedButton
            title={loading ? "Finding Perfect Wines..." : "Get Wine Recommendations"}
            onPress={handleGetRecommendations}
            variant="primary"
            size="large"
            loading={loading}
            fullWidth
            style={styles.recommendButton}
          />
        </View>

        {/* Enhanced Progress Indicator */}
        {loading && (
          <View style={styles.progressContainer}>
            <ProgressIndicator progress={progress} message={loadingMessage} />
          </View>
        )}

        {/* Skeleton Wine Cards During Loading */}
        {loading && (
          <View style={styles.skeletonContainer}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 16 }]}>
              Finding Perfect Wine Pairings...
            </Text>
            <SkeletonWineCard delay={0} />
            <SkeletonWineCard delay={200} />
            <SkeletonWineCard delay={400} />
          </View>
        )}

        {/* Enhanced Error Display */}
        {enhancedError && (
          <EnhancedErrorDisplay
            error={enhancedError}
            onDismiss={handleDismissError}
            style={styles.enhancedErrorContainer}
            customActions={{
              'Enter Dish': handleFocusDishInput,
              'Fix Input': handleFocusDishInput,
            }}
          />
        )}

        {/* Fallback Error Display */}
        {error && !enhancedError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Recommendations */}
        {recommendations && (
          <View style={styles.recommendationsSection}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>
              Wine Recommendations for "{recommendations.dish}"
            </Text>
                    {recommendations.recommendations.map((wine, index) => (
                      <AdaptiveWineCard
                        key={`${wine.wineName}-${index}`}
                        wine={wine}
                        index={index}
                        onAddToFavorites={handleAddToFavorites}
                        onRemoveFromFavorites={handleRemoveFromFavorites}
                      />
                    ))}
          </View>
        )}

        {/* Navigation Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu Navigation</Text>
          <View style={styles.menuAccent} />
          <SimpleEnhancedButton
            title="Browse Menu Categories"
            onPress={() => navigation.navigate('Menu' as never)}
            variant="outline"
            size="medium"
            fullWidth
            style={styles.menuButton}
          />
          <SimpleEnhancedButton
            title="My Favorites"
            onPress={() => navigation.navigate('Favorites' as never)}
            variant="outline"
            size="medium"
            fullWidth
            style={styles.menuButton}
          />
          <SimpleEnhancedButton
            title="Wine Preferences"
            onPress={() => navigation.navigate('Preferences' as never)}
            variant="outline"
            size="medium"
            fullWidth
            style={styles.menuButton}
          />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to show wine cellar background
  },
  wineCellarBackground: {
    position: 'absolute',
    top: -200, // Fill screen - extend beyond header
    left: 0, // Fill screen - no horizontal offset
    right: 0,
    bottom: 0,
    width: '100%', // Fill screen - full width
    height: '150%', // Fill screen - extend beyond viewport
    opacity: 0.5, // More visible to show through header
  },
  wineCellarOverlay: {
    position: 'absolute',
    top: -200, // Match the screen-filling background
    left: 0, // Match the screen-filling background
    right: 0,
    bottom: 0,
    width: '100%', // Match the screen-filling background
    height: '150%', // Match the screen-filling background height
    backgroundColor: 'rgba(91, 36, 51, 0.2)', // Dark tone overlay - reduced by 20%
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0, // Remove top padding to bring logo to top
    paddingBottom: 60, // More room at bottom
  },
  heroSection: {
    height: 180, // Much smaller height
    marginTop: 20, // Extra space from header
    marginBottom: 32, // More space after hero
    marginHorizontal: 20, // More margin to show background
    borderRadius: 16, // Smaller radius
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1, // Thinner border
    borderColor: 'rgba(191, 150, 148, 0.4)', // Metallic accent border
    position: 'relative',
    backgroundColor: '#5B2433', // Dark tone background
  },
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    // Same as wine cards - no opacity here, let the overlay handle it
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Perfect balance for readability
  },
  heroContent: {
    flex: 1,
    padding: 16, // Further reduced padding
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  heroAccent: {
    width: 100, // Slightly smaller
    height: 4, // Thinner
    backgroundColor: '#BF9694', // Metallic accent
    marginTop: 16, // Reduced from 24
    borderRadius: 3,
    shadowColor: '#BF9694',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28, // Reduced from 38
    fontWeight: '700', // Slightly lighter than 'bold' for sophistication
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12, // Reduced from 18
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    letterSpacing: 0.8, // Increased for elegance
  },
  heroSubtitle: {
    fontSize: 16, // Reduced from 22
    color: '#fff',
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 22, // Reduced from 30
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 22, // Slightly smaller
    fontWeight: '800',
    color: '#F7F4F0', // Light tone text color
    marginBottom: 12, // Reduced margin
    textAlign: 'center',
    textShadowColor: '#BF9694', // Metallic accent shadow
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  inputSection: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone background
    padding: 16, // Even smaller padding
    marginBottom: 32, // More space between sections
    marginHorizontal: 20, // More margin to show background
    borderRadius: 16, // Smaller radius
    shadowColor: '#BF9694', // Metallic accent shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent border
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B2433', // Dark tone text color
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent border
    borderRadius: 16,
    padding: 16, // Reduced padding
    fontSize: 16,
    backgroundColor: '#F7F4F0', // Light tone background
    textAlignVertical: 'top',
    minHeight: 80, // Much shorter height
    marginBottom: 16, // Reduced margin
    color: '#5B2433', // Dark tone text color
    shadowColor: 'rgba(191, 150, 148, 0.2)', // Metallic accent shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    fontWeight: '500',
  },
  recommendButton: {
    marginBottom: 0,
  },
  errorContainer: {
    backgroundColor: 'rgba(191, 150, 148, 0.1)', // Light metallic accent background
    borderColor: '#BF9694', // Metallic accent border
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 20,
  },
  errorText: {
    color: '#5B2433', // Dark tone for error text
    fontSize: 14,
    textAlign: 'center',
  },
  recommendationsSection: {
    backgroundColor: 'transparent', // Transparent to show main wine cellar background
    paddingHorizontal: 0, // Remove horizontal padding to let cards center properly
    paddingVertical: 20,
    marginBottom: 16,
  },
  menuSection: {
    backgroundColor: 'transparent', // Remove background
    padding: 16, // Consistent padding
    marginBottom: 32, // More space between sections
    marginHorizontal: 20, // Consistent margins
    borderRadius: 16, // Consistent radius
    gap: 8, // Small gap between buttons
    // Remove shadow and border for transparent container
  },
  menuButton: {
    marginBottom: 0,
  },
  menuAccent: {
    width: 80,
    height: 3,
    backgroundColor: '#BF9694', // Metallic accent
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#BF9694',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  // Vintage Wine Label Header Styles
  vintageHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40, // Push header down a bit more
    marginBottom: 20,
  },
  wineLabelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#BF9694', // Metallic accent shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 2,
    borderColor: 'rgba(191, 150, 148, 0.4)', // Metallic accent border
  },
  labelBorder: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderTopWidth: 3,
    borderTopColor: '#8B0000',
  },
  labelTopAccent: {
    width: 100,
    height: 4,
    backgroundColor: '#BF9694', // Metallic accent
    borderRadius: 2,
    marginBottom: 8,
    shadowColor: '#BF9694', // Metallic accent shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  wineGlassContainer: {
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.5)', // Metallic accent border
  },
  wineGlassIcon: {
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  vintageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 4,
  },
  vintageAccent: {
    width: 100,
    height: 4,
    backgroundColor: '#BF9694', // Metallic accent
    marginVertical: 8,
    borderRadius: 2,
    shadowColor: '#BF9694', // Metallic accent shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  vintageSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1.2,
    fontStyle: 'italic',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  vintageTagline: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  labelBottomAccent: {
    width: 80,
    height: 3,
    backgroundColor: '#BF9694', // Metallic accent
    borderRadius: 2,
    marginTop: 8,
    opacity: 0.8,
    shadowColor: '#BF9694', // Metallic accent shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  // Logo Header Styles
  logoHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60, // Moved down a tiny bit more
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 350,
    height: 140,
    resizeMode: 'contain',
  },
  // Enhanced Loading States Styles
  progressContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  skeletonContainer: {
    marginTop: 20,
  },
  enhancedErrorContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  textInputFocused: {
    borderColor: '#5B2433', // Dark tone accent when focused
    borderWidth: 2,
    shadowColor: '#5B2433',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
