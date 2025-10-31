import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteWine } from '../types/wine';

const FAVORITES_KEY = 'user_favorites';

export class FavoritesService {
  static async addToFavorites(wine: FavoriteWine): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const favoriteWine: FavoriteWine = {
        ...wine,
        id: wine.id || this.generateId(),
        addedAt: new Date().toISOString()
      };
      
      // Check if already exists
      const exists = favorites.some(fav => 
        fav.wineName === favoriteWine.wineName && 
        fav.producer === favoriteWine.producer && 
        fav.vintage === favoriteWine.vintage
      );
      
      if (!exists) {
        favorites.push(favoriteWine);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        console.log('Wine added to favorites successfully');
      } else {
        throw new Error('Wine is already in favorites');
      }
    } catch (error) {
      console.error('Error adding wine to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(wineIdOrWine: string | FavoriteWine): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      let updatedFavorites: FavoriteWine[];
      
      if (typeof wineIdOrWine === 'string') {
        // Remove by ID
        updatedFavorites = favorites.filter(fav => fav.id !== wineIdOrWine);
      } else {
        // Remove by wine object - use ID if available, otherwise match by name/producer/vintage
        const wine = wineIdOrWine;
        updatedFavorites = favorites.filter(fav => {
          if (fav.id && wine.id) {
            return fav.id !== wine.id;
          }
          // Fallback to matching by wine details
          return !(fav.wineName === wine.wineName && 
                  fav.producer === wine.producer && 
                  fav.vintage === wine.vintage);
        });
      }
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      console.log('Wine removed from favorites successfully');
    } catch (error) {
      console.error('Error removing wine from favorites:', error);
      throw error;
    }
  }

  static async getFavorites(): Promise<FavoriteWine[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static async clearFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      console.log('Favorites cleared successfully');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  }

  static async isFavorite(wine: { wineName: string; producer: string; vintage: string }): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => 
        fav.wineName === wine.wineName && 
        fav.producer === wine.producer && 
        fav.vintage === wine.vintage
      );
    } catch (error) {
      console.error('Error checking if wine is favorite:', error);
      return false;
    }
  }

  static async getFavoriteById(wineId: string): Promise<FavoriteWine | null> {
    try {
      const favorites = await this.getFavorites();
      return favorites.find(fav => fav.id === wineId) || null;
    } catch (error) {
      console.error('Error getting favorite by ID:', error);
      return null;
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

