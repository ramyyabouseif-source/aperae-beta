import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteWine } from '../types/wine';

const FAVORITES_KEY = 'user_favorites';
const CACHE_VERSION_KEY = 'favorites_cache_version';

// In-memory cache and indexes
interface FavoritesCache {
  data: FavoriteWine[];
  indexes: {
    byId: Map<string, FavoriteWine>;
    byProducer: Map<string, FavoriteWine[]>;
    byVintage: Map<string, FavoriteWine[]>;
    byPriceRange: Map<string, FavoriteWine[]>;
    sortedByDate: FavoriteWine[];
    sortedByName: FavoriteWine[];
    sortedByPrice: FavoriteWine[];
  };
  lastUpdated: number;
  version: number;
}

// Pagination options
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: 'date' | 'name' | 'price' | 'producer';
  sortOrder?: 'asc' | 'desc';
}

// Pagination result
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Filter options for querying
export interface FilterOptions {
  producer?: string;
  vintage?: string;
  priceRange?: { min?: number; max?: number };
  searchQuery?: string; // Searches in wineName, producer, tastingNotes
}

// Private cache instance
let cache: FavoritesCache | null = null;
let cacheVersion = 0;

export class FavoritesService {
  /**
   * Initialize cache from storage
   */
  private static async initializeCache(): Promise<void> {
    if (cache) {
      return; // Cache already initialized
    }

    try {
      const storedVersion = await AsyncStorage.getItem(CACHE_VERSION_KEY);
      const currentVersion = storedVersion ? parseInt(storedVersion, 10) : 0;
      
      const favorites = await this.loadFromStorage();
      cache = this.buildCache(favorites, currentVersion);
      cacheVersion = currentVersion;
    } catch (error) {
      console.error('Error initializing cache:', error);
      cache = this.buildCache([], 0);
    }
  }

  /**
   * Build in-memory cache with indexes
   */
  private static buildCache(favorites: FavoriteWine[], version: number): FavoritesCache {
    const byId = new Map<string, FavoriteWine>();
    const byProducer = new Map<string, FavoriteWine[]>();
    const byVintage = new Map<string, FavoriteWine[]>();
    const byPriceRange = new Map<string, FavoriteWine[]>();

    // Build indexes
    favorites.forEach(wine => {
      // Index by ID
      if (wine.id) {
        byId.set(wine.id, wine);
      }

      // Index by producer
      const producer = wine.producer.toLowerCase();
      if (!byProducer.has(producer)) {
        byProducer.set(producer, []);
      }
      byProducer.get(producer)!.push(wine);

      // Index by vintage
      const vintage = wine.vintage;
      if (!byVintage.has(vintage)) {
        byVintage.set(vintage, []);
      }
      byVintage.get(vintage)!.push(wine);

      // Index by price range
      const priceRange = this.getPriceRange(wine.pricePoint);
      if (!byPriceRange.has(priceRange)) {
        byPriceRange.set(priceRange, []);
      }
      byPriceRange.get(priceRange)!.push(wine);
    });

    // Build sorted arrays
    const sortedByDate = [...favorites].sort((a, b) => {
      const dateA = new Date(a.addedAt || 0).getTime();
      const dateB = new Date(b.addedAt || 0).getTime();
      return dateB - dateA; // Newest first
    });

    const sortedByName = [...favorites].sort((a, b) => 
      a.wineName.localeCompare(b.wineName)
    );

    const sortedByPrice = [...favorites].sort((a, b) => {
      const priceA = this.extractPrice(a.pricePoint);
      const priceB = this.extractPrice(b.pricePoint);
      return priceA - priceB;
    });

    return {
      data: favorites,
      indexes: {
        byId,
        byProducer,
        byVintage,
        byPriceRange,
        sortedByDate,
        sortedByName,
        sortedByPrice,
      },
      lastUpdated: Date.now(),
      version,
    };
  }

  /**
   * Extract numeric price from pricePoint string
   */
  private static extractPrice(pricePoint: string): number {
    if (!pricePoint || pricePoint === 'unknown' || pricePoint === 'Price N/A') {
      return 0;
    }
    const match = pricePoint.match(/\$?(\d+)/);
    return match && match[1] ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get price range category
   */
  private static getPriceRange(pricePoint: string): string {
    const price = this.extractPrice(pricePoint);
    if (price === 0) return 'unknown';
    if (price < 25) return 'budget';
    if (price < 50) return 'mid-range';
    if (price < 100) return 'premium';
    return 'luxury';
  }

  /**
   * Invalidate cache and force reload
   */
  private static async invalidateCache(): Promise<void> {
    cache = null;
    cacheVersion++;
    await AsyncStorage.setItem(CACHE_VERSION_KEY, cacheVersion.toString());
  }

  /**
   * Load favorites from AsyncStorage
   */
  private static async loadFromStorage(): Promise<FavoriteWine[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      return [];
    }
  }

