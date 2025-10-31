import { getApiBaseUrl } from '../utils/api';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  preferences?: any;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  requestId: string;
}

export interface RefreshResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  requestId: string;
}

export class AuthService {
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;
  private static user: User | null = null;

  // Register new user
  static async register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store tokens and user data
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = data.user;
      
      // Store in secure storage
      await this.storeTokens(data.accessToken, data.refreshToken);
      await this.storeUser(data.user);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store tokens and user data
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = data.user;
      
      // Store in secure storage
      await this.storeTokens(data.accessToken, data.refreshToken);
      await this.storeUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        const API_BASE_URL = getApiBaseUrl();
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      
      await this.clearStoredData();
    }
  }

  // Refresh access token
  static async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        return false;
      }

      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: RefreshResponse = await response.json();
      
      // Update tokens
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      // Store new tokens
      await this.storeTokens(data.accessToken, data.refreshToken);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await this.logout();
      return false;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      if (this.user) {
        return this.user;
      }

      if (!this.accessToken) {
        return null;
      }

      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return await this.getCurrentUser(); // Retry with new token
          }
        }
        return null;
      }

      const data = await response.json();
      this.user = data.user;
      await this.storeUser(data.user);
      
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.accessToken !== null && this.user !== null;
  }

  // Get access token
  static getAccessToken(): string | null {
    return this.accessToken;
  }

  // Get current user
  static getCurrentUserSync(): User | null {
    return this.user;
  }

  // Initialize auth state from storage
  static async initializeAuth(): Promise<void> {
    try {
      const storedTokens = await this.getStoredTokens();
      const storedUser = await this.getStoredUser();
      
      if (storedTokens && storedUser) {
        this.accessToken = storedTokens.accessToken;
        this.refreshToken = storedTokens.refreshToken;
        this.user = storedUser;
        
        // Verify token is still valid
        const currentUser = await this.getCurrentUser();
        if (!currentUser) {
          // Token is invalid, clear everything
          await this.logout();
        }
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      await this.clearStoredData();
    }
  }

  // Store tokens in secure storage
  private static async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // Use SecureStore for sensitive data
      const SecureStore = require('expo-secure-store').default;
      await SecureStore.setItemAsync('auth_access_token', accessToken);
      await SecureStore.setItemAsync('auth_refresh_token', refreshToken);
    } catch (error) {
      console.error('Store tokens error:', error);
      // Fallback to AsyncStorage if SecureStore fails
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('auth_tokens', JSON.stringify({
        accessToken,
        refreshToken
      }));
    }
  }

  // Get stored tokens
  private static async getStoredTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      // Try SecureStore first
      const SecureStore = require('expo-secure-store').default;
      const accessToken = await SecureStore.getItemAsync('auth_access_token');
      const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');
      
      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      
      // Fallback to AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const stored = await AsyncStorage.getItem('auth_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Get stored tokens error:', error);
      return null;
    }
  }

  // Store user data
  private static async storeUser(user: User): Promise<void> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Store user error:', error);
    }
  }

  // Get stored user data
  private static async getStoredUser(): Promise<User | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const stored = await AsyncStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Get stored user error:', error);
      return null;
    }
  }

  // Clear all stored auth data
  private static async clearStoredData(): Promise<void> {
    try {
      // Clear from SecureStore
      const SecureStore = require('expo-secure-store').default;
      await SecureStore.deleteItemAsync('auth_access_token');
      await SecureStore.deleteItemAsync('auth_refresh_token');
      
      // Clear from AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.multiRemove(['auth_tokens', 'auth_user']);
    } catch (error) {
      console.error('Clear stored data error:', error);
    }
  }
}