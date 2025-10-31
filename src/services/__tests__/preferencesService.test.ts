import { PreferencesService } from '../preferencesService';
import { UserPreferences } from '../../types/preferences';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('PreferencesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPreferences: UserPreferences = {
    budgetSensitivity: '$30-60',
    regionPreferences: 'Napa Valley',
    exploreNewRegions: true,
    grapeVariety: ['Cabernet Sauvignon', 'Merlot'],
    wineStyle: ['bold-tannic'],
    occasion: 'casual-dinner',
    retailAccessibility: 'widely-available',
    agingPotential: 'drink-now',
    foodPairingRisk: 'classic-safe',
  };

  describe('savePreferences', () => {
    it('should save preferences successfully', async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await PreferencesService.savePreferences(mockPreferences);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        JSON.stringify(mockPreferences)
      );
    });

    it('should handle storage errors', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(PreferencesService.savePreferences(mockPreferences)).rejects.toThrow('Storage error');
    });
  });

  describe('getPreferences', () => {
    it('should return preferences successfully', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPreferences));

      const result = await PreferencesService.getPreferences();

      expect(result).toEqual(mockPreferences);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user_preferences');
    });

    it('should return null when no preferences exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await PreferencesService.getPreferences();

      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await PreferencesService.getPreferences();

      expect(result).toBeNull();
    });
  });

  describe('clearPreferences', () => {
    it('should clear preferences successfully', async () => {
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      await PreferencesService.clearPreferences();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_preferences');
    });

    it('should handle storage errors', async () => {
      AsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(PreferencesService.clearPreferences()).rejects.toThrow('Storage error');
    });
  });

  describe('updatePreference', () => {
    it('should update a single preference successfully', async () => {
      const existingPreferences = { budgetSensitivity: '$15-30' };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingPreferences));
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await PreferencesService.updatePreference('budgetSensitivity', '$30-60');

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('user_preferences');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        JSON.stringify({ budgetSensitivity: '$30-60' })
      );
    });

    it('should update preference when no existing preferences', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await PreferencesService.updatePreference('budgetSensitivity', '$30-60');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        JSON.stringify({ budgetSensitivity: '$30-60' })
      );
    });

    it('should handle storage errors', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await expect(PreferencesService.updatePreference('budgetSensitivity', '$30-60')).rejects.toThrow('Storage error');
    });
  });
});





