import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AgeVerificationService } from '../services/ageVerificationService';
import { LEGAL_CONFIG } from '../config/legal';

interface AgeVerificationScreenProps {
  onVerified: () => void;
}

const LEGAL_DRINKING_AGE = 21;

export default function AgeVerificationScreen({ onVerified }: AgeVerificationScreenProps) {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (isVerifying) return; // Prevent double-clicks
    
    if (!selectedAge) {
      Alert.alert('Required', 'Please confirm your age to continue.');
      return;
    }

    if (selectedAge < LEGAL_DRINKING_AGE) {
      Alert.alert(
        'Age Restriction',
        `You must be ${LEGAL_DRINKING_AGE} or older to use ${LEGAL_CONFIG.appName}. This app provides wine recommendations for individuals of legal drinking age only.`,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
      return;
    }

    setIsVerifying(true);
    try {
      // Store age verification using the service
      await AgeVerificationService.verifyAge(selectedAge);
      // Call onVerified even if backend storage fails (local storage is primary)
      // Use setTimeout to ensure state update happens
      setTimeout(() => {
        onVerified();
      }, 0);
    } catch (error) {
      console.error('Error storing age verification:', error);
      // Still proceed if local storage succeeded (backend failure is non-blocking)
      // Check if local storage at least worked
      try {
        const verified = await AgeVerificationService.isAgeVerified();
        if (verified) {
          // Local storage succeeded, proceed anyway
          setTimeout(() => {
            onVerified();
          }, 0);
        } else {
          Alert.alert('Error', 'Failed to save age verification. Please try again.');
          setIsVerifying(false);
        }
      } catch (checkError) {
        Alert.alert('Error', 'Failed to save age verification. Please try again.');
        setIsVerifying(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Age Verification</Text>
        <Text style={styles.subtitle}>
          You must be {LEGAL_DRINKING_AGE} or older to use {LEGAL_CONFIG.appName}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Legal Drinking Age Required</Text>
          <Text style={styles.infoText}>
            {LEGAL_CONFIG.appName} provides wine recommendations and educational content about wine and food pairings. 
            To use this app, you must be at least {LEGAL_DRINKING_AGE} years of age (or the legal drinking age in your jurisdiction).
          </Text>
        </View>

        <Text style={styles.question}>Are you {LEGAL_DRINKING_AGE} years or older?</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.ageButton,
              selectedAge === LEGAL_DRINKING_AGE && styles.ageButtonSelected,
            ]}
            onPress={() => setSelectedAge(LEGAL_DRINKING_AGE)}
          >
            <Text style={[
              styles.ageButtonText,
              selectedAge === LEGAL_DRINKING_AGE && styles.ageButtonTextSelected,
            ]}>
              Yes, I am {LEGAL_DRINKING_AGE} or older
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.ageButton,
              selectedAge !== null && selectedAge < LEGAL_DRINKING_AGE && styles.ageButtonSelected,
            ]}
            onPress={() => setSelectedAge(17)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.ageButtonText,
              selectedAge !== null && selectedAge < LEGAL_DRINKING_AGE && styles.ageButtonTextSelected,
            ]}>
              No, I am under {LEGAL_DRINKING_AGE}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, (!selectedAge || isVerifying) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          onPressIn={handleVerify}
          disabled={!selectedAge || isVerifying}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyButtonText}>
            {isVerifying ? 'Verifying...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Please drink responsibly. These recommendations are for educational purposes only. 
            Not intended for persons under the legal drinking age.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4F0', // Light tone background
  },
  header: {
    backgroundColor: '#5B2433', // Dark tone background
    padding: 20,
    paddingTop: 60, // Push header down to prevent cutoff
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
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B2433',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#5B2433',
    lineHeight: 24,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5B2433',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  ageButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ageButtonSelected: {
    borderColor: '#5B2433',
    backgroundColor: '#FFF5F5',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  ageButtonText: {
    fontSize: 18,
    color: '#5B2433',
    fontWeight: '600',
  },
  ageButtonTextSelected: {
    color: '#5B2433',
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#5B2433',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#5B2433',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
});

