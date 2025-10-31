/**
 * Privacy Framework - Basic GDPR/CCPA Compliance
 * Handles user consent, data collection, and privacy preferences
 */

export interface PrivacyConsent {
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
  dataSharing: boolean;
  timestamp: Date;
  version: string;
}

export interface DataCollectionPolicy {
  dataType: string;
  purpose: string;
  retentionPeriod: number; // in days
  isRequired: boolean;
  isShared: boolean;
}

export interface PrivacySettings {
  consent: PrivacyConsent;
  dataCollection: DataCollectionPolicy[];
  lastUpdated: Date;
  version: string;
}

class PrivacyManager {
  private static instance: PrivacyManager;
  private privacySettings: PrivacySettings | null = null;
  private readonly STORAGE_KEY = 'privacy_settings';
  private readonly CONSENT_VERSION = '1.0';

  private constructor() {
    this.loadPrivacySettings();
  }

  /**
   * Gets the singleton instance of PrivacyManager
   */
  static getInstance(): PrivacyManager {
    if (!PrivacyManager.instance) {
      PrivacyManager.instance = new PrivacyManager();
    }
    return PrivacyManager.instance;
  }

  /**
   * Initializes privacy settings with default values
   */
  private initializeDefaultSettings(): PrivacySettings {
    const defaultConsent: PrivacyConsent = {
      analytics: false,
      personalization: false,
      marketing: false,
      dataSharing: false,
      timestamp: new Date(),
      version: this.CONSENT_VERSION,
    };

    const defaultDataCollection: DataCollectionPolicy[] = [
      {
        dataType: 'wine_preferences',
        purpose: 'Provide personalized wine recommendations',
        retentionPeriod: 365,
        isRequired: true,
        isShared: false,
      },
      {
        dataType: 'usage_analytics',
        purpose: 'Improve app performance and user experience',
        retentionPeriod: 90,
        isRequired: false,
        isShared: false,
      },
      {
        dataType: 'favorite_wines',
        purpose: 'Remember user preferences',
        retentionPeriod: 730,
        isRequired: true,
        isShared: false,
      },
    ];

    return {
      consent: defaultConsent,
      dataCollection: defaultDataCollection,
      lastUpdated: new Date(),
      version: this.CONSENT_VERSION,
    };
  }

  /**
   * Loads privacy settings from storage
   */
  private async loadPrivacySettings(): Promise<void> {
    try {
      // In a real implementation, this would use AsyncStorage
      // const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      // if (stored) {
      //   this.privacySettings = JSON.parse(stored);
      // }
      
      // For now, initialize with defaults
      this.privacySettings = this.initializeDefaultSettings();
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
      this.privacySettings = this.initializeDefaultSettings();
    }
  }

  /**
   * Saves privacy settings to storage
   */
  private async savePrivacySettings(): Promise<void> {
    if (!this.privacySettings) return;

    try {
      // In a real implementation, this would use AsyncStorage
      // await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.privacySettings));
      console.log('Privacy settings saved:', this.privacySettings);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  }

  /**
   * Gets current privacy settings
   */
  getPrivacySettings(): PrivacySettings | null {
    return this.privacySettings;
  }

  /**
   * Updates user consent preferences
   * @param consent - New consent preferences
   */
  async updateConsent(consent: Partial<PrivacyConsent>): Promise<void> {
    if (!this.privacySettings) {
      this.privacySettings = this.initializeDefaultSettings();
    }

    this.privacySettings.consent = {
      ...this.privacySettings.consent,
      ...consent,
      timestamp: new Date(),
      version: this.CONSENT_VERSION,
    };

    this.privacySettings.lastUpdated = new Date();
    await this.savePrivacySettings();
  }

  /**
   * Checks if user has consented to a specific data collection type
   * @param dataType - Type of data collection
   * @returns true if user has consented, false otherwise
   */
  hasConsentFor(dataType: string): boolean {
    if (!this.privacySettings) return false;

    const policy = this.privacySettings.dataCollection.find(
      policy => policy.dataType === dataType
    );

    if (!policy) return false;

    // Required data collection is always allowed
    if (policy.isRequired) return true;

    // Check specific consent based on data type
    switch (dataType) {
      case 'usage_analytics':
        return this.privacySettings.consent.analytics;
      case 'personalization_data':
        return this.privacySettings.consent.personalization;
      case 'marketing_data':
        return this.privacySettings.consent.marketing;
      case 'shared_data':
        return this.privacySettings.consent.dataSharing;
      default:
        return false;
    }
  }

  /**
   * Records data collection activity
   * @param dataType - Type of data being collected
   * @param purpose - Purpose of data collection
   * @param metadata - Additional metadata
   */
  async recordDataCollection(
    dataType: string,
    purpose: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.hasConsentFor(dataType)) {
      console.warn(`Data collection not allowed for: ${dataType}`);
      return;
    }

    // In a real implementation, this would log to a privacy-compliant analytics service
    console.log('Data collection recorded:', {
      dataType,
      purpose,
      timestamp: new Date(),
      metadata,
    });
  }

