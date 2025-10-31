import { SecureStorageService } from './secureStorage';

const TERMS_ACCEPTED_KEY = 'terms_accepted_secure';
const NDA_ACCEPTED_KEY = 'nda_accepted_secure';

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
  
  // NDA methods
  static async hasAcceptedNDA(): Promise<boolean> {
    try {
      const accepted = await SecureStorageService.getItem(NDA_ACCEPTED_KEY);
      return accepted === 'true';
    } catch (error) {
      console.error('Error checking NDA acceptance:', error);
      return false;
    }
  }

  static async acceptNDA(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      await SecureStorageService.setItem(NDA_ACCEPTED_KEY, 'true');
      await SecureStorageService.setItem('nda_timestamp_secure', timestamp);
    } catch (error) {
      console.error('Error accepting NDA:', error);
      throw error;
    }
  }

  static async resetNDA(): Promise<void> {
    try {
      await SecureStorageService.removeItem(NDA_ACCEPTED_KEY);
      await SecureStorageService.removeItem('nda_timestamp_secure');
    } catch (error) {
      console.error('Error resetting NDA:', error);
      throw error;
    }
  }
}