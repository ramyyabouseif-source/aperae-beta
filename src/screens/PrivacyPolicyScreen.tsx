import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_CONFIG } from '../config/legal';

interface PrivacyPolicyScreenProps {
  onAccept?: () => void;
  onBack?: () => void;
  onCookiePolicyPress?: () => void;
  navigation?: any; // Optional navigation prop for when used in NavigationContainer
}

// Inner component that doesn't use navigation hook
function PrivacyPolicyContent({ onAccept, onBack, onCookiePolicyPress, navigation }: PrivacyPolicyScreenProps) {
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
      Alert.alert('Please Scroll', 'Please scroll to the bottom of the Privacy Notice to continue.');
      return;
    }
    
    if (!isAgreed) {
      Alert.alert('Please Agree', 'Please check the agreement box to continue.');
      return;
    }
    
    if (onAccept) {
      // Call the handler - parent component handles state
      try {
        onAccept();
      } catch (error) {
        console.error('Error accepting privacy notice:', error);
        // Error is handled in parent component
      }
    } else if (navigation) {
      // If no onAccept callback but navigation is available, navigate back
      navigation.goBack();
    }
    // If neither onAccept nor navigation available, just do nothing
  };
  
  const handleBack = () => {
    if (onBack) {
      // If onBack is provided, we're shown from AgeVerificationScreen - go back to it
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleCookiePolicyPress = () => {
    if (onCookiePolicyPress) {
      onCookiePolicyPress();
    } else if (navigation) {
      // @ts-ignore - navigation type issue
      navigation.navigate('CookiePolicy');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button when shown from AgeVerificationScreen - positioned absolutely */}
      {onBack && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#5B2433" />
        </TouchableOpacity>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Notice</Text>
          <Text style={styles.subtitle}>
            For Personal, Non-Commercial Use
          </Text>
          <Text style={styles.sectionTitle}>Aperae Privacy Notice</Text>
          <Text style={styles.effectiveDate}>Last Updated: {LEGAL_CONFIG.privacyLastUpdated}</Text>
          <Text style={styles.effectiveDate}>Version: {LEGAL_CONFIG.privacyVersion}</Text>
          <Text style={styles.effectiveDate}>Effective Date: {LEGAL_CONFIG.privacyLastUpdated}</Text>
          
          <Text style={styles.subsectionTitle}>About This Notice</Text>
          <Text style={styles.paragraph}>
            Aperae is a <Text style={styles.bold}>personal, non-commercial project</Text> created for 
            educational and informational purposes. This Privacy Notice explains what information we 
            collect when you use the Aperae website, and how that information is used.
          </Text>

          <Text style={styles.importantNotice}>
            <Text style={styles.bold}>Important:</Text>{'\n'}
            • Aperae is NOT a commercial business and is not incorporated{'\n'}
            • We do NOT sell products or services{'\n'}
            • We do NOT sell or monetize your data{'\n'}
            • This is a hobby/educational project provided free of charge{'\n\n'}
            Because Aperae is non-commercial, many commercial privacy laws may not apply. However, 
            we believe in transparency and want you to understand our data practices.
          </Text>

          <Text style={styles.subsectionTitle}>Jurisdictional Scope</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>This service is available only to users in the United States.</Text>
          </Text>
          <Text style={styles.bulletPoint}>• EU/EEA Access Blocked: We block access from the European Union and European Economic Area</Text>
          <Text style={styles.bulletPoint}>• If you see a geo-blocking message: The service is not available in your region</Text>
          <Text style={styles.bulletPoint}>• GDPR: Does not currently apply (we don't process EU data)</Text>

          <Text style={styles.sectionTitle}>1. What Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect minimal information necessary to provide wine recommendations.
          </Text>

          <Text style={styles.subsectionTitle}>1.1 Device Identifiers</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we collect:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• A unique identifier for your web browser</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>How it works:</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • We create a "device fingerprint" from your browser's User-Agent string (browser type, 
            version, operating system) and Accept-Language header (language preference)
          </Text>
          <Text style={styles.bulletPoint}>• This fingerprint is cryptographically hashed (SHA-256) before being sent to our servers</Text>
          <Text style={styles.bulletPoint}>• Stored in your browser's localStorage (not a traditional cookie)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Important characteristics:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• The fingerprint may change if you:</Text>
          <Text style={styles.bulletPoint}>  - Update your web browser</Text>
          <Text style={styles.bulletPoint}>  - Change language settings</Text>
          <Text style={styles.bulletPoint}>  - Use a different browser on the same device</Text>
          <Text style={styles.bulletPoint}>  - Clear your browser data or localStorage</Text>
          <Text style={styles.bulletPoint}>• Using incognito/private mode generates a different fingerprint</Text>
          <Text style={styles.bulletPoint}>• Each browser on the same device gets a different fingerprint</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Purpose:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Track your consent to Terms of Service and Privacy Notice</Text>
          <Text style={styles.bulletPoint}>• Link your age attestation (21+ confirmation) to your browser</Text>
          <Text style={styles.bulletPoint}>• Enable basic app preferences</Text>
          <Text style={styles.bulletPoint}>• If you create an account later, link your browser to your account</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Storage & Retention:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• In your browser: Stored in localStorage until you clear browser data</Text>
          <Text style={styles.bulletPoint}>• In our database: Stored indefinitely (hashed) unless you request deletion</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>CCPA Classification:</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • Device identifier hashes are considered "personal information" under California 
            Consumer Privacy Act (CCPA)
          </Text>
          <Text style={styles.bulletPoint}>
            • Even though hashed and cannot directly identify you, they are linked to your browser 
            and track your usage
          </Text>

          <Text style={styles.warningBox}>
            <Text style={styles.bold}>⚠️ What Happens If You Clear Browser Data:</Text>{'\n\n'}
            If you clear your browser cache, cookies, or localStorage:{'\n'}
            • Your device fingerprint is lost{'\n'}
            • A new fingerprint is generated on your next visit{'\n'}
            • You must re-accept Terms, Privacy Notice, and age verification{'\n'}
            • We cannot link your old and new fingerprints (they appear as different users to us)
          </Text>

          <Text style={styles.subsectionTitle}>1.2 IP Addresses</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we collect:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Your IP address when you access the app</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>How we use it:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Geographic blocking: Block access from EU/EEA (US-only service)</Text>
          <Text style={styles.bulletPoint}>• Rate limiting: Prevent spam/abuse</Text>
          <Text style={styles.bulletPoint}>• Security: Detect suspicious activity</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Storage:</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Anonymous users (no account):</Text> NOT stored in database (used in-memory only, then discarded)
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Account users:</Text> Stored for up to 37 days (session management)
          </Text>

          <Text style={styles.subsectionTitle}>1.3 Consent Records</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we collect:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Timestamp when you accepted Terms/Privacy Notice</Text>
          <Text style={styles.bulletPoint}>• Which version you accepted</Text>
          <Text style={styles.bulletPoint}>• Age attestation (21+ checkbox - NOT your actual birthdate)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Storage:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Kept indefinitely (proves you agreed to Terms)</Text>
          <Text style={styles.bulletPoint}>• Linked to your device identifier hash</Text>

          <Text style={styles.subsectionTitle}>1.4 Images You Upload</Text>
          <Text style={styles.importantNotice}>
            <Text style={styles.bold}>CRITICAL: Images are NOT stored</Text>
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What happens:</Text>
          </Text>
          <Text style={styles.bulletPoint}>1. You upload a menu photo or wine label</Text>
          <Text style={styles.bulletPoint}>2. We receive it as data in our server's memory (RAM)</Text>
          <Text style={styles.bulletPoint}>3. Sent to Google Cloud Vision for text extraction (OCR)</Text>
          <Text style={styles.bulletPoint}>4. Sent to Anthropic Claude (along with extracted text) for wine recommendations</Text>
          <Text style={styles.bulletPoint}>5. Image deleted from memory within seconds (never saved to disk)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we keep:</Text>
          </Text>
          <Text style={styles.bulletPoint}>✅ Extracted text from the image (menu items, wine names, etc.)</Text>
          <Text style={styles.bulletPoint}>❌ NOT the image itself</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Third-party processing:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Google and Anthropic receive your images</Text>
          <Text style={styles.bulletPoint}>• We don't control how long they keep images</Text>
          <Text style={styles.bulletPoint}>• See their privacy policies:</Text>
          <Text style={styles.bulletPoint}>  - Google Cloud Vision: https://cloud.google.com/vision/docs/data-usage</Text>
          <Text style={styles.bulletPoint}>  - Anthropic: https://www.anthropic.com/legal/privacy</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Your responsibility:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Don't upload images with faces, IDs, credit cards, or personal info</Text>
          <Text style={styles.bulletPoint}>• Don't upload copyrighted images you don't have rights to</Text>

          <Text style={styles.subsectionTitle}>1.5 Wine Recommendations</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we collect:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Your input (dish descriptions, food pairing requests)</Text>
          <Text style={styles.bulletPoint}>• AI-generated wine recommendations</Text>
          <Text style={styles.bulletPoint}>• Timestamp of recommendation</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Storage:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Stored in our database</Text>
          <Text style={styles.bulletPoint}>• Kept indefinitely (no automatic deletion)</Text>
          <Text style={styles.bulletPoint}>• NOT automatically linked to your account if you create one</Text>

          <Text style={styles.subsectionTitle}>1.6 Favorites (Saved Wines)</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we collect:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Wines you save to your favorites list</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Storage:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Stored locally on your device only (AsyncStorage/localStorage)</Text>
          <Text style={styles.bulletPoint}>• NOT stored in our database</Text>
          <Text style={styles.bulletPoint}>• Deleted if you clear browser data</Text>

          <Text style={styles.subsectionTitle}>1.7 Technical Information</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we collect:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Device type, operating system, browser</Text>
          <Text style={styles.bulletPoint}>• App version, screen size, language</Text>
          <Text style={styles.bulletPoint}>• Error logs (for fixing bugs - no personal info)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Storage:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Error logs: 30 days, then deleted</Text>
          <Text style={styles.bulletPoint}>• No personal identifiers in logs</Text>

          <Text style={styles.subsectionTitle}>1.8 Account Information (if you create an account)</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we collect:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Email address</Text>
          <Text style={styles.bulletPoint}>• Password (stored as encrypted hash - never in plain text)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What we DON'T collect:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Real name (not stored even if you enter it)</Text>
          <Text style={styles.bulletPoint}>• Date of birth (only 21+ checkbox)</Text>
          <Text style={styles.bulletPoint}>• Phone number, address, payment info</Text>

          <Text style={styles.subsectionTitle}>1.9 What We DON'T Collect</Text>
          <Text style={styles.paragraph}>We do NOT collect:</Text>
          <Text style={styles.bulletPoint}>✗ Precise location (only country/state from IP)</Text>
          <Text style={styles.bulletPoint}>✗ Biometric data</Text>
          <Text style={styles.bulletPoint}>✗ Health information</Text>
          <Text style={styles.bulletPoint}>✗ Social media accounts</Text>
          <Text style={styles.bulletPoint}>✗ Contact lists</Text>
          <Text style={styles.bulletPoint}>✗ Browsing history outside the app</Text>
          <Text style={styles.bulletPoint}>✗ Analytics/tracking data (no Google Analytics, etc.)</Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We use information to:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Generate AI wine recommendations (via Anthropic Claude)</Text>
          <Text style={styles.bulletPoint}>• Extract text from menu photos (via Google Cloud Vision)</Text>
          <Text style={styles.bulletPoint}>• Prevent spam and abuse (rate limiting)</Text>
          <Text style={styles.bulletPoint}>• Enforce US-only access (geo-blocking)</Text>
          <Text style={styles.bulletPoint}>• Fix bugs and improve the app</Text>
          <Text style={styles.bulletPoint}>• Prove you accepted our Terms (consent records)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We do NOT:</Text>
          </Text>
          <Text style={styles.bulletPoint}>✗ Sell your data</Text>
          <Text style={styles.bulletPoint}>✗ Use data for advertising</Text>
          <Text style={styles.bulletPoint}>✗ Share data for marketing</Text>
          <Text style={styles.bulletPoint}>✗ Track you across websites</Text>

          <Text style={styles.sectionTitle}>3. Who We Share Information With</Text>

          <Text style={styles.subsectionTitle}>3.1 Third-Party Services</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>(a) Anthropic (Claude API)</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>What they receive:</Text> Your images, extracted text, wine pairing requests
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Purpose:</Text> Generate AI recommendations</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Their privacy policy:</Text> https://www.anthropic.com/legal/privacy</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>We don't control:</Text> How long they keep your data</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>(b) Google Cloud Vision</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>What they receive:</Text> Your uploaded images (for OCR)
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Purpose:</Text> Extract text from photos</Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Their privacy policy:</Text> https://cloud.google.com/vision/docs/data-usage
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>(c) Neon (Database Hosting)</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>What they receive:</Text> All data in our database (device hashes, consent 
            records, recommendations, account info)
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Purpose:</Text> Store data</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Security:</Text> Industry-standard encryption</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>(d) Render (Server Hosting)</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>What they receive:</Text> Data flowing through our servers
          </Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Purpose:</Text> Host our backend application</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Security:</Text> TLS encryption in transit</Text>

          <Text style={styles.subsectionTitle}>3.2 Legal Requirements</Text>
          <Text style={styles.paragraph}>
            We may disclose information if required by law:
          </Text>
          <Text style={styles.bulletPoint}>• Valid subpoenas, court orders, or warrants</Text>
          <Text style={styles.bulletPoint}>• Law enforcement investigations</Text>
          <Text style={styles.bulletPoint}>• Compliance with applicable laws</Text>

          <Text style={styles.subsectionTitle}>3.3 Business Transfers</Text>
          <Text style={styles.paragraph}>
            In the event of merger, acquisition, or sale of Aperae, your information may transfer to 
            the new entity.
          </Text>

          <Text style={styles.sectionTitle}>4. How Long We Keep Your Data</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.5 }]}>Data Type</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.5 }]}>How Long</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Device identifier hash</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Indefinite (until deletion request)</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Consent records</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Indefinite (proves you agreed to Terms)</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>IP addresses (anonymous)</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>NOT stored</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>IP addresses (accounts)</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>37 days max</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Uploaded images</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Immediate deletion (&lt;5 seconds)</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Extracted text</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Indefinite</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Wine recommendations</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Indefinite</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Favorites</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Until you clear browser data</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Account info</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Until deletion request</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Error logs</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>30 days</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>5. Your Privacy Rights</Text>

          <Text style={styles.subsectionTitle}>5.1 All Users</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Right to Access:</Text> Request what data we have about your device
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Right to Delete:</Text> Request deletion of your data
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>How to request:</Text>
          </Text>
          <Text style={styles.bulletPoint}>1. Email: {LEGAL_CONFIG.contact.privacy}</Text>
          <Text style={styles.bulletPoint}>2. Subject: "Data Deletion Request"</Text>
          <Text style={styles.bulletPoint}>3. Include: Device type, OS, approximate date you first used app</Text>
          <Text style={styles.bulletPoint}>4. We'll respond within 30 days</Text>

          <Text style={styles.warningBox}>
            <Text style={styles.bold}>Important:</Text> Request must come from the same browser that created 
            the data. If you reinstalled or switched browsers, we may not be able to link old data to new device.
          </Text>

          <Text style={styles.subsectionTitle}>5.2 California Residents (CCPA Rights)</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Note:</Text> CCPA applies to "businesses" - Aperae may not qualify as 
            we're non-commercial. However, we'll honor CCPA-style requests anyway.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Your rights:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Right to know what data we collected (past 12 months)</Text>
          <Text style={styles.bulletPoint}>• Right to delete your data</Text>
          <Text style={styles.bulletPoint}>• Right to opt-out of sale (we don't sell data)</Text>
          <Text style={styles.bulletPoint}>• Right to non-discrimination</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Categories of data we collect (CCPA format):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Identifiers: Device hash, IP address, email (account users)</Text>
          <Text style={styles.bulletPoint}>• Internet activity: Usage data, error logs</Text>
          <Text style={styles.bulletPoint}>• Sensory data: Uploaded images (transient - immediately deleted)</Text>
          <Text style={styles.bulletPoint}>• Geolocation: Country/state (from IP, for geo-blocking)</Text>

          <Text style={styles.subsectionTitle}>5.3 Other State Residents</Text>
          <Text style={styles.paragraph}>
            Residents of Colorado, Connecticut, Virginia, and other states with privacy laws can also request:
          </Text>
          <Text style={styles.bulletPoint}>• Access to your data</Text>
          <Text style={styles.bulletPoint}>• Deletion of your data</Text>
          <Text style={styles.bulletPoint}>• Correction of inaccurate data</Text>

          <Text style={styles.paragraph}>
            Email: {LEGAL_CONFIG.contact.privacy}
          </Text>

          <Text style={styles.sectionTitle}>6. Data Security</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We use commercially reasonable security measures, including:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Encryption in transit (TLS/HTTPS)</Text>
          <Text style={styles.bulletPoint}>• Encrypted database storage (via hosting providers)</Text>
          <Text style={styles.bulletPoint}>• Hashed device identifiers (SHA-256)</Text>
          <Text style={styles.bulletPoint}>• Encrypted passwords (bcrypt - never stored in plain text)</Text>
          <Text style={styles.bulletPoint}>• No storage of uploaded images (privacy by design)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Security limitations:</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • We rely on third-party providers (Neon, Render, Google, Anthropic) for infrastructure security
          </Text>
          <Text style={styles.bulletPoint}>• Verify their current security practices from their documentation</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>No system is 100% secure.</Text> While we use industry-standard protections, 
            we cannot guarantee absolute security.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Your responsibility:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Keep your device secure</Text>
          <Text style={styles.bulletPoint}>• Use strong passwords (if you create an account)</Text>
          <Text style={styles.bulletPoint}>• Don't share your device with untrusted people</Text>

          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>This app is for users 21 years or older.</Text>
          </Text>
          <Text style={styles.bulletPoint}>• We use self-attestation (checkbox) for age verification</Text>
          <Text style={styles.bulletPoint}>• We don't knowingly collect data from anyone under 21</Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>If we discover a minor used the app:</Text> We'll delete their data immediately
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Parents:</Text> Monitor your children's internet use and prevent access to 
            age-restricted apps.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Report minor use:</Text> Email {LEGAL_CONFIG.contact.privacy}
          </Text>

          <Text style={styles.sectionTitle}>8. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>US-only service:</Text> Data is processed primarily in the United States.
          </Text>

          <Text style={styles.paragraph}>
            Third-party processors (Anthropic, Google) may process data internationally per their policies.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>EU/EEA users:</Text> Currently blocked. If we expand internationally, 
            we'll implement GDPR compliance.
          </Text>

          <Text style={styles.sectionTitle}>9. Cookies & Tracking Technologies</Text>

          <Text style={styles.subsectionTitle}>9.1 What We Use</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Browser localStorage (Not Traditional Cookies):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• We use browser localStorage API (key-value storage) to store:</Text>
          <Text style={styles.bulletPoint}>  - Device fingerprint (hashed identifier)</Text>
          <Text style={styles.bulletPoint}>  - Your consent to Terms and Privacy Notice</Text>
          <Text style={styles.bulletPoint}>  - Your age verification (21+ attestation)</Text>
          <Text style={styles.bulletPoint}>• localStorage persists until you clear browser data</Text>
          <Text style={styles.bulletPoint}>• NOT traditional HTTP cookies (different browser storage mechanism)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Session Cookies (If You Create an Account):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Session ID cookie for logged-in users</Text>
          <Text style={styles.bulletPoint}>• Expires when you close your browser</Text>
          <Text style={styles.bulletPoint}>• Essential for login functionality</Text>

          <Text style={styles.subsectionTitle}>9.2 What We Do NOT Use</Text>
          <Text style={styles.importantNotice}>
            <Text style={styles.bold}>WE DO NOT USE:</Text>{'\n'}
            ✗ Google Analytics or any analytics services{'\n'}
            ✗ Facebook Pixel or social media tracking{'\n'}
            ✗ Advertising cookies or retargeting pixels{'\n'}
            ✗ Third-party tracking cookies{'\n'}
            ✗ Cross-site tracking{'\n'}
            ✗ Any cookies beyond essential functionality
          </Text>

          <Text style={styles.subsectionTitle}>9.3 Essential vs. Optional Technologies</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Essential (Always Active - Cannot Be Disabled):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Device fingerprint (localStorage)</Text>
          <Text style={styles.bulletPoint}>• Consent records (localStorage)</Text>
          <Text style={styles.bulletPoint}>• Age verification (localStorage)</Text>
          <Text style={styles.bulletPoint}>• Session cookies (account users only)</Text>
          <Text style={styles.bulletPoint}>• These are required for the website to function</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Optional (Currently None):</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Analytics cookies: NOT USED</Text>
          <Text style={styles.bulletPoint}>• Advertising cookies: NOT USED</Text>
          <Text style={styles.bulletPoint}>• Social media cookies: NOT USED</Text>

          <Text style={styles.subsectionTitle}>9.4 Third-Party Services (Server-Side Only)</Text>
          <Text style={styles.paragraph}>
            Our third-party services (Anthropic, Google Cloud Vision, Neon, Render) are called 
            <Text style={styles.bold}> server-side</Text> and do <Text style={styles.bold}>NOT</Text> set 
            cookies or tracking technologies in your browser.
          </Text>

          <Text style={styles.subsectionTitle}>9.5 Your Cookie Choices</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Browser Controls:</Text>
          </Text>
          <Text style={styles.paragraph}>
            You can manage localStorage and cookies through your browser settings.
          </Text>

          <Text style={styles.warningBox}>
            <Text style={styles.bold}>⚠️ WARNING:</Text> Clearing localStorage will:{'\n'}
            • Delete your consent records (you'll need to re-accept Terms/Privacy){'\n'}
            • Delete your age verification (you'll need to verify age again){'\n'}
            • May break website functionality{'\n'}
            • Prevent account login from working
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Incognito / Private Browsing Mode:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Generates a separate device fingerprint</Text>
          <Text style={styles.bulletPoint}>• You must re-accept Terms/Privacy/Age in incognito mode</Text>
          <Text style={styles.bulletPoint}>• Data is cleared when you close the incognito/private window</Text>

          <Text style={styles.subsectionTitle}>9.6 Do Not Track (DNT)</Text>
          <Text style={styles.paragraph}>
            We do <Text style={styles.bold}>NOT</Text> currently respond to Do Not Track (DNT) browser signals.
          </Text>
          <Text style={styles.paragraph}>
            However, we don't track you across websites anyway.
          </Text>

          <Text style={styles.subsectionTitle}>9.7 Cookie Policy</Text>
          <Text style={styles.paragraph}>
            For complete details on our use of cookies and similar technologies, see our{' '}
            {navigation ? (
              <Text style={styles.link} onPress={handleCookiePolicyPress}>
                Cookie Policy
              </Text>
            ) : (
              <Text style={styles.linkText}>Cookie Policy</Text>
            )}
            .
          </Text>

          <Text style={styles.sectionTitle}>10. Changes to This Privacy Notice</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Notice from time to time.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>How we'll notify you of changes:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Update the "Last Updated" date</Text>
          <Text style={styles.bulletPoint}>• In-app notification for material changes</Text>
          <Text style={styles.bulletPoint}>• Email (if you have an account)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Continued use after changes = acceptance of updated notice.</Text>
          </Text>

          <Text style={styles.paragraph}>
            If you don't agree: Stop using the app and request data deletion.
          </Text>

          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            For questions, concerns, or requests regarding this Privacy Notice:
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Privacy Officer:</Text>{'\n'}
            {LEGAL_CONFIG.contact.address}{'\n'}
            Email: {LEGAL_CONFIG.contact.privacy}
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>General Support:</Text>{'\n'}
            Email: {LEGAL_CONFIG.contact.support}
          </Text>

          <Text style={styles.paragraph}>
            We typically respond within 30 days.
          </Text>

          <Text style={styles.disclaimer}>
            <Text style={styles.bold}>Legal Notice</Text>{'\n\n'}
            This Privacy Notice constitutes a legally binding agreement between you and Aperae regarding 
            how we collect, use, and protect your personal information.{'\n\n'}
            This policy is designed to comply with CCPA and other applicable US privacy laws.{'\n\n'}
            <Text style={styles.bold}>BY USING THE SERVICE, YOU CONSENT TO DATA COLLECTION AND PROCESSING 
            AS DESCRIBED IN THIS PRIVACY NOTICE.</Text>{'\n\n'}
            If you do not consent, do not use the service.
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
            I have read and agree to the Privacy Notice
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
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5B2433',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
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
  importantNotice: {
    fontSize: 15,
    color: '#5B2433', // Dark tone text
    lineHeight: 22,
    backgroundColor: 'rgba(255, 243, 205, 0.8)', // Yellow warning background (slightly transparent)
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC107', // Yellow border
    fontWeight: '500',
  },
  warningBox: {
    fontSize: 15,
    color: '#5B2433', // Dark tone text
    lineHeight: 22,
    backgroundColor: 'rgba(255, 193, 7, 0.15)', // Light yellow/orange background
    padding: 16,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FF9800', // Orange border for warnings
    fontWeight: '500',
  },
  table: {
    borderWidth: 1,
    borderColor: '#BF9694', // Metallic accent border
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#5B2433', // Dark tone background
    borderBottomWidth: 2,
    borderBottomColor: '#BF9694', // Metallic accent
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191, 150, 148, 0.3)', // Light metallic accent
  },
  tableCell: {
    fontSize: 14,
    color: '#5B2433', // Dark tone text
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(191, 150, 148, 0.3)', // Light metallic accent
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
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
function PrivacyPolicyScreenWithNavigation(props: Omit<PrivacyPolicyScreenProps, 'onAccept' | 'onBack'>) {
  // useNavigation hook is safe to call here since we're always inside NavigationContainer
  const navigation = useNavigation();
  return <PrivacyPolicyContent navigation={navigation} onCookiePolicyPress={props.onCookiePolicyPress} />;
}

// Main export - handles both gate screen and navigation contexts
export default function PrivacyPolicyScreen(props: PrivacyPolicyScreenProps) {
  // If onAccept is provided, we're in gate screen context (no NavigationContainer)
  // In that case, don't use navigation hook at all
  if (props.onAccept) {
    return <PrivacyPolicyContent onAccept={props.onAccept} onBack={props.onBack} onCookiePolicyPress={props.onCookiePolicyPress} />;
  }
  
  // Otherwise, we're inside NavigationContainer - use navigation hook
  // This component will be rendered from the navigation stack, so hook is safe
  return <PrivacyPolicyScreenWithNavigation onCookiePolicyPress={props.onCookiePolicyPress} />;
}
