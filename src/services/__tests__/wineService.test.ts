import { WineService } from '../wineService';
import { UserPreferences } from '../../types/preferences';

// Mock fetch
global.fetch = jest.fn();

describe('WineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  const mockPreferences: UserPreferences = {
    budgetSensitivity: '$30-60',
    regionPreferences: 'Napa Valley',
  };

  const mockResponse = {
    dish: 'Ribeye steak',
    recommendations: [
      {
        wineName: 'Test Wine',
        producer: 'Test Producer',
        vintage: '2020',
        pricePoint: '$50',
        rationale: 'Test rationale',
        tastingNotes: 'Test notes',
        servingGuidance: 'Test guidance',
        confidenceScore: 95,
        expertRating: '95 (Wine Spectator)',
        retailerSuggestion: 'Test retailer',
        image: 'test.jpg',
        storytellingElements: 'Test story',
      },
    ],
  };

  describe('getWineRecommendations', () => {
    it('should return mock recommendations when in mock mode', async () => {
      WineService.setMockMode(true);

      const result = await WineService.getWineRecommendations('Ribeye steak', mockPreferences);

      expect(result).toHaveProperty('dish');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should make API call when not in mock mode', async () => {
      WineService.setMockMode(false);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await WineService.getWineRecommendations('Ribeye steak', mockPreferences);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/recommendations'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            dish: 'Ribeye steak',
            preferences: mockPreferences,
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      WineService.setMockMode(false);
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await WineService.getWineRecommendations('Ribeye steak', mockPreferences);

      // Should fallback to mock data
      expect(result).toHaveProperty('dish');
      expect(result).toHaveProperty('recommendations');
    });

    it('should handle non-ok responses', async () => {
      WineService.setMockMode(false);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await WineService.getWineRecommendations('Ribeye steak', mockPreferences);

      // Should fallback to mock data
      expect(result).toHaveProperty('dish');
      expect(result).toHaveProperty('recommendations');
    });

    it('should retry on failure', async () => {
      WineService.setMockMode(false);
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

      const result = await WineService.getWineRecommendations('Ribeye steak', mockPreferences);

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockResponse);
    });

    it('should work without preferences', async () => {
      WineService.setMockMode(true);

      const result = await WineService.getWineRecommendations('Ribeye steak');

      expect(result).toHaveProperty('dish');
      expect(result).toHaveProperty('recommendations');
    });
  });

  describe('mock mode management', () => {
    it('should track mock mode state correctly', () => {
      WineService.setMockMode(true);
      expect(WineService.isMockModeEnabled()).toBe(true);

      WineService.setMockMode(false);
      expect(WineService.isMockModeEnabled()).toBe(false);
    });
  });
});





