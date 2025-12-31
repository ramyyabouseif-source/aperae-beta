/**
 * Migration Helper Utilities
 * Helper functions to verify and manually trigger My Cellar migration
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoritesService } from '../services/favoritesService';
import { MyCellarWine } from '../types/wine';

const MY_CELLAR_KEY = 'my_cellar';
const FAVORITES_KEY = 'user_favorites';

/**
 * Check migration status
 */
export async function checkMigrationStatus(): Promise<{
  hasOldData: boolean;
  hasNewData: boolean;
  oldCount: number;
  newCount: number;
  migrationNeeded: boolean;
}> {
  try {
    const oldData = await AsyncStorage.getItem(FAVORITES_KEY);
    const newData = await AsyncStorage.getItem(MY_CELLAR_KEY);

    const oldFavorites = oldData ? JSON.parse(oldData) : [];
    const newWines = newData ? JSON.parse(newData) : [];

    return {
      hasOldData: oldFavorites.length > 0,
      hasNewData: newWines.length > 0,
      oldCount: oldFavorites.length,
      newCount: newWines.length,
      migrationNeeded: oldFavorites.length > 0 && newWines.length === 0,
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return {
      hasOldData: false,
      hasNewData: false,
      oldCount: 0,
      newCount: 0,
      migrationNeeded: false,
    };
  }
}

/**
 * Manually trigger migration
 */
export async function triggerMigration(): Promise<{
  success: boolean;
  migratedCount: number;
  error?: string;
}> {
  try {
    console.log('🔄 Starting manual migration...');

    // Check if migration is needed
    const status = await checkMigrationStatus();

    if (!status.migrationNeeded) {
      if (status.hasNewData) {
        return {
          success: true,
          migratedCount: status.newCount,
          error: 'Migration already completed',
        };
      }
      if (!status.hasOldData) {
        return {
          success: true,
          migratedCount: 0,
          error: 'No data to migrate',
        };
      }
    }

    // Get old favorites
    const oldData = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!oldData) {
      return {
        success: false,
        migratedCount: 0,
        error: 'No old favorites data found',
      };
    }

    const oldFavorites = JSON.parse(oldData);

    // Migrate each wine to new format
    const migratedWines: MyCellarWine[] = oldFavorites.map((wine: any) => ({
      ...wine,
      // Set defaults for new fields
      status: wine.status || 'favorite',
      hasTried: wine.hasTried ?? false,
      wantsToTry: wine.wantsToTry ?? false,
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
    }));

    // Save to new key
    await AsyncStorage.setItem(MY_CELLAR_KEY, JSON.stringify(migratedWines));

    // Invalidate cache to force reload
    await FavoritesService.refreshCache();

    console.log('✅ Migration completed:', migratedWines.length, 'wines migrated');

    return {
      success: true,
      migratedCount: migratedWines.length,
    };
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      migratedCount: 0,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Verify migration by checking data structure
 */
export async function verifyMigration(): Promise<{
  isValid: boolean;
  winesWithStatus: number;
  winesWithoutStatus: number;
  totalWines: number;
  details: string[];
}> {
  try {
    const wines = await FavoritesService.getFavorites();
    const details: string[] = [];

    let winesWithStatus = 0;
    let winesWithoutStatus = 0;

    wines.forEach((wine, index) => {
      if ((wine as MyCellarWine).status !== undefined) {
        winesWithStatus++;
      } else {
        winesWithoutStatus++;
        details.push(`Wine ${index + 1} (${wine.wineName}): Missing status field`);
      }
    });

    const isValid = winesWithoutStatus === 0;

    return {
      isValid,
      winesWithStatus,
      winesWithoutStatus,
      totalWines: wines.length,
      details,
    };
  } catch (error: any) {
    return {
      isValid: false,
      winesWithStatus: 0,
      winesWithoutStatus: 0,
      totalWines: 0,
      details: [`Error: ${error.message}`],
    };
  }
}







