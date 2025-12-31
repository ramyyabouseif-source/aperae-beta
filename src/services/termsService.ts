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
      // Store locally for app functionality
      await SecureStorageService.setItem(TERMS_ACCEPTED_KEY, 'true');

      // Store in backend for compliance/traceability (privacy-compliant)
      try {
        const ConsentApiService = (await import('./consentApiService')).default;
        await ConsentApiService.storeConsent({
          consentType: 'terms',
          accepted: true,
          version: '1.0', // Update version when terms change
        });
      } catch (backendError) {
        // Log but don't fail - local storage is primary, backend is for compliance
        console.warn('Failed to store terms acceptance to backend (non-blocking):', backendError);
      }
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