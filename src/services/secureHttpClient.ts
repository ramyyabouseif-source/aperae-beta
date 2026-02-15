import { Platform } from 'react-native';
import certificatePinningService from './certificatePinningService';
import { getValidAccessToken } from '../utils/tokenValidator';

/**
 * Secure HTTP Client with Certificate Pinning
 * Provides secure API communication with certificate validation
 */
class SecureHttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 90000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Aperae/1.0.0',
      // Add CSRF-friendly header for state-changing requests
      'X-Requested-With': 'Aperae',
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
    console.log(`[SecureHttpClient] Validating URL security for: ${url}`);
    const isUrlSecure = certificatePinningService.validateUrlSecurity(url);
    console.log(`[SecureHttpClient] URL security validation result: ${isUrlSecure}`);
    
    if (!isUrlSecure) {
      const errorMsg = `Insecure URL detected - request blocked for security: ${url}`;
      console.error(`[SecureHttpClient] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Prepare request configuration
    const requestConfig: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      // Note: fetch() doesn't support timeout directly, we'll use AbortController
    };

    // Add body for POST/PUT requests
    if (body && (method === 'POST' || method === 'PUT')) {
      requestConfig.body = JSON.stringify(body);
    }

    // Set up timeout using AbortController (fetch doesn't support timeout option directly)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Add abort signal to request config
    requestConfig.signal = controller.signal;

    try {
      // HIGH-4: Check if access token is valid before making request
      if (this.defaultHeaders['Authorization']) {
        const token = this.defaultHeaders['Authorization'].replace('Bearer ', '');
        const validToken = await getValidAccessToken();
        if (!validToken || validToken !== token) {
          console.warn('[SecureHttpClient] Access token expired, may need refresh');
          // Don't throw here - let the API return 401 so the app can handle refresh
        }
      }

      console.log(`Making secure request to: ${url}`);
      
      // Make the request
      const response = await fetch(url, requestConfig);
      
      clearTimeout(timeoutId);
      
      // LOW-4: Extract request ID from response headers
      const requestId = response.headers.get('X-Request-ID');
      
      // Check if response is ok
      if (!response.ok) {
        // Try to parse error response body for more details
        let errorMessage = `${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = `HTTP ${response.status}: ${errorData.error}`;
            if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
              const detailMessages = errorData.details.map((d: any) => d.msg || d.message || JSON.stringify(d)).join('; ');
              errorMessage += ` - ${detailMessages}`;
            }
          } else if (errorData.message) {
            errorMessage = `HTTP ${response.status}: ${errorData.message}`;
          }
          
          // LOW-4: Include request ID in error message if available
          if (requestId || errorData.requestId) {
            errorMessage += ` (Request ID: ${requestId || errorData.requestId})`;
          }
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          if (requestId) {
            errorMessage += ` (Request ID: ${requestId})`;
          }
        }
        throw new Error(errorMessage);
      }

      // Parse response
      const data = await response.json();
      
      console.log(`Secure request successful: ${url}`);
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Secure request failed: ${url}`, error);
      
      // Enhanced error handling
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network connection failed - please check your internet connection and ensure you are on the same WiFi network');
      }
      
      if (error instanceof TypeError && error.message.includes('aborted') || error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout / 1000} seconds - please check your network connection`);
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
   * POST that consumes NDJSON stream (heartbeat + result). Used for /recommendations
   * to prevent proxy timeout - server sends heartbeats every 10s during long Claude call.
   * Falls back to regular JSON parse if Content-Type is not application/x-ndjson (e.g. mock mode).
   */
  async postStreamingNDJSON<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isUrlSecure = certificatePinningService.validateUrlSecurity(url);
    if (!isUrlSecure) {
      throw new Error(`Insecure URL detected - request blocked: ${url}`);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const requestConfig: RequestInit = {
      method: 'POST',
      headers: { ...this.defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    };
    try {
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `HTTP ${response.status}`);
      }
      const ct = response.headers.get('Content-Type') || '';
      if (ct.includes('ndjson')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const obj = JSON.parse(line);
              if (obj.type === 'result' && obj.data !== undefined) return obj.data as T;
              if (obj.type === 'error') throw new Error(obj.error || 'Server error');
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
        if (buffer.trim()) {
          const obj = JSON.parse(buffer);
          if (obj.type === 'result' && obj.data !== undefined) return obj.data as T;
          if (obj.type === 'error') throw new Error(obj.error || 'Server error');
        }
        throw new Error('Incomplete NDJSON response');
      }
      return (await response.json()) as T;
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof Error) {
        if (e.name === 'AbortError') throw new Error(`Request timed out after ${this.timeout / 1000} seconds`);
        if (e.message.includes('timeout')) throw new Error('Request timeout - please try again');
      }
      throw e;
    }
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



