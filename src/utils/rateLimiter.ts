/**
 * Frontend Rate Limiter
 * HIGH-2: Prevents excessive API calls from the client side
 * 
 * This is a client-side rate limiter that complements server-side rate limiting.
 * It helps prevent accidental spam and provides better UX by showing errors immediately.
 */

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  /**
   * Check if a request can be made based on rate limit rules
   * @param key - Unique key for the rate limit (e.g., 'wine-recommendation-pasta')
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request can be made, false if rate limit exceeded
   */
  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside window
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
  
  /**
   * Get the number of milliseconds until the next request can be made
   * @param key - Unique key for the rate limit
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Number of milliseconds to wait, or 0 if request can be made now
   */
  getRetryAfter(key: string, maxRequests: number, windowMs: number): number {
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
  clear(key: string): void {
    this.requests.delete(key);
  }
  
  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

