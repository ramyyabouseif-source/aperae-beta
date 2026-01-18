import { SecureStorageService } from './secureStorage';

const AGE_VERIFIED_KEY = 'age_verified';
const AGE_VERIFICATION_DATE_KEY = 'age_verification_date';
const AGE_VERIFICATION_AGE_KEY = 'age_verification_age';

export interface AgeVerificationData {
  verified: boolean;
  verificationDate?: string;
  verifiedAge?: number;
}

export class AgeVerificationService {
  /**
   * Check if user has verified their age
   */
  static async isAgeVerified(): Promise<boolean> {
    try {
      const verified = await SecureStorageService.getItem(AGE_VERIFIED_KEY);
      return verified === 'true';
    } catch (error) {
      console.error('Error checking age verification:', error);
      return false;
    }
  }

  /**
   * Get age verification data
   */
  static async getAgeVerificationData(): Promise<AgeVerificationData> {
    try {
      const verified = await SecureStorageService.getItem(AGE_VERIFIED_KEY);
      const date = await SecureStorageService.getItem(AGE_VERIFICATION_DATE_KEY);
      const age = await SecureStorageService.getItem(AGE_VERIFICATION_AGE_KEY);

      return {
        verified: verified === 'true',
        verificationDate: date || undefined,
        verifiedAge: age ? parseInt(age, 10) : undefined,
      };
    } catch (error) {
      console.error('Error getting age verification data:', error);
      return { verified: false };
    }
  }

  /**
   * Verify age (store verification)
   * Stores both locally (for app functionality) and in backend (for compliance/traceability)
   */
  static async verifyAge(age: number): Promise<void> {
    try {
      // Store locally for app functionality
      await SecureStorageService.setItem(AGE_VERIFIED_KEY, 'true');
      await SecureStorageService.setItem(AGE_VERIFICATION_DATE_KEY, new Date().toISOString());
      await SecureStorageService.setItem(AGE_VERIFICATION_AGE_KEY, age.toString());

      // Note: Backend storage is now handled by the single-point consent endpoint
      // in AgeVerificationScreen, so we don't need to store separately here
      // to avoid duplicate API calls
    } catch (error) {
      console.error('Error storing age verification:', error);
      throw error;
    }
  }

  /**
   * Clear age verification (for testing or logout)
   */
  static async clearAgeVerification(): Promise<void> {
    try {
      await SecureStorageService.removeItem(AGE_VERIFIED_KEY);
      await SecureStorageService.removeItem(AGE_VERIFICATION_DATE_KEY);
      await SecureStorageService.removeItem(AGE_VERIFICATION_AGE_KEY);
    } catch (error) {
      console.error('Error clearing age verification:', error);
      throw error;
    }
  }
}

