/**
 * API Health Check Utility
 * LOW-5: Provides health check functionality for the frontend
 */

import { getApiBaseUrl } from './api';

export interface HealthCheckResult {
  healthy: boolean;
  status?: string;
  timestamp?: string;
  dependencies?: {
    database?: { status: string; message: string };
    anthropic?: { status: string; message: string };
    googleVision?: { status: string; message: string };
  };
  error?: string;
}

/**
 * Check if the API is healthy
 * @returns Promise resolving to health check result
 */
export async function checkApiHealth(): Promise<HealthCheckResult> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout for health check (5 seconds)
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        healthy: false,
        status: 'unhealthy',
        error: `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    return {
      healthy: data.status === 'healthy',
      status: data.status,
      dependencies: data.dependencies,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      healthy: false,
      status: 'unreachable',
      error: error.message || 'Failed to connect to API',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check if API is ready (all dependencies healthy)
 * @returns Promise resolving to true if ready, false otherwise
 */
export async function isApiReady(): Promise<boolean> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/ready`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'ready';
  } catch (error) {
    return false;
  }
}

