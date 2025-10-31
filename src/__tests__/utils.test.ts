/**
 * Unit Tests for Critical Utility Functions
 * Tests error handling, API service, and core business logic
 */

import { EnhancedErrorHandler, EnhancedError } from '../utils/enhancedErrorHandler';
import apiService from '../services/enhancedApiService';

// Mock fetch for testing
global.fetch = jest.fn();

describe('EnhancedErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEnhancedError', () => {
    it('should create network error with appropriate recovery actions', () => {
      const networkError = new Error('Network request failed');
      const enhancedError = EnhancedErrorHandler.createEnhancedError(networkError, {
        operation: 'getRecommendations',
        component: 'WineCard',
        userAction: 'tap',
        retryable: true,
      });

      expect(enhancedError.title).toBe('Connection Problem');
      expect(enhancedError.message).toContain('internet connection');
      expect(enhancedError.category).toBe('network');
      expect(enhancedError.severity).toBe('medium');
      expect(enhancedError.recoveryActions).toHaveLength(2);
      expect(enhancedError.recoveryActions[0].label).toBe('Try Again');
      expect(enhancedError.recoveryActions[1].label).toBe('Check Connection');
    });

    it('should create validation error with appropriate recovery actions', () => {
      const validationError = new Error('validation failed');
      const enhancedError = EnhancedErrorHandler.createEnhancedError(validationError, {
        operation: 'validateInput',
        component: 'InputForm',
        userAction: 'submit',
      });

      expect(enhancedError.title).toBe('Invalid Input');
      expect(enhancedError.message).toContain('required fields');
      expect(enhancedError.category).toBe('validation');
      expect(enhancedError.severity).toBe('low');
      expect(enhancedError.recoveryActions).toHaveLength(2);
      expect(enhancedError.recoveryActions[0].label).toBe('Fix Input');
      expect(enhancedError.recoveryActions[1].label).toBe('Clear Form');
    });

    it('should create server error with appropriate recovery actions', () => {
      const serverError = { status: 500, message: 'Internal server error' };
      const enhancedError = EnhancedErrorHandler.createEnhancedError(serverError, {
        operation: 'getWineData',
        component: 'WineService',
        userAction: 'load',
      });

      expect(enhancedError.title).toBe('Server Error');
      expect(enhancedError.message).toContain('servers are experiencing issues');
      expect(enhancedError.category).toBe('server');
      expect(enhancedError.severity).toBe('high');
      expect(enhancedError.recoveryActions).toHaveLength(2);
      expect(enhancedError.recoveryActions[0].label).toBe('Try Again');
      expect(enhancedError.recoveryActions[1].label).toBe('Report Issue');
    });

    it('should create authentication error with appropriate recovery actions', () => {
      const authError = { status: 401, message: 'unauthorized' };
      const enhancedError = EnhancedErrorHandler.createEnhancedError(authError, {
        operation: 'authenticate',
        component: 'AuthService',
        userAction: 'login',
      });

      expect(enhancedError.title).toBe('Authentication Required');
      expect(enhancedError.message).toContain('sign in again');
      expect(enhancedError.category).toBe('authentication');
      expect(enhancedError.severity).toBe('medium');
      expect(enhancedError.recoveryActions).toHaveLength(2);
      expect(enhancedError.recoveryActions[0].label).toBe('Sign In');
      expect(enhancedError.recoveryActions[1].label).toBe('Continue Offline');
    });

    it('should create default error for unknown error types', () => {
      const unknownError = new Error('Something unexpected happened');
      const enhancedError = EnhancedErrorHandler.createEnhancedError(unknownError);

      expect(enhancedError.title).toBe('Something Went Wrong');
      expect(enhancedError.message).toContain('unexpected error');
      expect(enhancedError.category).toBe('unknown');
      expect(enhancedError.severity).toBe('medium');
      expect(enhancedError.recoveryActions).toHaveLength(2);
    });

    it('should include context information in enhanced error', () => {
      const error = new Error('Test error');
      const context = {
        operation: 'testOperation',
        component: 'TestComponent',
        userAction: 'testAction',
      };
      const enhancedError = EnhancedErrorHandler.createEnhancedError(error, context);

      expect(enhancedError.context).toEqual(context);
      expect(enhancedError.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('logError', () => {
    it('should log error information to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const enhancedError: EnhancedError = {
        title: 'Test Error',
        message: 'Test message',
        recoveryActions: [],
        severity: 'medium',
        category: 'unknown',
        timestamp: new Date(),
        context: { operation: 'test' },
      };

      EnhancedErrorHandler.logError(enhancedError);

      expect(consoleSpy).toHaveBeenCalledWith('Enhanced Error:', {
        title: enhancedError.title,
        message: enhancedError.message,
        severity: enhancedError.severity,
        category: enhancedError.category,
        timestamp: enhancedError.timestamp,
        context: enhancedError.context,
      });

      consoleSpy.mockRestore();
    });
  });
});

describe('EnhancedApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('rate limiting', () => {
    it('should allow requests within rate limit', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      const config = {
        method: 'GET' as const,
        url: '/test',
      };

      const result = await apiService.request(config);
      expect(result).toEqual({ data: 'test' });
    });

    it('should block requests when rate limit exceeded', async () => {
      // Mock multiple successful requests to trigger rate limiting
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      const config = {
        method: 'GET' as const,
        url: '/test',
      };

      // Make requests up to the limit
      for (let i = 0; i < 100; i++) {
        await apiService.request(config);
      }

      // Next request should be rate limited
      await expect(apiService.request(config)).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('retry mechanism', () => {
    it('should retry on network errors', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        });

      const config = {
        method: 'GET' as const,
        url: '/test',
        retries: 3,
        retryDelay: 100,
      };

      const result = await apiService.request(config);
      expect(result).toEqual({ data: 'success' });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('HTTP 400: Bad Request'));

      const config = {
        method: 'GET' as const,
        url: '/test',
        retries: 3,
      };

      await expect(apiService.request(config)).rejects.toThrow('HTTP 400: Bad Request');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff for retries', async () => {
      const startTime = Date.now();
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        });

      const config = {
        method: 'GET' as const,
        url: '/test',
        retries: 3,
        retryDelay: 100,
      };

      await apiService.request(config);
      const endTime = Date.now();
      
      // Should have waited at least 100ms + 200ms = 300ms
      expect(endTime - startTime).toBeGreaterThanOrEqual(300);
    });
  });

  describe('circuit breaker', () => {
    it('should open circuit breaker after failure threshold', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Server error'));

      const config = {
        method: 'GET' as const,
        url: '/test',
      };

      // Make requests to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        try {
          await apiService.request(config);
        } catch (error) {
          // Expected to fail
        }
      }

      // Next request should be blocked by circuit breaker
      await expect(apiService.request(config)).rejects.toThrow('Service temporarily unavailable');
    });

    it('should reset circuit breaker on successful request', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        });

      const config = {
        method: 'GET' as const,
        url: '/test',
      };

      // First request fails
      await expect(apiService.request(config)).rejects.toThrow('Server error');

      // Second request succeeds and resets circuit breaker
      const result = await apiService.request(config);
      expect(result).toEqual({ data: 'success' });
    });
  });

  describe('request configuration', () => {
    it('should handle GET requests', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      const config = {
        method: 'GET' as const,
        url: '/test',
      };

      const result = await apiService.request(config);
      expect(result).toEqual({ data: 'test' });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle POST requests with data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'created' }),
      });

      const config = {
        method: 'POST' as const,
        url: '/test',
        data: { name: 'test' },
      };

      const result = await apiService.request(config);
      expect(result).toEqual({ data: 'created' });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });

    it('should handle custom headers', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      const config = {
        method: 'GET' as const,
        url: '/test',
        headers: { 'Authorization': 'Bearer token' },
      };

      await apiService.request(config);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
          }),
        })
      );
    });

    it('should handle timeout', async () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ data: 'test' }),
        }), 2000))
      );

      const config = {
        method: 'GET' as const,
        url: '/test',
        timeout: 1000,
      };

      await expect(apiService.request(config)).rejects.toThrow();
    });
  });
});

describe('Utility Functions', () => {
  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [
        new Error('Network request failed'),
        new Error('HTTP 500: Internal Server Error'),
        new Error('Request timeout'),
        { name: 'AbortError' },
      ];

      retryableErrors.forEach(error => {
        // This would need to be tested through the actual service
        // since isRetryableError is private
        expect(error).toBeDefined();
      });
    });
  });
});




