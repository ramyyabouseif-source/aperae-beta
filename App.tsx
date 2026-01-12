import { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Platform, Image, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TermsService } from './src/services/termsService';
import { AgeVerificationService } from './src/services/ageVerificationService';
import { PrivacyPolicyService } from './src/services/privacyPolicyService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { CacheService } from './src/services/cacheService';

import AdaptiveHomeScreen from './src/screens/AdaptiveHomeScreen';
import AdaptiveMenuScreen from './src/screens/AdaptiveMenuScreen';
import AdaptiveFavoritesScreen from './src/screens/AdaptiveFavoritesScreen';
import AdaptivePreferencesScreen from './src/screens/AdaptivePreferencesScreen';
import TermsScreen from './src/screens/TermsScreen';
import AgeVerificationScreen from './src/screens/AgeVerificationScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import CookiePolicyScreen from './src/screens/CookiePolicyScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import AboutScreen from './src/screens/AboutScreen';
import GeoBlockedScreen from './src/screens/GeoBlockedScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState<boolean | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsFromAge, setShowTermsFromAge] = useState(false);
  const [showPrivacyFromAge, setShowPrivacyFromAge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render trigger
  const [isGeoBlocked, setIsGeoBlocked] = useState<boolean | null>(null);
  const [geoBlockData, setGeoBlockData] = useState<{country?: string; countryName?: string} | null>(null);

  useEffect(() => {
    checkGeoBlocking();
    checkAcceptanceStatus();
  }, []);

  // Check for geo-blocking on app startup
  const checkGeoBlocking = async () => {
    try {
      // Make a lightweight health check request to detect geo-blocking
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.aperae.com/api';
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // If 403, check if it's geo-blocking
      if (response.status === 403) {
        try {
          const errorData = await response.json();
          if (errorData.code === 'GEO_BLOCKED') {
            setIsGeoBlocked(true);
            setGeoBlockData({
              country: errorData.country,
              countryName: errorData.countryName,
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // If JSON parsing fails, might still be geo-blocking
          console.warn('Could not parse geo-blocking error:', e);
        }
      }

      // Not geo-blocked
      setIsGeoBlocked(false);
    } catch (error) {
      // On network error, assume not geo-blocked (might be offline)
      console.warn('Geo-blocking check failed (might be offline):', error);
      setIsGeoBlocked(false);
    }
  };

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
      
      // Check age verification (required first)
      const ageVerified = await AgeVerificationService.isAgeVerified();
      setIsAgeVerified(ageVerified);
      
      // Check if Terms and Privacy Policy have been accepted previously
      const termsAccepted = await TermsService.hasAcceptedTerms();
      const privacyAccepted = await PrivacyPolicyService.hasAcceptedPrivacyPolicy();
      setHasAcceptedTerms(termsAccepted);
      setHasAcceptedPrivacyPolicy(privacyAccepted);
      
      console.log('Age verified:', ageVerified);
      console.log('Terms accepted:', termsAccepted);
      console.log('Privacy Policy accepted:', privacyAccepted);
    } catch (error) {
      console.error('Error checking acceptance status:', error);
      setIsAgeVerified(false);
      setHasAcceptedTerms(false);
      setHasAcceptedPrivacyPolicy(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgeVerified = useCallback(async () => {
    // Set state immediately to trigger re-render - this is the key fix for mobile web
    // Age verification screen now also accepts Terms and Privacy Policy, so set all three
    setIsAgeVerified(true);
    setHasAcceptedTerms(true);
    setHasAcceptedPrivacyPolicy(true);
    setForceUpdate(prev => prev + 1); // Force immediate re-render
    
    // Verify storage succeeded (non-blocking, in background)
    Promise.resolve().then(async () => {
      try {
        const verified = await AgeVerificationService.isAgeVerified();
        const termsAccepted = await TermsService.hasAcceptedTerms();
        const privacyAccepted = await PrivacyPolicyService.hasAcceptedPrivacyPolicy();
        if (!verified || !termsAccepted || !privacyAccepted) {
          console.warn('Verification/acceptance state mismatch, re-checking...');
          setIsAgeVerified(verified);
          setHasAcceptedTerms(termsAccepted);
          setHasAcceptedPrivacyPolicy(privacyAccepted);
        }
      } catch (error) {
        console.error('Error verifying verification/acceptance state:', error);
      }
    });
  }, []);

  const handleAcceptTerms = useCallback(async () => {
    // Set state optimistically FIRST to trigger immediate re-render on mobile web
    setHasAcceptedTerms(true);
    setForceUpdate(prev => prev + 1); // Force immediate re-render
    
    try {
      console.log('Accepting terms...');
      // Then perform the async operation (non-blocking for UI)
      TermsService.acceptTerms().then(() => {
        console.log('Terms accepted successfully');
      }).catch((error) => {
        console.error('Error accepting terms:', error);
        // Check if local storage at least worked
        TermsService.hasAcceptedTerms().then((accepted) => {
          if (!accepted) {
            // Revert optimistic update if storage failed
            setHasAcceptedTerms(false);
          }
        }).catch((checkError) => {
          console.error('Error checking terms acceptance:', checkError);
          setHasAcceptedTerms(false);
        });
      });
    } catch (error) {
      console.error('Error in handleAcceptTerms:', error);
      // Error handling is done in promise chain above
    }
  }, []);

  const handleAcceptPrivacyPolicy = useCallback(async () => {
    // Set state optimistically FIRST to trigger immediate re-render on mobile web
    setHasAcceptedPrivacyPolicy(true);
    setShowPrivacyPolicy(false);
    setForceUpdate(prev => prev + 1); // Force immediate re-render
    
    try {
      console.log('Accepting privacy policy...');
      // Then perform the async operation (non-blocking for UI)
      PrivacyPolicyService.acceptPrivacyPolicy().then(() => {
        console.log('Privacy Policy accepted successfully');
      }).catch((error) => {
        console.error('Error accepting privacy policy:', error);
        // Check if local storage at least worked
        PrivacyPolicyService.hasAcceptedPrivacyPolicy().then((accepted) => {
          if (!accepted) {
            // Revert optimistic update if storage failed
            setHasAcceptedPrivacyPolicy(false);
          }
        }).catch((checkError) => {
          console.error('Error checking privacy policy acceptance:', checkError);
          setHasAcceptedPrivacyPolicy(false);
        });
      });
    } catch (error) {
      console.error('Error in handleAcceptPrivacyPolicy:', error);
      // Error handling is done in promise chain above
    }
  }, []);

  const handlePrivacyPolicyPress = () => {
    setShowPrivacyPolicy(true);
  };

  const handleTermsPressFromAge = useCallback(() => {
    setShowTermsFromAge(true);
  }, []);

  const handlePrivacyPressFromAge = useCallback(() => {
    setShowPrivacyFromAge(true);
  }, []);

  // Show loading screen while checking status
  if (isLoading && isGeoBlocked === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  // Show geo-blocked screen FIRST (before age verification or anything else)
  if (isGeoBlocked === true) {
    return (
      <GeoBlockedScreen 
        country={geoBlockData?.country}
        countryName={geoBlockData?.countryName}
      />
    );
  }

  // Age verification must come FIRST (before any other screens)
  if (!isAgeVerified) {
    // Show Terms or Privacy Policy screens if user clicked links from age verification
    if (showTermsFromAge) {
      return (
        <TermsScreen 
          onAccept={() => setShowTermsFromAge(false)} 
          onBack={() => setShowTermsFromAge(false)}
          onPrivacyPolicyPress={handlePrivacyPolicyPress} 
        />
      );
    }
    if (showPrivacyFromAge) {
      return (
        <PrivacyPolicyScreen 
          onAccept={() => setShowPrivacyFromAge(false)} 
          onBack={() => setShowPrivacyFromAge(false)}
        />
      );
    }
    // Show age verification screen with links to Terms/Privacy
    return (
      <AgeVerificationScreen 
        onVerified={handleAgeVerified}
        onTermsPress={handleTermsPressFromAge}
        onPrivacyPress={handlePrivacyPressFromAge}
      />
    );
  }

  // Main Tab Navigator Component
  const MainTabs = () => {
    return (
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#5B2433', // Dark tone
          tabBarInactiveTintColor: '#BF9694', // Metallic accent
          tabBarStyle: {
            backgroundColor: '#F7F4F0', // Light tone background
            borderTopWidth: 1,
            borderTopColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={() => (
            <ErrorBoundary>
              <AdaptiveHomeScreen />
            </ErrorBoundary>
          )}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Menu"
          component={MenuStack}
          options={{
            tabBarLabel: 'Menu',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="restaurant" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesStack}
          options={{
            tabBarLabel: 'My Cellar',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsStack"
          component={SettingsStack}
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  };

  // Menu Stack Navigator (nested inside Menu tab)
  const MenuStack = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#5B2433',
            height: 180,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          headerTitleContainerStyle: {
            left: 0,
            right: 0,
            paddingTop: 50,
            paddingBottom: 10,
          },
        }}
      >
        <Stack.Screen
          name="MenuMain"
          component={() => (
            <ErrorBoundary>
              <AdaptiveMenuScreen />
            </ErrorBoundary>
          )}
          options={{
            headerTitle: () => (
              <View style={styles.menuHeaderContainer}>
                <Image 
                  source={require('./assets/images/Aperae Logo.jpg')} 
                  style={styles.menuHeaderLogo}
                  resizeMode="contain"
                />
                <Text style={styles.menuHeaderTitle} numberOfLines={1} adjustsFontSizeToFit>
                  Menu Recommendations
                </Text>
              </View>
            ),
          }}
        />
      </Stack.Navigator>
    );
  };

  // Favorites Stack Navigator (nested inside Favorites tab)
  const FavoritesStack = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#5B2433',
            height: 180,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          headerTitleContainerStyle: {
            left: 0,
            right: 0,
            paddingTop: 50,
            paddingBottom: 10,
          },
        }}
      >
        <Stack.Screen
          name="FavoritesMain"
          component={() => (
            <ErrorBoundary>
              <AdaptiveFavoritesScreen />
            </ErrorBoundary>
          )}
          options={{
            headerTitle: () => (
              <View style={styles.menuHeaderContainer}>
                <Image 
                  source={require('./assets/images/Aperae Logo.jpg')} 
                  style={styles.menuHeaderLogo}
                  resizeMode="contain"
                />
                <Text style={styles.menuHeaderTitle} numberOfLines={1} adjustsFontSizeToFit>
                  My Cellar
                </Text>
              </View>
            ),
          }}
        />
      </Stack.Navigator>
    );
  };

  // Settings Stack Navigator (nested inside Settings tab)
  const SettingsStack = () => {
    return (
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#5B2433', // Dark tone
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="SettingsHome"
          component={SettingsHomeScreen}
          options={{
            title: 'Settings',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#5B2433',
              height: 180,
            },
            headerTitleAlign: 'center',
            headerTitleContainerStyle: {
              left: 0,
              right: 0,
              paddingTop: 50,
              paddingBottom: 10,
            },
            headerTitle: () => (
              <View style={styles.menuHeaderContainer}>
                <Image 
                  source={require('./assets/images/Aperae Logo.jpg')} 
                  style={styles.menuHeaderLogo}
                  resizeMode="contain"
                />
                <Text style={styles.menuHeaderTitle} numberOfLines={1} adjustsFontSizeToFit>
                  Settings
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="Preferences"
          component={() => (
            <ErrorBoundary>
              <AdaptivePreferencesScreen />
            </ErrorBoundary>
          )}
          options={{
            title: 'Wine Preferences',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="PrivacySettings"
          component={PrivacySettingsScreen}
          options={{
            title: 'Privacy Settings',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#5B2433',
              height: 180,
            },
            headerTitleAlign: 'center',
            headerTitleContainerStyle: {
              left: 0,
              right: 0,
              paddingTop: 50,
              paddingBottom: 10,
            },
            headerTitle: () => (
              <View style={styles.menuHeaderContainer}>
                <Image 
                  source={require('./assets/images/Aperae Logo.jpg')} 
                  style={styles.menuHeaderLogo}
                  resizeMode="contain"
                />
                <Text style={styles.menuHeaderTitle} numberOfLines={1} adjustsFontSizeToFit>
                  Privacy Settings
                </Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'About',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#5B2433',
              height: 180,
            },
            headerTitleAlign: 'center',
            headerTitleContainerStyle: {
              left: 0,
              right: 0,
              paddingTop: 50,
              paddingBottom: 10,
            },
            headerTitle: () => (
              <View style={styles.menuHeaderContainer}>
                <Image 
                  source={require('./assets/images/Aperae Logo.jpg')} 
                  style={styles.menuHeaderLogo}
                  resizeMode="contain"
                />
                <Text style={styles.menuHeaderTitle} numberOfLines={1} adjustsFontSizeToFit>
                  About
                </Text>
              </View>
            ),
          }}
        />
      </Stack.Navigator>
    );
  };

  // Settings Home Screen Component
  const SettingsHomeScreen = ({ navigation }: any) => {
    return (
      <View style={styles.settingsContainer}>
        <ScrollView 
          style={styles.settingsScrollView}
          contentContainerStyle={styles.settingsContent}
          showsVerticalScrollIndicator={true}
        >
          <TouchableOpacity
            style={styles.settingsOption}
            onPress={() => navigation.navigate('PrivacySettings')}
          >
            <Ionicons name="shield-outline" size={24} color="#5B2433" />
            <Text style={styles.settingsOptionText}>Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingsOption}
            onPress={() => navigation.navigate('About')}
          >
            <Ionicons name="information-circle-outline" size={24} color="#5B2433" />
            <Text style={styles.settingsOptionText}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // Show main app if all are accepted
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Stack.Navigator 
            initialRouteName="MainTabs"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
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
            <Stack.Screen 
              name="PrivacySettings" 
              component={PrivacySettingsScreen} 
              options={{ 
                title: 'Privacy Settings',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#5B2433', // Dark tone
                  height: 180, // Increased height to accommodate logo and prevent cutoff
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
                headerTitleContainerStyle: {
                  left: 0,
                  right: 0,
                  paddingTop: 50, // Push content down to prevent logo cutoff
                  paddingBottom: 10,
                },
                headerTitle: () => (
                  <View style={styles.menuHeaderContainer}>
                    <Image 
                      source={require('./assets/images/Aperae Logo.jpg')} 
                      style={styles.menuHeaderLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.menuHeaderTitle} numberOfLines={1} adjustsFontSizeToFit>
                      Privacy Settings
                    </Text>
                  </View>
                ),
              }}
            />
            <Stack.Screen 
              name="PrivacyPolicy" 
              component={PrivacyPolicyScreen} 
              options={{ 
                title: 'Privacy Policy',
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
              name="About" 
              component={AboutScreen} 
              options={{ 
                title: 'About',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#5B2433', // Dark tone
                  height: 180, // Increased height to accommodate logo and prevent cutoff
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                headerTitleAlign: 'center',
                headerTitleContainerStyle: {
                  left: 0,
                  right: 0,
                  paddingTop: 50, // Push content down to prevent logo cutoff
                  paddingBottom: 10,
                },
                headerTitle: () => (
                  <View style={styles.menuHeaderContainer}>
                    <Image 
                      source={require('./assets/images/Aperae Logo.jpg')} 
                      style={styles.menuHeaderLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.menuHeaderTitle} numberOfLines={1} adjustsFontSizeToFit>
                      About
                    </Text>
                  </View>
                ),
              }}
            />
            <Stack.Screen 
              name="Terms" 
              component={TermsScreen} 
              options={{ 
                title: 'Terms of Use',
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
              name="CookiePolicy" 
              component={CookiePolicyScreen} 
              options={{ 
                title: 'Cookie Policy',
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
              name="ThirdPartyLicenses" 
              component={ThirdPartyLicensesScreen} 
              options={{ 
                title: 'Third-Party Licenses',
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
    // backdropFilter is not supported in React Native
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
  menuHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  menuHeaderLogo: {
    width: 120,
    height: 40,
    marginBottom: 16,
  },
  menuHeaderTitle: {
    fontSize: 20, // Slightly smaller to prevent wrapping
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#F7F4F0', // Light tone background
  },
  settingsScrollView: {
    flex: 1,
  },
  settingsContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
    shadowColor: '#BF9694',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#5B2433', // Dark tone
    marginLeft: 12,
  },
});