import * as SecureStore from 'expo-secure-store';

export class SecureStorageService {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing secure item:', error);
      throw error;
    }
  }
  
  static async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }
  
  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing secure item:', error);
      throw error;
    }
  }
  
  static async hasItem(key: string): Promise<boolean> {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item !== null;
    } catch (error) {
      console.error('Error checking secure item:', error);
      return false;
    }
  }
}