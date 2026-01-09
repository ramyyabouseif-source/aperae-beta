import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LEGAL_CONFIG } from '../config/legal';

interface TermsScreenProps {
  onAccept?: () => void;
  onPrivacyPolicyPress?: () => void;
  navigation?: any; // Optional navigation prop for when used in NavigationContainer
}

// Inner component that doesn't use navigation hook
function TermsScreenContent({ onAccept, onPrivacyPolicyPress, navigation }: TermsScreenProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
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
      Alert.alert('Please Scroll', 'Please scroll to the bottom of the terms to continue.');
      return;
    }
    
    if (onAccept) {
      try {
        // Call the async handler
        await onAccept();
      } catch (error) {
        console.error('Error accepting terms:', error);
        // Still proceed - local storage might have succeeded
        // The parent component will handle the state update
      }
    } else if (navigation) {
      // If no onAccept callback but navigation is available, navigate back
      navigation.goBack();
    }
    // If neither onAccept nor navigation available, just do nothing
  };

  const handlePrivacyPolicyPress = () => {
    if (onPrivacyPolicyPress) {
      onPrivacyPolicyPress();
    } else if (navigation) {
      // If no callback but navigation is available, navigate to Privacy Policy
      // @ts-ignore - navigation type issue
      navigation.navigate('PrivacyPolicy');
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
        <Text style={styles.title}>Terms & Conditions</Text>
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
          <Text style={styles.sectionTitle}>Aperae Key Terms & User Agreement</Text>
          <Text style={styles.effectiveDate}>Effective Date: {LEGAL_CONFIG.termsEffectiveDate}</Text>
          
          <Text style={styles.introText}>
            Welcome to Aperae! Before you dive in, here's what you need to know:
          </Text>

          <Text style={styles.subsectionTitle}>Key Terms (Plain-English Summary)</Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>Age Requirement:</Text> You must be 21 or older (or the legal drinking age where you live).
          </Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>Entertainment Only:</Text> Our wine and food pairing tips are AI-generated and meant for fun and education — not guaranteed results, not professional or medical advice.
          </Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>Use Responsibly:</Text> Follow the law, drink responsibly, and never misuse the app.
          </Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>No Guarantees:</Text> We do our best, but we can't promise accuracy or specific outcomes from recommendations.
          </Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>Your Data:</Text> We collect limited information as described in our{' '}
            {handlePrivacyPolicyPress ? (
              <Text style={styles.link} onPress={handlePrivacyPolicyPress}>
                Privacy Policy
              </Text>
            ) : (
              <Text style={styles.linkText}>Privacy Policy</Text>
            )}
            , and comply with privacy laws (including GDPR, where applicable).
          </Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>Our Content:</Text> Everything in Aperae (logos, design, AI outputs, etc.) belongs to us. You can use the app, but you can't copy or resell it.
          </Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>Disputes:</Text> If there's a disagreement, it will be handled by binding arbitration in New York (not in court, and not in a class action).
          </Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>Termination:</Text> We can suspend or remove your account if you misuse the Service or break the rules.
          </Text>
          
          <Text style={styles.termItem}>
            <Text style={styles.termLabel}>Changes:</Text> We may update these terms, and continued use means you agree to the new version.
          </Text>

          <Text style={styles.note}>
            �� Note: This is just a friendly summary. The full Terms of Use below are the actual binding legal contract.
          </Text>

          <Text style={styles.sectionTitle}>Aperae Terms of Use and User Agreement</Text>
          
          <Text style={styles.introText}>
            By accessing or using Aperae's website, mobile application, or related services (collectively, the "Service"), you ("User," "you," or "your") agree to be bound by this Agreement. If you do not agree, do not use the Service.
          </Text>

          <Text style={styles.subsectionTitle}>1. Eligibility & Age Requirements</Text>
          <Text style={styles.paragraph}>
            You must be at least 21 years of age (or the legal drinking age in your jurisdiction) to use the Service.
          </Text>
          <Text style={styles.paragraph}>
            By using Aperae, you represent and warrant that you meet these age requirements and have the legal capacity to enter into this Agreement.
          </Text>
          <Text style={styles.paragraph}>
            The Service is not intended for individuals under the age of 21 or those prohibited from consuming alcohol under applicable law.
          </Text>

          <Text style={styles.subsectionTitle}>2. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            You agree to use the Service only for lawful purposes and in compliance with all applicable laws and regulations.
          </Text>
          <Text style={styles.paragraph}>You will not:</Text>
          <Text style={styles.bulletPoint}>• Misuse the Service or interfere with its normal operation.</Text>
          <Text style={styles.bulletPoint}>• Rely on the Service for medical advice, health decisions, or alcohol consumption guidance beyond general pairing or educational recommendations.</Text>
          <Text style={styles.bulletPoint}>• Share your account or credentials with others without authorization.</Text>

          <Text style={styles.subsectionTitle}>3. License & Intellectual Property</Text>
          <Text style={styles.paragraph}>
            Aperae grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal, non-commercial purposes.
          </Text>
          <Text style={styles.paragraph}>
            All content, software, trademarks, service marks, logos, and other intellectual property displayed through the Service are the property of Aperae or its licensors and are protected by applicable intellectual property laws.
          </Text>
          <Text style={styles.paragraph}>
            You may not reproduce, modify, distribute, or create derivative works from the Service without prior written consent from Aperae.
          </Text>

          <Text style={styles.subsectionTitle}>4. Service Limitations & Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            The Service provides AI-generated recommendations that simulate the opinions of a sommelier. These recommendations are provided for entertainment and educational purposes only.
          </Text>
          <Text style={styles.paragraph}>
            Aperae does not guarantee the accuracy, reliability, or results of any recommendation.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>No Medical or Professional Advice:</Text> Aperae does not provide health, medical, or dietary advice. Always consult a qualified professional for health or medical concerns.
          </Text>
          <Text style={styles.paragraph}>
            The Service is provided on an "as-is" and "as-available" basis without warranties of any kind, express or implied.
          </Text>

          <Text style={styles.subsectionTitle}>5. Limitation of Liability</Text>
          <Text style={styles.paragraph}>To the fullest extent permitted by law:</Text>
          <Text style={styles.paragraph}>
            Aperae and its officers, directors, employees, affiliates, licensors, and partners shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, goodwill, or use, arising out of or relating to your use of the Service.
          </Text>
          <Text style={styles.paragraph}>
            Your sole and exclusive remedy for dissatisfaction with the Service is to stop using it.
          </Text>

          <Text style={styles.subsectionTitle}>6. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify, defend, and hold harmless Aperae and its affiliates, officers, directors, employees, and licensors from and against any claims, liabilities, damages, losses, and expenses (including attorneys' fees) arising out of or related to:
          </Text>
          <Text style={styles.bulletPoint}>• Your violation of this Agreement.</Text>
          <Text style={styles.bulletPoint}>• Your misuse of the Service.</Text>
          <Text style={styles.bulletPoint}>• Your violation of any law or rights of a third party.</Text>

          <Text style={styles.subsectionTitle}>7. Privacy & Data Practices</Text>
          <Text style={styles.paragraph}>
            Aperae collects and processes certain information in accordance with its{' '}
            {handlePrivacyPolicyPress ? (
              <Text style={styles.link} onPress={handlePrivacyPolicyPress}>
                Privacy Policy
              </Text>
            ) : (
              <Text style={styles.linkText}>Privacy Policy</Text>
            )}
            .
          </Text>
          <Text style={styles.paragraph}>
            If you are located in the European Union, we process personal data in compliance with the General Data Protection Regulation (GDPR) where applicable.
          </Text>
          <Text style={styles.paragraph}>
            By using the Service, you consent to the collection and use of your data as described in the Privacy Policy.
          </Text>

          <Text style={styles.subsectionTitle}>8. Governing Law & Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            This Agreement shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to conflict of law principles.
          </Text>
          <Text style={styles.paragraph}>
            Any dispute, claim, or controversy arising out of or relating to this Agreement or your use of the Service shall be resolved by binding arbitration under the rules of the American Arbitration Association (AAA).
          </Text>
          <Text style={styles.paragraph}>
            You waive any right to a jury trial or to participate in a class action.
          </Text>

          <Text style={styles.subsectionTitle}>9. Termination of Access</Text>
          <Text style={styles.paragraph}>
            Aperae may suspend or terminate your access to the Service at any time, without notice, if you violate this Agreement or engage in conduct that may harm the Service or other users.
          </Text>
          <Text style={styles.paragraph}>
            Upon termination, your right to use the Service immediately ceases.
          </Text>

          <Text style={styles.subsectionTitle}>10. Changes to Agreement</Text>
          <Text style={styles.paragraph}>
            Aperae reserves the right to modify or update this Agreement at any time.
          </Text>
          <Text style={styles.paragraph}>
            Continued use of the Service after changes become effective constitutes acceptance of the revised Agreement.
          </Text>

          <Text style={styles.subsectionTitle}>11. Contact Information</Text>
          <Text style={styles.paragraph}>For questions or concerns about this Agreement, please contact:</Text>
          <Text style={styles.paragraph}>
            {LEGAL_CONFIG.contact.address}{'\n'}
            Email: {LEGAL_CONFIG.contact.legal}
          </Text>

          <Text style={styles.disclaimer}>
            <Text style={styles.bold}>Closing Disclaimer</Text>{'\n'}
            This document is a simulated legal draft prepared by AI for educational purposes only. Consult a licensed attorney for official legal advice and compliance with applicable laws.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.acceptButton, !hasScrolledToBottom && styles.acceptButtonDisabled]}
          onPress={handleAccept}
          onPressIn={handleAccept}
          disabled={!hasScrolledToBottom}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>
            {onAccept 
              ? (hasScrolledToBottom ? 'I Accept' : 'Scroll to Accept')
              : (hasScrolledToBottom ? 'Done' : 'Scroll to Continue')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Wrapper component - handles navigation hook properly
// This component is used when screen is inside NavigationContainer (from navigation stack)
function TermsScreenWithNavigation(props: Omit<TermsScreenProps, 'onAccept'>) {
  // useNavigation hook is safe to call here since we're always inside NavigationContainer
  const navigation = useNavigation();
  return <TermsScreenContent {...props} navigation={navigation} />;
}

// Main export - handles both gate screen and navigation contexts
export default function TermsScreen(props: TermsScreenProps) {
  // If onAccept is provided, we're in gate screen context (no NavigationContainer)
  // In that case, don't use navigation hook at all
  if (props.onAccept) {
    return <TermsScreenContent {...props} />;
  }
  
  // Otherwise, we're inside NavigationContainer - use navigation hook
  // This component will be rendered from the navigation stack, so hook is safe
  return <TermsScreenWithNavigation onPrivacyPolicyPress={props.onPrivacyPolicyPress} />;
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
  termItem: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    lineHeight: 24,
    marginBottom: 12,
  },
  termLabel: {
    fontWeight: 'bold',
    color: '#BF9694', // Metallic accent
  },
  note: {
    fontSize: 14,
    color: '#5B2433', // Dark tone text
    fontStyle: 'italic',
    backgroundColor: 'rgba(191, 150, 148, 0.1)', // Light metallic accent background
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent border
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
  link: {
    color: '#BF9694', // Metallic accent
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  linkText: {
    color: '#BF9694', // Metallic accent
    fontWeight: '600',
  },
});