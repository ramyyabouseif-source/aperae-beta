import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuAnalysisService, WineListAnalysisResult } from '../services/menuAnalysisService';
import { CameraService } from '../services/cameraService';
import { PreferencesService } from '../services/preferencesService';
import { WinePreferences } from '../types/wine';
import MenuCamera from '../components/MenuCamera';
import MenuResults from '../components/MenuResults';


const SimpleEnhancedMenuScreen: React.FC = () => {
  // Wine Pairing Assistant state
  const [dishInput, setDishInput] = useState('');
  const [servingStyle, setServingStyle] = useState<'glass' | 'bottle' | 'both'>('both');
  const [capturedPhoto, setCapturedPhoto] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WineListAnalysisResult | null>(null);
  const [serviceStatus, setServiceStatus] = useState({
    ocrAvailable: false,
    cameraAvailable: false,
    cameraPermission: false,
    mediaLibraryPermission: false,
    overallAvailable: false,
  });
  const [winePreferences, setWinePreferences] = useState<WinePreferences | null>(null);

  React.useEffect(() => {
    checkServiceStatus();
    loadWinePreferences();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const status = await MenuAnalysisService.getStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Service status check error:', error);
    }
  };

  const loadWinePreferences = async () => {
    try {
      const preferences = await PreferencesService.getWinePreferences();
      if (preferences) {
        setWinePreferences(preferences);
        console.log('Wine preferences loaded:', preferences);
      }
    } catch (error) {
      console.error('Error loading wine preferences:', error);
    }
  };

  // OCR functionality handlers
  const handleTakePhoto = async () => {
    console.log('Take Photo button pressed');
    console.log('Service status:', serviceStatus);
    console.log('Dish input:', dishInput);
    
    if (!dishInput.trim()) {
      Alert.alert('Missing Information', 'Please enter what dish you are eating first.');
      return;
    }
    
    try {
      // Request camera permission first
      const cameraPermission = await CameraService.requestCameraPermission();
      
      if (!cameraPermission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'PocketSomm needs access to your camera to take photos of wine lists. Please enable camera access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              // In a real app, you'd open device settings here
              console.log('User should go to device settings to enable camera');
            }}
          ]
        );
        return;
      }
      
      console.log('Camera permission granted, opening camera...');
      setShowCamera(true);
    } catch (error) {
      console.error('Camera permission error:', error);
      Alert.alert('Error', 'Failed to request camera permission. Please try again.');
    }
  };


  const handlePhotoCaptured = async (photo: any) => {
    console.log('Photo captured:', photo);
    setShowCamera(false);
    setCapturedPhoto(photo);
  };

  const handleUploadPhoto = async () => {
    console.log('Upload Photo button pressed');
    console.log('Service status:', serviceStatus);
    console.log('Dish input:', dishInput);
    console.log('Serving style:', servingStyle);
    
    if (!dishInput.trim()) {
      Alert.alert('Missing Information', 'Please enter what dish you are eating first.');
      return;
    }
    
    try {
      // Request media library permission first
      console.log('Requesting media library permission...');
      const permissionGranted = await CameraService.requestMediaLibraryPermission();
      
      if (!permissionGranted) {
        Alert.alert(
          'Photo Library Permission Required',
          'PocketSomm needs access to your photo library to select wine list images. Please enable photo library access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              // In a real app, you'd open device settings here
              console.log('User should go to device settings to enable photo library access');
            }}
          ]
        );
        return;
      }
      
      console.log('Photo library permission granted, opening gallery...');
      const photo = await CameraService.pickPhoto();
      if (photo) {
        console.log('Photo selected:', photo);
        setCapturedPhoto(photo);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      if (error instanceof Error && error.message.includes('cancelled')) {
        return;
      }
      Alert.alert('Error', 'Failed to access photo library. Please try again.');
    }
  };

  const handleGetRecommendations = async () => {
    console.log('Get Wine Recommendations button pressed');
    console.log('Dish:', dishInput);
    console.log('Serving style:', servingStyle);
    console.log('Captured photo:', capturedPhoto);
    
    if (!dishInput.trim()) {
      Alert.alert('Missing Information', 'Please enter what dish you are eating first.');
      return;
    }
    
    if (!capturedPhoto) {
      Alert.alert('Missing Photo', 'Please take or upload a photo of the wine list first.');
      return;
    }
    
    console.log('Starting wine list analysis...');
    setIsAnalyzing(true);
    
    try {
      // Analyze wine list with dish context, serving style preference, and user wine preferences
      const result = await MenuAnalysisService.analyzeWineListFromPhoto(
        capturedPhoto, 
        dishInput, 
        servingStyle,
        winePreferences
      );
      console.log('Analysis result:', result);
      setAnalysisResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Wine list analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze wine list. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setAnalysisResult(null);
  };

  const renderWinePairingAssistant = () => (
    <View style={styles.winePairingContainer}>
      <View style={styles.winePairingHeader}>
        <View style={styles.winePairingIconContainer}>
          <Ionicons name="restaurant" size={24} color="#5B2433" />
        </View>
        <View style={styles.winePairingTextContainer}>
          <Text style={styles.winePairingTitle}>Restaurant Wine Pairing Assistant</Text>
          <Text style={styles.winePairingSubtitle}>Get the perfect wine pairing from the restaurant's wine list</Text>
        </View>
      </View>

      {/* Step 1: Dish Input */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>1. Describe your dish</Text>
        <TextInput
          style={styles.dishInput}
          placeholder="e.g., Grilled Salmon, Ribeye Steak, Caesar Salad..."
          value={dishInput}
          onChangeText={setDishInput}
          multiline
        />
      </View>

      {/* Step 2: Serving Style Selection */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>2. Wine serving preference?</Text>
        <View style={styles.servingStyleContainer}>
          <TouchableOpacity
            style={[
              styles.servingStyleButton,
              servingStyle === 'glass' && styles.servingStyleButtonSelected
            ]}
            onPress={() => setServingStyle('glass')}
          >
            <Ionicons 
              name="wine" 
              size={20} 
              color={servingStyle === 'glass' ? '#fff' : '#5B2433'} 
            />
            <Text style={[
              styles.servingStyleText,
              servingStyle === 'glass' && styles.servingStyleTextSelected
            ]}>
              By the Glass
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.servingStyleButton,
              servingStyle === 'bottle' && styles.servingStyleButtonSelected
            ]}
            onPress={() => setServingStyle('bottle')}
          >
            <Ionicons 
              name="wine" 
              size={20} 
              color={servingStyle === 'bottle' ? '#fff' : '#5B2433'} 
            />
            <Text style={[
              styles.servingStyleText,
              servingStyle === 'bottle' && styles.servingStyleTextSelected
            ]}>
              Full Bottle
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.servingStyleButton,
              servingStyle === 'both' && styles.servingStyleButtonSelected
            ]}
            onPress={() => setServingStyle('both')}
          >
            <Ionicons 
              name="wine" 
              size={20} 
              color={servingStyle === 'both' ? '#fff' : '#5B2433'} 
            />
            <Text style={[
              styles.servingStyleText,
              servingStyle === 'both' && styles.servingStyleTextSelected
            ]}>
              Both Options
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step 3: Wine List Photo */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>3. Scan the wine list</Text>
        <View style={styles.photoButtonsContainer}>
          <TouchableOpacity 
            style={[styles.photoButton, styles.takePhotoButton, isAnalyzing && styles.photoButtonDisabled]}
            onPress={handleTakePhoto}
            disabled={isAnalyzing || !dishInput.trim()}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={20} color="#fff" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.photoButton, styles.uploadPhotoButton, isAnalyzing && styles.photoButtonDisabled]}
            onPress={handleUploadPhoto}
            disabled={isAnalyzing || !dishInput.trim()}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="image-outline" size={20} color="#fff" />
                <Text style={styles.photoButtonText}>Upload Image</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.photoSubtext}>
          Take a photo of the wine list (by the glass, bottles, etc.)
        </Text>
        {capturedPhoto && (
          <View style={styles.photoReadyIndicator}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.photoReadyText}>Photo ready for analysis</Text>
          </View>
        )}
      </View>

      {/* Step 4: Get Recommendations */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>4. Get wine recommendations</Text>
        <TouchableOpacity 
          style={[styles.getRecommendationsButton, (isAnalyzing || !dishInput.trim() || !capturedPhoto) && styles.getRecommendationsButtonDisabled]}
          onPress={handleGetRecommendations}
          disabled={isAnalyzing || !dishInput.trim() || !capturedPhoto}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="wine" size={20} color="#fff" />
              <Text style={styles.getRecommendationsButtonText}>Get Wine Recommendations</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.getRecommendationsSubtext}>
          Analyze your inputs and get personalized wine pairing recommendations
        </Text>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          OCR: {serviceStatus.ocrAvailable ? '✅' : '❌'} | 
          Camera: {serviceStatus.cameraAvailable ? '✅' : '❌'} | 
          Preferences: {winePreferences ? '✅' : '❌'}
        </Text>
        {winePreferences && (
          <Text style={styles.preferencesStatusText}>
            Wine preferences loaded: {Object.keys(winePreferences).filter(key => winePreferences[key as keyof WinePreferences]).length} preferences set
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.pageContainer}>
      {/* Transparent Status Bar */}
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Wine Cellar Background */}
      <ImageBackground
        source={require('../../assets/images/vineyard-hero-background.jpg')}
        style={styles.wineCellarBackground}
        resizeMode="cover"
      />
      
      {/* Dark Overlay */}
      <View style={styles.wineCellarOverlay} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Wine Pairing Assistant */}
        {renderWinePairingAssistant()}

        {/* Wine Pairing Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Wine Pairing Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Red wines pair well with red meats and rich sauces
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                White wines complement seafood and light dishes
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>
                Sparkling wines are perfect for celebrations and appetizers
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <MenuCamera
          onPhotoCaptured={handlePhotoCaptured}
          onClose={handleCloseCamera}
        />
      </Modal>

      {/* Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {analysisResult && (
          <MenuResults
            analysisResult={analysisResult}
            onClose={handleCloseResults}
          />
        )}
      </Modal>
    </View>
  );
};

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
    paddingBottom: 32,
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  quickSuggestionsContainer: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#BF9694', // Metallic accent
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  tipsContainer: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#BF9694', // Metallic accent
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5B2433', // Dark tone
    marginBottom: 16,
  },
  tipsList: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    fontSize: 14,
    color: '#5B2433', // Dark tone
    marginLeft: 8,
    flex: 1,
  },
  // Wine Pairing Assistant Styles
  winePairingContainer: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#BF9694', // Metallic accent
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  winePairingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  winePairingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(191, 150, 148, 0.2)', // Light metallic accent
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  winePairingTextContainer: {
    flex: 1,
  },
  winePairingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5B2433', // Dark tone
    marginBottom: 4,
  },
  winePairingSubtitle: {
    fontSize: 14,
    color: '#6C6C6C', // Secondary text
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B2433', // Dark tone
    marginBottom: 12,
  },
  dishInput: {
    backgroundColor: '#F7F4F0', // Light tone
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#5B2433', // Dark tone
    minHeight: 60,
    textAlignVertical: 'top',
  },
  servingStyleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  servingStyleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
    backgroundColor: '#F7F4F0', // Light tone
  },
  servingStyleButtonSelected: {
    backgroundColor: '#5B2433', // Dark tone
    borderColor: '#5B2433', // Dark tone
  },
  servingStyleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B2433', // Dark tone
    marginLeft: 6,
  },
  servingStyleTextSelected: {
    color: '#fff',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  takePhotoButton: {
    backgroundColor: '#5B2433', // Dark tone
  },
  uploadPhotoButton: {
    backgroundColor: '#BF9694', // Metallic accent
  },
  photoButtonDisabled: {
    opacity: 0.6,
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  photoSubtext: {
    fontSize: 12,
    color: '#6C6C6C', // Secondary text
    textAlign: 'center',
    fontStyle: 'italic',
  },
  photoReadyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  photoReadyText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  getRecommendationsButton: {
    backgroundColor: '#5B2433', // Dark tone
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  getRecommendationsButtonDisabled: {
    opacity: 0.6,
  },
  getRecommendationsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  getRecommendationsSubtext: {
    fontSize: 12,
    color: '#6C6C6C', // Secondary text
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusContainer: {
    backgroundColor: 'rgba(191, 150, 148, 0.1)', // Light metallic accent
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6C6C6C', // Secondary text
    textAlign: 'center',
  },
  preferencesStatusText: {
    fontSize: 11,
    color: '#BF9694', // Metallic accent
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default SimpleEnhancedMenuScreen;
