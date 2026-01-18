import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LEGAL_CONFIG } from '../config/legal';

export default function AboutScreen() {
  const navigation = useNavigation();

  const handleViewTerms = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('Terms');
  };

  const handleViewPrivacyPolicy = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('PrivacyPolicy');
  };

  const handleViewPrivacySettings = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('PrivacySettings');
  };

  const handleViewLicenses = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('ThirdPartyLicenses');
  };

  const handleViewCookiePolicy = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('CookiePolicy');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version:</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Build:</Text>
          <Text style={styles.infoValue}>1</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleViewTerms}
        >
          <Ionicons name="document-text-outline" size={20} color="#5B2433" />
          <Text style={styles.linkButtonText}>Terms of Use</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleViewPrivacyPolicy}
        >
          <Ionicons name="shield-outline" size={20} color="#5B2433" />
          <Text style={styles.linkButtonText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleViewPrivacySettings}
        >
          <Ionicons name="settings-outline" size={20} color="#5B2433" />
          <Text style={styles.linkButtonText}>Privacy Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleViewCookiePolicy}
        >
          <Ionicons name="document-text-outline" size={20} color="#5B2433" />
          <Text style={styles.linkButtonText}>Cookie Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleViewLicenses}
        >
          <Ionicons name="list-outline" size={20} color="#5B2433" />
          <Text style={styles.linkButtonText}>Third-Party Licenses</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.contactText}>
          <Text style={styles.contactLabel}>Support:</Text> {LEGAL_CONFIG.contact.support}
        </Text>
        <Text style={styles.contactText}>
          <Text style={styles.contactLabel}>Privacy:</Text> {LEGAL_CONFIG.contact.privacy}
        </Text>
        <Text style={styles.contactText}>
          <Text style={styles.contactLabel}>Legal:</Text> {LEGAL_CONFIG.contact.legal}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Copyright</Text>
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>
            Copyright © 2025 {LEGAL_CONFIG.companyName}
          </Text>
          <Text style={styles.copyrightText}>
            All Rights Reserved.
          </Text>
          <Text style={styles.copyrightDescription}>
            This software and associated documentation files are proprietary and confidential 
            information of {LEGAL_CONFIG.companyName}. Unauthorized copying, distribution, 
            modification, or use of this software, via any medium, is strictly prohibited 
            without the express written permission of {LEGAL_CONFIG.companyName}.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for wine enthusiasts
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
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B2433',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B2433',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  linkButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#5B2433',
    marginLeft: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#5B2433',
    marginBottom: 12,
    lineHeight: 24,
  },
  contactLabel: {
    fontWeight: '600',
    marginRight: 8,
  },
  copyrightContainer: {
    backgroundColor: '#F7F4F0',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  copyrightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B2433',
    textAlign: 'center',
    marginBottom: 8,
  },
  copyrightDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

