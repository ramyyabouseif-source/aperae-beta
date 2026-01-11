import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LEGAL_CONFIG } from '../config/legal';

interface CookiePolicyScreenProps {
  navigation?: any; // Optional navigation prop for when used in NavigationContainer
}

// Inner component that doesn't use navigation hook
function CookiePolicyContent({ navigation }: CookiePolicyScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const handlePrivacyPolicyPress = () => {
    if (navigation) {
      // @ts-ignore - navigation type issue
      navigation.navigate('PrivacyPolicy');
    }
  };

  const handleTermsPress = () => {
    if (navigation) {
      // @ts-ignore - navigation type issue
      navigation.navigate('Terms');
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
        <Text style={styles.title}>Cookie Policy</Text>
        <Text style={styles.subtitle}>Information about our use of cookies</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Aperae Cookie Policy</Text>
          <Text style={styles.effectiveDate}>Last Updated: {LEGAL_CONFIG.cookiePolicyLastUpdated || LEGAL_CONFIG.privacyLastUpdated}</Text>
          <Text style={styles.effectiveDate}>Effective Date: {LEGAL_CONFIG.cookiePolicyEffectiveDate || LEGAL_CONFIG.privacyLastUpdated}</Text>
          
          <Text style={styles.introText}>
            This Cookie Policy explains how Aperae uses cookies and similar tracking technologies 
            when you visit our website.
          </Text>

          <Text style={styles.sectionTitle}>1. What Are Cookies?</Text>
          <Text style={styles.paragraph}>
            Cookies are small text files stored on your device (computer, phone, tablet) when you 
            visit a website. They help websites remember your preferences and improve functionality.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Similar technologies</Text> include browser localStorage, 
            sessionStorage, and other browser storage mechanisms that serve similar purposes.
          </Text>

          <Text style={styles.sectionTitle}>2. How Aperae Uses Cookies & Similar Technologies</Text>

          <Text style={styles.subsectionTitle}>2.1 Essential Technologies (Always Active)</Text>
          <Text style={styles.paragraph}>
            These are necessary for the website to function and cannot be disabled without breaking 
            core functionality:
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.5 }]}>Technology</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Purpose</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1 }]}>Duration</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Device Fingerprint (localStorage)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Identify your browser for consent tracking, age verification</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Until you clear browser data</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Consent Records (localStorage)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Remember your acceptance of Terms & Privacy Notice</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Until you clear browser data</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Age Verification (localStorage)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Remember your 21+ age attestation</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Until you clear browser data</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Session Cookie (if accounts exist)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Maintain login session for account users</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Session (until browser closes)</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>2.2 What Data Is Stored</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Device Fingerprint:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Hash (SHA-256) of: browser User-Agent + Accept-Language header</Text>
          <Text style={styles.bulletPoint}>• Cannot directly identify you personally</Text>
          <Text style={styles.bulletPoint}>• Tied to your specific browser (not you as a person)</Text>
          <Text style={styles.bulletPoint}>• Changes if you update browser or change language settings</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Consent Records:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Timestamp of when you accepted Terms & Privacy Notice</Text>
          <Text style={styles.bulletPoint}>• Version numbers you accepted</Text>
          <Text style={styles.bulletPoint}>• Your 21+ age attestation (NOT your actual birthdate)</Text>

          <Text style={styles.subsectionTitle}>2.3 Analytics Cookies (Currently NOT Used)</Text>
          <Text style={styles.importantNotice}>
            <Text style={styles.bold}>WE DO NOT CURRENTLY USE ANALYTICS COOKIES.</Text>
          </Text>
          <Text style={styles.paragraph}>
            We do not use:
          </Text>
          <Text style={styles.bulletPoint}>• Google Analytics</Text>
          <Text style={styles.bulletPoint}>• Facebook Pixel</Text>
          <Text style={styles.bulletPoint}>• Any other analytics or tracking services</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>If we add analytics in the future, we will:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Update this Cookie Policy</Text>
          <Text style={styles.bulletPoint}>• Request your consent before setting analytics cookies</Text>
          <Text style={styles.bulletPoint}>• Provide opt-out mechanism</Text>
          <Text style={styles.bulletPoint}>• Notify you via website banner or email (account users)</Text>

          <Text style={styles.subsectionTitle}>2.4 Advertising Cookies (NOT Used)</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We do NOT use advertising or targeting cookies.</Text>
          </Text>
          <Text style={styles.paragraph}>
            We do not:
          </Text>
          <Text style={styles.bulletPoint}>• Show advertisements</Text>
          <Text style={styles.bulletPoint}>• Track you for advertising purposes</Text>
          <Text style={styles.bulletPoint}>• Share data with advertising networks</Text>
          <Text style={styles.bulletPoint}>• Use cookies for behavioral targeting</Text>

          <Text style={styles.subsectionTitle}>2.5 Third-Party Services (Server-Side Only)</Text>
          <Text style={styles.paragraph}>
            We use these third-party services, but they are called <Text style={styles.bold}>server-side</Text> and 
            do <Text style={styles.bold}>NOT set cookies in your browser</Text>:
          </Text>

          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Anthropic Claude API:</Text> Processes wine recommendations (no browser cookies)
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Google Cloud Vision API:</Text> Processes image OCR (no browser cookies)
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Neon PostgreSQL:</Text> Database hosting (no browser cookies)
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Render:</Text> Server hosting (no browser cookies)
          </Text>

          <Text style={styles.paragraph}>
            These services have their own privacy policies:
          </Text>
          <Text style={styles.bulletPoint}>• Anthropic: https://www.anthropic.com/legal/privacy</Text>
          <Text style={styles.bulletPoint}>• Google Cloud: https://cloud.google.com/terms</Text>
          <Text style={styles.bulletPoint}>• Neon: https://neon.tech/privacy-policy</Text>
          <Text style={styles.bulletPoint}>• Render: https://render.com/privacy</Text>

          <Text style={styles.sectionTitle}>3. Your Cookie Choices</Text>

          <Text style={styles.subsectionTitle}>3.1 Browser Controls</Text>
          <Text style={styles.paragraph}>
            You can control cookies and localStorage through your browser settings:
          </Text>

          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Google Chrome:</Text> Settings → Privacy and Security → Cookies and other site data
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Mozilla Firefox:</Text> Settings → Privacy & Security → Cookies and Site Data
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Safari:</Text> Preferences → Privacy → Cookies and website data
          </Text>
          <Text style={styles.bulletPoint}>
            • <Text style={styles.bold}>Microsoft Edge:</Text> Settings → Privacy, search, and services → Cookies
          </Text>

          <Text style={styles.subsectionTitle}>3.2 What Happens If You Block Cookies/localStorage</Text>
          <Text style={styles.warningBox}>
            <Text style={styles.bold}>⚠️ WARNING:</Text> Disabling essential cookies and localStorage will prevent 
            the website from functioning properly.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>If you block or delete cookies/localStorage:</Text>
          </Text>
          <Text style={styles.bulletPoint}>❌ Website may not function at all</Text>
          <Text style={styles.bulletPoint}>❌ We cannot remember your consent to Terms/Privacy Policy</Text>
          <Text style={styles.bulletPoint}>❌ You will be asked to verify age repeatedly (every visit)</Text>
          <Text style={styles.bulletPoint}>❌ Account login will not work (if applicable)</Text>
          <Text style={styles.bulletPoint}>❌ Your preferences will not be saved</Text>

          <Text style={styles.subsectionTitle}>3.3 Incognito / Private Browsing Mode</Text>
          <Text style={styles.paragraph}>
            If you use incognito or private browsing mode:
          </Text>
          <Text style={styles.bulletPoint}>• A different device fingerprint is generated (separate from your normal browsing)</Text>
          <Text style={styles.bulletPoint}>• You must re-accept Terms, Privacy Notice, and age verification in private mode</Text>
          <Text style={styles.bulletPoint}>• Data is cleared when you close the incognito/private window</Text>
          <Text style={styles.bulletPoint}>• Each incognito session may generate a new fingerprint</Text>

          <Text style={styles.subsectionTitle}>3.4 Do Not Track (DNT)</Text>
          <Text style={styles.paragraph}>
            We do <Text style={styles.bold}>NOT</Text> currently respond to Do Not Track (DNT) browser signals.
          </Text>
          <Text style={styles.paragraph}>
            However, we don't track you anyway:
          </Text>
          <Text style={styles.bulletPoint}>• No analytics cookies</Text>
          <Text style={styles.bulletPoint}>• No advertising cookies</Text>
          <Text style={styles.bulletPoint}>• No cross-site tracking</Text>
          <Text style={styles.bulletPoint}>• Essential cookies only (for functionality)</Text>

          <Text style={styles.sectionTitle}>4. How Long We Keep Cookie Data</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 1.5 }]}>Data Type</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Retention in Browser</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}>Retention in Database</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Device Fingerprint</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Until you clear browser data</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Indefinitely (until deletion request)</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Consent Records</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Until you clear browser data</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Indefinitely (legal compliance)</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Session Cookie</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>Session (until browser closes)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>N/A (session-only)</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>5. Cookie Security</Text>
          <Text style={styles.paragraph}>
            We implement security measures to protect cookie data:
          </Text>
          <Text style={styles.bulletPoint}>• Device fingerprints are hashed (SHA-256) before storage</Text>
          <Text style={styles.bulletPoint}>• No sensitive personal information stored in cookies/localStorage</Text>
          <Text style={styles.bulletPoint}>• Session cookies use secure flags (HTTPS only)</Text>
          <Text style={styles.bulletPoint}>• HttpOnly flags prevent JavaScript access to sensitive cookies</Text>

          <Text style={styles.sectionTitle}>6. International Users</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>This website is available ONLY to users in the United States.</Text>
          </Text>
          <Text style={styles.paragraph}>
            We block access from the European Union (EU) and European Economic Area (EEA) via geo-blocking.
          </Text>
          <Text style={styles.paragraph}>
            If you bypass our geo-blocking (e.g., using a VPN):
          </Text>
          <Text style={styles.bulletPoint}>• You violate our Terms of Service</Text>
          <Text style={styles.bulletPoint}>• Your access will be terminated if discovered</Text>
          <Text style={styles.bulletPoint}>• GDPR/ePrivacy Directive may apply to you</Text>

          <Text style={styles.sectionTitle}>7. Changes to This Cookie Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Cookie Policy from time to time to reflect:
          </Text>
          <Text style={styles.bulletPoint}>• Changes in how we use cookies</Text>
          <Text style={styles.bulletPoint}>• New cookies or technologies we add</Text>
          <Text style={styles.bulletPoint}>• Legal or regulatory requirements</Text>
          <Text style={styles.bulletPoint}>• User feedback or privacy concerns</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>How we'll notify you of changes:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Update the "Last Updated" date at the top of this policy</Text>
          <Text style={styles.bulletPoint}>• Display a banner notification on the website</Text>
          <Text style={styles.bulletPoint}>• Email notification (if you have an account)</Text>

          <Text style={styles.paragraph}>
            Check the "Last Updated" date regularly to stay informed about our cookie practices.
          </Text>

          <Text style={styles.sectionTitle}>8. Contact Us</Text>
          <Text style={styles.paragraph}>
            Questions about cookies or this Cookie Policy?
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Privacy Contact:</Text>{'\n'}
            {LEGAL_CONFIG.contact.address}{'\n'}
            Email: {LEGAL_CONFIG.contact.privacy}
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>General Support:</Text>{'\n'}
            Email: {LEGAL_CONFIG.contact.support}
          </Text>

          <Text style={styles.sectionTitle}>9. Related Policies</Text>
          <Text style={styles.paragraph}>
            For more information about how we handle your data:
          </Text>
          <Text style={styles.bulletPoint}>
            • Privacy Notice:{' '}
            <Text style={styles.link} onPress={handlePrivacyPolicyPress}>
              View Privacy Notice
            </Text>
          </Text>
          <Text style={styles.bulletPoint}>
            • Terms of Use:{' '}
            <Text style={styles.link} onPress={handleTermsPress}>
              View Terms of Use
            </Text>
          </Text>

          <Text style={styles.disclaimer}>
            <Text style={styles.bold}>Legal Notice</Text>{'\n'}
            This Cookie Policy is part of our Privacy Notice and Terms of Use. By continuing to 
            use this website, you consent to our use of essential cookies as described above.{'\n\n'}
            If you do not consent to our use of cookies, please do not use this website.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>
            {navigation ? 'Back' : 'Done'}
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
  backButton: {
    backgroundColor: '#5B2433', // Dark tone background
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#BF9694', // Metallic accent
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

// Wrapper component - handles navigation hook properly
// This component is used when screen is inside NavigationContainer (from navigation stack)
function CookiePolicyScreenWithNavigation(props: Omit<CookiePolicyScreenProps, 'navigation'>) {
  // useNavigation hook is safe to call here since we're always inside NavigationContainer
  const navigation = useNavigation();
  return <CookiePolicyContent navigation={navigation} />;
}

// Main export - handles both navigation contexts
export default function CookiePolicyScreen(props: CookiePolicyScreenProps) {
  // If navigation is provided as prop, use it directly
  if (props.navigation) {
    return <CookiePolicyContent {...props} />;
  }
  
  // Otherwise, we're inside NavigationContainer - use navigation hook
  // This component will be rendered from the navigation stack, so hook is safe
  return <CookiePolicyScreenWithNavigation />;
}

