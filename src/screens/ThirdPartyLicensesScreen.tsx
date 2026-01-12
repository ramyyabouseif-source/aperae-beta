import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ThirdPartyLicensesScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Third-Party Licenses & Terms</Text>
          <Text style={styles.subtitle}>
            Aperae uses the following third-party services. Please review their terms of service.
          </Text>

          <View style={styles.section}>
            <View style={styles.serviceHeader}>
              <Ionicons name="chatbubbles-outline" size={24} color="#5B2433" />
              <Text style={styles.serviceTitle}>Anthropic Claude</Text>
            </View>
            <Text style={styles.serviceDescription}>
              Aperae uses Anthropic's Claude AI model to generate wine recommendations.
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleOpenLink('https://www.anthropic.com/legal/terms-of-service')}
            >
              <Text style={styles.linkText}>View Anthropic Terms of Service</Text>
              <Ionicons name="open-outline" size={20} color="#5B2433" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleOpenLink('https://www.anthropic.com/legal/privacy-policy')}
            >
              <Text style={styles.linkText}>View Anthropic Privacy Policy</Text>
              <Ionicons name="open-outline" size={20} color="#5B2433" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.serviceHeader}>
              <Ionicons name="camera-outline" size={24} color="#5B2433" />
              <Text style={styles.serviceTitle}>Google Cloud Vision API</Text>
            </View>
            <Text style={styles.serviceDescription}>
              Aperae uses Google Cloud Vision API for OCR (Optical Character Recognition) to extract text from wine list images.
            </Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleOpenLink('https://cloud.google.com/terms')}
            >
              <Text style={styles.linkText}>View Google Cloud Terms of Service</Text>
              <Ionicons name="open-outline" size={20} color="#5B2433" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleOpenLink('https://policies.google.com/privacy')}
            >
              <Text style={styles.linkText}>View Google Privacy Policy</Text>
              <Ionicons name="open-outline" size={20} color="#5B2433" />
            </TouchableOpacity>
          </View>

          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>Note</Text>
            <Text style={styles.noteText}>
              By using Aperae, you also agree to the terms of service and privacy policies of these third-party services. 
              Please review their policies to understand how they handle your data.
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
  scrollView: {
    flex: 1,
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B2433',
    marginLeft: 12,
  },
  serviceDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F7F4F0',
    borderRadius: 8,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#5B2433',
    fontWeight: '500',
    flex: 1,
  },
  noteSection: {
    backgroundColor: 'rgba(191, 150, 148, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B2433',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#5B2433',
    lineHeight: 20,
  },
});

