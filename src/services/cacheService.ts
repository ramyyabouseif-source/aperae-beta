import AsyncStorage from '@react-native-async-storage/async-storage';
import encryptionService from './encryptionService';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  encrypted?: boolean; // Flag to indicate if data is encrypted
  hash?: string; // Hash for integrity checking
}

interface EncryptedCacheEntry {
  encrypted: string;
  hash: string;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static readonly CACHE_PREFIX = 'wine_recommendations_';
  private static readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  static async get(key: string): Promise<any | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
      const entry = JSON.parse(cached);
      const now = Date.now();
    
    if (now - entry.timestamp > entry.ttl) {
      await this.remove(key);
      return null;
    }
    
      return entry.data;
  }   catch (error) {
      console.error('Cache get error:', error);
      return null;
  }
}

  static async set(key: string, data: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
    
    // Use simple JSON storage for now
    const entry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
      console.log(`Cache set (simple): ${key}`);
  }   catch (error) {
      console.error('Cache set error:', error);
  }
}

  static async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  static generateKey(dish: string, preferences?: any): string {
    const prefString = preferences ? JSON.stringify(preferences) : '';
    return btoa(dish + prefString).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Clear all cached data (useful for security/logout)
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Cleared ${cacheKeys.length} cached entries`);
      }
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{ totalEntries: number; encryptedEntries: number; legacyEntries: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let encryptedEntries = 0;
      let legacyEntries = 0;
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          if (encryptionService.isEncrypted(cached)) {
            encryptedEntries++;
          } else {
            legacyEntries++;
          }
        }
      }
      
      return {
        totalEntries: cacheKeys.length,
        encryptedEntries,
        legacyEntries
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { totalEntries: 0, encryptedEntries: 0, legacyEntries: 0 };
    }
  }

  /**
   * Migrate legacy unencrypted cache entries to encrypted format
   */
  static async migrateToEncrypted(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let migratedCount = 0;
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached && !encryptionService.isEncrypted(cached)) {
          // This is a legacy entry, migrate it
          const entry: CacheEntry = JSON.parse(cached);
          
          // Re-encrypt the data
          await this.set(key.replace(this.CACHE_PREFIX, ''), entry.data, entry.ttl);
          migratedCount++;
        }
      }
      
      if (migratedCount > 0) {
        console.log(`Migrated ${migratedCount} legacy cache entries to encrypted format`);
      }
    } catch (error) {
      console.error('Cache migration error:', error);
    }
  }
}