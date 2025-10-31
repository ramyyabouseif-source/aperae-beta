import { FavoritesService } from '../favoritesService';
import { FavoriteWine } from '../../types/wine';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('FavoritesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockWine: FavoriteWine = {
    id: 'test-id',
    wineName: 'Test Wine',
    producer: 'Test Producer',
    vintage: '2020',
    pricePoint: '$50',
    rationale: 'Test rationale',
    tastingNotes: 'Test tasting notes',
    servingGuidance: 'Test serving guidance',
    confidenceScore: 95,
    expertRating: '95 (Wine Spectator)',
    retailerSuggestion: 'Test retailer',
    image: 'test-image.jpg',
    storytellingElements: 'Test storytelling',
    addedAt: '2024-01-01T00:00:00.000Z',
  };

  describe('addToFavorites', () => {
    it('should add a wine to favorites successfully', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await FavoritesService.addToFavorites(mockWine);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user_favorites');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_favorites',
        JSON.stringify([{ ...mockWine, id: expect.any(String), addedAt: expect.any(String) }])
      );
    });

    it('should not add duplicate wines', async () => {
      const existingFavorites = [mockWine];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingFavorites));

      await expect(FavoritesService.addToFavorites(mockWine)).rejects.toThrow(
        'Wine is already in favorites'
      );

      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle storage errors', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await expect(FavoritesService.addToFavorites(mockWine)).rejects.toThrow('Storage error');
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove a wine from favorites successfully', async () => {
      const existingFavorites = [mockWine, { ...mockWine, id: 'other-id' }];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingFavorites));
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await FavoritesService.removeFromFavorites('test-id');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_favorites',
        JSON.stringify([{ ...mockWine, id: 'other-id' }])
      );
    });

    it('should handle storage errors', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await expect(FavoritesService.removeFromFavorites('test-id')).rejects.toThrow('Storage error');
    });
  });

  describe('getFavorites', () => {
    it('should return favorites successfully', async () => {
      const favorites = [mockWine];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(favorites));

      const result = await FavoritesService.getFavorites();

      expect(result).toEqual(favorites);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user_favorites');
    });

    it('should return empty array when no favorites exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await FavoritesService.getFavorites();

      expect(result).toEqual([]);
    });

    it('should handle storage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await FavoritesService.getFavorites();

      expect(result).toEqual([]);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites successfully', async () => {
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      await FavoritesService.clearFavorites();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_favorites');
    });

    it('should handle storage errors', async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(FavoritesService.clearFavorites()).rejects.toThrow('Storage error');
    });
  });

  describe('isFavorite', () => {
    it('should return true if wine is in favorites', async () => {
      const favorites = [mockWine];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(favorites));

      const result = await FavoritesService.isFavorite({
        wineName: 'Test Wine',
        producer: 'Test Producer',
        vintage: '2020',
      });

      expect(result).toBe(true);
    });

    it('should return false if wine is not in favorites', async () => {
      const favorites = [mockWine];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(favorites));

      const result = await FavoritesService.isFavorite({
        wineName: 'Different Wine',
        producer: 'Different Producer',
        vintage: '2021',
      });

      expect(result).toBe(false);
    });

    it('should handle storage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await FavoritesService.isFavorite({
        wineName: 'Test Wine',
        producer: 'Test Producer',
        vintage: '2020',
      });

      expect(result).toBe(false);
    });
  });

  describe('getFavoriteById', () => {
    it('should return favorite by ID', async () => {
      const favorites = [mockWine];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(favorites));

      const result = await FavoritesService.getFavoriteById('test-id');

      expect(result).toEqual(mockWine);
    });

    it('should return null if favorite not found', async () => {
      const favorites = [mockWine];
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(favorites));

      const result = await FavoritesService.getFavoriteById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await FavoritesService.getFavoriteById('test-id');

      expect(result).toBeNull();
    });
  });
});





