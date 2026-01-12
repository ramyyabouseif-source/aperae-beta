const prisma = require('../prisma/client');
const crypto = require('crypto');
const logger = require('../logger');

/**
 * Consent Service for Privacy-Compliant Consent Tracking
 * 
 * Implements privacy-by-design principles:
 * - Data minimization (only store necessary consent metadata)
 * - Pseudonymization (hashed device IDs for anonymous users)
 * - Purpose limitation (consent records only for compliance/legal defense)
 * - Security (encryption, access controls)
 * - User rights (included in data exports, honorable deletion requests)
 */
class ConsentService {
  /**
   * Hash device ID for pseudonymization (one-way, cannot be reversed)
   * @param {string} deviceId - Device identifier
   * @returns {string} SHA-256 hash of device ID
   * @private
   */
  _hashDeviceId(deviceId) {
    if (!deviceId) return null;
    return crypto.createHash('sha256').update(deviceId).digest('hex');
  }

  /**
   * Get device identifier from request (browser fingerprint or app installation ID)
   * For web: uses combination of user-agent + accept-language (pseudonymized)
   * For mobile: should use app installation ID (passed from client)
   * @param {object} req - Express request object
   * @param {string} clientDeviceId - Device ID from client (mobile apps)
   * @returns {string} Hashed device identifier
   * @private
   */
  _getDeviceIdHash(req, clientDeviceId) {
    // Prefer client-provided device ID (mobile apps)
    if (clientDeviceId) {
      return this._hashDeviceId(clientDeviceId);
    }

    // Fallback: create pseudonymized identifier from request (web)
    if (req) {
      const userAgent = req.headers['user-agent'] || '';
      const acceptLanguage = req.headers['accept-language'] || '';
      // Create a stable but pseudonymized identifier
      const deviceFingerprint = `${userAgent}|${acceptLanguage}`;
      return this._hashDeviceId(deviceFingerprint);
    }

    return null;
  }

  /**
   * Store consent record (privacy-compliant)
   * @param {object} params - Consent parameters
   * @param {string} params.consentType - Type of consent ('age_verification', 'terms', 'privacy_policy')
   * @param {boolean} params.accepted - Whether consent was accepted
   * @param {string} [params.version] - Version of terms/policy (e.g., '1.0')
   * @param {string} [params.userId] - User ID if logged in (optional)
   * @param {string} [params.deviceId] - Device ID from client (optional, will be hashed)
   * @param {object} [params.req] - Express request object (for device fingerprinting on web)
   * @returns {Promise<object>} Created consent record
   */
  async storeConsent({ consentType, accepted, version = null, userId = null, deviceId = null, req = null }) {
    try {
      // Validate consent type
      const validConsentTypes = ['age_verification', 'terms', 'privacy_policy'];
      if (!validConsentTypes.includes(consentType)) {
        throw new Error(`Invalid consent type: ${consentType}. Must be one of: ${validConsentTypes.join(', ')}`);
      }

      // Get pseudonymized device ID (hashed for privacy)
      const deviceIdHash = this._getDeviceIdHash(req, deviceId);

      // Store consent record (minimal data - privacy by design)
      const consent = await prisma.userConsent.create({
        data: {
          userId: userId || null,
          deviceIdHash: deviceIdHash,
          consentType: consentType,
          accepted: accepted,
          version: version,
          acceptedAt: new Date(),
        },
      });

      logger.info('Consent stored', {
        consentType,
        accepted,
        version,
        hasUserId: !!userId,
        hasDeviceIdHash: !!deviceIdHash,
      });

      return consent;
    } catch (error) {
      logger.error('Error storing consent', { error: error.message, consentType, accepted });
      throw error;
    }
  }