  /**
   * Gets data collection policies for display to user
   */
  getDataCollectionPolicies(): DataCollectionPolicy[] {
    if (!this.privacySettings) return [];
    return this.privacySettings.dataCollection;
  }

  /**
   * Requests user consent for all data collection types
   * @returns Promise resolving to user's consent choices
   */
  async requestConsent(): Promise<PrivacyConsent> {
    // In a real implementation, this would show a consent dialog
    // For now, return current consent settings
    if (!this.privacySettings) {
      this.privacySettings = this.initializeDefaultSettings();
    }
    
    return this.privacySettings.consent;
  }

  /**
   * Exports user data for GDPR compliance
   * @returns User's data in a structured format
   */
  async exportUserData(): Promise<{
    privacySettings: PrivacySettings;
    dataTypes: string[];
    exportDate: Date;
  }> {
    if (!this.privacySettings) {
      this.privacySettings = this.initializeDefaultSettings();
    }

    return {
      privacySettings: this.privacySettings,
      dataTypes: this.privacySettings.dataCollection.map(policy => policy.dataType),
      exportDate: new Date(),
    };
  }

  /**
   * Deletes user data for GDPR compliance
   * @param dataTypes - Types of data to delete
   */
  async deleteUserData(dataTypes?: string[]): Promise<void> {
    if (!this.privacySettings) return;

    if (dataTypes) {
      // Delete specific data types
      this.privacySettings.dataCollection = this.privacySettings.dataCollection.filter(
        policy => !dataTypes.includes(policy.dataType)
      );
    } else {
      // Delete all non-required data
      this.privacySettings.dataCollection = this.privacySettings.dataCollection.filter(
        policy => policy.isRequired
      );
    }

    this.privacySettings.lastUpdated = new Date();
    await this.savePrivacySettings();

    console.log('User data deleted:', dataTypes || 'all non-required data');
  }

  /**
   * Checks if privacy settings need to be updated
   * @returns true if settings are outdated
   */
  needsPrivacyUpdate(): boolean {
    if (!this.privacySettings) return true;
    return this.privacySettings.consent.version !== this.CONSENT_VERSION;
  }

  /**
   * Gets privacy policy text for display
   */
  getPrivacyPolicyText(): string {
    return `
PRIVACY POLICY - PocketSomm

Data Collection:
- Wine Preferences: Required for personalized recommendations
- Usage Analytics: Optional, helps improve app performance
- Favorite Wines: Required for user experience
- Marketing Data: Optional, for personalized offers

Data Retention:
- Wine preferences: 1 year
- Usage analytics: 3 months
- Favorite wines: 2 years
- Marketing data: 6 months

Your Rights:
- Access your data
- Delete your data
- Export your data
- Withdraw consent
- Data portability

Contact: privacy@pocketsomm.com
Last Updated: ${new Date().toLocaleDateString()}
    `.trim();
  }
}

// Create singleton instance
const privacyManager = PrivacyManager.getInstance();

export default privacyManager;
export { PrivacyManager, PrivacyConsent, DataCollectionPolicy, PrivacySettings };




