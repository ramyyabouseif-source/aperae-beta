import { Platform } from 'react-native';

/**
 * Get the API base URL for the application
 * 
 * Priority order:
 * 1. Environment variable (EXPO_PUBLIC_API_URL) - explicit override
 * 2. Environment-based selection (EXPO_PUBLIC_ENV) - production/staging/development
 * 3. Localhost for development (default)
 * 
 * IMPORTANT: For development, use localhost instead of ngrok to avoid timeout issues.
 * ngrok free tier has a 30-second request timeout, which causes 503 errors for
 * long-running API calls (Claude API can take 55+ seconds).
 * 
 * @returns {string} The API base URL
 */
const getApiBaseUrl = (): string => {
  // Priority 1: Explicit API URL override (highest priority)
  const explicitUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();
  if (explicitUrl) {
    // Warn if using ngrok in development
    if (explicitUrl.includes('ngrok')) {
      console.warn(
        '⚠️ Using ngrok URL. Note: ngrok free tier has a 30-second timeout.\n' +
        'For long-running API calls (Claude API ~55s), use localhost instead.\n' +
        'See NGROK_TIMEOUT_LIMITATION.md for details.'
      );
    }
    return explicitUrl.endsWith('/api') ? explicitUrl : `${explicitUrl.replace(/\/$/, '')}/api`;
  }
  
  // Priority 2: Environment-based selection
  const env = (process.env.EXPO_PUBLIC_ENV || '').toLowerCase().trim();
  
  if (env === 'production') {
    // Production: use api.aperae.com
    return 'https://api.aperae.com/api';
  }
  
  if (env === 'staging') {
    // Staging: use staging-api.aperae.com
    return 'https://staging-api.aperae.com/api';
  }
  
  // Priority 3: Development (default) - use production API for physical devices
  // Physical devices can't access localhost, so default to production API
  // For local development with simulators, set EXPO_PUBLIC_API_URL=http://localhost:3001/api
  const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    if (Platform.OS === 'web') {
      // Web can use localhost
      return 'http://localhost:3001/api';
    }
    // For physical devices, use production API (localhost doesn't work)
    // For simulators/emulators, you can override with EXPO_PUBLIC_API_URL
    return 'https://api.aperae.com/api';
  }

  // Fallback: default to production API
  if (Platform.OS === 'web') {
    return 'http://localhost:3001/api';
  }
  return 'https://api.aperae.com/api';
};

export { getApiBaseUrl };

// Network security configuration
export const NETWORK_CONFIG = {
  timeout: 90000, // 90 seconds - increased to handle Claude API response times (55-60s)
  retries: 3,
  retryDelay: 1000,
  // Add certificate pinning in production
  validateSSL: true,
  // Add request signing in production
  signRequests: false
};