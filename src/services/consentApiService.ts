import { getApiBaseUrl } from '../utils/api';
import { getDeviceId } from '../utils/deviceId';

/**
 * Consent API Service
 * Handles communication with backend for privacy-compliant consent storage
 */

export interface ConsentRecord {
  id: string;
  consentType: 'age_verification' | 'terms' | 'privacy_policy';
  accepted: boolean;
  version?: string;
  acceptedAt: string;
}

export interface StoreConsentParams {
  consentType: 'age_verification' | 'terms' | 'privacy_policy';
  accepted: boolean;
  version?: string;
}

class ConsentApiService {
  /**
   * Store consent record to backend (privacy-compliant)
   * Device ID is sent and will be hashed on backend for pseudonymization
   * 
   * @param params - Consent parameters
   * @returns Promise resolving to stored consent record
   */
  static async storeConsent(params: StoreConsentParams): Promise<ConsentRecord> {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const deviceId = await getDeviceId(); // Get device ID (will be hashed on backend)

      console.log('[ConsentApiService] Storing consent:', {
        consentType: params.consentType,
        accepted: params.accepted,
        version: params.version,
        apiBaseUrl,
        hasDeviceId: !!deviceId,
      });

      const response = await fetch(`${apiBaseUrl}/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection header
        },
        body: JSON.stringify({
          consentType: params.consentType,
          accepted: params.accepted,
          version: params.version || null,
          deviceId: deviceId, // Device ID sent to backend (will be hashed)
        }),
      });

      console.log('[ConsentApiService] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || `HTTP ${response.status}: Failed to store consent`;
        console.error('[ConsentApiService] API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          errorData,
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[ConsentApiService] Consent stored successfully:', data.consent);
      return data.consent;
    } catch (error: any) {
      console.error('[ConsentApiService] Error storing consent to backend:', {
        error: error.message,
        stack: error.stack,
        consentType: params.consentType,
      });
      // Don't throw - consent storage failures shouldn't block user flow
      // Frontend still stores consent locally as fallback
      // But we log the error for debugging
      throw error;
    }
  }

  /**
   * Get user consent records (for authenticated users)
   * Used for data export functionality
   * 
   * @param accessToken - User authentication token
   * @returns Promise resolving to array of consent records
   */
  static async getUserConsents(accessToken: string): Promise<ConsentRecord[]> {
    try {
      const apiBaseUrl = getApiBaseUrl();

      const response = await fetch(`${apiBaseUrl}/consent/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to retrieve consents`);
      }

      const data = await response.json();
      return data.consents || [];
    } catch (error) {
      console.error('Error retrieving user consents:', error);
      throw error;
    }
  }
}

export default ConsentApiService;

