import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteWine } from '../types/wine';

const FAVORITES_KEY = 'favorite_wines';

export class StorageService {
  static async getFavorites(): Promise<FavoriteWine[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static async addFavorite(wine: FavoriteWine): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const newFavorite = {
        ...wine,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString(),
      };
      
      favorites.push(newFavorite);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  static async removeFavorite(wineId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(wine => wine.id !== wineId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  static async isFavorite(wineId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(wine => wine.id === wineId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
}