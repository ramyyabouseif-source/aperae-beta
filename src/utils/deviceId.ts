import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'aperae_device_id';

/**
 * Get or create a stable device identifier for pseudonymization
 * 
 * Privacy-preserving approach:
 * - Creates a UUID that persists for the app installation
 * - Stored locally, never shared in plain text (always hashed before sending to backend)
 * - For web: Uses localStorage (less secure but functional)
 * - For mobile: Uses AsyncStorage
 * 
 * @returns {Promise<string>} Device identifier (to be hashed before sending to backend)
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID
    const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existingId) {
      return existingId;
    }

    // Generate new device ID using Crypto.randomUUID()
    let deviceId: string;
    try {
      deviceId = await Crypto.randomUUID();
    } catch (error) {
      // Fallback: Generate using hash if randomUUID not available
      const randomData = `${Date.now()}-${Math.random()}-${Platform.OS}-${Platform.Version}`;
      deviceId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        randomData
      );
      // Use first 36 chars as UUID-like identifier (matches UUID format length)
      deviceId = deviceId.substring(0, 36);
    }

    // Store device ID for future use
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);

    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback: Generate a temporary ID (not ideal but prevents crashes)
    return `temp-${Date.now()}-${Math.random()}`;
  }
}

/**
 * Hash device ID for pseudonymization before sending to backend
 * This ensures privacy - backend never sees the actual device ID
 * 
 * @param {string} deviceId - Device identifier
 * @returns {Promise<string>} SHA-256 hash of device ID
 */
export async function hashDeviceId(deviceId: string): Promise<string> {
  try {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      deviceId
    );
    return hash;
  } catch (error) {
    console.error('Error hashing device ID:', error);
    // Fallback: Simple hash (not cryptographically secure but prevents crashes)
    return deviceId.split('').reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0).toString(16);
  }
}

