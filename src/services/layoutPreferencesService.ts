import AsyncStorage from '@react-native-async-storage/async-storage';

const LAYOUT_PREFERENCE_KEY = 'favorites_layout_preference';

export type LayoutType = 'grid' | 'list';

export class LayoutPreferencesService {
  /**
   * Save layout preference
   */
  static async saveLayoutPreference(layout: LayoutType): Promise<void> {
    try {
      await AsyncStorage.setItem(LAYOUT_PREFERENCE_KEY, layout);
      console.log('Layout preference saved:', layout);
    } catch (error) {
      console.error('Error saving layout preference:', error);
      throw error;
    }
  }

  /**
   * Get saved layout preference
   */
  static async getLayoutPreference(): Promise<LayoutType> {
    try {
      const preference = await AsyncStorage.getItem(LAYOUT_PREFERENCE_KEY);
      if (preference && this.isValidLayoutType(preference)) {
        return preference;
      }
      // Default to grid if no preference saved
      return 'grid';
    } catch (error) {
      console.error('Error loading layout preference:', error);
      return 'grid'; // Default to grid on error
    }
  }

  /**
   * Check if layout type is valid
   */
  static isValidLayoutType(layout: string): layout is LayoutType {
    return layout === 'grid' || layout === 'list';
  }

  /**
   * Clear layout preference (reset to default)
   */
  static async clearLayoutPreference(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAYOUT_PREFERENCE_KEY);
      console.log('Layout preference cleared');
    } catch (error) {
      console.error('Error clearing layout preference:', error);
      throw error;
    }
  }
}

