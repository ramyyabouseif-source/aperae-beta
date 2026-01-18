import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyCellarWine, FavoriteWine } from '../types/wine';

// Updated storage keys for My Cellar
const MY_CELLAR_KEY = 'my_cellar';
const FAVORITES_KEY = 'user_favorites'; // Legacy key for migration
const CACHE_VERSION_KEY = 'my_cellar_cache_version';

// In-memory cache and indexes
interface MyCellarCache {
  data: MyCellarWine[];
  indexes: {
    byId: Map<string, MyCellarWine>;
    byProducer: Map<string, MyCellarWine[]>;
    byVintage: Map<string, MyCellarWine[]>;
    byPriceRange: Map<string, MyCellarWine[]>;
    byStatus: Map<'wantToTry' | 'haveTried' | 'favorite', MyCellarWine[]>;
    byTag: Map<string, MyCellarWine[]>;
    sortedByDate: MyCellarWine[];
    sortedByName: MyCellarWine[];
    sortedByPrice: MyCellarWine[];
    sortedByRating: MyCellarWine[];
  };
  lastUpdated: number;
  version: number;
}

// Legacy alias for backward compatibility
type FavoritesCache = MyCellarCache;

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
  status?: 'wantToTry' | 'haveTried' | 'favorite';
  tags?: string[]; // Filter by tags
  minRating?: number; // Minimum rating (1-5)
  maxRating?: number; // Maximum rating (1-5)
}

