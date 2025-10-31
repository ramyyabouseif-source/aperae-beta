import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { CameraService } from '../services/cameraService';
import { MenuAnalysisService, MenuAnalysisResult } from '../services/menuAnalysisService';
import MenuCamera from '../components/MenuCamera';
import MenuResults from '../components/MenuResults';

export default function MenuScreen() {
  const [menuText, setMenuText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MenuAnalysisResult | null>(null);
  const [serviceStatus, setServiceStatus] = useState({
    ocrAvailable: false,
    cameraAvailable: false,
    cameraPermission: false,
    overallAvailable: false,
  });

  React.useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const status = await MenuAnalysisService.getStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Service status check error:', error);
    }
  };

  const handleAnalyzeMenu = async () => {
    if (!menuText.trim()) {
      Alert.alert('Error', 'Please enter some menu text to analyze.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await MenuAnalysisService.analyzeMenuFromText(menuText);
      setAnalysisResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Menu analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze menu. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTakePhoto = () => {
    if (!serviceStatus.overallAvailable) {
      Alert.alert(
        'Service Unavailable',
        'Camera or OCR service is not available. Please check your permissions and try again.'
      );
      return;
    }
    setShowCamera(true);
  };

  const handleUploadPhoto = async () => {
    if (!serviceStatus.overallAvailable) {
      Alert.alert(
        'Service Unavailable',
        'OCR service is not available. Please check your permissions and try again.'
      );
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await MenuAnalysisService.pickPhotoAndAnalyze();
      setAnalysisResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Photo upload analysis error:', error);
      if (error instanceof Error && error.message.includes('cancelled')) {
        // User cancelled photo selection, no need to show error
        return;
      }
      Alert.alert('Analysis Error', 'Failed to analyze photo. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoCaptured = async (photo: any) => {
    setShowCamera(false);
    setIsAnalyzing(true);
    
    try {
      const result = await MenuAnalysisService.analyzeMenuFromPhoto(photo);
      setAnalysisResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Photo analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze photo. Please try again.');
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Analysis</Text>
        <Text style={styles.subtitle}>
          Paste menu text or take a photo to get wine recommendations
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.sectionTitle}>Paste Menu Text:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Paste your menu here..."
          value={menuText}
          onChangeText={setMenuText}
          multiline
        />
        
        <TouchableOpacity 
          style={[styles.button, isAnalyzing && styles.buttonDisabled]}
          onPress={handleAnalyzeMenu}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Analyze Menu</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <Text style={styles.dividerText}>OR</Text>
      </View>

      <View style={styles.cameraContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.cameraButton, styles.takePhotoButton]}
            onPress={handleTakePhoto}
          >
            <Text style={styles.cameraButtonText}>📷 Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.cameraButton, styles.uploadPhotoButton]}
            onPress={handleUploadPhoto}
          >
            <Text style={styles.cameraButtonText}>📁 Upload Photo</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.cameraSubtext}>
          Use OCR to extract menu items automatically
        </Text>
        
        {/* Service Status Indicator */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            OCR: {serviceStatus.ocrAvailable ? '✅' : '❌'} | 
            Camera: {serviceStatus.cameraAvailable ? '✅' : '❌'}
          </Text>
        </View>
      </View>

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
  inputContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#8B0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  cameraContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cameraButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  takePhotoButton: {
    backgroundColor: '#4CAF50',
  },
  uploadPhotoButton: {
    backgroundColor: '#2196F3',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  statusContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});