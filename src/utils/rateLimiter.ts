/**
 * Frontend Rate Limiter
 * HIGH-2: Prevents excessive API calls from the client side
 * 
 * This is a client-side rate limiter that complements server-side rate limiting.
 * It helps prevent accidental spam and provides better UX by showing errors immediately.
 * 
 * Uses AsyncStorage for persistence across app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private storageKey = 'aperae_rate_limits';
  
  /**
   * Load rate limit data from persistent storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        // Clean up old entries (older than 1 hour)
        for (const [key, timestamps] of Object.entries(data)) {
          const recent = (timestamps as number[]).filter((time: number) => now - time < 3600000);
          if (recent.length > 0) {
            this.requests.set(key, recent);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load rate limits from storage:', error);
    }
  }

  /**
   * Save rate limit data to persistent storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const data: Record<string, number[]> = {};
      this.requests.forEach((timestamps, key) => {
        data[key] = timestamps;
      });
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save rate limits to storage:', error);
    }
  }

  /**
   * Check if a request can be made based on rate limit rules
   * @param key - Unique key for the rate limit (e.g., 'wine-recommendation-pasta')
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request can be made, false if rate limit exceeded
   */
  async canMakeRequest(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
    // Load from storage on first call
    if (this.requests.size === 0) {
      await this.loadFromStorage();
    }

    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside window
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    // Save to storage (async, don't wait)
    this.saveToStorage().catch(() => {
      // Ignore storage errors
    });
    
    return true;
  }
  
  /**
   * Get the number of milliseconds until the next request can be made
   * @param key - Unique key for the rate limit
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Number of milliseconds to wait, or 0 if request can be made now
   */
  async getRetryAfter(key: string, maxRequests: number, windowMs: number): Promise<number> {
    // Load from storage if needed
    if (this.requests.size === 0) {
      await this.loadFromStorage();
    }

    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length < maxRequests) {
      return 0;
    }
    
    // Find the oldest request in the window
    const oldestRequest = recentRequests[0];
    return windowMs - (now - oldestRequest);
  }
  
  /**
   * Clear rate limit data for a specific key
   * @param key - Unique key for the rate limit
   */
  async clear(key: string): Promise<void> {
    this.requests.delete(key);
    await this.saveToStorage();
  }
  
  /**
   * Clear all rate limit data
   */
  async clearAll(): Promise<void> {
    this.requests.clear();
    await AsyncStorage.removeItem(this.storageKey);
  }
}

export const rateLimiter = new RateLimiter();