// Private cache instance
let cache: MyCellarCache | null = null;
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
  private static buildCache(wines: MyCellarWine[], version: number): MyCellarCache {
    const byId = new Map<string, MyCellarWine>();
    const byProducer = new Map<string, MyCellarWine[]>();
    const byVintage = new Map<string, MyCellarWine[]>();
    const byPriceRange = new Map<string, MyCellarWine[]>();
    const byStatus = new Map<'wantToTry' | 'haveTried' | 'favorite', MyCellarWine[]>();
    const byTag = new Map<string, MyCellarWine[]>();

    // Initialize status maps
    byStatus.set('wantToTry', []);
    byStatus.set('haveTried', []);
    byStatus.set('favorite', []);

    // Build indexes
    wines.forEach(wine => {
      // Migrate legacy wines to new format
      const migratedWine = this.migrateWineToMyCellarFormat(wine);

      // Index by ID
      if (migratedWine.id) {
        byId.set(migratedWine.id, migratedWine);
      }

      // Index by producer
      const producer = migratedWine.producer.toLowerCase();
      if (!byProducer.has(producer)) {
        byProducer.set(producer, []);
      }
      byProducer.get(producer)!.push(migratedWine);

      // Index by vintage
      const vintage = migratedWine.vintage;
      if (!byVintage.has(vintage)) {
        byVintage.set(vintage, []);
      }
      byVintage.get(vintage)!.push(migratedWine);

      // Index by price range
      const priceRange = this.getPriceRange(migratedWine.pricePoint);
      if (!byPriceRange.has(priceRange)) {
        byPriceRange.set(priceRange, []);
      }
      byPriceRange.get(priceRange)!.push(migratedWine);

      // Index by status
      const status = migratedWine.status || 'favorite';
      byStatus.get(status)!.push(migratedWine);

      // Index by tags
      if (migratedWine.tags && migratedWine.tags.length > 0) {
        migratedWine.tags.forEach(tag => {
          if (!byTag.has(tag)) {
            byTag.set(tag, []);
          }
          byTag.get(tag)!.push(migratedWine);
        });
      }
    });

    // Build sorted arrays
    const sortedByDate = [...wines].sort((a, b) => {
      const dateA = new Date(a.addedAt || 0).getTime();
      const dateB = new Date(b.addedAt || 0).getTime();
      return dateB - dateA; // Newest first
    });

    const sortedByName = [...wines].sort((a, b) => 
      a.wineName.localeCompare(b.wineName)
    );

    const sortedByPrice = [...wines].sort((a, b) => {
      const priceA = this.extractPrice(a.pricePoint);
      const priceB = this.extractPrice(b.pricePoint);
      return priceA - priceB;
    });

    const sortedByRating = [...wines].sort((a, b) => {
      const ratingA = a.wineRating || 0;
      const ratingB = b.wineRating || 0;
      return ratingB - ratingA; // Highest first
    });

    return {
      data: wines,
      indexes: {
        byId,
        byProducer,
        byVintage,
        byPriceRange,
        byStatus,
        byTag,
        sortedByDate,
        sortedByName,
        sortedByPrice,
        sortedByRating,
      },
      lastUpdated: Date.now(),
      version,
    };
  }

  /**
   * Migrate legacy FavoriteWine to MyCellarWine format
   */
  private static migrateWineToMyCellarFormat(wine: any): MyCellarWine {
    // If already in new format, return as is
    if (wine.status !== undefined) {
      return wine as MyCellarWine;
    }

    // Migrate from old format
    return {
      ...wine,
      status: 'favorite', // Default status for legacy wines
      hasTried: false,
      wantsToTry: false,
      tags: wine.tags || [],
      pairingRating: wine.pairingRating,
      pairingNotes: wine.pairingNotes,
      pairedDishes: wine.pairedDishes || [],
      wineRating: wine.wineRating,
      wineNotes: wine.wineNotes,
      purchaseLocation: wine.purchaseLocation,
      purchasePrice: wine.purchasePrice,
      purchaseDate: wine.purchaseDate,
      occasion: wine.occasion,
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
   * Load wines from AsyncStorage (supports migration from old key)
   */
  private static async loadFromStorage(): Promise<MyCellarWine[]> {
    try {
      // Try new key first
      let wines = await AsyncStorage.getItem(MY_CELLAR_KEY);
      
      if (wines) {
        const parsed = JSON.parse(wines);
        return parsed.map((w: any) => this.migrateWineToMyCellarFormat(w));
      }

      // Try legacy key for migration
      const legacyFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (legacyFavorites) {
        const parsed = JSON.parse(legacyFavorites);
        const migrated = parsed.map((w: any) => this.migrateWineToMyCellarFormat(w));
        
        // Migrate to new key
        await AsyncStorage.setItem(MY_CELLAR_KEY, JSON.stringify(migrated));
        // Optionally remove old key after migration (keep for safety)
        // await AsyncStorage.removeItem(FAVORITES_KEY);
        
        return migrated;
      }

      return [];
    } catch (error) {
      console.error('Error loading wines from storage:', error);
      return [];
    }
  }

  /**
   * Save wines to AsyncStorage
   */
  private static async saveToStorage(wines: MyCellarWine[]): Promise<void> {
    try {
      await AsyncStorage.setItem(MY_CELLAR_KEY, JSON.stringify(wines));
      await this.invalidateCache();
      await this.initializeCache(); // Rebuild cache
    } catch (error) {
      console.error('Error saving wines to storage:', error);
      throw error;
    }
  }

  /**
   * Get all wines in My Cellar (backward compatible)
   */
  static async getFavorites(): Promise<MyCellarWine[]> {
    await this.initializeCache();
    return cache ? [...cache.data] : [];
  }

  /**
   * Get all wines in My Cellar (new method name)
   */
  static async getMyCellar(): Promise<MyCellarWine[]> {
    return this.getFavorites();
  }

  /**
   * Get wines with pagination
   */
  static async getFavoritesPaginated(options: PaginationOptions): Promise<PaginatedResult<MyCellarWine>> {
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
    let sortedData: MyCellarWine[];
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
   * Get wines with filtering (enhanced with status, tags, ratings)
   */
  static async getFavoritesFiltered(filters: FilterOptions): Promise<MyCellarWine[]> {
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

    // Filter by status
    if (filters.status) {
      results = results.filter(wine => wine.status === filters.status);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(wine => 
        wine.tags && filters.tags!.some(tag => wine.tags!.includes(tag))
      );
    }

    // Filter by rating range
    if (filters.minRating !== undefined || filters.maxRating !== undefined) {
      results = results.filter(wine => {
        const rating = wine.wineRating || 0;
        const min = filters.minRating ?? 0;
        const max = filters.maxRating ?? 5;
        return rating >= min && rating <= max;
      });
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(wine =>
        wine.wineName.toLowerCase().includes(query) ||
        wine.producer.toLowerCase().includes(query) ||
        (typeof wine.tastingNotes === 'string' && wine.tastingNotes.toLowerCase().includes(query)) ||
        wine.rationale?.toLowerCase().includes(query) ||
        wine.wineNotes?.toLowerCase().includes(query)
      );
    }

    return results;
  }

  /**
   * Get wines with filtering and pagination
   */
  static async getFavoritesFilteredPaginated(
    filters: FilterOptions,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<MyCellarWine>> {
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
   * Get wines by producer (using index for fast lookup)
   */
  static async getFavoritesByProducer(producer: string): Promise<MyCellarWine[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    const producerLower = producer.toLowerCase();
    return cache.indexes.byProducer.get(producerLower) || [];
  }

  /**
   * Get wines by vintage (using index for fast lookup)
   */
  static async getFavoritesByVintage(vintage: string): Promise<MyCellarWine[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    return cache.indexes.byVintage.get(vintage) || [];
  }

  /**
   * Get wines by status (using index for fast lookup)
   */
  static async getWinesByStatus(status: 'wantToTry' | 'haveTried' | 'favorite'): Promise<MyCellarWine[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    return cache.indexes.byStatus.get(status) || [];
  }

  /**
   * Get wines by tag (using index for fast lookup)
   */
  static async getWinesByTag(tag: string): Promise<MyCellarWine[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    return cache.indexes.byTag.get(tag) || [];
  }

  /**
   * Get all unique tags
   */
  static async getAllTags(): Promise<string[]> {
    await this.initializeCache();
    
    if (!cache) {
      return [];
    }

    const tags = new Set<string>();
    cache.data.forEach(wine => {
      if (wine.tags && wine.tags.length > 0) {
        wine.tags.forEach(tag => tags.add(tag));
      }
    });

    return Array.from(tags).sort();
  }

  /**
   * Add wine to My Cellar (with default values for new fields)
   */
  static async addToFavorites(wine: MyCellarWine | FavoriteWine): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      // Migrate to MyCellarWine format and set defaults
      const cellarWine: MyCellarWine = this.migrateWineToMyCellarFormat({
        ...wine,
        id: wine.id || this.generateId(),
        addedAt: wine.addedAt || new Date().toISOString(),
        // Set defaults if not provided
        status: (wine as MyCellarWine).status || 'favorite',
        hasTried: (wine as MyCellarWine).hasTried ?? false,
        wantsToTry: (wine as MyCellarWine).wantsToTry ?? false,
        tags: (wine as MyCellarWine).tags || [],
      });
      
      // Check if already exists (using index for fast lookup)
      const exists = cache?.indexes.byId.has(cellarWine.id) || 
        wines.some(w => 
          w.wineName === cellarWine.wineName && 
          w.producer === cellarWine.producer && 
          w.vintage === cellarWine.vintage
        );
      
      if (!exists) {
        wines.push(cellarWine);
        await this.saveToStorage(wines);
        console.log('Wine added to My Cellar successfully');
      } else {
        throw new Error('Wine is already in My Cellar');
      }
    } catch (error) {
      console.error('Error adding wine to My Cellar:', error);
      throw error;
    }
  }

  /**
   * Remove wine from My Cellar
   */
  static async removeFromFavorites(wineIdOrWine: string | MyCellarWine | FavoriteWine): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      let updatedWines: MyCellarWine[];
      
      if (typeof wineIdOrWine === 'string') {
        // Remove by ID (using index for fast lookup)
        updatedWines = wines.filter(w => w.id !== wineIdOrWine);
      } else {
        // Remove by wine object
        const wine = wineIdOrWine;
        updatedWines = wines.filter(w => {
          if (w.id && wine.id) {
            return w.id !== wine.id;
          }
          return !(w.wineName === wine.wineName && 
                  w.producer === wine.producer && 
                  w.vintage === wine.vintage);
        });
      }
      
      await this.saveToStorage(updatedWines); // This already invalidates and rebuilds cache
      console.log('Wine removed from My Cellar successfully');
    } catch (error) {
      console.error('Error removing wine from My Cellar:', error);
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
   * Get wine by ID (using index for O(1) lookup)
   */
  static async getFavoriteById(wineId: string): Promise<MyCellarWine | null> {
    try {
      await this.initializeCache();
      
      if (!cache) {
        return null;
      }

      return cache.indexes.byId.get(wineId) || null;
    } catch (error) {
      console.error('Error getting wine by ID:', error);
      return null;
    }
  }

  /**
   * Get total count of wines
   */
  static async getFavoritesCount(): Promise<number> {
    await this.initializeCache();
    return cache ? cache.data.length : 0;
  }

  /**
   * Get statistics for My Cellar
   */
  static async getMyCellarStats(): Promise<{
    total: number;
    wantToTry: number;
    haveTried: number;
    favorites: number;
    averageRating: number;
  }> {
    await this.initializeCache();
    
    if (!cache) {
      return {
        total: 0,
        wantToTry: 0,
        haveTried: 0,
        favorites: 0,
        averageRating: 0,
      };
    }

    const wantToTry = cache.indexes.byStatus.get('wantToTry')?.length || 0;
    const haveTried = cache.indexes.byStatus.get('haveTried')?.length || 0;
    const favorites = cache.indexes.byStatus.get('favorite')?.length || 0;
    
    const ratedWines = cache.data.filter(w => w.wineRating !== undefined && w.wineRating > 0);
    const averageRating = ratedWines.length > 0
      ? ratedWines.reduce((sum, w) => sum + (w.wineRating || 0), 0) / ratedWines.length
      : 0;

    return {
      total: cache.data.length,
      wantToTry,
      haveTried,
      favorites,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    };
  }

  /**
   * Update wine status
   */
  static async updateWineStatus(wineId: string, status: 'wantToTry' | 'haveTried' | 'favorite', triedDate?: string): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      wines[index] = {
        ...wines[index],
        status,
        hasTried: status === 'haveTried',
        wantsToTry: status === 'wantToTry',
        triedDate: status === 'haveTried' ? (triedDate || new Date().toISOString()) : wines[index].triedDate,
      };

      await this.saveToStorage(wines);
      console.log('Wine status updated successfully');
    } catch (error) {
      console.error('Error updating wine status:', error);
      throw error;
    }
  }

  /**
   * Update wine rating
   */
  static async updateWineRating(wineId: string, wineRating: number): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      wines[index] = {
        ...wines[index],
        wineRating: Math.max(1, Math.min(5, wineRating)), // Clamp between 1-5
      };

      await this.saveToStorage(wines);
      console.log('Wine rating updated successfully');
    } catch (error) {
      console.error('Error updating wine rating:', error);
      throw error;
    }
  }

  /**
   * Update pairing rating
   */
  static async updatePairingRating(wineId: string, pairingRating: number, dish?: string): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      const pairedDishes = wines[index].pairedDishes || [];
      if (dish) {
        // Add or update pairing entry
        const existingIndex = pairedDishes.findIndex(p => p.dish === dish);
        if (existingIndex >= 0) {
          pairedDishes[existingIndex] = {
            ...pairedDishes[existingIndex],
            rating: Math.max(1, Math.min(5, pairingRating)),
            date: new Date().toISOString(),
          };
        } else {
          pairedDishes.push({
            dish,
            rating: Math.max(1, Math.min(5, pairingRating)),
            date: new Date().toISOString(),
          });
        }
      }

      wines[index] = {
        ...wines[index],
        pairingRating: Math.max(1, Math.min(5, pairingRating)),
        pairedDishes,
      };

      await this.saveToStorage(wines);
      console.log('Pairing rating updated successfully');
    } catch (error) {
      console.error('Error updating pairing rating:', error);
      throw error;
    }
  }

  /**
   * Update wine notes
   */
  static async updateWineNotes(wineId: string, wineNotes: string): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      wines[index] = {
        ...wines[index],
        wineNotes,
      };

      await this.saveToStorage(wines);
      console.log('Wine notes updated successfully');
    } catch (error) {
      console.error('Error updating wine notes:', error);
      throw error;
    }
  }

  /**
   * Update pairing notes
   */
  static async updatePairingNotes(wineId: string, pairingNotes: string, dish?: string): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      const pairedDishes = wines[index].pairedDishes || [];
      if (dish) {
        // Add or update pairing entry with notes
        const existingIndex = pairedDishes.findIndex(p => p.dish === dish);
        if (existingIndex >= 0) {
          pairedDishes[existingIndex] = {
            ...pairedDishes[existingIndex],
            notes: pairingNotes,
            date: new Date().toISOString(),
          };
        } else {
          pairedDishes.push({
            dish,
            rating: wines[index].pairingRating || 0,
            notes: pairingNotes,
            date: new Date().toISOString(),
          });
        }
      }

      wines[index] = {
        ...wines[index],
        pairingNotes,
        pairedDishes,
      };

      await this.saveToStorage(wines);
      console.log('Pairing notes updated successfully');
    } catch (error) {
      console.error('Error updating pairing notes:', error);
      throw error;
    }
  }

  /**
   * Add tags to wine
   */
  static async addTags(wineId: string, tags: string[]): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      const existingTags = wines[index].tags || [];
      const newTags = [...new Set([...existingTags, ...tags])]; // Remove duplicates

      wines[index] = {
        ...wines[index],
        tags: newTags,
      };

      await this.saveToStorage(wines);
      console.log('Tags added successfully');
    } catch (error) {
      console.error('Error adding tags:', error);
      throw error;
    }
  }

  /**
   * Remove tags from wine
   */
  static async removeTags(wineId: string, tags: string[]): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      const existingTags = wines[index].tags || [];
      const newTags = existingTags.filter(tag => !tags.includes(tag));

      wines[index] = {
        ...wines[index],
        tags: newTags,
      };

      await this.saveToStorage(wines);
      console.log('Tags removed successfully');
    } catch (error) {
      console.error('Error removing tags:', error);
      throw error;
    }
  }

  /**
   * Update wine tags (replace all tags)
   */
  static async updateWineTags(wineId: string, tags: string[]): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      wines[index] = {
        ...wines[index],
        tags: tags || [],
      };

      await this.saveToStorage(wines);
      console.log('Wine tags updated successfully');
    } catch (error) {
      console.error('Error updating wine tags:', error);
      throw error;
    }
  }

  /**
   * Update occasion
   */
  static async updateOccasion(wineId: string, occasion: string): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      wines[index] = {
        ...wines[index],
        occasion,
      };

      await this.saveToStorage(wines);
      console.log('Occasion updated successfully');
    } catch (error) {
      console.error('Error updating occasion:', error);
      throw error;
    }
  }

  /**
   * Update purchase information
   */
  static async updatePurchaseInfo(
    wineId: string,
    purchaseLocation?: string,
    purchasePrice?: string,
    purchaseDate?: string
  ): Promise<void> {
    try {
      await this.initializeCache();
      const wines = cache ? [...cache.data] : [];
      
      const index = wines.findIndex(w => w.id === wineId);
      if (index === -1) {
        throw new Error('Wine not found');
      }

      wines[index] = {
        ...wines[index],
        purchaseLocation: purchaseLocation !== undefined ? purchaseLocation : wines[index].purchaseLocation,
        purchasePrice: purchasePrice !== undefined ? purchasePrice : wines[index].purchasePrice,
        purchaseDate: purchaseDate !== undefined ? purchaseDate : wines[index].purchaseDate,
      };

      await this.saveToStorage(wines);
      console.log('Purchase information updated successfully');
    } catch (error) {
      console.error('Error updating purchase information:', error);
      throw error;
    }
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

// Export alias for backward compatibility
export const MyCellarService = FavoritesService;
