import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import privacyManager, { PrivacyConsent, DataCollectionPolicy } from '../utils/privacyManager';
import { FavoritesService } from '../services/favoritesService';
import { PreferencesService } from '../services/preferencesService';
import { LEGAL_CONFIG } from '../config/legal';

export default function PrivacySettingsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState<PrivacyConsent>({
    analytics: false,
    personalization: false,
    marketing: false,
    dataSharing: false,
    timestamp: new Date(),
    version: '1.0',
  });
  const [dataPolicies, setDataPolicies] = useState<DataCollectionPolicy[]>([]);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const settings = await privacyManager.getPrivacySettings();
      
      if (settings) {
        setConsent(settings.consent);
        setDataPolicies(settings.dataCollection);
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (key: keyof PrivacyConsent, value: boolean) => {
    try {
      setSaving(true);
      
      const updatedConsent = { ...consent, [key]: value };
      setConsent(updatedConsent);
      
      await privacyManager.updateConsent({ [key]: value });
      
      // Show confirmation for important changes
      if (key === 'analytics' && value) {
        Alert.alert(
          'Analytics Enabled',
          'We will collect usage data to improve your app experience. You can change this anytime in Privacy Settings.'
        );
      }
    } catch (error) {
      console.error('Error updating consent:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
      // Revert on error
      await loadPrivacySettings();
    } finally {
      setSaving(false);
    }
  };

  const handleViewPrivacyPolicy = () => {
    // Navigate to Privacy Policy screen
    // @ts-ignore - navigation type issue
    navigation.navigate('PrivacyPolicy');
  };

  const handleExportData = async () => {
    try {
      // Export privacy settings
      const exportedData = await privacyManager.exportUserData();
      
      // Export favorites
      const favorites = await FavoritesService.getFavorites();
      
      // Export preferences
      let preferences = null;
      try {
        preferences = await PreferencesService.getPreferences();
      } catch (error) {
        console.log('No preferences found:', error);
      }

      // Export consent records (if user is authenticated)
      let consents = [];
      try {
        const { AuthService } = await import('../services/authService');
        const accessToken = await AuthService.getAccessToken();
        if (accessToken) {
          const ConsentApiService = (await import('../services/consentApiService')).default;
          consents = await ConsentApiService.getUserConsents(accessToken);
        }
      } catch (error) {
        console.log('No consent records found or user not authenticated:', error);
        // Non-blocking - continue export even if consent records can't be retrieved
      }
      
      // Combine all user data
      const userDataExport = {
        exportInfo: {
          exportDate: exportedData.exportDate.toISOString(),
          appVersion: '1.0.0',
          dataTypes: exportedData.dataTypes,
        },
        privacySettings: exportedData.privacySettings,
        favorites: favorites,
        preferences: preferences,
        consents: consents, // Consent records for compliance/traceability
      };
      
      // Create JSON file
      const jsonData = JSON.stringify(userDataExport, null, 2);
      const fileName = `aperae-data-export-${new Date().toISOString().split('T')[0]}.json`;
      
      // Try to use file system, fallback to sharing as text
      let fileUri: string | null = null;
      try {
        // Use cache directory which is available on all platforms
        const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
        if (dir) {
          fileUri = `${dir}${fileName}`;
          await FileSystem.writeAsStringAsync(fileUri, jsonData);
        }
      } catch (error) {
        console.log('File system not available, using text share:', error);
      }
      
      if (!fileUri) {
        // Fallback: share as text if file system not available
        await Share.share({
          message: jsonData,
          title: 'Aperae Data Export',
        });
        Alert.alert('Success', 'Your data has been exported and shared.');
        return;
      }
      
      // Share the file
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const result = await Share.share({
          url: fileUri,
          title: 'Aperae Data Export',
          message: 'Here is my exported data from Aperae',
        });
        
        if (result.action === Share.sharedAction) {
          Alert.alert('Success', 'Your data has been exported and shared successfully.');
        } else if (result.action === Share.dismissedAction) {
          Alert.alert('Export Ready', `Your data has been saved to: ${fileName}\n\nYou can share it from your device's file manager.`);
        }
      } else {
        // For web or other platforms, show the data
        Alert.alert(
          'Data Export',
          `Your data has been exported.\n\n` +
          `Data Types: ${exportedData.dataTypes.join(', ')}\n` +
          `Export Date: ${exportedData.exportDate.toLocaleString()}\n\n` +
          `File saved to: ${fileName}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete Non-Required Data',
      'This will delete:\n' +
      '• All favorites\n' +
      '• Wine preferences\n' +
      '• Analytics data\n' +
      '• Marketing consent data\n\n' +
      'Privacy settings and required data will be preserved.\n\n' +
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete favorites (non-required data)
              try {
                const favorites = await FavoritesService.getFavorites();
                for (const favorite of favorites) {
                  await FavoritesService.removeFromFavorites(favorite.wineName);
                }
                console.log('Favorites deleted');
              } catch (error) {
                console.log('Error deleting favorites:', error);
              }
              
              // Delete preferences (non-required data)
              try {
                await PreferencesService.clearPreferences();
                await PreferencesService.clearWinePreferences();
                console.log('Preferences deleted');
              } catch (error) {
                console.log('Error deleting preferences:', error);
              }
              
              // Delete non-required privacy data
              await privacyManager.deleteUserData();
              
              Alert.alert(
                'Success',
                'All non-required data has been deleted successfully.\n\n' +
                'Privacy settings and required data have been preserved.'
              );
              await loadPrivacySettings();
            } catch (error) {
              console.error('Error deleting data:', error);
              Alert.alert('Error', `Failed to delete data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          },
        },
      ]
    );
  };

  const renderConsentSection = (
    title: string,
    description: string,
    key: keyof PrivacyConsent,
    icon: string,
    required: boolean = false
  ) => (
    <View style={styles.consentItem}>
      <View style={styles.consentHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color="#5B2433" />
        </View>
        <View style={styles.consentTextContainer}>
          <Text style={styles.consentTitle}>
            {title}
            {required && <Text style={styles.requiredText}> (Required)</Text>}
          </Text>
          <Text style={styles.consentDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={consent[key] as boolean}
        onValueChange={(value) => handleConsentChange(key, value)}
        disabled={required || saving}
        trackColor={{ false: '#CCCCCC', true: '#5B2433' }}
        thumbColor={consent[key] ? '#FFFFFF' : '#F4F3F4'}
      />
    </View>
  );

  const renderDataPolicyItem = (policy: DataCollectionPolicy) => (
    <View key={policy.dataType} style={styles.policyItem}>
      <View style={styles.policyHeader}>
        <Text style={styles.policyTitle}>
          {policy.dataType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          {policy.isRequired && <Text style={styles.requiredText}> (Required)</Text>}
        </Text>
        {policy.isShared && (
          <View style={styles.sharedBadge}>
            <Text style={styles.sharedBadgeText}>Shared</Text>
          </View>
        )}
      </View>
      <Text style={styles.policyPurpose}>{policy.purpose}</Text>
      <Text style={styles.policyRetention}>
        Retention: {policy.retentionPeriod} days
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B2433" />
        <Text style={styles.loadingText}>Loading privacy settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consent Preferences</Text>
        <Text style={styles.sectionDescription}>
          Manage your consent for different types of data collection. You can change these settings at any time.
        </Text>

        {renderConsentSection(
          'Analytics',
          'Help improve app performance and user experience by sharing usage analytics',
          'analytics',
          'analytics-outline'
        )}

        {renderConsentSection(
          'Personalization',
          'Enable personalized recommendations based on your preferences',
          'personalization',
          'person-outline'
        )}

        {renderConsentSection(
          'Marketing',
          'Receive personalized offers and marketing communications',
          'marketing',
          'megaphone-outline'
        )}

        {renderConsentSection(
          'Data Sharing',
          'Allow sharing of anonymized data with third-party partners',
          'dataSharing',
          'share-outline'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Collection Policies</Text>
        <Text style={styles.sectionDescription}>
          Learn about what data we collect and how long we keep it.
        </Text>
        {dataPolicies.map(renderDataPolicyItem)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewPrivacyPolicy}
        >
          <Ionicons name="document-text-outline" size={20} color="#5B2433" />
          <Text style={styles.actionButtonText}>View Full Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleExportData}
        >
          <Ionicons name="download-outline" size={20} color="#5B2433" />
          <Text style={styles.actionButtonText}>Export My Data (GDPR)</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteData}
        >
          <Ionicons name="trash-outline" size={20} color="#DC3545" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete Non-Required Data
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {consent.timestamp.toLocaleDateString()}
        </Text>
        <Text style={styles.footerText}>
          Questions? Contact us at {LEGAL_CONFIG.contact.privacy}
        </Text>
        <Text style={[styles.footerText, styles.copyrightText]}>
          Copyright © 2025 {LEGAL_CONFIG.companyName}. All Rights Reserved.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4F0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#5B2433',
  },
  header: {
    backgroundColor: '#5B2433',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F4F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B2433',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  requiredText: {
    fontSize: 12,
    color: '#DC3545',
    fontWeight: 'normal',
  },
  policyItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B2433',
    flex: 1,
  },
  sharedBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sharedBadgeText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  policyPurpose: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
  policyRetention: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#5B2433',
    marginLeft: 12,
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    color: '#DC3545',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 4,
  },
  copyrightText: {
    marginTop: 12,
    fontWeight: '600',
    color: '#5B2433',
  },
});

