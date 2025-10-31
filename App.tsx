import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Platform, Text } from 'react-native';
import { TermsService } from './src/services/termsService';
import { NDAService } from './src/services/ndaService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { CacheService } from './src/services/cacheService';

import AdaptiveHomeScreen from './src/screens/AdaptiveHomeScreen';
import AdaptiveMenuScreen from './src/screens/AdaptiveMenuScreen';
import AdaptiveFavoritesScreen from './src/screens/AdaptiveFavoritesScreen';
import AdaptivePreferencesScreen from './src/screens/AdaptivePreferencesScreen';
import TermsScreen from './src/screens/TermsScreen';
import NDAScreen from './src/screens/NDAScreen';

const Stack = createStackNavigator();

export default function App() {
  const [hasAcceptedNDA, setHasAcceptedNDA] = useState<boolean | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAcceptanceStatus();
  }, []);

  const checkAcceptanceStatus = async () => {
    try {
      console.log('Checking acceptance status...');
      
      // Migrate cache to encrypted format
      try {
        await CacheService.migrateToEncrypted();
        const stats = await CacheService.getStats();
        console.log('Cache migration completed:', stats);
      } catch (error) {
        console.warn('Cache migration failed:', error);
      }
      
      // Always show both NDA and Terms screens on app launch
      // regardless of previous acceptance
      setHasAcceptedNDA(false);
      setHasAcceptedTerms(false);
      
      console.log('Both NDA and Terms will be shown on this launch');
    } catch (error) {
      console.error('Error checking acceptance status:', error);
      setHasAcceptedNDA(false);
      setHasAcceptedTerms(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptNDA = async () => {
    try {
      console.log('Accepting NDA...');
      await NDAService.acceptNDA();
      setHasAcceptedNDA(true);
      console.log('NDA accepted successfully');
    } catch (error) {
      console.error('Error accepting NDA:', error);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      console.log('Accepting terms...');
      await TermsService.acceptTerms();
      setHasAcceptedTerms(true);
      console.log('Terms accepted successfully');
    } catch (error) {
      console.error('Error accepting terms:', error);
    }
  };

  // Show loading screen while checking status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  // Always show NDA screen first on app launch
  if (!hasAcceptedNDA) {
    return <NDAScreen onAccept={handleAcceptNDA} />;
  }

  // Show terms screen if NDA accepted but terms not accepted
  if (!hasAcceptedTerms) {
    return <TermsScreen onAccept={handleAcceptTerms} />;
  }

  // Show main app if both are accepted
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerShown: false, // Hide the navigation header completely
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={AdaptiveHomeScreen} 
            />
            <Stack.Screen 
              name="Menu" 
              component={AdaptiveMenuScreen} 
              options={{ 
                title: 'Menu Recommendations',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#5B2433', // Dark tone
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen 
              name="Favorites" 
              component={AdaptiveFavoritesScreen} 
              options={{ 
                title: 'My Favorites',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#5B2433', // Dark tone
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen 
              name="Preferences" 
              component={AdaptivePreferencesScreen} 
              options={{ 
                title: 'Wine Preferences',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#5B2433', // Dark tone
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  vintageHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60, // Push header down even more before making it scrollable
  },
  wineLabelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backdropFilter: 'blur(10px)',
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
    borderTopColor: '#FFD700',
  },
  labelTopAccent: {
    width: 100,
    height: 4,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    marginBottom: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  wineGlassContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
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
    backgroundColor: '#FFD700',
    marginVertical: 8,
    borderRadius: 2,
    shadowColor: '#FFD700',
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
    backgroundColor: '#FFD700',
    borderRadius: 2,
    marginTop: 8,
    opacity: 0.8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});