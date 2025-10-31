/**
 * Enhanced API Service with Rate Limiting, Retry Mechanisms, and Circuit Breaker
 * Provides robust API communication with automatic retry and failure handling
 */

interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

class EnhancedApiService {
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private circuitBreakerState: Map<string, {
    failures: number;
    lastFailureTime: number;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  }> = new Map();

  private rateLimitConfig: RateLimitConfig = {
    maxRequests: 100, // requests per window
    windowMs: 60000, // 1 minute
    blockDurationMs: 300000, // 5 minutes
  };

  private circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 30000, // 30 seconds
    monitoringPeriod: 60000, // 1 minute
  };

  private baseUrl: string;
  private defaultTimeout: number = 10000; // 10 seconds

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Makes an API request with rate limiting, retry logic, and circuit breaker
   */
  async request<T>(config: ApiRequestConfig): Promise<T> {
    const endpoint = this.extractEndpoint(config.url);
    
    // Check rate limiting
    if (this.isRateLimited(endpoint)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Check circuit breaker
    if (this.isCircuitBreakerOpen(endpoint)) {
      throw new Error('Service temporarily unavailable. Please try again later.');
    }

    // Make the request with retry logic
    return this.makeRequestWithRetry<T>(config, endpoint);
  }

  /**
   * Makes a request with automatic retry on failure
   */
  private async makeRequestWithRetry<T>(
    config: ApiRequestConfig,
    endpoint: string,
    attempt: number = 1
  ): Promise<T> {
    const maxRetries = config.retries || 3;
    const retryDelay = config.retryDelay || 1000;

    try {
      const response = await this.makeHttpRequest<T>(config);
      
      // Reset circuit breaker on success
      this.resetCircuitBreaker(endpoint);
      
      return response;
    } catch (error) {
      // Record failure for circuit breaker
      this.recordFailure(endpoint);

      if (attempt < maxRetries && this.isRetryableError(error)) {
        // Exponential backoff delay
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await this.delay(delay);
        
        return this.makeRequestWithRetry<T>(config, endpoint, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Makes the actual HTTP request
   */
  private async makeHttpRequest<T>(config: ApiRequestConfig): Promise<T> {
    const url = config.url.startsWith('http') ? config.url : `${this.baseUrl}${config.url}`;
    const timeout = config.timeout || this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Checks if the endpoint is rate limited
   */
  private isRateLimited(endpoint: string): boolean {
    const now = Date.now();
    const key = endpoint;
    const limit = this.rateLimitStore.get(key);

    if (!limit) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + this.rateLimitConfig.windowMs });
      return false;
    }

    if (now > limit.resetTime) {
      // Reset the counter
      this.rateLimitStore.set(key, { count: 1, resetTime: now + this.rateLimitConfig.windowMs });
      return false;
    }

    if (limit.count >= this.rateLimitConfig.maxRequests) {
      return true;
    }

    // Increment counter
    limit.count++;
    return false;
  }

  /**
   * Checks if the circuit breaker is open for the endpoint
   */
  private isCircuitBreakerOpen(endpoint: string): boolean {
    const state = this.circuitBreakerState.get(endpoint);
    
    if (!state) {
      this.circuitBreakerState.set(endpoint, {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED',
      });
      return false;
    }

    const now = Date.now();

    if (state.state === 'OPEN') {
      if (now - state.lastFailureTime > this.circuitBreakerConfig.recoveryTimeout) {
        // Move to half-open state
        state.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Records a failure for circuit breaker tracking
   */
  private recordFailure(endpoint: string): void {
    const state = this.circuitBreakerState.get(endpoint);
    
    if (!state) {
      this.circuitBreakerState.set(endpoint, {
        failures: 1,
        lastFailureTime: Date.now(),
        state: 'CLOSED',
      });
      return;
    }

    state.failures++;
    state.lastFailureTime = Date.now();

    if (state.failures >= this.circuitBreakerConfig.failureThreshold) {
      state.state = 'OPEN';
    }
  }

  /**
   * Resets the circuit breaker for the endpoint
   */
  private resetCircuitBreaker(endpoint: string): void {
    const state = this.circuitBreakerState.get(endpoint);
    
    if (state) {
      state.failures = 0;
      state.state = 'CLOSED';
    }
  }

  /**
   * Determines if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error.name === 'AbortError' || error.message?.includes('Network')) {
      return true;
    }

    // Server errors (5xx) are retryable
    if (error.message?.includes('HTTP 5')) {
      return true;
    }

    // Timeout errors are retryable
    if (error.message?.includes('timeout')) {
      return true;
    }

    return false;
  }

  /**
   * Extracts endpoint from URL for rate limiting
   */
  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  /**
   * Utility function to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets the current rate limit status for an endpoint
   */
  getRateLimitStatus(endpoint: string): {
    remaining: number;
    resetTime: number;
    isLimited: boolean;
  } {
    const limit = this.rateLimitStore.get(endpoint);
    const now = Date.now();

    if (!limit || now > limit.resetTime) {
      return {
        remaining: this.rateLimitConfig.maxRequests,
        resetTime: now + this.rateLimitConfig.windowMs,
        isLimited: false,
      };
    }

    return {
      remaining: Math.max(0, this.rateLimitConfig.maxRequests - limit.count),
      resetTime: limit.resetTime,
      isLimited: limit.count >= this.rateLimitConfig.maxRequests,
    };
  }

  /**
   * Gets the current circuit breaker status for an endpoint
   */
  getCircuitBreakerStatus(endpoint: string): {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failures: number;
    lastFailureTime: number;
  } {
    const state = this.circuitBreakerState.get(endpoint);
    
    if (!state) {
      return {
        state: 'CLOSED',
        failures: 0,
        lastFailureTime: 0,
      };
    }

    return {
      state: state.state,
      failures: state.failures,
      lastFailureTime: state.lastFailureTime,
    };
  }
}

// Create singleton instance
const apiService = new EnhancedApiService(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000');

export default apiService;
export { EnhancedApiService, ApiRequestConfig, RateLimitConfig, CircuitBreakerConfig };