  /**
   * Save favorites to AsyncStorage
   */
  private static async saveToStorage(favorites: FavoriteWine[]): Promise<void> {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      await this.invalidateCache();
      await this.initializeCache(); // Rebuild cache
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
      throw error;
    }
  }

  /**
   * Get all favorites (backward compatible)
   */
  static async getFavorites(): Promise<FavoriteWine[]> {
    await this.initializeCache();
    return cache ? [...cache.data] : [];
  }

  /**
   * Get favorites with pagination
   */
  static async getFavoritesPaginated(options: PaginationOptions): Promise<PaginatedResult<FavoriteWine>> {
    await this.initializeCache();
    
    if (!cache) {
      return {
        data: [],
        pagination: {
          page: options.page,
          pageSize: options.pageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    // Get sorted array based on sortBy option
    let sortedData: FavoriteWine[];
    switch (options.sortBy) {
      case 'name':
        sortedData = cache.indexes.sortedByName;
        break;
      case 'price':
        sortedData = cache.indexes.sortedByPrice;
        break;
      case 'date':
      default:
        sortedData = cache.indexes.sortedByDate;
        break;
    }

    // Apply sort order
    if (options.sortOrder === 'asc' && options.sortBy !== 'date') {
      sortedData = [...sortedData].reverse();
    }

    // Calculate pagination
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / options.pageSize);
    const startIndex = (options.page - 1) * options.pageSize;
    const endIndex = startIndex + options.pageSize;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page: options.page,
        pageSize: options.pageSize,
        totalItems,
        totalPages,
        hasNextPage: options.page < totalPages,
        hasPreviousPage: options.page > 1,
      },
    };
  }

  /**
   * Get favorites with filtering
   */
  static async getFavoritesFiltered(filters: FilterOptions): Promise<FavoriteWine[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    let results = [...cache.data];

    // Filter by producer
    if (filters.producer) {
      const producerLower = filters.producer.toLowerCase();
      results = results.filter(wine => 
        wine.producer.toLowerCase().includes(producerLower)
      );
    }

    // Filter by vintage
    if (filters.vintage) {
      results = results.filter(wine => wine.vintage === filters.vintage);
    }

    // Filter by price range
    if (filters.priceRange) {
      results = results.filter(wine => {
        const price = this.extractPrice(wine.pricePoint);
        const min = filters.priceRange!.min ?? 0;
        const max = filters.priceRange!.max ?? Infinity;
        return price >= min && price <= max;
      });
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(wine =>
        wine.wineName.toLowerCase().includes(query) ||
        wine.producer.toLowerCase().includes(query) ||
        wine.tastingNotes?.toLowerCase().includes(query) ||
        wine.rationale?.toLowerCase().includes(query)
      );
    }

    return results;
  }

  /**
   * Get favorites with filtering and pagination
   */
  static async getFavoritesFilteredPaginated(
    filters: FilterOptions,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<FavoriteWine>> {
    const filtered = await this.getFavoritesFiltered(filters);
    
    // Apply sorting
    let sorted = [...filtered];
    switch (pagination.sortBy) {
      case 'name':
        sorted.sort((a, b) => a.wineName.localeCompare(b.wineName));
        break;
      case 'price':
        sorted.sort((a, b) => {
          const priceA = this.extractPrice(a.pricePoint);
          const priceB = this.extractPrice(b.pricePoint);
          return priceA - priceB;
        });
        break;
      case 'date':
      default:
        sorted.sort((a, b) => {
          const dateA = new Date(a.addedAt || 0).getTime();
          const dateB = new Date(b.addedAt || 0).getTime();
          return dateB - dateA;
        });
        break;
    }

    if (pagination.sortOrder === 'asc' && pagination.sortBy !== 'date') {
      sorted = sorted.reverse();
    }

    // Apply pagination
    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedData = sorted.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  /**
   * Get unique producers from favorites
   */
  static async getUniqueProducers(): Promise<string[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    return Array.from(cache.indexes.byProducer.keys())
      .map(producer => {
        // Get original casing from first wine
        const wines = cache!.indexes.byProducer.get(producer);
        return wines && wines.length > 0 && wines[0] ? wines[0].producer : producer;
      })
      .sort();
  }

  /**
   * Get unique vintages from favorites
   */
  static async getUniqueVintages(): Promise<string[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    return Array.from(cache.indexes.byVintage.keys()).sort((a, b) => {
      const yearA = parseInt(a, 10);
      const yearB = parseInt(b, 10);
      return isNaN(yearA) || isNaN(yearB) ? a.localeCompare(b) : yearB - yearA;
    });
  }

  /**
   * Get favorites by producer (using index for fast lookup)
   */
  static async getFavoritesByProducer(producer: string): Promise<FavoriteWine[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    const producerLower = producer.toLowerCase();
    return cache.indexes.byProducer.get(producerLower) || [];
  }

  /**
   * Get favorites by vintage (using index for fast lookup)
   */
  static async getFavoritesByVintage(vintage: string): Promise<FavoriteWine[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    return cache.indexes.byVintage.get(vintage) || [];
  }

  /**
   * Add wine to favorites
   */
  static async addToFavorites(wine: FavoriteWine): Promise<void> {
    try {
      await this.initializeCache();
      const favorites = cache ? [...cache.data] : [];
      
      const favoriteWine: FavoriteWine = {
        ...wine,
        id: wine.id || this.generateId(),
        addedAt: wine.addedAt || new Date().toISOString()
      };
      
      // Check if already exists (using index for fast lookup)
      const exists = cache?.indexes.byId.has(favoriteWine.id) || 
        favorites.some(fav => 
          fav.wineName === favoriteWine.wineName && 
          fav.producer === favoriteWine.producer && 
          fav.vintage === favoriteWine.vintage
        );
      
      if (!exists) {
        favorites.push(favoriteWine);
        await this.saveToStorage(favorites);
        console.log('Wine added to favorites successfully');
      } else {
        throw new Error('Wine is already in favorites');
      }
    } catch (error) {
      console.error('Error adding wine to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove wine from favorites
   */
  static async removeFromFavorites(wineIdOrWine: string | FavoriteWine): Promise<void> {
    try {
      await this.initializeCache();
      const favorites = cache ? [...cache.data] : [];
      let updatedFavorites: FavoriteWine[];
      
      if (typeof wineIdOrWine === 'string') {
        // Remove by ID (using index for fast lookup)
        updatedFavorites = favorites.filter(fav => fav.id !== wineIdOrWine);
      } else {
        // Remove by wine object
        const wine = wineIdOrWine;
        updatedFavorites = favorites.filter(fav => {
          if (fav.id && wine.id) {
            return fav.id !== wine.id;
          }
          return !(fav.wineName === wine.wineName && 
                  fav.producer === wine.producer && 
                  fav.vintage === wine.vintage);
        });
      }
      
      await this.saveToStorage(updatedFavorites);
      console.log('Wine removed from favorites successfully');
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }

  /**
   * Clear all favorites
   */
  static async clearFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      await this.invalidateCache();
      console.log('Favorites cleared successfully');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  }

  /**
   * Check if wine is favorite (using index for fast lookup)
   */
  static async isFavorite(wine: { wineName: string; producer: string; vintage: string }): Promise<boolean> {
    try {
      await this.initializeCache();
      
      if (!cache) {
        return false;
      }

      // Fast lookup using indexes
      const producerWines = cache.indexes.byProducer.get(wine.producer.toLowerCase());
      if (!producerWines) {
        return false;
      }

      return producerWines.some(fav => 
        fav.wineName === wine.wineName && 
        fav.vintage === wine.vintage
      );
    } catch (error) {
      console.error('Error checking if wine is favorite:', error);
      return false;
    }
  }

  /**
   * Get favorite by ID (using index for O(1) lookup)
   */
  static async getFavoriteById(wineId: string): Promise<FavoriteWine | null> {
    try {
      await this.initializeCache();
      
      if (!cache) {
        return null;
      }

      return cache.indexes.byId.get(wineId) || null;
    } catch (error) {
      console.error('Error getting favorite by ID:', error);
      return null;
    }
  }

  /**
   * Get total count of favorites
   */
  static async getFavoritesCount(): Promise<number> {
    await this.initializeCache();
    return cache ? cache.data.length : 0;
  }

  /**
   * Force cache refresh (useful after external changes)
   */
  static async refreshCache(): Promise<void> {
    await this.invalidateCache();
    await this.initializeCache();
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