  /**
   * Get consent records for a user (for data export)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Consent records
   */
  async getUserConsents(userId) {
    try {
      const consents = await prisma.userConsent.findMany({
        where: {
          userId: userId,
          anonymizedAt: null, // Only non-anonymized records
        },
        orderBy: {
          acceptedAt: 'desc',
        },
      });

      return consents;
    } catch (error) {
      logger.error('Error getting user consents', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get consent records by device ID hash (for anonymous users)
   * @param {string} deviceIdHash - Hashed device ID
   * @returns {Promise<Array>} Consent records
   */
  async getConsentsByDeviceIdHash(deviceIdHash) {
    try {
      const consents = await prisma.userConsent.findMany({
        where: {
          deviceIdHash: deviceIdHash,
          userId: null, // Only anonymous user records
          anonymizedAt: null,
        },
        orderBy: {
          acceptedAt: 'desc',
        },
      });

      return consents;
    } catch (error) {
      logger.error('Error getting consents by device ID hash', { error: error.message });
      throw error;
    }
  }

  /**
   * Link anonymous consent records to a user account (when user signs up)
   * @param {string} deviceIdHash - Hashed device ID
   * @param {string} userId - User ID to link to
   * @returns {Promise<number>} Number of records updated
   */
  async linkConsentsToUser(deviceIdHash, userId) {
    try {
      const result = await prisma.userConsent.updateMany({
        where: {
          deviceIdHash: deviceIdHash,
          userId: null, // Only anonymous records
        },
        data: {
          userId: userId,
        },
      });

      logger.info('Consents linked to user', { deviceIdHash, userId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Error linking consents to user', { error: error.message, deviceIdHash, userId });
      throw error;
    }
  }

  /**
   * Delete consent records for a user (for data deletion requests)
   * Note: May need to retain for legal/regulatory compliance (check retention policies)
   * @param {string} userId - User ID
   * @param {boolean} [anonymizeOnly=false] - If true, anonymize instead of delete (for retention)
   * @returns {Promise<number>} Number of records deleted/anonymized
   */
  async deleteUserConsents(userId, anonymizeOnly = false) {
    try {
      if (anonymizeOnly) {
        // Anonymize instead of delete (for legal retention requirements)
        const result = await prisma.userConsent.updateMany({
          where: {
            userId: userId,
            anonymizedAt: null,
          },
          data: {
            userId: null, // Remove user link
            deviceIdHash: null, // Remove device link
            anonymizedAt: new Date(),
          },
        });

        logger.info('User consents anonymized', { userId, count: result.count });
        return result.count;
      } else {
        // Delete records (only if legal retention period has passed)
        const result = await prisma.userConsent.deleteMany({
          where: {
            userId: userId,
          },
        });

        logger.info('User consents deleted', { userId, count: result.count });
        return result.count;
      }
    } catch (error) {
      logger.error('Error deleting user consents', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Check if user has given specific consent
   * @param {string} userId - User ID (optional)
   * @param {string} deviceIdHash - Hashed device ID (optional, for anonymous users)
   * @param {string} consentType - Type of consent to check
   * @param {string} [version] - Optional version to check
   * @returns {Promise<boolean>} True if consent was given
   */
  async hasConsent(userId, deviceIdHash, consentType, version = null) {
    try {
      const where = {
        consentType: consentType,
        accepted: true,
        anonymizedAt: null,
      };

      if (userId) {
        where.userId = userId;
      } else if (deviceIdHash) {
        where.deviceIdHash = deviceIdHash;
        where.userId = null; // Only anonymous records
      } else {
        return false;
      }

      if (version) {
        where.version = version;
      }

      const consent = await prisma.userConsent.findFirst({
        where: where,
        orderBy: {
          acceptedAt: 'desc',
        },
      });

      return !!consent;
    } catch (error) {
      logger.error('Error checking consent', { error: error.message, userId, consentType });
      return false;
    }
  }

  /**
   * Get compliance report for anonymous user (by device ID hash)
   * Returns formatted report showing completion status of all required consents
   * @param {string} deviceIdHash - Hashed device ID
   * @returns {Promise<object>} Compliance report with status and consent records
   */
  async getComplianceReportByDeviceIdHash(deviceIdHash) {
    try {
      if (!deviceIdHash) {
        throw new Error('Device ID hash is required');
      }

      // Get all consent records for this device
      const allConsents = await prisma.userConsent.findMany({
        where: {
          deviceIdHash: deviceIdHash,
          userId: null, // Only anonymous user records
          anonymizedAt: null,
        },
        orderBy: {
          acceptedAt: 'asc',
        },
      });

      // Required consent types
      const requiredConsentTypes = ['age_verification', 'terms', 'privacy_policy'];
      
      // Get the most recent accepted consent for each type
      const consentMap = new Map();
      allConsents.forEach(consent => {
        if (consent.accepted && !consentMap.has(consent.consentType)) {
          consentMap.set(consent.consentType, consent);
        }
      });

      // Build consent records array
      const consentRecords = requiredConsentTypes.map(consentType => {
        const consent = consentMap.get(consentType);
        return {
          type: consentType,
          accepted: !!consent && consent.accepted,
          version: consent?.version || null,
          acceptedAt: consent?.acceptedAt || null,
        };
      });

      // Calculate compliance status
      const acceptedCount = consentRecords.filter(r => r.accepted).length;
      const allAccepted = consentRecords.every(r => r.accepted);
      
      let complianceStatus;
      if (acceptedCount === requiredConsentTypes.length && allAccepted) {
        complianceStatus = 'FULLY_COMPLIANT';
      } else if (acceptedCount > 0) {
        complianceStatus = 'PARTIAL_COMPLIANCE';
      } else {
        complianceStatus = 'NON_COMPLIANT';
      }

      // Get first and last consent timestamps
      const acceptedConsents = consentRecords.filter(r => r.acceptedAt);
      const firstConsent = acceptedConsents.length > 0 
        ? acceptedConsents[0].acceptedAt 
        : null;
      const lastConsent = acceptedConsents.length > 0 
        ? acceptedConsents[acceptedConsents.length - 1].acceptedAt 
        : null;

      return {
        complianceStatus,
        consentsCompleted: acceptedCount,
        requiredConsents: requiredConsentTypes.length,
        consentRecords,
        firstConsent,
        lastConsent,
      };
    } catch (error) {
      logger.error('Error getting compliance report', { error: error.message, deviceIdHash });
      throw error;
    }
  }

  /**
   * Store single point consent (all three consents together)
   * @param {object} params - Consent parameters
   * @param {boolean} params.ageVerified - Age verification status
   * @param {boolean} params.termsAccepted - Terms acceptance status
   * @param {boolean} params.privacyAccepted - Privacy policy acceptance status
   * @param {string} [params.termsVersion] - Terms version (e.g., '1.0')
   * @param {string} [params.privacyVersion] - Privacy policy version (e.g., '1.0')
   * @param {string} [params.userId] - User ID if logged in
   * @param {string} [params.deviceId] - Device ID from client (optional, will be hashed)
   * @param {object} [params.req] - Express request object (for device fingerprinting on web)
   * @returns {Promise<object>} Created consent record
   */
  async storeSinglePointConsent({
    ageVerified,
    termsAccepted,
    privacyAccepted,
    termsVersion = null,
    privacyVersion = null,
    userId = null,
    deviceId = null,
    req = null
  }) {
    try {
      // Validate all three consents are true
      if (!ageVerified || !termsAccepted || !privacyAccepted) {
        throw new Error('All three consents must be accepted for single point consent');
      }

      // Get pseudonymized device ID
      const deviceIdHash = this._getDeviceIdHash(req, deviceId);

      // Build consent data JSON
      const consentData = {
        age_verification: ageVerified,
        terms: termsAccepted,
        privacy_policy: privacyAccepted,
        terms_version: termsVersion,
        privacy_version: privacyVersion,
        accepted_together: true,
        source: 'age_verification_screen'
      };

      // Store single consent record
      const consent = await prisma.userConsent.create({
        data: {
          userId: userId || null,
          deviceIdHash: deviceIdHash,
          consentType: 'single_point_consent',
          accepted: true,
          version: `${termsVersion || '1.0'}-${privacyVersion || '1.0'}`, // Combined version
          consentData: consentData,
          acceptedAt: new Date(),
        },
      });

      logger.info('Single point consent stored', {
        userId: userId || 'anonymous',
        hasDeviceIdHash: !!deviceIdHash,
        consentData
      });

      return consent;
    } catch (error) {
      logger.error('Error storing single point consent', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if user has given single point consent
   * @param {string} userId - User ID (optional)
   * @param {string} deviceIdHash - Hashed device ID (optional, for anonymous users)
   * @returns {Promise<boolean>} True if single point consent was given
   */
  async hasSinglePointConsent(userId, deviceIdHash) {
    try {
      const where = {
        consentType: 'single_point_consent',
        accepted: true,
        anonymizedAt: null,
      };

      if (userId) {
        where.userId = userId;
      } else if (deviceIdHash) {
        where.deviceIdHash = deviceIdHash;
        where.userId = null;
      } else {
        return false;
      }

      const consent = await prisma.userConsent.findFirst({
        where: where,
        orderBy: {
          acceptedAt: 'desc',
        },
      });

      if (!consent) return false;

      // Also check that all three consents in consent_data are true
      const consentData = consent.consentData;
      if (consentData) {
        return consentData.age_verification === true &&
               consentData.terms === true &&
               consentData.privacy_policy === true;
      }

      return true; // If consent_data is null, assume valid (backward compatibility)
    } catch (error) {
      logger.error('Error checking single point consent', { error: error.message, userId });
      return false;
    }
  }
}

module.exports = new ConsentService();


