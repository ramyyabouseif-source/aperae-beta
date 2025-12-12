import { Platform } from 'react-native';

/**
 * Certificate Pinning Service for PocketSomm
 * Provides SSL certificate pinning to prevent man-in-the-middle attacks
 */
class CertificatePinningService {
  private static instance: CertificatePinningService;
  private pinnedCertificates: Map<string, string[]> = new Map();
  private isEnabled: boolean = true;

  private constructor() {
    this.initializePinnedCertificates();
  }

  static getInstance(): CertificatePinningService {
    if (!CertificatePinningService.instance) {
      CertificatePinningService.instance = new CertificatePinningService();
    }
    return CertificatePinningService.instance;
  }

  /**
   * Initialize pinned certificates for known endpoints
   */
  private initializePinnedCertificates(): void {
    // For development with ngrok, we'll use a more flexible approach
    // In production, you should pin to your actual server's certificate
    if (__DEV__) {
      // Development mode - allow ngrok certificates but validate domain
      this.pinnedCertificates.set('ngrok-free.app', [
        // These are example SHA256 hashes - replace with actual ngrok certificate hashes
        'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Placeholder
      ]);
    } else {
      // Production mode - pin to your actual server certificate
      this.pinnedCertificates.set('your-production-domain.com', [
        // Replace with your actual server's certificate SHA256 hash
        'sha256/YOUR_ACTUAL_CERTIFICATE_HASH_HERE',
      ]);
    }
  }

  /**
   * Validate certificate for a given URL
   * @param url - The URL to validate
   * @param certificateHash - The certificate hash to validate
   * @returns boolean - True if certificate is valid
   */
  validateCertificate(url: string, certificateHash: string): boolean {
    if (!this.isEnabled) {
      return true; // Skip validation if disabled
    }

    try {
      const hostname = this.extractHostname(url);
      
      // Check if we have pinned certificates for this hostname
      const pinnedHashes = this.pinnedCertificates.get(hostname);
      if (!pinnedHashes) {
        console.warn(`No pinned certificates found for hostname: ${hostname}`);
        return false;
      }

      // Validate against pinned certificates
      const isValid = pinnedHashes.includes(certificateHash);
      
      if (!isValid) {
        console.error(`Certificate validation failed for ${hostname}. Expected: ${pinnedHashes}, Got: ${certificateHash}`);
      }

      return isValid;
    } catch (error) {
      console.error('Certificate validation error:', error);
      return false;
    }
  }

  /**
   * Extract hostname from URL
   * @param url - The URL to extract hostname from
   * @returns string - The hostname
   */
  private extractHostname(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error('Error extracting hostname from URL:', url, error);
      return '';
    }
  }

  /**
   * Add a new pinned certificate
   * @param hostname - The hostname to pin
   * @param certificateHash - The certificate hash to pin
   */
  addPinnedCertificate(hostname: string, certificateHash: string): void {
    if (!this.pinnedCertificates.has(hostname)) {
      this.pinnedCertificates.set(hostname, []);
    }
    
    const existingHashes = this.pinnedCertificates.get(hostname) || [];
    if (!existingHashes.includes(certificateHash)) {
      existingHashes.push(certificateHash);
      this.pinnedCertificates.set(hostname, existingHashes);
      console.log(`Added pinned certificate for ${hostname}`);
    }
  }

  /**
   * Remove a pinned certificate
   * @param hostname - The hostname to remove
   * @param certificateHash - The certificate hash to remove
   */
  removePinnedCertificate(hostname: string, certificateHash: string): void {
    const existingHashes = this.pinnedCertificates.get(hostname) || [];
    const updatedHashes = existingHashes.filter(hash => hash !== certificateHash);
    
    if (updatedHashes.length === 0) {
      this.pinnedCertificates.delete(hostname);
    } else {
      this.pinnedCertificates.set(hostname, updatedHashes);
    }
    
    console.log(`Removed pinned certificate for ${hostname}`);
  }

  /**
   * Enable or disable certificate pinning
   * @param enabled - Whether to enable certificate pinning
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`Certificate pinning ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if certificate pinning is enabled
   * @returns boolean - True if enabled
   */
  isCertificatePinningEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get all pinned certificates
   * @returns Map<string, string[]> - Map of hostnames to certificate hashes
   */
  getAllPinnedCertificates(): Map<string, string[]> {
    return new Map(this.pinnedCertificates);
  }

  /**
   * Validate URL against known secure patterns
   * @param url - The URL to validate
   * @returns boolean - True if URL appears secure
   */
  validateUrlSecurity(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // In development mode, allow HTTP and local IP addresses for local development
      if (__DEV__) {
        // Allow HTTP for local development (192.168.x.x, localhost, 127.0.0.1)
        const localDevelopmentPatterns = [
          /^192\.168\.\d+\.\d+/,
          /^127\.0\.0\.1$/,
          /^localhost$/i,
          /^10\.\d+\.\d+\.\d+/,
          /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+/,
        ];

        const isLocalDevelopment = localDevelopmentPatterns.some(pattern => 
          pattern.test(urlObj.hostname)
        );

        if (isLocalDevelopment && urlObj.protocol === 'http:') {
          console.log(`Allowing local development URL: ${url}`);
          return true;
        }

        // In development, also allow ngrok HTTPS URLs
        if (urlObj.hostname.includes('ngrok-free.app') && urlObj.protocol === 'https:') {
          console.log(`Allowing ngrok development URL: ${url}`);
          return true;
        }
      }
      
      // Check protocol (production mode or non-local URLs)
      if (urlObj.protocol !== 'https:') {
        console.warn(`Insecure protocol detected: ${urlObj.protocol}`);
        return false;
      }

      // Check for suspicious patterns (only in production)
      if (!__DEV__) {
        const suspiciousPatterns = [
          /localhost/i,
          /127\.0\.0\.1/,
          /192\.168\./,
          /10\./,
          /172\.(1[6-9]|2[0-9]|3[0-1])\./,
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(urlObj.hostname)) {
            console.warn(`Suspicious hostname pattern detected: ${urlObj.hostname}`);
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('URL security validation error:', error);
      return false;
    }
  }

  /**
   * Get certificate hash from server (for development/testing)
   * This is a placeholder - in production, you'd get this from your server admin
   * @param hostname - The hostname to get certificate for
   * @returns Promise<string> - The certificate hash
   */
  async getCertificateHash(hostname: string): Promise<string | null> {
    try {
      // In development, you might want to fetch this from a secure endpoint
      // For now, we'll return null to indicate manual configuration needed
      console.log(`Certificate hash for ${hostname} needs to be configured manually`);
      return null;
    } catch (error) {
      console.error('Error getting certificate hash:', error);
      return null;
    }
  }
}

export default CertificatePinningService.getInstance();




