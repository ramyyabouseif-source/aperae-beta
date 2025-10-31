import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WineService } from '../services/wineService';
import { WineRecommendationResponse } from '../types/wine';
import WineRecommendation from '../components/WineRecommendation';
import MockModeToggle from '../components/MockModeToggle';
import { PreferencesService } from '../services/preferencesService';
import { FavoritesService } from '../services/favoritesService';
import { UserPreferences } from '../types/preferences';
import { InputValidator } from '../utils/validation';
import { SecureErrorHandler } from '../utils/errorHandler';
import { sortWinesForAPIMode, sortWinesForMockMode } from '../utils/wineSorting';

export default function HomeScreen() {
  const [dish, setDish] = useState('');
  const [recommendations, setRecommendations] = useState<WineRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added missing error state
  const navigation = useNavigation();

  const handleGetRecommendations = async () => {
    // Clear previous error
    setError(null);
    
    // Basic validation
    if (!dish.trim()) {
      Alert.alert('Error', 'Please enter a dish or food item');
      return;
    }

    // SECURITY: Validate and sanitize input
    const validation = InputValidator.validateDishInput(dish);
    if (!validation.isValid) {
      Alert.alert('Invalid Input', validation.errors.join('\n'));
      return;
    }

    const sanitizedDish = InputValidator.sanitizeInput(dish);

    try {
      setLoading(true);
      setRecommendations(null); // Clear previous recommendations
      
      // Load user preferences
      const userPreferences = await PreferencesService.getPreferences();
      console.log('Loaded preferences:', userPreferences);
      
      // SECURITY: Validate preferences if they exist
      if (userPreferences) {
        const prefValidation = InputValidator.validatePreferences(userPreferences);
        if (!prefValidation.isValid) {
          Alert.alert('Invalid Preferences', prefValidation.errors.join('\n'));
          return;
        }
      }
      
      // Get wine recommendations with sanitized input and validated preferences
      const result = await WineService.getWineRecommendations(sanitizedDish, userPreferences);
      console.log('Received recommendations:', result);
      
      // Validate the result before setting state
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
      } else {
        console.error('Invalid recommendations data:', result);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to PocketSomm</Text>
        <Text style={styles.subtitle}>
          Your AI-powered wine sommelier
        </Text>
      </View>

      <View style={styles.content}>
        <MockModeToggle />
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            What dish would you like wine recommendations for?
          </Text>
          <TextInput
            style={styles.textInput}
            value={dish}
            onChangeText={setDish}
            placeholder="e.g., Ribeye steak with creamed spinach"
            multiline
            numberOfLines={3}
            maxLength={500} // SECURITY: Limit input length
            autoCapitalize="none" // SECURITY: Prevent auto-capitalization
            autoCorrect={false} // SECURITY: Disable auto-correct
            accessibilityLabel="Dish description input"
            accessibilityHint="Enter the name of a dish or food item to get wine recommendations"
            accessibilityRole="text"
          />
        </View>

        {/* SECURITY: Display error messages */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGetRecommendations}
          disabled={loading}
          accessibilityLabel="Get wine recommendations"
          accessibilityHint="Tap to get AI-powered wine recommendations for your dish"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Wine Recommendations</Text>
          )}
        </TouchableOpacity>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Menu')}
          >
            <Text style={styles.menuButtonText}>📋 Menu Recommendations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Text style={styles.menuButtonText}>❤️ My Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Preferences')}
          >
            <Text style={styles.menuButtonText}>🍷 Wine Preferences</Text>
          </TouchableOpacity>
        </View>

        {recommendations && (
          <WineRecommendation
            recommendations={recommendations}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    gap: 12,
    marginBottom: 20,
  },
  menuButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B0000',
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // SECURITY: Added error display styles
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
});