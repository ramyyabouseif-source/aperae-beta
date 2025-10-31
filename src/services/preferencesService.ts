import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types/preferences';
import { WinePreferences } from '../types/wine';

const PREFERENCES_KEY = 'user_preferences';
const WINE_PREFERENCES_KEY = 'wine_preferences';

export class PreferencesService {
  static async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      console.log('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  static async getPreferences(): Promise<UserPreferences | null> {
    try {
      const preferences = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (preferences) {
        return JSON.parse(preferences);
      }
      return null;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  }

  static async clearPreferences(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFERENCES_KEY);
      console.log('Preferences cleared successfully');
    } catch (error) {
      console.error('Error clearing preferences:', error);
      throw error;
    }
  }

  static async updatePreference(key: keyof UserPreferences, value: any): Promise<void> {
    try {
      const currentPreferences = await this.getPreferences() || {};
      const updatedPreferences = { ...currentPreferences, [key]: value };
      await this.savePreferences(updatedPreferences);
    } catch (error) {
      console.error('Error updating preference:', error);
      throw error;
    }
  }

  // Wine Preferences methods
  static async saveWinePreferences(preferences: WinePreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(WINE_PREFERENCES_KEY, JSON.stringify(preferences));
      console.log('Wine preferences saved successfully');
    } catch (error) {
      console.error('Error saving wine preferences:', error);
      throw error;
    }
  }

  static async getWinePreferences(): Promise<WinePreferences | null> {
    try {
      const preferences = await AsyncStorage.getItem(WINE_PREFERENCES_KEY);
      if (preferences) {
        return JSON.parse(preferences);
      }
      return null;
    } catch (error) {
      console.error('Error loading wine preferences:', error);
      return null;
    }
  }

  static async clearWinePreferences(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WINE_PREFERENCES_KEY);
      console.log('Wine preferences cleared successfully');
    } catch (error) {
      console.error('Error clearing wine preferences:', error);
      throw error;
    }
  }
}