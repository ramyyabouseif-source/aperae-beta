import { Platform } from 'react-native';

const getApiBaseUrl = (): string => {
  // Prefer runtime-configured URL
  const envUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim();
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }

  // Sensible defaults per platform
  if (Platform.OS === 'web') {
    return 'http://localhost:3001/api';
  }
  // Mobile default: require manual config; fall back to localhost for emulators
  return 'http://localhost:3001/api';
};

export { getApiBaseUrl };

// Network security configuration
export const NETWORK_CONFIG = {
  timeout: 30000, // 30 seconds - more reasonable for ngrok tunnels
  retries: 3,
  retryDelay: 1000,
  // Add certificate pinning in production
  validateSSL: true,
  // Add request signing in production
  signRequests: false
};