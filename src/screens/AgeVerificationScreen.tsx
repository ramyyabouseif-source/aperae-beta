import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { AgeVerificationService } from '../services/ageVerificationService';
import { TermsService } from '../services/termsService';
import { PrivacyPolicyService } from '../services/privacyPolicyService';
import { LEGAL_CONFIG } from '../config/legal';

interface AgeVerificationScreenProps {
  onVerified: () => void;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
}

const LEGAL_DRINKING_AGE = 21;

export default function AgeVerificationScreen({ 
  onVerified, 
  onTermsPress, 
  onPrivacyPress 
}: AgeVerificationScreenProps) {
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleContinue = async () => {
    if (isVerifying) return;
    
    if (!isAgeConfirmed) {
      Alert.alert('Required', 'Please confirm you are 21 or older to continue.');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Required', 'Please accept the Terms of Use and Privacy Notice to continue.');
      return;
    }

    setIsVerifying(true);
    try {
      // Accept all three: Age verification, Terms, and Privacy Policy
      await Promise.all([
        AgeVerificationService.verifyAge(LEGAL_DRINKING_AGE),
        TermsService.acceptTerms(),
        PrivacyPolicyService.acceptPrivacyPolicy(),
      ]);
      onVerified();
    } catch (error) {
      console.error('Error storing verification/acceptance:', error);
      
      // Check if at least age verification succeeded
      try {
        const verified = await AgeVerificationService.isAgeVerified();
        const termsAccepted = await TermsService.hasAcceptedTerms();
        const privacyAccepted = await PrivacyPolicyService.hasAcceptedPrivacyPolicy();
        
        if (verified && termsAccepted && privacyAccepted) {
          onVerified();
        } else {
          Alert.alert('Error', 'Failed to save verification. Please try again.');
          setIsVerifying(false);
        }
      } catch (checkError) {
        Alert.alert('Error', 'Failed to save verification. Please try again.');
        setIsVerifying(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/Aperae Logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Age Verification</Text>
        <Text style={styles.subtitle}>
          Required for Alcohol-Related Content
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Why We Ask */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Why do we ask?</Text>
            <Text style={styles.infoText}>
              {LEGAL_CONFIG.appName} provides wine recommendations and alcohol-related content. 
              Federal and state laws require age verification for such content.
            </Text>
            <Text style={[styles.infoText, styles.infoTextSpacing]}>
              We use self-attestation (honor system) and do not verify government IDs.
            </Text>
          </View>

          {/* Age Confirmation */}
          <TouchableOpacity
            style={[styles.ageButton, isAgeConfirmed && styles.ageButtonSelected]}
            onPress={() => setIsAgeConfirmed(!isAgeConfirmed)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContainer}>
              <View style={[styles.checkbox, isAgeConfirmed && styles.checkboxChecked]}>
                {isAgeConfirmed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.ageButtonText}>
                I am 21 years or older (or the legal drinking age in my area)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Terms Acceptance */}
          <TouchableOpacity
            style={[styles.termsButton, agreedToTerms && styles.termsButtonSelected]}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View style={styles.checkboxContainer}>
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  I have read and agree to the{' '}
                  {onTermsPress ? (
                    <Text style={styles.link} onPress={onTermsPress}>
                      Terms of Use
                    </Text>
                  ) : (
                    <Text style={styles.linkText}>Terms of Use</Text>
                  )}
                  {' '}and{' '}
                  {onPrivacyPress ? (
                    <Text style={styles.link} onPress={onPrivacyPress}>
                      Privacy Notice
                    </Text>
                  ) : (
                    <Text style={styles.linkText}>Privacy Notice</Text>
                  )}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Important Disclaimers */}
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerTitle}>⚠️ Important Disclaimers</Text>
            <Text style={styles.disclaimerText}>
              • AI recommendations may be inaccurate (~10% error rate){'\n'}
              • Not professional sommelier or medical advice{'\n'}
              • Personal project - use entirely at your own risk{'\n'}
              • Drink responsibly - never drink and drive{'\n'}
              • If you're under 21, you may not use this app
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!isAgeConfirmed || !agreedToTerms || isVerifying) && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!isAgeConfirmed || !agreedToTerms || isVerifying}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {isVerifying ? 'Please wait...' : 'I Agree & Continue'}
            </Text>
          </TouchableOpacity>

          {/* Help Resources */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              For alcohol-related concerns:{'\n'}
              SAMHSA Hotline: 1-800-662-4357 (24/7, free, confidential)
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
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
    color: '#5B2433', // Dark tone text
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#5B2433', // Dark tone text
    lineHeight: 22,
  },
  infoTextSpacing: {
    marginTop: 12,
  },
  ageButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ageButtonSelected: {
    borderColor: '#5B2433', // Dark tone
    backgroundColor: '#FFF5F5',
  },
  termsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  termsButtonSelected: {
    borderColor: '#5B2433', // Dark tone
    backgroundColor: '#FFF5F5',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#5B2433', // Dark tone
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#5B2433', // Dark tone
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ageButtonText: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    fontWeight: '600',
    flex: 1,
    lineHeight: 24,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 15,
    color: '#5B2433', // Dark tone text
    lineHeight: 22,
  },
  link: {
    color: '#BF9694', // Metallic accent
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  linkText: {
    color: '#BF9694', // Metallic accent
    fontWeight: '600',
  },
  disclaimerContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#5B2433', // Dark tone
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
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpContainer: {
    backgroundColor: 'rgba(191, 150, 148, 0.15)', // Light metallic accent background
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent border
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5B2433', // Dark tone text
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#5B2433', // Dark tone text
    lineHeight: 18,
  },
});
