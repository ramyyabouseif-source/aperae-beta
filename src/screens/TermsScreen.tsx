import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LEGAL_CONFIG } from '../config/legal';

interface TermsScreenProps {
  onAccept?: () => void;
  onPrivacyPolicyPress?: () => void;
  onCookiePolicyPress?: () => void;
  navigation?: any; // Optional navigation prop for when used in NavigationContainer
}

// Inner component that doesn't use navigation hook
function TermsScreenContent({ onAccept, onPrivacyPolicyPress, onCookiePolicyPress, navigation }: TermsScreenProps) {
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
      // Call the handler - parent component handles state
      try {
        onAccept();
      } catch (error) {
        console.error('Error accepting terms:', error);
        // Error is handled in parent component
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

  const handleCookiePolicyPress = () => {
    if (onCookiePolicyPress) {
      onCookiePolicyPress();
    } else if (navigation) {
      // If no callback but navigation is available, navigate to Cookie Policy
      // @ts-ignore - navigation type issue
      navigation.navigate('CookiePolicy');
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
        <Text style={styles.title}>Terms of Use</Text>
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
          <Text style={styles.sectionTitle}>Aperae Terms of Use</Text>
          <Text style={styles.effectiveDate}>Effective Date: {LEGAL_CONFIG.termsEffectiveDate}</Text>
          <Text style={styles.effectiveDate}>Version: 1.0</Text>
          
          <Text style={styles.importantNotice}>
            <Text style={styles.bold}>IMPORTANT: READ BEFORE USING</Text>{'\n\n'}
            Aperae is a personal, non-commercial project created for educational and informational 
            purposes. By using this app, you agree to these Terms of Use.{'\n\n'}
            <Text style={styles.bold}>Key Points:</Text>{'\n'}
            • Age Requirement: You must be 21+ (or legal drinking age in your area){'\n'}
            • Entertainment Only: AI recommendations are not professional advice and may contain errors{'\n'}
            • Free Service: No charges, no monetization, no warranties{'\n'}
            • Use at Your Own Risk: This is a hobby project, not a commercial service{'\n'}
            • No Guarantees: Service may be discontinued at any time{'\n\n'}
            If you don't agree to these Terms, don't use the app.
          </Text>

          <Text style={styles.sectionTitle}>1. About Aperae</Text>

          <Text style={styles.subsectionTitle}>(a) Non-Commercial Personal Project</Text>
          <Text style={styles.paragraph}>
            Aperae is a <Text style={styles.bold}>personal, non-commercial project</Text> operated as a 
            hobby/educational endeavor:
          </Text>
          <Text style={styles.bulletPoint}>• NOT incorporated as a business</Text>
          <Text style={styles.bulletPoint}>• NO commercial purpose or revenue</Text>
          <Text style={styles.bulletPoint}>• Provided free of charge with no expectation of payment</Text>
          <Text style={styles.bulletPoint}>• No warranties or guarantees of any kind</Text>

          <Text style={styles.subsectionTitle}>(b) Educational Purpose</Text>
          <Text style={styles.paragraph}>This app demonstrates:</Text>
          <Text style={styles.bulletPoint}>• AI-powered wine recommendations (using Anthropic Claude)</Text>
          <Text style={styles.bulletPoint}>• Optical character recognition (using Google Cloud Vision)</Text>
          <Text style={styles.bulletPoint}>• Food and wine pairing principles</Text>
          <Text style={styles.bulletPoint}>• Web application development techniques</Text>

          <Text style={styles.subsectionTitle}>(c) No Professional Service</Text>
          <Text style={styles.paragraph}>Aperae is <Text style={styles.bold}>NOT:</Text></Text>
          <Text style={styles.bulletPoint}>• A professional wine consultancy</Text>
          <Text style={styles.bulletPoint}>• A licensed alcohol seller or distributor</Text>
          <Text style={styles.bulletPoint}>• A medical or dietary advisory service</Text>
          <Text style={styles.bulletPoint}>• A commercial product with customer support obligations</Text>

          <Text style={styles.sectionTitle}>2. Acceptance of Terms</Text>

          <Text style={styles.subsectionTitle}>(a) By Using Aperae, You Agree To:</Text>
          <Text style={styles.bulletPoint}>• These Terms of Use</Text>
          <Text style={styles.bulletPoint}>• Our Privacy Notice</Text>
          <Text style={styles.bulletPoint}>• The risks and limitations described below</Text>
          <Text style={styles.bulletPoint}>• Third-party terms (Anthropic, Google Cloud Vision)</Text>

          <Text style={styles.subsectionTitle}>(b) Device-Based Consent Tracking</Text>
          <Text style={styles.paragraph}>
            Your acceptance is recorded with a unique device identifier:
          </Text>
          <Text style={styles.bulletPoint}>• Timestamp of acceptance</Text>
          <Text style={styles.bulletPoint}>• Version of Terms you accepted</Text>
          <Text style={styles.bulletPoint}>• Age attestation (21+ confirmation)</Text>
          <Text style={styles.bulletPoint}>• Linked to your device/browser (not personally identifiable)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>If you reinstall the app or use a different browser/device:</Text> You'll 
            be asked to accept Terms again on that device.
          </Text>

          <Text style={styles.subsectionTitle}>(c) Agreement is Binding</Text>
          <Text style={styles.paragraph}>
            Even though Aperae is non-commercial, these Terms create a binding agreement between you 
            and the creator of Aperae.
          </Text>

          <Text style={styles.sectionTitle}>3. Age Requirements</Text>

          <Text style={styles.subsectionTitle}>(a) You Must Be 21 or Older</Text>
          <Text style={styles.paragraph}>
            This app is intended <Text style={styles.bold}>solely for individuals who are:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• 21 years of age or older (in the United States)</Text>
          <Text style={styles.bulletPoint}>• OR the legal drinking age in your jurisdiction (whichever is higher)</Text>

          <Text style={styles.subsectionTitle}>(b) Self-Attestation Only</Text>
          <Text style={styles.paragraph}>
            We verify age through <Text style={styles.bold}>self-attestation</Text> (checkbox):
          </Text>
          <Text style={styles.bulletPoint}>• No ID checks</Text>
          <Text style={styles.bulletPoint}>• No identity verification</Text>
          <Text style={styles.bulletPoint}>• Honor system only</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>By clicking "I am 21 or older," you confirm that you meet the age requirement.</Text>
          </Text>

          <Text style={styles.subsectionTitle}>(c) If You're Under 21</Text>
          <Text style={styles.paragraph}>If you are under the legal drinking age:</Text>
          <Text style={styles.bulletPoint}>• STOP using the app immediately</Text>
          <Text style={styles.bulletPoint}>• You are prohibited from accessing wine-related content</Text>
          <Text style={styles.bulletPoint}>• Providing false age information violates these Terms</Text>

          <Text style={styles.subsectionTitle}>(d) Parental Responsibility</Text>
          <Text style={styles.paragraph}>Parents/guardians are responsible for:</Text>
          <Text style={styles.bulletPoint}>• Monitoring minors' internet usage</Text>
          <Text style={styles.bulletPoint}>• Preventing access to age-restricted apps</Text>
          <Text style={styles.bulletPoint}>• Ensuring household devices don't allow minor access</Text>

          <Text style={styles.subsectionTitle}>(e) What Happens If We Discover Minor Use</Text>
          <Text style={styles.paragraph}>If we learn someone under 21 has used the app:</Text>
          <Text style={styles.bulletPoint}>• Terminate access from that device</Text>
          <Text style={styles.bulletPoint}>• Delete all associated data</Text>
          <Text style={styles.bulletPoint}>• Report to parents/guardians if possible</Text>

          <Text style={styles.sectionTitle}>4. Responsible Alcohol Use</Text>

          <Text style={styles.subsectionTitle}>(a) Drink Responsibly</Text>
          <Text style={styles.paragraph}>
            Aperae provides wine recommendations for legal-age adults. <Text style={styles.bold}>You agree to:</Text>
          </Text>
          <Text style={styles.bulletPoint}>✓ Consume alcohol responsibly and in moderation</Text>
          <Text style={styles.bulletPoint}>✓ <Text style={styles.bold}>NEVER drink and drive</Text></Text>
          <Text style={styles.bulletPoint}>✓ Follow all alcohol laws in your jurisdiction</Text>
          <Text style={styles.bulletPoint}>✓ Not use the app if pregnant or have health conditions affected by alcohol</Text>
          <Text style={styles.bulletPoint}>✓ Recognize signs of alcohol problems and seek help if needed</Text>

          <Text style={styles.subsectionTitle}>(b) Resources for Alcohol Concerns</Text>
          <Text style={styles.paragraph}>If you or someone you know has concerns about alcohol use:</Text>
          <Text style={styles.bulletPoint}>• SAMHSA National Helpline: 1-800-662-4357 (free, confidential, 24/7)</Text>
          <Text style={styles.bulletPoint}>• Alcoholics Anonymous: aa.org</Text>
          <Text style={styles.bulletPoint}>• National Council on Alcoholism: ncadd.org</Text>

          <Text style={styles.subsectionTitle}>(c) We Are Not Responsible for Alcohol-Related Harm</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>YOU ASSUME ALL RISKS</Text> associated with alcohol consumption.
          </Text>
          <Text style={styles.paragraph}>We are NOT liable for:</Text>
          <Text style={styles.bulletPoint}>• Impaired judgment or decision-making from alcohol</Text>
          <Text style={styles.bulletPoint}>• DUI, accidents, injuries, or death related to alcohol use</Text>
          <Text style={styles.bulletPoint}>• Health complications from alcohol consumption</Text>
          <Text style={styles.bulletPoint}>• Alcohol dependence or addiction</Text>
          <Text style={styles.bulletPoint}>• Violations of alcohol laws</Text>

          <Text style={styles.sectionTitle}>5. AI Recommendations - Critical Disclaimers</Text>

          <Text style={styles.subsectionTitle}>(a) AI-Generated Content</Text>
          <Text style={styles.paragraph}>
            Wine recommendations are generated by <Text style={styles.bold}>Anthropic Claude</Text>, a 
            large language model (AI).
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Important facts about AI recommendations:</Text>
          </Text>
          <Text style={styles.bulletPoint}>
            ⚠️ <Text style={styles.bold}>Approximately 10% of recommended wines may not exist, may have 
            incorrect details (vintage, producer, region), or may no longer be available</Text>
          </Text>
          <Text style={styles.bulletPoint}>⚠️ AI can "hallucinate" - invent wine names, producers, or details that sound real but aren't</Text>
          <Text style={styles.bulletPoint}>⚠️ Recommendations are not verified before being shown to you</Text>
          <Text style={styles.bulletPoint}>⚠️ Pairing suggestions may not match your personal taste</Text>

          <Text style={styles.subsectionTitle}>(b) Not Professional Advice</Text>
          <Text style={styles.paragraph}>AI recommendations are <Text style={styles.bold}>NOT:</Text></Text>
          <Text style={styles.bulletPoint}>✗ Professional sommelier or wine expert advice</Text>
          <Text style={styles.bulletPoint}>✗ Medical, health, or dietary advice</Text>
          <Text style={styles.bulletPoint}>✗ Guaranteed to be accurate, suitable, or enjoyable</Text>
          <Text style={styles.bulletPoint}>✗ A substitute for consulting a real wine professional</Text>

          <Text style={styles.subsectionTitle}>(c) Entertainment & Educational Purposes Only</Text>
          <Text style={styles.paragraph}>Treat recommendations as:</Text>
          <Text style={styles.bulletPoint}>✓ Suggestions for exploration</Text>
          <Text style={styles.bulletPoint}>✓ Starting points for your own research</Text>
          <Text style={styles.bulletPoint}>✓ Educational information about wine pairing principles</Text>
          <Text style={styles.bulletPoint}>✓ NOT definitive wine selections</Text>

          <Text style={styles.subsectionTitle}>(d) YOU Must Verify Before Purchasing</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Before buying any wine based on our recommendations:</Text>
          </Text>
          <Text style={styles.bulletPoint}>1. Verify the wine actually exists</Text>
          <Text style={styles.bulletPoint}>2. Check vintage, producer, and region details</Text>
          <Text style={styles.bulletPoint}>3. Confirm pricing and availability with retailers</Text>
          <Text style={styles.bulletPoint}>4. Research reviews from wine experts</Text>
          <Text style={styles.bulletPoint}>5. Consider your own taste preferences</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We are NOT responsible for:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Disappointment with wines you purchase</Text>
          <Text style={styles.bulletPoint}>• Money wasted on wines you don't like</Text>
          <Text style={styles.bulletPoint}>• Wines that don't exist or have wrong information</Text>
          <Text style={styles.bulletPoint}>• Availability issues or pricing surprises</Text>

          <Text style={styles.sectionTitle}>6. OCR Text Extraction - Limitations</Text>

          <Text style={styles.subsectionTitle}>(a) Google Cloud Vision API</Text>
          <Text style={styles.paragraph}>
            We use <Text style={styles.bold}>Google Cloud Vision</Text> to extract text from your uploaded 
            menu/wine label photos.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>OCR Limitations:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• May misread or misinterpret text</Text>
          <Text style={styles.bulletPoint}>• Struggles with handwritten or stylized fonts</Text>
          <Text style={styles.bulletPoint}>• May extract incomplete or garbled text from low-quality images</Text>
          <Text style={styles.bulletPoint}>• Can miss important details (allergens, vintages, preparation methods)</Text>

          <Text style={styles.subsectionTitle}>(b) Your Responsibility</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>YOU are responsible for:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Verifying that extracted text is accurate</Text>
          <Text style={styles.bulletPoint}>• Understanding that poor image quality = poor recommendations</Text>
          <Text style={styles.bulletPoint}>• Not relying solely on OCR output for important decisions</Text>

          <Text style={styles.subsectionTitle}>(c) Image Processing</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>What happens to your uploaded images:</Text>
          </Text>
          <Text style={styles.bulletPoint}>1. Received by our server (in memory only)</Text>
          <Text style={styles.bulletPoint}>2. Sent to Google Cloud Vision for OCR</Text>
          <Text style={styles.bulletPoint}>3. Sent to Anthropic Claude for recommendations</Text>
          <Text style={styles.bulletPoint}>4. <Text style={styles.bold}>Deleted within seconds</Text> (never saved to disk)</Text>

          <Text style={styles.paragraph}>
            See our Privacy Notice for full details.
          </Text>

          <Text style={styles.sectionTitle}>7. No Warranties - "AS-IS" Service</Text>

          <Text style={styles.subsectionTitle}>(a) Provided "AS-IS"</Text>
          <Text style={styles.paragraph}>
            Aperae is provided <Text style={styles.bold}>"AS-IS"</Text> and <Text style={styles.bold}>"AS-AVAILABLE"</Text> with 
            <Text style={styles.bold}> NO WARRANTIES</Text> of any kind.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>This means:</Text>
          </Text>
          <Text style={styles.bulletPoint}>✗ No guarantee of accuracy</Text>
          <Text style={styles.bulletPoint}>✗ No guarantee of availability (service may go down)</Text>
          <Text style={styles.bulletPoint}>✗ No guarantee of fitness for any purpose</Text>
          <Text style={styles.bulletPoint}>✗ No guarantee that bugs will be fixed</Text>
          <Text style={styles.bulletPoint}>✗ No guarantee of continued operation</Text>

          <Text style={styles.subsectionTitle}>(b) No Implied Warranties</Text>
          <Text style={styles.paragraph}>We <Text style={styles.bold}>specifically disclaim:</Text></Text>
          <Text style={styles.bulletPoint}>• Implied warranty of merchantability</Text>
          <Text style={styles.bulletPoint}>• Implied warranty of fitness for a particular purpose</Text>
          <Text style={styles.bulletPoint}>• Implied warranty of non-infringement</Text>
          <Text style={styles.bulletPoint}>• Any warranties arising from course of dealing or usage of trade</Text>

          <Text style={styles.subsectionTitle}>(c) Third-Party Dependencies</Text>
          <Text style={styles.paragraph}>The service relies on:</Text>
          <Text style={styles.bulletPoint}>• Anthropic Claude API (wine recommendations)</Text>
          <Text style={styles.bulletPoint}>• Google Cloud Vision API (OCR text extraction)</Text>
          <Text style={styles.bulletPoint}>• Neon PostgreSQL (database hosting)</Text>
          <Text style={styles.bulletPoint}>• Render (server hosting)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We do NOT control these services and are NOT responsible for:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Their availability or uptime</Text>
          <Text style={styles.bulletPoint}>• Their accuracy or performance</Text>
          <Text style={styles.bulletPoint}>• Their security or data practices</Text>
          <Text style={styles.bulletPoint}>• Outages or service disruptions</Text>

          <Text style={styles.subsectionTitle}>(d) Service May Be Discontinued</Text>
          <Text style={styles.paragraph}>As a personal project:</Text>
          <Text style={styles.bulletPoint}>• Service may be discontinued at any time</Text>
          <Text style={styles.bulletPoint}>• No advance notice required</Text>
          <Text style={styles.bulletPoint}>• No obligation to maintain or support</Text>
          <Text style={styles.bulletPoint}>• No refunds (service is free anyway)</Text>

          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>

          <Text style={styles.subsectionTitle}>(a) Maximum Liability: $0</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</Text>
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>The creator of Aperae's total liability to you for ANY claims is ZERO DOLLARS ($0).</Text>
          </Text>

          <Text style={styles.paragraph}>Why? Because:</Text>
          <Text style={styles.bulletPoint}>• The service is completely free</Text>
          <Text style={styles.bulletPoint}>• You have paid nothing</Text>
          <Text style={styles.bulletPoint}>• This is a non-commercial hobby project</Text>
          <Text style={styles.bulletPoint}>• There are no commercial damages</Text>

          <Text style={styles.subsectionTitle}>(b) No Liability For ANY Damages</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>We are NOT liable for:</Text>
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>AI & Technology Failures:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Incorrect wine recommendations or "hallucinations"</Text>
          <Text style={styles.bulletPoint}>• Wines that don't exist or have wrong information</Text>
          <Text style={styles.bulletPoint}>• OCR errors or misread text</Text>
          <Text style={styles.bulletPoint}>• Service outages or downtime</Text>
          <Text style={styles.bulletPoint}>• Third-party API failures (Google, Anthropic)</Text>
          <Text style={styles.bulletPoint}>• Data loss or corruption</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Alcohol-Related Harm:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• ANY harm from alcohol consumption</Text>
          <Text style={styles.bulletPoint}>• Impaired judgment or decision-making</Text>
          <Text style={styles.bulletPoint}>• DUI, accidents, injuries, or death</Text>
          <Text style={styles.bulletPoint}>• Health complications</Text>
          <Text style={styles.bulletPoint}>• Alcohol dependence or addiction</Text>
          <Text style={styles.bulletPoint}>• Violations of alcohol laws</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Wine Purchases:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Disappointment with wine purchases</Text>
          <Text style={styles.bulletPoint}>• Money spent on wines you don't like</Text>
          <Text style={styles.bulletPoint}>• Unavailable wines or pricing issues</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Data & Security:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Data breaches or unauthorized access</Text>
          <Text style={styles.bulletPoint}>• Privacy violations</Text>
          <Text style={styles.bulletPoint}>• Loss of your data</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>General:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Indirect, consequential, special, or punitive damages</Text>
          <Text style={styles.bulletPoint}>• Loss of profits, goodwill, or use</Text>
          <Text style={styles.bulletPoint}>• Any damages whatsoever</Text>

          <Text style={styles.subsectionTitle}>(c) YOU ASSUME ALL RISKS</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>By using Aperae, YOU assume:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• All risks of using AI-generated recommendations</Text>
          <Text style={styles.bulletPoint}>• All risks of purchasing wines</Text>
          <Text style={styles.bulletPoint}>• All risks of alcohol consumption</Text>
          <Text style={styles.bulletPoint}>• All risks of uploading images</Text>
          <Text style={styles.bulletPoint}>• All risks of using the service</Text>

          <Text style={styles.subsectionTitle}>(d) Some States Don't Allow These Limitations</Text>
          <Text style={styles.paragraph}>
            Some states don't allow limitation of liability for certain damages. If you live in such a 
            state, the above limitations apply <Text style={styles.bold}>to the maximum extent permitted by your 
            state's law</Text>.
          </Text>
          <Text style={styles.paragraph}>
            But understand: <Text style={styles.bold}>This is a free, personal project. There is no commercial 
            basis for liability.</Text>
          </Text>

          <Text style={styles.sectionTitle}>9. Your Responsibilities</Text>

          <Text style={styles.subsectionTitle}>(a) Lawful Use Only</Text>
          <Text style={styles.paragraph}>You agree to use Aperae only for lawful purposes:</Text>
          <Text style={styles.bulletPoint}>✓ Comply with all applicable laws</Text>
          <Text style={styles.bulletPoint}>✓ Respect intellectual property rights</Text>
          <Text style={styles.bulletPoint}>✓ Not misuse or abuse the service</Text>
          <Text style={styles.bulletPoint}>✓ Not attempt to hack or disrupt the service</Text>

          <Text style={styles.subsectionTitle}>(b) Image Uploads</Text>
          <Text style={styles.paragraph}>When uploading menu/wine label photos, you agree:</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>You represent and warrant:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• You own the image OR have permission to upload it</Text>
          <Text style={styles.bulletPoint}>• Image doesn't violate any copyright or trademark</Text>
          <Text style={styles.bulletPoint}>• Image doesn't contain others' personal information without consent</Text>
          <Text style={styles.bulletPoint}>• Image is not illegal, obscene, or harmful</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>You will NOT upload:</Text>
          </Text>
          <Text style={styles.bulletPoint}>✗ Images containing faces, IDs, credit cards, or personal info</Text>
          <Text style={styles.bulletPoint}>✗ Copyrighted images you don't have rights to use</Text>
          <Text style={styles.bulletPoint}>✗ Restaurant menus that prohibit photography</Text>
          <Text style={styles.bulletPoint}>✗ Illegal, obscene, or harmful content</Text>
          <Text style={styles.bulletPoint}>✗ Malware or malicious code</Text>

          <Text style={styles.subsectionTitle}>(c) No Commercial Use</Text>
          <Text style={styles.paragraph}>
            This is a <Text style={styles.bold}>personal, educational app</Text>. You may NOT:
          </Text>
          <Text style={styles.bulletPoint}>• Use it for commercial wine consulting</Text>
          <Text style={styles.bulletPoint}>• Resell or redistribute wine recommendations</Text>
          <Text style={styles.bulletPoint}>• Use it to train competing AI models</Text>
          <Text style={styles.bulletPoint}>• Reverse engineer or copy the app</Text>

          <Text style={styles.subsectionTitle}>(d) Account Security (if applicable)</Text>
          <Text style={styles.paragraph}>If you create an account:</Text>
          <Text style={styles.bulletPoint}>• Keep your password secure</Text>
          <Text style={styles.bulletPoint}>• Don't share your account</Text>
          <Text style={styles.bulletPoint}>• Notify us if your account is compromised</Text>

          <Text style={styles.sectionTitle}>10. Intellectual Property</Text>

          <Text style={styles.subsectionTitle}>(a) Aperae Owns the App</Text>
          <Text style={styles.paragraph}>
            All content, software, designs, and materials in Aperae are owned by the creator:
          </Text>
          <Text style={styles.bulletPoint}>• App design and code</Text>
          <Text style={styles.bulletPoint}>• "Aperae" name and logo</Text>
          <Text style={styles.bulletPoint}>• Proprietary wine database</Text>
          <Text style={styles.bulletPoint}>• AI prompts (trade secrets)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Protected by:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Copyright law</Text>
          <Text style={styles.bulletPoint}>• Trademark law (if registered)</Text>
          <Text style={styles.bulletPoint}>• Trade secret law</Text>

          <Text style={styles.subsectionTitle}>(b) Your License</Text>
          <Text style={styles.paragraph}>
            You have a <Text style={styles.bold}>limited, personal, non-commercial license</Text> to use the 
            app for your own entertainment and education.
          </Text>

          <Text style={styles.paragraph}>You may NOT:</Text>
          <Text style={styles.bulletPoint}>• Reproduce, copy, or distribute the app</Text>
          <Text style={styles.bulletPoint}>• Modify or create derivative works</Text>
          <Text style={styles.bulletPoint}>• Remove copyright/trademark notices</Text>
          <Text style={styles.bulletPoint}>• Use for commercial purposes</Text>

          <Text style={styles.subsectionTitle}>(c) Your Uploaded Images</Text>
          <Text style={styles.paragraph}>When you upload images:</Text>
          <Text style={styles.bulletPoint}>• <Text style={styles.bold}>You retain ownership</Text> of your images</Text>
          <Text style={styles.bulletPoint}>• You grant us a <Text style={styles.bold}>limited license</Text> to process them (OCR, AI recommendations)</Text>
          <Text style={styles.bulletPoint}>• This license <Text style={styles.bold}>terminates when images are deleted</Text> (within seconds)</Text>
          <Text style={styles.bulletPoint}>• We do NOT claim ownership of your images</Text>
          <Text style={styles.bulletPoint}>• We do NOT use your images for any other purpose</Text>

          <Text style={styles.subsectionTitle}>(d) AI-Generated Recommendations</Text>
          <Text style={styles.paragraph}>Wine recommendations generated by AI are considered:</Text>
          <Text style={styles.bulletPoint}>• Derivative works of the app</Text>
          <Text style={styles.bulletPoint}>• Not copyrightable (AI output ownership is unclear legally)</Text>
          <Text style={styles.bulletPoint}>• Provided to you for personal use only</Text>

          <Text style={styles.paragraph}>
            You may use recommendations personally but may not republish them commercially.
          </Text>

          <Text style={styles.sectionTitle}>11. DMCA & Copyright Complaints</Text>

          <Text style={styles.subsectionTitle}>(a) If You Believe Your Copyright Was Infringed</Text>
          <Text style={styles.paragraph}>
            If you believe uploaded content infringes your copyright, send a <Text style={styles.bold}>DMCA 
            takedown notice</Text> to:
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>DMCA Contact:</Text>{'\n'}
            {LEGAL_CONFIG.contact.legal}{'\n'}
            {LEGAL_CONFIG.contact.address}
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Your notice must include (17 U.S.C. § 512(c)(3)):</Text>
          </Text>
          <Text style={styles.bulletPoint}>1. Your signature (physical or electronic)</Text>
          <Text style={styles.bulletPoint}>2. Identification of copyrighted work</Text>
          <Text style={styles.bulletPoint}>3. Identification of infringing material and its location</Text>
          <Text style={styles.bulletPoint}>4. Your contact information</Text>
          <Text style={styles.bulletPoint}>5. Statement of good faith belief</Text>
          <Text style={styles.bulletPoint}>6. Statement of accuracy under penalty of perjury</Text>
          <Text style={styles.bulletPoint}>7. Statement that you're authorized to act for copyright owner</Text>

          <Text style={styles.subsectionTitle}>(b) Note on Image Retention</Text>
          <Text style={styles.paragraph}>
            Since we delete images <Text style={styles.bold}>within seconds</Text>, most DMCA claims will be 
            moot (images are already gone). However, extracted text may still be available.
          </Text>

          <Text style={styles.subsectionTitle}>(c) Repeat Infringers</Text>
          <Text style={styles.paragraph}>
            We may terminate access for users who repeatedly upload infringing content.
          </Text>

          <Text style={styles.sectionTitle}>12. Termination</Text>

          <Text style={styles.subsectionTitle}>(a) We Can Terminate Your Access</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your access <Text style={styles.bold}>at any time, for any reason or no reason</Text>, including:
          </Text>
          <Text style={styles.bulletPoint}>• Violation of these Terms</Text>
          <Text style={styles.bulletPoint}>• Misuse of the service</Text>
          <Text style={styles.bulletPoint}>• Use by someone under 21</Text>
          <Text style={styles.bulletPoint}>• Fraudulent or abusive activity</Text>
          <Text style={styles.bulletPoint}>• To protect our rights or others</Text>
          <Text style={styles.bulletPoint}>• For any reason or no reason at all</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>No notice required. No appeals process.</Text>
          </Text>

          <Text style={styles.subsectionTitle}>(b) Effect of Termination</Text>
          <Text style={styles.paragraph}>When access is terminated:</Text>
          <Text style={styles.bulletPoint}>• Your right to use the app immediately ends</Text>
          <Text style={styles.bulletPoint}>• We may delete data associated with your device</Text>
          <Text style={styles.bulletPoint}>• Sections 4-8 (disclaimers, liability limits) survive termination</Text>

          <Text style={styles.subsectionTitle}>(c) You Can Stop Using Anytime</Text>
          <Text style={styles.paragraph}>You can stop using Aperae at any time by:</Text>
          <Text style={styles.bulletPoint}>• Uninstalling the app</Text>
          <Text style={styles.bulletPoint}>• Ceasing to access the website</Text>
          <Text style={styles.bulletPoint}>• Requesting data deletion (see Privacy Notice)</Text>

          <Text style={styles.paragraph}>
            Your obligations under Sections 4-8 survive even after you stop using the app.
          </Text>

          <Text style={styles.sectionTitle}>13. Disputes & Governing Law</Text>

          <Text style={styles.subsectionTitle}>(a) Informal Resolution First</Text>
          <Text style={styles.paragraph}>If you have a dispute with Aperae:</Text>
          <Text style={styles.bulletPoint}>1. <Text style={styles.bold}>First:</Text> Email us at {LEGAL_CONFIG.contact.legal} and try to resolve informally</Text>
          <Text style={styles.bulletPoint}>2. <Text style={styles.bold}>Give us 30 days</Text> to respond and work it out</Text>
          <Text style={styles.bulletPoint}>3. <Text style={styles.bold}>Only then</Text> proceed to formal dispute resolution</Text>

          <Text style={styles.subsectionTitle}>(b) Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by the laws of <Text style={styles.bold}>New York State</Text>, without 
            regard to conflict of law principles.
          </Text>

          <Text style={styles.subsectionTitle}>(c) Venue</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>If a legal dispute arises:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• You agree to bring claims in state or federal courts located in New York County, New York</Text>
          <Text style={styles.bulletPoint}>• You consent to personal jurisdiction in these courts</Text>
          <Text style={styles.bulletPoint}>• You waive any objection to venue</Text>

          <Text style={styles.subsectionTitle}>(d) No Class Actions</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>You agree to bring disputes INDIVIDUALLY only.</Text>
          </Text>
          <Text style={styles.paragraph}>You waive any right to:</Text>
          <Text style={styles.bulletPoint}>• Participate in a class action lawsuit</Text>
          <Text style={styles.bulletPoint}>• Serve as a class representative</Text>
          <Text style={styles.bulletPoint}>• Join claims with other users</Text>
          <Text style={styles.bulletPoint}>• Bring representative actions on behalf of others</Text>

          <Text style={styles.subsectionTitle}>(e) No Jury Trial</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>You waive any right to a jury trial.</Text>
          </Text>
          <Text style={styles.paragraph}>Disputes will be decided by a judge, not a jury.</Text>

          <Text style={styles.subsectionTitle}>(f) One-Year Limitation</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Any claim must be filed within ONE (1) YEAR after the claim arises.</Text>
          </Text>
          <Text style={styles.paragraph}>
            Claims not filed within one year are <Text style={styles.bold}>permanently barred</Text>.
          </Text>

          <Text style={styles.subsectionTitle}>(g) Small Claims Court</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>You may bring claims in small claims court</Text> if:
          </Text>
          <Text style={styles.bulletPoint}>• The claim qualifies for small claims jurisdiction</Text>
          <Text style={styles.bulletPoint}>• You bring it in your jurisdiction or ours (New York)</Text>
          <Text style={styles.bulletPoint}>• It remains in small claims court</Text>

          <Text style={styles.sectionTitle}>14. Geographic Restrictions</Text>

          <Text style={styles.subsectionTitle}>(a) United States Only</Text>
          <Text style={styles.paragraph}>
            Aperae is available <Text style={styles.bold}>ONLY to users in the United States</Text>.
          </Text>

          <Text style={styles.subsectionTitle}>(b) EU/EEA Access Blocked</Text>
          <Text style={styles.paragraph}>We block access from:</Text>
          <Text style={styles.bulletPoint}>• European Union (EU)</Text>
          <Text style={styles.bulletPoint}>• European Economic Area (EEA)</Text>
          <Text style={styles.bulletPoint}>• Other regions as needed</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Why?</Text> GDPR compliance is complex and beyond the scope of this personal project.
          </Text>

          <Text style={styles.subsectionTitle}>(c) No VPN / Proxy Use</Text>
          <Text style={styles.paragraph}>
            You may NOT use VPNs or proxies to bypass geographic restrictions.
          </Text>
          <Text style={styles.paragraph}>
            Doing so violates these Terms and will result in termination.
          </Text>

          <Text style={styles.subsectionTitle}>(d) Export Controls</Text>
          <Text style={styles.paragraph}>
            You agree not to export or re-export the app in violation of U.S. export laws.
          </Text>

          <Text style={styles.sectionTitle}>15. Changes to These Terms</Text>

          <Text style={styles.subsectionTitle}>(a) We May Update These Terms</Text>
          <Text style={styles.paragraph}>We may update these Terms at any time to reflect:</Text>
          <Text style={styles.bulletPoint}>• Changes in how the app works</Text>
          <Text style={styles.bulletPoint}>• New features</Text>
          <Text style={styles.bulletPoint}>• Legal requirements</Text>
          <Text style={styles.bulletPoint}>• User feedback</Text>

          <Text style={styles.subsectionTitle}>(b) How You'll Be Notified</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Material changes will be communicated via:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Update to "Effective Date" at top</Text>
          <Text style={styles.bulletPoint}>• In-app notification</Text>
          <Text style={styles.bulletPoint}>• Email (if you have an account)</Text>

          <Text style={styles.subsectionTitle}>(c) Continued Use = Acceptance</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>By continuing to use Aperae after changes, you accept the updated Terms.</Text>
          </Text>
          <Text style={styles.paragraph}>
            If you don't agree: Stop using the app and delete it.
          </Text>

          <Text style={styles.subsectionTitle}>(d) Reinstall = Re-Accept</Text>
          <Text style={styles.paragraph}>
            If you reinstall the app after Terms have changed, you'll be asked to accept the new version.
          </Text>

          <Text style={styles.sectionTitle}>16. Miscellaneous</Text>

          <Text style={styles.subsectionTitle}>(a) Entire Agreement</Text>
          <Text style={styles.paragraph}>
            These Terms, together with the Privacy Notice, constitute the entire agreement between you and Aperae.
          </Text>

          <Text style={styles.subsectionTitle}>(b) Severability</Text>
          <Text style={styles.paragraph}>If any provision is found invalid or unenforceable:</Text>
          <Text style={styles.bulletPoint}>• That provision will be modified to the minimum extent necessary</Text>
          <Text style={styles.bulletPoint}>• All other provisions remain in full effect</Text>

          <Text style={styles.subsectionTitle}>(c) No Waiver</Text>
          <Text style={styles.paragraph}>
            Our failure to enforce any provision doesn't waive our right to enforce it later.
          </Text>

          <Text style={styles.subsectionTitle}>(d) No Assignment</Text>
          <Text style={styles.paragraph}>You may NOT assign these Terms to anyone else.</Text>
          <Text style={styles.paragraph}>
            We may assign these Terms to anyone (if we ever sell or transfer Aperae).
          </Text>

          <Text style={styles.subsectionTitle}>(e) Headings</Text>
          <Text style={styles.paragraph}>
            Section headings are for convenience only and don't affect interpretation.
          </Text>

          <Text style={styles.subsectionTitle}>(f) Contact for Legal Notices</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Legal notices should be sent to:</Text>{'\n'}
            {LEGAL_CONFIG.contact.legal}{'\n'}
            {LEGAL_CONFIG.contact.address}
          </Text>

          <Text style={styles.sectionTitle}>17. Force Majeure</Text>
          <Text style={styles.paragraph}>
            Aperae shall not be liable for any failure or delay in performance due to circumstances 
            beyond our reasonable control, including:
          </Text>
          <Text style={styles.bulletPoint}>• Acts of God, natural disasters, pandemics</Text>
          <Text style={styles.bulletPoint}>• War, terrorism, civil unrest</Text>
          <Text style={styles.bulletPoint}>• Government actions, emergency declarations</Text>
          <Text style={styles.bulletPoint}>• Internet outages, third-party service failures</Text>
          <Text style={styles.bulletPoint}>• Anthropic Claude API or Google Cloud Vision API outages</Text>
          <Text style={styles.bulletPoint}>• Cyberattacks, DDoS attacks, ransomware</Text>

          <Text style={styles.sectionTitle}>18. Website-Specific Terms</Text>

          <Text style={styles.subsectionTitle}>(a) Browser Requirements</Text>
          <Text style={styles.paragraph}>This website requires:</Text>
          <Text style={styles.bulletPoint}>• Modern web browser (Chrome, Firefox, Safari, Edge - latest 2 versions)</Text>
          <Text style={styles.bulletPoint}>• JavaScript enabled (required for core functionality)</Text>
          <Text style={styles.bulletPoint}>• Cookies and localStorage enabled (required)</Text>
          <Text style={styles.bulletPoint}>• Minimum screen width: 320 pixels</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Unsupported browsers:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• Internet Explorer (all versions) - NOT supported</Text>
          <Text style={styles.bulletPoint}>• Browsers with JavaScript disabled - will not function</Text>
          <Text style={styles.bulletPoint}>• Browsers blocking localStorage - will not function</Text>

          <Text style={styles.subsectionTitle}>(b) Web Browser Local Storage</Text>
          <Text style={styles.paragraph}>We use your browser's localStorage API to store:</Text>
          <Text style={styles.bulletPoint}>• Your device fingerprint (hashed identifier)</Text>
          <Text style={styles.bulletPoint}>• Your consent to Terms and Privacy Notice</Text>
          <Text style={styles.bulletPoint}>• Your age verification (21+ attestation)</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>If you clear your browser data:</Text>
          </Text>
          <Text style={styles.bulletPoint}>• All consent records are deleted from your browser</Text>
          <Text style={styles.bulletPoint}>• You will be required to re-accept Terms, Privacy Notice, and age verification</Text>
          <Text style={styles.bulletPoint}>• Website functionality may be impaired</Text>

          <Text style={styles.paragraph}>
            See our{' '}
            {navigation ? (
              <Text style={styles.link} onPress={handleCookiePolicyPress}>
                Cookie Policy
              </Text>
            ) : (
              <Text style={styles.linkText}>Cookie Policy</Text>
            )}
            {' '}for full details.
          </Text>

          <Text style={styles.subsectionTitle}>(c) Link Policy</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>External Links:</Text> We may link to third-party websites. We are NOT 
            responsible for their content, privacy practices, or availability.
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Linking to Aperae:</Text> You may link to our homepage for non-commercial purposes.
          </Text>
          <Text style={styles.paragraph}>You may NOT:</Text>
          <Text style={styles.bulletPoint}>• Frame or embed our website</Text>
          <Text style={styles.bulletPoint}>• Imply endorsement or affiliation</Text>
          <Text style={styles.bulletPoint}>• Use our logo without permission</Text>

          <Text style={styles.subsectionTitle}>(d) No Automated Access</Text>
          <Text style={styles.paragraph}>You may NOT use automated tools to access the website:</Text>
          <Text style={styles.bulletPoint}>• Bots, web scrapers, or crawlers</Text>
          <Text style={styles.bulletPoint}>• Automated scripts or tools</Text>
          <Text style={styles.bulletPoint}>• Tools to bypass rate limiting</Text>

          <Text style={styles.paragraph}>Violations may result in IP blocking and legal action.</Text>

          <Text style={styles.subsectionTitle}>(e) Browser Compatibility</Text>
          <Text style={styles.paragraph}>We test on major browsers but cannot guarantee:</Text>
          <Text style={styles.bulletPoint}>• Perfect rendering on all browsers</Text>
          <Text style={styles.bulletPoint}>• Compatibility with browser extensions</Text>
          <Text style={styles.bulletPoint}>• Functionality with ad blockers enabled</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Use with unsupported browsers is at your own risk.</Text>
          </Text>

          <Text style={styles.subsectionTitle}>(f) Website Availability</Text>
          <Text style={styles.paragraph}>As a personal project:</Text>
          <Text style={styles.bulletPoint}>• We make NO guarantees about website availability</Text>
          <Text style={styles.bulletPoint}>• Website may go offline without notice</Text>
          <Text style={styles.bulletPoint}>• No service level agreement (SLA)</Text>

          <Text style={styles.sectionTitle}>19. Contact Us</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>For questions about these Terms:</Text>
          </Text>
          <Text style={styles.paragraph}>
            Email: {LEGAL_CONFIG.contact.legal}{'\n'}
            Address: {LEGAL_CONFIG.contact.address}
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>For general support:</Text>{'\n'}
            Email: {LEGAL_CONFIG.contact.support}
          </Text>

          <Text style={styles.sectionTitle}>Final Acknowledgment</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>By using Aperae, you acknowledge and agree that:</Text>
          </Text>
          <Text style={styles.bulletPoint}>✓ You have read and understand these Terms</Text>
          <Text style={styles.bulletPoint}>✓ You are 21 years or older (or legal drinking age in your area)</Text>
          <Text style={styles.bulletPoint}>✓ This is a personal, non-commercial project with no warranties</Text>
          <Text style={styles.bulletPoint}>✓ AI recommendations may be inaccurate (~10% hallucination rate)</Text>
          <Text style={styles.bulletPoint}>✓ You use the service entirely at your own risk</Text>
          <Text style={styles.bulletPoint}>✓ You assume all risks of alcohol consumption and wine purchases</Text>
          <Text style={styles.bulletPoint}>✓ The creator has ZERO liability to you</Text>
          <Text style={styles.bulletPoint}>✓ You will drink responsibly and never drink and drive</Text>
          <Text style={styles.bulletPoint}>✓ Service may be discontinued at any time</Text>

          <Text style={styles.disclaimer}>
            <Text style={styles.bold}>Legal Notice</Text>{'\n'}
            These Terms of Use constitute a legally binding agreement between you and Aperae. 
            By using the Service, you agree to be bound by these Terms. If you have questions 
            about these Terms, please consult your attorney or contact us at {LEGAL_CONFIG.contact.legal}.{'\n\n'}
            <Text style={styles.bold}>If you don't agree, don't use the app.</Text>
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
  const navigationProps: Omit<TermsScreenProps, 'onAccept'> = {};
  if (props.onPrivacyPolicyPress) {
    navigationProps.onPrivacyPolicyPress = props.onPrivacyPolicyPress;
  }
  if (props.onCookiePolicyPress) {
    navigationProps.onCookiePolicyPress = props.onCookiePolicyPress;
  }
  return <TermsScreenWithNavigation {...navigationProps} />;
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
  importantNotice: {
    fontSize: 15,
    color: '#5B2433', // Dark tone text
    lineHeight: 24,
    backgroundColor: 'rgba(191, 150, 148, 0.15)', // Slightly more prominent than note
    padding: 18,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: 'rgba(191, 150, 148, 0.4)', // Stronger border for importance
  },
});

