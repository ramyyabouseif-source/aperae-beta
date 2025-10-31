import { Platform } from 'react-native';
import certificatePinningService from './certificatePinningService';

/**
 * Secure HTTP Client with Certificate Pinning
 * Provides secure API communication with certificate validation
 */
class SecureHttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'PocketSomm/1.0.0',
      // Add CSRF-friendly header for state-changing requests
      'X-Requested-With': 'PocketSomm',
    };
  }

  /**
   * Make a secure HTTP request with certificate pinning
   * @param endpoint - The API endpoint
   * @param options - Request options
   * @returns Promise<any> - The response data
   */
  async request<T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      timeout = this.timeout,
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    
    // Validate URL security
    if (!certificatePinningService.validateUrlSecurity(url)) {
      throw new Error('Insecure URL detected - request blocked for security');
    }

    // Prepare request configuration
    const requestConfig: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      timeout,
    };

    // Add body for POST/PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      console.log(`Making secure request to: ${url}`);
      
      // Make the request
      const response = await fetch(url, requestConfig);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse response
      const data = await response.json();
      
      console.log(`Secure request successful: ${url}`);
      return data;
      
    } catch (error) {
      console.error(`Secure request failed: ${url}`, error);
      
      // Enhanced error handling
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network connection failed - please check your internet connection');
      }
      
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error('Request timeout - please try again');
      }
      
      throw error;
    }
  }

  /**
   * Make a GET request
   * @param endpoint - The API endpoint
   * @param headers - Optional headers
   * @returns Promise<T> - The response data
   */
  async get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * Make a POST request
   * @param endpoint - The API endpoint
   * @param body - Request body
   * @param headers - Optional headers
   * @returns Promise<T> - The response data
   */
  async post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * Make a PUT request
   * @param endpoint - The API endpoint
   * @param body - Request body
   * @param headers - Optional headers
   * @returns Promise<T> - The response data
   */
  async put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * Make a DELETE request
   * @param endpoint - The API endpoint
   * @param headers - Optional headers
   * @returns Promise<T> - The response data
   */
  async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * Set default headers
   * @param headers - Headers to set
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Set authorization header
   * @param token - The authorization token
   */
  setAuthorization(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  removeAuthorization(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Get current base URL
   * @returns string - The base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Set new base URL
   * @param baseURL - The new base URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * Test connection to the API
   * @returns Promise<boolean> - True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default SecureHttpClient;



