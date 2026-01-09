import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LEGAL_CONFIG } from '../config/legal';

interface PrivacyPolicyScreenProps {
  onAccept?: () => void;
  navigation?: any; // Optional navigation prop for when used in NavigationContainer
}

// Inner component that doesn't use navigation hook
function PrivacyPolicyContent({ onAccept, navigation }: PrivacyPolicyScreenProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    
    if (isCloseToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!hasScrolledToBottom) {
      Alert.alert('Please Scroll', 'Please scroll to the bottom of the Privacy Policy to continue.');
      return;
    }
    
    if (!isAgreed) {
      Alert.alert('Please Agree', 'Please check the agreement box to continue.');
      return;
    }
    
    if (onAccept) {
      try {
        // Call the async handler
        await onAccept();
      } catch (error) {
        console.error('Error accepting privacy policy:', error);
        // Still proceed - local storage might have succeeded
        // The parent component will handle the state update
      }
    } else if (navigation) {
      // If no onAccept callback but navigation is available, navigate back
      navigation.goBack();
    }
    // If neither onAccept nor navigation available, just do nothing
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/Aperae Logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>Please read and accept to continue</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Aperae Privacy Policy</Text>
          <Text style={styles.effectiveDate}>Last Updated: {LEGAL_CONFIG.privacyLastUpdated}</Text>
          <Text style={styles.version}>Version: {LEGAL_CONFIG.privacyVersion}</Text>
          
          <Text style={styles.introText}>
            At Aperae, we respect your privacy and are committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
          </Text>

          <Text style={styles.subsectionTitle}>1. Information We Collect</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>1.1 Information You Provide to Us:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Wine Preferences:</Text> Your wine taste preferences, budget ranges, preferred regions, grape varieties, and pairing styles.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Favorites:</Text> Wines you save to your favorites list.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Usage Data:</Text> Information about how you interact with the app, including menu photos you upload for wine recommendations.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Account Information:</Text> If you create an account, we may collect your email address and other account details.</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>1.2 Automatically Collected Information:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Device Information:</Text> Device type, operating system, unique device identifiers, and mobile network information.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Usage Information:</Text> How you use the app, features accessed, and app performance data.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Location Data:</Text> Approximate location data (if you grant permission) to provide region-specific recommendations.</Text>

          <Text style={styles.subsectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>We use the information we collect to:</Text>
          <Text style={styles.bulletPoint}>• Provide personalized wine recommendations based on your preferences and food pairings.</Text>
          <Text style={styles.bulletPoint}>• Analyze menu photos to suggest appropriate wines.</Text>
          <Text style={styles.bulletPoint}>• Improve and optimize our app's functionality and user experience.</Text>
          <Text style={styles.bulletPoint}>• Communicate with you about your account, app updates, and support requests.</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations and enforce our Terms of Service.</Text>
          <Text style={styles.bulletPoint}>• Conduct analytics and research to improve our services.</Text>

          <Text style={styles.subsectionTitle}>3. Legal Basis for Processing (GDPR)</Text>
          <Text style={styles.paragraph}>
            If you are located in the European Economic Area (EEA), we process your personal data based on the following legal grounds:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Consent:</Text> You have given clear consent to process your personal data for specific purposes (e.g., personalized recommendations).</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Contract Performance:</Text> Processing is necessary to provide the services you requested.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Legitimate Interests:</Text> We process data to improve our services, prevent fraud, and ensure security.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Legal Obligation:</Text> We may process data to comply with applicable laws.</Text>

          <Text style={styles.subsectionTitle}>4. Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Service Providers:</Text> We may share data with third-party service providers who assist us in operating our app (e.g., cloud hosting, analytics, AI services like Anthropic Claude and Google Cloud Vision).</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Legal Requirements:</Text> We may disclose information if required by law, court order, or government regulation.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Business Transfers:</Text> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>With Your Consent:</Text> We may share information with your explicit consent.</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Third-Party Services:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Anthropic Claude:</Text> We use Anthropic's Claude API to generate wine recommendations. Your input data (dish descriptions, preferences) is sent to Anthropic for processing. Please review Anthropic's Privacy Policy for their data handling practices.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Google Cloud Vision:</Text> We use Google Cloud Vision API to analyze menu photos. Images are processed by Google according to their Privacy Policy.</Text>

          <Text style={styles.subsectionTitle}>5. Data Retention</Text>
          <Text style={styles.paragraph}>We retain your personal information for the following periods:</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Wine Preferences:</Text> Retained for 1 year after your last use of the app, or until you delete your account.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Wine Recommendations History:</Text> Retained for 1 year for service improvement purposes.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Usage Analytics:</Text> Retained for 3 months in aggregated, anonymized form.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Favorite Wines:</Text> Retained for 2 years or until you remove them.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Account Information:</Text> Retained until you delete your account or request deletion.</Text>
          <Text style={styles.paragraph}>
            After these periods, we will delete or anonymize your personal information unless we are required to retain it for legal purposes.
          </Text>

          <Text style={styles.subsectionTitle}>6. Your Privacy Rights</Text>
          
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>6.1 GDPR Rights (EU/EEA Residents):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Access:</Text> Request a copy of the personal data we hold about you.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Rectification:</Text> Request correction of inaccurate or incomplete data.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Erasure:</Text> Request deletion of your personal data ("right to be forgotten").</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Restrict Processing:</Text> Request limitation of how we process your data.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Data Portability:</Text> Receive your data in a structured, machine-readable format.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Object:</Text> Object to processing based on legitimate interests.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Withdraw Consent:</Text> Withdraw consent at any time where processing is based on consent.</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>6.2 CCPA Rights (California Residents):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Know:</Text> Request disclosure of what personal information we collect, use, and disclose.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Delete:</Text> Request deletion of your personal information.</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Opt-Out:</Text> Opt-out of the sale of personal information (we do not sell personal information).</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Right to Non-Discrimination:</Text> We will not discriminate against you for exercising your privacy rights.</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>6.3 Exercising Your Rights:</Text>
          </Text>
          <Text style={styles.paragraph}>
            To exercise any of these rights, please contact us at {LEGAL_CONFIG.contact.privacy} or use the privacy settings in the app. 
            We will respond to your request within 30 days (or as required by applicable law).
          </Text>

          <Text style={styles.subsectionTitle}>7. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </Text>
          <Text style={styles.bulletPoint}>• Encryption of data in transit using TLS/SSL.</Text>
          <Text style={styles.bulletPoint}>• Secure storage of sensitive data using encrypted storage mechanisms.</Text>
          <Text style={styles.bulletPoint}>• Regular security assessments and updates.</Text>
          <Text style={styles.bulletPoint}>• Access controls and authentication measures.</Text>
          <Text style={styles.paragraph}>
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your data, 
            we cannot guarantee absolute security.
          </Text>

          <Text style={styles.subsectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our app is intended for users who are 21 years of age or older (or the legal drinking age in their jurisdiction). 
            We do not knowingly collect personal information from individuals under the age of 21. If we become aware that we have collected 
            information from a person under 21, we will delete that information immediately.
          </Text>

          <Text style={styles.subsectionTitle}>9. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have 
            data protection laws that differ from those in your country. When we transfer data to third-party services (such as Anthropic Claude or Google Cloud), 
            we ensure appropriate safeguards are in place, including:
          </Text>
          <Text style={styles.bulletPoint}>• Standard Contractual Clauses (SCCs) approved by the European Commission.</Text>
          <Text style={styles.bulletPoint}>• Adequacy decisions by the European Commission.</Text>
          <Text style={styles.bulletPoint}>• Other legally recognized transfer mechanisms.</Text>

          <Text style={styles.subsectionTitle}>10. Cookies and Tracking Technologies</Text>
          <Text style={styles.paragraph}>
            Our app may use cookies and similar tracking technologies to:
          </Text>
          <Text style={styles.bulletPoint}>• Remember your preferences and settings.</Text>
          <Text style={styles.bulletPoint}>• Analyze app usage and performance.</Text>
          <Text style={styles.bulletPoint}>• Provide personalized content and recommendations.</Text>
          <Text style={styles.paragraph}>
            You can control cookie preferences through your device settings or app preferences. 
            Note that disabling certain cookies may affect app functionality.
          </Text>

          <Text style={styles.subsectionTitle}>11. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
            We will notify you of any material changes by:
          </Text>
          <Text style={styles.bulletPoint}>• Posting the updated Privacy Policy in the app.</Text>
          <Text style={styles.bulletPoint}>• Updating the "Last Updated" date.</Text>
          <Text style={styles.bulletPoint}>• Requesting your consent if required by law.</Text>
          <Text style={styles.paragraph}>
            Continued use of the app after changes become effective constitutes acceptance of the updated Privacy Policy.
          </Text>

          <Text style={styles.subsectionTitle}>12. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Privacy Officer</Text>{'\n'}
            {LEGAL_CONFIG.contact.address}{'\n'}
            Email: {LEGAL_CONFIG.contact.privacy}{'\n'}
            For general inquiries: {LEGAL_CONFIG.contact.support}
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Data Protection Officer (EU/EEA):</Text>{'\n'}
            If you are located in the EU/EEA, you also have the right to lodge a complaint with your local data protection authority 
            (Supervisory Authority) if you believe we have violated your privacy rights.
          </Text>

          <Text style={styles.disclaimer}>
            <Text style={styles.bold}>Important Notice</Text>{'\n'}
            This Privacy Policy is designed to comply with GDPR, CCPA, and other applicable privacy laws. 
            However, this document is a legal draft prepared for educational purposes and should be reviewed by a qualified attorney 
            before final implementation to ensure full compliance with all applicable laws and regulations in your jurisdiction.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkboxContainer, isAgreed && styles.checkboxChecked]}
            onPress={() => setIsAgreed(!isAgreed)}
            activeOpacity={0.7}
          >
            <Text style={styles.checkboxText}>✓</Text>
          </TouchableOpacity>
          <Text style={styles.agreementText}>
            I have read and agree to the Privacy Policy
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.acceptButton, (!hasScrolledToBottom || !isAgreed) && styles.acceptButtonDisabled]}
          onPress={handleAccept}
          onPressIn={handleAccept}
          disabled={!hasScrolledToBottom || !isAgreed}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>
            {!hasScrolledToBottom ? 'Scroll to Continue' : !isAgreed ? 'Check Agreement' : 'AGREE'}
          </Text>
        </TouchableOpacity>
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
  logo: {
    width: 120,
    height: 40,
    marginBottom: 16,
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B2433', // Dark tone text
    marginTop: 20,
    marginBottom: 10,
  },
  effectiveDate: {
    fontSize: 14,
    color: '#5B2433', // Dark tone text
    fontStyle: 'italic',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: '#5B2433', // Dark tone text
    fontStyle: 'italic',
    marginBottom: 15,
  },
  introText: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    lineHeight: 24,
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B2433', // Dark tone text
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 14,
    color: '#5B2433', // Dark tone text
    fontStyle: 'italic',
    backgroundColor: 'rgba(191, 150, 148, 0.1)', // Light metallic accent background
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent border
  },
  footer: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone background
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent border
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#5B2433', // Dark tone border
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5B2433', // Dark tone background
  },
  checkboxText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agreementText: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#5B2433', // Dark tone background
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#ccc',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

// Wrapper component - handles navigation hook properly
// This component is used when screen is inside NavigationContainer (from navigation stack)
function PrivacyPolicyScreenWithNavigation(props: Omit<PrivacyPolicyScreenProps, 'onAccept'>) {
  // useNavigation hook is safe to call here since we're always inside NavigationContainer
  const navigation = useNavigation();
  return <PrivacyPolicyContent navigation={navigation} />;
}

// Main export - handles both gate screen and navigation contexts
export default function PrivacyPolicyScreen(props: PrivacyPolicyScreenProps) {
  // If onAccept is provided, we're in gate screen context (no NavigationContainer)
  // In that case, don't use navigation hook at all
  if (props.onAccept) {
    return <PrivacyPolicyContent onAccept={props.onAccept} />;
  }
  
  // Otherwise, we're inside NavigationContainer - use navigation hook
  // This component will be rendered from the navigation stack, so hook is safe
  return <PrivacyPolicyScreenWithNavigation />;
}

