import { useState, useRef, useEffect } from 'react';
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
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { WineService } from '../services/wineService';
import { DishService } from '../services/dishService';
import { WineRecommendationResponse, WineRecommendation, FavoriteWine } from '../types/wine';
import { DishRecommendationResponse } from '../types/dish';
import AdaptiveWineCard from '../components/AdaptiveWineCard';
import FlipDishCard from '../components/FlipDishCard';
import WineAnalysisCard from '../components/WineAnalysisCard';
import PairingModeToggle, { PairingMode } from '../components/PairingModeToggle';
import SimpleEnhancedButton from '../components/SimpleEnhancedButton';
import MockModeToggle from '../components/MockModeToggle';
import ResponsibleDrinkingDisclaimer from '../components/ResponsibleDrinkingDisclaimer';
import AllergyFoodSafetyWarning from '../components/AllergyFoodSafetyWarning';
import DishAnalysisCard from '../components/DishAnalysisCard';
import FinalSommelierNotes from '../components/FinalSommelierNotes';
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
import { getConfidenceScore } from '../utils/wineTypeHelpers';
import { wineCardImageService } from '../services/wineCardImageService';
import { getWineCardImageCount } from '../utils/wineCardImages';

export default function SimpleEnhancedHomeScreen() {
  // Pairing mode state
  const [pairingMode, setPairingMode] = useState<PairingMode>('dish-to-wine');
  
  // Dish-to-Wine state
  const [dish, setDish] = useState('');
  const [recommendations, setRecommendations] = useState<WineRecommendationResponse | null>(null);
  const [wineImageIndices, setWineImageIndices] = useState<number[]>([]); // Store image indices for current recommendations
  
  // Wine-to-Dish state
  const [wine, setWine] = useState('');
  const [dishRecommendations, setDishRecommendations] = useState<DishRecommendationResponse | null>(null);
  
  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Enhanced state for better UX
  const [enhancedError, setEnhancedError] = useState<EnhancedError | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [pairingNotesExpanded, setPairingNotesExpanded] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Refs for input fields
  const dishInputRef = useRef<TextInput>(null);
  const wineInputRef = useRef<TextInput>(null);

  const handleGetRecommendations = async () => {
    const timingId = performanceMonitor.startTiming('wine_recommendations', {
      dish,
      timestamp: new Date().toISOString(),
    });

    setError(null);
    setEnhancedError(null);
    setWineImageIndices([]); // Clear image indices when starting new search

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
    setLoadingMessage('Generating recommendations (30–90s)...');

    try {
      // Simulate progress updates + dynamic ETA for better UX
      // Slower updates for more accurate progress indication
      const progressInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTs) / 1000);
        const estTotal = 90; // upper-bound estimate - increased for Claude API response times
        const remaining = Math.max(3, estTotal - elapsedSec);
        setLoadingMessage(`Generating recommendations (~${remaining}s remaining)...`);
        setProgress(prev => {
          if (prev >= 0.9) {
            clearInterval(progressInterval);
            return 0.9;
          }
          // Slower progress updates: smaller increments, longer intervals
          return Math.min(0.9, prev + 0.05);
        });
      }, 2000); // Changed from 1000ms to 2000ms for slower updates

      setProgress(0.2);
      setLoadingMessage('Analyzing dish...');

      setProgress(0.3);
      setLoadingMessage('Finding perfect wine pairings...');

      const preferences = await PreferencesService.getPreferences();
      const response = await WineService.getWineRecommendations(dish, preferences || undefined);
      
      // Initialize image service with total count and reset for new recommendations
      wineCardImageService.setTotalImageCount(getWineCardImageCount());
      wineCardImageService.resetForNewRecommendations();
      
      clearInterval(progressInterval);
      setProgress(1.0);
      setLoadingMessage('Complete!');
      
      // Apply sorting based on mode
      let finalRecommendations: WineRecommendation[] = [];
      if (response && response.recommendations && Array.isArray(response.recommendations)) {
        const isMockMode = WineService.isMockModeEnabled();
        finalRecommendations = isMockMode 
          ? sortWinesForMockMode(response.recommendations)
          : sortWinesForAPIMode(response.recommendations);
        
        // Detailed logging similar to menu screen
        console.log('=== HOME SCREEN RECOMMENDATION RESULTS ===');
        console.log('Dish:', dish);
        console.log('Preferences:', preferences || 'none');
        console.log('Mock Mode:', isMockMode);
        console.log(`Generated recommendations: ${finalRecommendations.length}`);
        
        // Log each recommendation with key details
        finalRecommendations.forEach((rec, index) => {
          console.log(`\nRecommendation ${index + 1}:`);
          console.log(`  Wine: ${rec.wineName || 'Unknown'}`);
          console.log(`  Producer: ${rec.producer || 'Unknown'}`);
          console.log(`  Vintage: ${rec.vintage || 'NV'}`);
          console.log(`  Price Point: ${rec.pricePoint || 'Not specified'}`);
          const confidenceScore = getConfidenceScore(rec) || 'N/A';
          console.log(`  Confidence Score: ${confidenceScore}`);
          console.log(`  Expert Rating: ${rec.expertRating || 'unknown'}`);
          console.log(`  Category: ${rec.category || 'Unknown'}`);
          if (rec.pairingRationale) {
            console.log(`  Pairing Rationale: ${rec.pairingRationale.substring(0, 100)}...`);
          }
        });
        
        console.log('\n=== FULL RECOMMENDATION RESPONSE ===');
        console.log(JSON.stringify({
          dish: response.dish,
          recommendations: finalRecommendations.map(rec => ({
            wineName: rec.wineName,
            producer: rec.producer,
            vintage: rec.vintage,
            pricePoint: rec.pricePoint,
            confidenceScore: getConfidenceScore(rec),
            expertRating: rec.expertRating,
            pairingRationale: rec.pairingRationale?.substring(0, 150),
            tastingNotes: typeof rec.tastingNotes === 'string' 
              ? rec.tastingNotes?.substring(0, 100)
              : rec.tastingNotes?.palate?.substring(0, 100) || 'N/A',
          })),
          recommendationCount: finalRecommendations.length,
        }, null, 2));
        console.log('=== END RECOMMENDATION RESULTS ===\n');
        
        // Preserve ALL fields from response, including closingNarrative and avoid
        const finalResponse: WineRecommendationResponse = {
          ...response,
          recommendations: finalRecommendations
        };
        
        // Debug: Verify finalResponse has the fields
        console.log('=== FINAL RESPONSE CHECK ===');
        console.log('finalResponse has closingNarrative:', !!finalResponse.closingNarrative);
        console.log('finalResponse has avoid:', !!finalResponse.avoid);
        console.log('finalResponse.closingNarrative:', finalResponse.closingNarrative?.substring(0, 50));
        console.log('finalResponse.avoid:', JSON.stringify(finalResponse.avoid));
        console.log('=== END FINAL RESPONSE CHECK ===\n');
        
        setRecommendations(finalResponse);
      } else {
        finalRecommendations = response?.recommendations || [];
        console.log('=== RECOMMENDATION RESPONSE (no sorting) ===');
        console.log('Response:', response);
        console.log('=== END RECOMMENDATION RESPONSE ===\n');
        setRecommendations(response);
      }

      // Generate random image indices once when recommendations are received
      // This ensures images are stable and don't refresh on navigation
      if (finalRecommendations.length > 0) {
        const imageIndices = wineCardImageService.getRandomIndices(
          finalRecommendations.length
        );
        setWineImageIndices(imageIndices);
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

    } catch (error: any) {
      console.error('=== FRONTEND ERROR DETAILS ===');
      console.error('Error fetching wine recommendations:', error);
      console.error('Error Name:', error?.name || 'Unknown');
      console.error('Error Message:', error?.message || 'No error message');
      console.error('Error Stack:', error?.stack || 'No stack trace');
      
      // Enhanced error details
      if (error?.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Status Text:', error.response.statusText);
        console.error('Response Data:', JSON.stringify(error.response.data || {}).substring(0, 1000));
      }
      
      if (error?.request) {
        console.error('Request Details:', {
          url: error.request.url || 'Unknown',
          method: error.request.method || 'Unknown'
        });
      }
      
      // Network errors
      if (error?.message?.includes('Network') || error?.message?.includes('Failed to fetch')) {
        console.error('Network error detected - check connection');
      }
      
      // API errors
      if (error?.response?.status) {
        console.error(`API returned error status: ${error.response.status}`);
        if (error.response.data) {
          console.error('API Error Response:', JSON.stringify(error.response.data).substring(0, 1000));
        }
      }
      
      console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error)).substring(0, 2000));
      console.error('Dish that caused error:', dish);
      console.error('Preferences used:', preferences);
      console.error('=== END FRONTEND ERROR DETAILS ===');
      
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

  // Load existing favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const allFavorites = await FavoritesService.getFavorites();
        const favoriteNames = new Set(allFavorites.map(wine => wine.wineName));
        setFavorites(favoriteNames);
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  const handleAddToFavorites = async (wine: WineRecommendation) => {
    try {
      // Ensure all fields are preserved when adding to favorites
      const favoriteWine: FavoriteWine = {
        ...wine,
        id: `${wine.wineName}-${wine.producer}-${wine.vintage}-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };
      await FavoritesService.addToFavorites(favoriteWine);
      setFavorites(new Set([...favorites, wine.wineName]));
      Alert.alert('Success', 'Wine added to your cellar!');
    } catch (error: any) {
      if (error.message && error.message.includes('already in favorites')) {
        Alert.alert('Already Added', 'This wine is already in your cellar!');
        // Update state even if already in favorites
        setFavorites(new Set([...favorites, wine.wineName]));
      } else {
        Alert.alert('Error', 'Failed to add wine to your cellar');
      }
    }
  };

  const handleRemoveFromFavorites = async (wine: any) => {
    try {
      await FavoritesService.removeFromFavorites(wine);
      const newFavorites = new Set(favorites);
      newFavorites.delete(wine.wineName || wine);
      setFavorites(newFavorites);
      Alert.alert('Success', 'Wine removed from favorites!');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove wine from favorites');
    }
  };

  // Handle pairing mode change
  const handleModeChange = (mode: PairingMode) => {
    setPairingMode(mode);
    // Clear previous results when switching modes
    setRecommendations(null);
    setDishRecommendations(null);
    setError(null);
    setEnhancedError(null);
    setDish('');
    setWine('');
  };

  // Handle dish recommendations (Wine-to-Dish)
  const handleGetDishRecommendations = async () => {
    const timingId = performanceMonitor.startTiming('dish_recommendations', {
      wine,
      timestamp: new Date().toISOString(),
    });

    setError(null);
    setEnhancedError(null);
    setDishRecommendations(null);

    if (!wine.trim()) {
      const validationError = EnhancedErrorHandler.createEnhancedError(
        new Error('Please enter a wine name to get dish recommendations'),
        {
          operation: 'validateInput',
          component: 'SimpleEnhancedHomeScreen',
          userAction: 'getDishRecommendations',
        }
      );
      setEnhancedError(validationError);
      return;
    }

    setLoading(true);
    setProgress(0);
    setLoadingMessage('Analyzing wine profile...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      setLoadingMessage('Finding perfect dish pairings...');
      const response = await DishService.getDishRecommendations(wine.trim());

      clearInterval(progressInterval);
      setProgress(100);
      setLoadingMessage('Complete!');

      if (response && response.dishRecommendations && Array.isArray(response.dishRecommendations) && response.dishRecommendations.length > 0) {
        setDishRecommendations(response);
      } else {
        throw new Error('No dish recommendations received');
      }
    } catch (error: any) {
      console.error('Error fetching dish recommendations:', error);
      const enhancedError = EnhancedErrorHandler.createEnhancedError(error, {
        operation: 'getDishRecommendations',
        component: 'SimpleEnhancedHomeScreen',
        userAction: 'getDishRecommendations',
        context: { wine },
      });

      setEnhancedError(enhancedError);
      const safeError = SecureErrorHandler.sanitizeError(error);
      setError(safeError);
    } finally {
      setLoading(false);
      setProgress(0);
      setLoadingMessage('');
      performanceMonitor.endTiming(timingId, {
        success: !error && !enhancedError,
        recommendationCount: dishRecommendations?.dishRecommendations?.length || 0,
      });
    }
  };


  // Render ScrollView content
  const renderScrollContent = () => (
    <>
        {/* Logo Header */}
        <View style={styles.logoHeaderContainer}>
          <Image
            source={require('../../assets/images/Aperae Logo.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Hero Section - Wine red background */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Reveal your perfect pairing.</Text>
            <View style={styles.heroAccent} />
          </View>
        </View>

        {/* Mock Mode Toggle */}
        <MockModeToggle />

        {/* Input Section with Integrated Pairing Mode Toggle - Conditionally render based on mode */}
        {pairingMode === 'dish-to-wine' ? (
          <View style={styles.inputSection}>
            {/* Pairing Mode Toggle - Integrated at top */}
            <PairingModeToggle
              mode={pairingMode}
              onModeChange={handleModeChange}
              style={styles.pairingToggleIntegrated}
            />
            <Text style={styles.inputLabel}>Describe your dish:</Text>
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
              onFocus={() => {
                setIsInputFocused(true);
                // Scroll to input when keyboard appears (skip measure on web as it doesn't work well)
                if (Platform.OS !== 'web') {
                  setTimeout(() => {
                    dishInputRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
                      scrollViewRef.current?.scrollTo({
                        y: pageY - 100, // Scroll to show input with padding above
                        animated: true,
                      });
                    });
                  }, 300); // Delay to allow keyboard to appear
                }
              }}
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
        ) : (
          <View style={styles.inputSection}>
            {/* Pairing Mode Toggle - Integrated at top */}
            <PairingModeToggle
              mode={pairingMode}
              onModeChange={handleModeChange}
              style={styles.pairingToggleIntegrated}
            />
            <Text style={styles.inputLabel}>Enter your wine:</Text>
            <TextInput
              ref={wineInputRef}
              style={[
                styles.textInput,
                isInputFocused && styles.textInputFocused
              ]}
              value={wine}
              onChangeText={setWine}
              placeholder="Enter a wine name, producer, or vintage (e.g., '2016 Clos de Oro Malbec Reserva')..."
              placeholderTextColor="#999"
              multiline
              onFocus={() => {
                setIsInputFocused(true);
                // Scroll to input when keyboard appears (skip measure on web as it doesn't work well)
                if (Platform.OS !== 'web') {
                  setTimeout(() => {
                    wineInputRef.current?.measure((_x, _y, _width, _height, _pageX, pageY) => {
                      scrollViewRef.current?.scrollTo({
                        y: pageY - 100, // Scroll to show input with padding above
                        animated: true,
                      });
                    });
                  }, 300); // Delay to allow keyboard to appear
                }
              }}
              onBlur={() => setIsInputFocused(false)}
              accessibilityLabel="Wine input"
              accessibilityHint="Enter the wine you want dish recommendations for"
              accessibilityRole="text"
            />
            <SimpleEnhancedButton
              title={loading ? "Finding Perfect Dishes..." : "Get Dish Recommendations"}
              onPress={handleGetDishRecommendations}
              variant="primary"
              size="large"
              loading={loading}
              fullWidth
              style={styles.recommendButton}
            />
          </View>
        )}

        {/* Enhanced Progress Indicator */}
        {loading && (
          <View style={styles.progressContainer}>
            <ProgressIndicator progress={progress} message={loadingMessage} />
          </View>
        )}

        {/* Skeleton Cards During Loading */}
        {loading && (
          <View style={styles.skeletonContainer}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 16 }]}>
              {pairingMode === 'dish-to-wine' 
                ? 'Finding Perfect Wine Pairings...' 
                : 'Finding Perfect Dish Pairings...'}
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

        {/* Wine Recommendations (Dish-to-Wine mode) */}
        {pairingMode === 'dish-to-wine' && recommendations && (
          <View style={styles.recommendationsSection}>
            {/* Dish Analysis Card */}
            <DishAnalysisCard
              dish={recommendations.dish}
              dishAnalysis={recommendations.dishAnalysis}
              pairingPrinciples={recommendations.recommendations[0]?.pairingPrinciplesApplied}
            />
            
            {/* Wine Recommendation Cards */}
            {recommendations.recommendations.map((wine, index) => {
              return (
                <AdaptiveWineCard
                  key={`${wine.wineName}-${index}`}
                  wine={wine}
                  index={wineImageIndices[index] ?? 0}
                  isFavorite={favorites.has(wine.wineName)}
                  onAddToFavorites={handleAddToFavorites}
                  onRemoveFromFavorites={handleRemoveFromFavorites}
                />
              );
            })}
            
            {/* Pairing Notes - After all recommendations */}
            {recommendations.pairingNotes && (
              <View style={styles.pairingNotesSection}>
                <TouchableOpacity
                  style={styles.pairingNotesHeader}
                  onPress={() => setPairingNotesExpanded(!pairingNotesExpanded)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#8B0000" />
                  <View style={styles.pairingNotesHeaderContent}>
                    <Text style={styles.pairingNotesTitle}>Pairing Notes</Text>
                  </View>
                  <Ionicons
                    name={pairingNotesExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#8B0000"
                    style={styles.pairingNotesExpandIcon}
                  />
                </TouchableOpacity>
                {!pairingNotesExpanded && (
                  <Text style={styles.pairingNotesExpandHint}>Expand for pairing notes</Text>
                )}
                {pairingNotesExpanded && (
                  <Text style={styles.pairingNotesText}>
                    {recommendations.pairingNotes.charAt(0).toUpperCase() + recommendations.pairingNotes.slice(1)}
                  </Text>
                )}
              </View>
            )}

            {/* Final Sommelier Notes - After all recommendations, before disclaimer */}
            {(recommendations.closingNarrative || recommendations.avoid) && (
              <View style={styles.finalNotesSection}>
                <FinalSommelierNotes
                  {...(recommendations.closingNarrative && { closingNarrative: recommendations.closingNarrative })}
                  {...(recommendations.avoid && { avoid: recommendations.avoid })}
                />
              </View>
            )}

            {/* Responsible Drinking Disclaimer - After wine cards with proper spacing */}
            <View style={styles.finalNotesSection}>
              <ResponsibleDrinkingDisclaimer />
            </View>
          </View>
        )}

        {/* Dish Recommendations (Wine-to-Dish mode) */}
        {pairingMode === 'wine-to-dish' && dishRecommendations && (
          <View style={styles.recommendationsSection}>
            {/* Wine Analysis Card - Matching DishAnalysisCard style */}
            {dishRecommendations.wineAnalysis && (
              <WineAnalysisCard
                wine={dishRecommendations.wine}
                wineAnalysis={dishRecommendations.wineAnalysis}
                wineServingGuidance={dishRecommendations.wineServingGuidance}
              />
            )}

            {/* Dish Recommendation Cards - Ordered: Complex > Moderate > Simple */}
            {[...dishRecommendations.dishRecommendations]
              .sort((a, b) => {
                const order = { complex: 0, moderate: 1, simple: 2 };
                return order[a.complexity.level] - order[b.complexity.level];
              })
              .map((dish, index) => (
                <FlipDishCard
                  key={`${dish.dishName}-${index}`}
                  dish={dish}
                  index={index}
                />
              ))}

            {/* Allergy & Food Safety Warning - After dish cards with proper spacing */}
            <View style={{ marginTop: 24, marginBottom: 16 }}>
              <AllergyFoodSafetyWarning />
            </View>
          </View>
        )}
      </>
  );

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
      
      {Platform.OS === 'web' ? (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {renderScrollContent()}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={true}
          >
            {renderScrollContent()}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
    height: 100, // Smaller height to match other sections
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
    padding: 12, // Reduced padding for smaller banner
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  heroAccent: {
    width: 80, // Smaller accent bar
    height: 2, // Thinner for subtlety
    backgroundColor: '#BF9694', // Metallic accent
    marginTop: 8, // Less space after title
    borderRadius: 2,
    shadowColor: '#BF9694',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 16, // Match "Mock mode" and "Describe your dish" font size
    fontWeight: '600', // Match font weight
    color: '#fff',
    textAlign: 'center',
    marginBottom: 0, // No bottom margin since subtitle removed
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3, // Reduced letter spacing to match other text
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
    overflow: 'hidden', // Ensure toggle respects border radius
  },
  pairingToggleIntegrated: {
    marginHorizontal: 0, // Remove horizontal margin (container handles it)
    marginTop: 0, // No top margin (sits at top of container)
    marginBottom: 16, // Space between toggle and input label
    borderRadius: 12, // Match container border radius (slightly smaller for visual distinction)
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
  menuButtonTopRight: {
    position: 'absolute',
    top: 200, // Below hero banner (hero is ~180px + some margin)
    right: 20,
    zIndex: 10,
  },
  menuButtonContainerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonTextTop: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B0000',
    marginLeft: 6,
  },
  pairingNotesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pairingNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  pairingNotesHeaderContent: {
    flex: 1,
    marginLeft: 8,
  },
  pairingNotesExpandIcon: {
    position: 'absolute',
    right: 0,
  },
  pairingNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pairingNotesExpandHint: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  pairingNotesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginTop: 12,
  },
  finalNotesSection: {
    marginHorizontal: 20,
    marginTop: 24,
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
  menuButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B0000',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B0000',
    marginLeft: 8,
  },
  menuOptions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
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
  wineAnalysisSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  wineAnalysisCard: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wineName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B2433',
    marginBottom: 12,
  },
  wineDetail: {
    fontSize: 14,
    color: '#5B2433',
    marginBottom: 8,
    lineHeight: 20,
  },
  closingNarrativeSection: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(247, 244, 240, 0.95)',
    padding: 16,
    borderRadius: 12,
  },
  closingNarrativeText: {
    fontSize: 16,
    color: '#5B2433',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
