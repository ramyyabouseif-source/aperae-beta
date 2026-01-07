import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Secure Storage Service with web fallback
 * - iOS/Android: Uses Expo SecureStore (native keychain/keystore)
 * - Web: Uses localStorage (less secure but functional for web browsers)
 */
export class SecureStorageService {
  // Web storage key prefix to avoid conflicts
  private static readonly WEB_STORAGE_PREFIX = 'pocketsomm_secure_';

  /**
   * Store an item securely
   * CRITICAL-2: Use sessionStorage instead of localStorage for better security (still XSS vulnerable but cleared on tab close)
   * TODO: Migrate to httpOnly cookies for production (requires backend changes)
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web: Use sessionStorage (cleared on tab close, still XSS vulnerable but better than localStorage)
        // TODO: Migrate to httpOnly cookies for production
        const storageKey = this.WEB_STORAGE_PREFIX + key;
        sessionStorage.setItem(storageKey, value);
      } else {
        // iOS/Android: Use Expo SecureStore
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error storing secure item:', error);
      throw error;
    }
  }
  
  /**
   * Retrieve an item
   * CRITICAL-2: Use sessionStorage instead of localStorage
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Web: Use sessionStorage with prefix
        const storageKey = this.WEB_STORAGE_PREFIX + key;
        return sessionStorage.getItem(storageKey);
      } else {
        // iOS/Android: Use Expo SecureStore
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }
  
  /**
   * Remove an item
   * CRITICAL-2: Use sessionStorage instead of localStorage
   */
  static async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Web: Use sessionStorage with prefix
        const storageKey = this.WEB_STORAGE_PREFIX + key;
        sessionStorage.removeItem(storageKey);
      } else {
        // iOS/Android: Use Expo SecureStore
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Error removing secure item:', error);
      throw error;
    }
  }
  
  /**
   * Check if an item exists
   * CRITICAL-2: Use sessionStorage instead of localStorage
   */
  static async hasItem(key: string): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web: Use sessionStorage with prefix
        const storageKey = this.WEB_STORAGE_PREFIX + key;
        return sessionStorage.getItem(storageKey) !== null;
      } else {
        // iOS/Android: Use Expo SecureStore
        const item = await SecureStore.getItemAsync(key);
        return item !== null;
      }
    } catch (error) {
      console.error('Error checking secure item:', error);
      return false;
    }
  }
}