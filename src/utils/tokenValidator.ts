/**
 * JWT Token Validator
 * HIGH-4: Validates JWT token expiration before making API requests
 * Prevents unnecessary 401 errors by checking expiration client-side
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Decode JWT token without verification (just to check expiration)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
function decodeJWT(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    // Base64 decode
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is valid (not expired)
 * @param token - JWT token string
 * @param bufferSeconds - Buffer time in seconds before expiration (default: 60)
 * @returns True if token is valid and not expired
 */
export function isTokenValid(token: string | null, bufferSeconds: number = 60): boolean {
  if (!token) {
    return false;
  }

  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const exp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const bufferMs = bufferSeconds * 1000;

    // Consider token expired if less than buffer time remaining
    return exp > (now + bufferMs);
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Get access token from secure storage and validate it
 * @returns Valid access token or null
 */
export async function getValidAccessToken(): Promise<string | null> {
  try {
    let token: string | null = null;

    if (Platform.OS === 'web') {
      // Web: Use sessionStorage
      token = sessionStorage.getItem('aperae_secure_auth_access_token');
    } else {
      // iOS/Android: Use SecureStore
      token = await SecureStore.getItemAsync('auth_access_token');
    }

    if (!token) {
      return null;
    }

    // Check if token is valid
    if (isTokenValid(token)) {
      return token;
    }

    // Token is expired or invalid
    return null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Get token expiration time
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if invalid
 */
export function getTokenExpiration(token: string | null): number | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
}

