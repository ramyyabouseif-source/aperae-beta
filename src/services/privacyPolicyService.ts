import { SecureStorageService } from './secureStorage';

const PRIVACY_POLICY_ACCEPTED_KEY = 'privacy_policy_accepted_secure';
const PRIVACY_POLICY_TIMESTAMP_KEY = 'privacy_policy_timestamp_secure';
const PRIVACY_POLICY_VERSION_KEY = 'privacy_policy_version_secure';

export class PrivacyPolicyService {
  private static readonly CURRENT_VERSION = '1.0';

  /**
   * Check if user has accepted the privacy policy
   */
  static async hasAcceptedPrivacyPolicy(): Promise<boolean> {
    try {
      const accepted = await SecureStorageService.getItem(PRIVACY_POLICY_ACCEPTED_KEY);
      return accepted === 'true';
    } catch (error) {
      console.error('Error checking privacy policy acceptance:', error);
      return false;
    }
  }

  /**
   * Check if the accepted privacy policy version is current
   */
  static async isPrivacyPolicyCurrent(): Promise<boolean> {
    try {
      const acceptedVersion = await SecureStorageService.getItem(PRIVACY_POLICY_VERSION_KEY);
      return acceptedVersion === this.CURRENT_VERSION;
    } catch (error) {
      console.error('Error checking privacy policy version:', error);
      return false;
    }
  }

  /**
   * Accept the privacy policy
   */
  static async acceptPrivacyPolicy(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      await SecureStorageService.setItem(PRIVACY_POLICY_ACCEPTED_KEY, 'true');
      await SecureStorageService.setItem(PRIVACY_POLICY_TIMESTAMP_KEY, timestamp);
      await SecureStorageService.setItem(PRIVACY_POLICY_VERSION_KEY, this.CURRENT_VERSION);
    } catch (error) {
      console.error('Error accepting privacy policy:', error);
      throw error;
    }
  }

  /**
   * Get the timestamp of when privacy policy was accepted
   */
  static async getPrivacyPolicyTimestamp(): Promise<string | null> {
    try {
      return await SecureStorageService.getItem(PRIVACY_POLICY_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error getting privacy policy timestamp:', error);
      return null;
    }
  }

  /**
   * Get the version of privacy policy that was accepted
   */
  static async getPrivacyPolicyVersion(): Promise<string | null> {
    try {
      return await SecureStorageService.getItem(PRIVACY_POLICY_VERSION_KEY);
    } catch (error) {
      console.error('Error getting privacy policy version:', error);
      return null;
    }
  }

  /**
   * Reset privacy policy acceptance (for testing or re-prompting)
   */
  static async resetPrivacyPolicy(): Promise<void> {
    try {
      await SecureStorageService.removeItem(PRIVACY_POLICY_ACCEPTED_KEY);
      await SecureStorageService.removeItem(PRIVACY_POLICY_TIMESTAMP_KEY);
      await SecureStorageService.removeItem(PRIVACY_POLICY_VERSION_KEY);
    } catch (error) {
      console.error('Error resetting privacy policy:', error);
      throw error;
    }
  }

  /**
   * Get current privacy policy version
   */
  static getCurrentVersion(): string {
    return this.CURRENT_VERSION;
  }
}

