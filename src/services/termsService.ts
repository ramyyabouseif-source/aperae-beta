import { SecureStorageService } from './secureStorage';

const TERMS_ACCEPTED_KEY = 'terms_accepted_secure';

export class TermsService {
  static async hasAcceptedTerms(): Promise<boolean> {
    try {
      const accepted = await SecureStorageService.getItem(TERMS_ACCEPTED_KEY);
      return accepted === 'true';
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      return false;
    }
  }

  static async acceptTerms(): Promise<void> {
    try {
      await SecureStorageService.setItem(TERMS_ACCEPTED_KEY, 'true');
    } catch (error) {
      console.error('Error accepting terms:', error);
      throw error;
    }
  }

  static async resetTerms(): Promise<void> {
    try {
      await SecureStorageService.removeItem(TERMS_ACCEPTED_KEY);
    } catch (error) {
      console.error('Error resetting terms:', error);
      throw error;
    }
  }
}