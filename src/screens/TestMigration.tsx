import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FavoritesService } from '../services/favoritesService';
import { MyCellarWine } from '../types/wine';
import { COLORS } from '../design';

/**
 * Test Migration Screen
 * Simple UI to verify My Cellar migration status
 */
export default function TestMigration() {
  const [result, setResult] = useState<string>('Press the button below to check migration status.');
  const [loading, setLoading] = useState(false);

  const runVerification = async () => {
    setLoading(true);
    setResult('Running verification...\n\n');

    try {
      const wines = await FavoritesService.getFavorites();
      
      let output = `📊 VERIFICATION RESULTS\n`;
      output += `${'='.repeat(40)}\n\n`;
      output += `Found ${wines.length} wine${wines.length !== 1 ? 's' : ''} in collection\n\n`;
      
      if (wines.length === 0) {
        output += '⚠️  No wines found.\n';
        output += 'Add some favorites from the Home screen first!\n';
        setResult(output);
        setLoading(false);
        return;
      }
      
      // Check first wine
      const firstWine = wines[0] as MyCellarWine;
      
      output += `🍷 FIRST WINE CHECK\n`;
      output += `${'-'.repeat(40)}\n`;
      output += `Name: ${firstWine.wineName}\n`;
      output += `Producer: ${firstWine.producer}\n`;
      output += `Vintage: ${firstWine.vintage}\n\n`;
      
      // Check new fields
      output += `🔍 CHECKING NEW FIELDS\n`;
      output += `${'-'.repeat(40)}\n`;
      
      const hasStatus = 'status' in firstWine;
      const hasTags = 'tags' in firstWine;
      const hasHasTried = 'hasTried' in firstWine;
      const hasWantsToTry = 'wantsToTry' in firstWine;
      const hasWineRating = 'wineRating' in firstWine;
      const hasPairingRating = 'pairingRating' in firstWine;
      
      output += `Status field: ${hasStatus ? '✅ YES' : '❌ NO'}\n`;
      if (hasStatus) {
        output += `  → Value: "${firstWine.status}"\n`;
      }
      
      output += `Tags field: ${hasTags ? '✅ YES' : '❌ NO'}\n`;
      if (hasTags) {
        output += `  → Value: ${JSON.stringify(firstWine.tags || [])}\n`;
      }
      
      output += `hasTried field: ${hasHasTried ? '✅ YES' : '❌ NO'}\n`;
      if (hasHasTried) {
        output += `  → Value: ${firstWine.hasTried}\n`;
      }
      
      output += `wantsToTry field: ${hasWantsToTry ? '✅ YES' : '❌ NO'}\n`;
      if (hasWantsToTry) {
        output += `  → Value: ${firstWine.wantsToTry}\n`;
      }
      
      output += `wineRating field: ${hasWineRating ? '✅ YES' : '❌ NO'}\n`;
      output += `pairingRating field: ${hasPairingRating ? '✅ YES' : '❌ NO'}\n\n`;
      
      // Check all wines
      output += `📋 CHECKING ALL WINES\n`;
      output += `${'-'.repeat(40)}\n`;
      
      let winesWithStatus = 0;
      let winesWithoutStatus = 0;
      
      wines.forEach((wine, index) => {
        if ('status' in wine) {
          winesWithStatus++;
        } else {
          winesWithoutStatus++;
          output += `  ⚠️  Wine #${index + 1} (${wine.wineName}) missing status\n`;
        }
      });
      
      output += `\nWines with status: ${winesWithStatus}\n`;
      output += `Wines without status: ${winesWithoutStatus}\n`;
      output += `Total wines: ${wines.length}\n\n`;
      
      // Final result
      output += `🎯 FINAL RESULT\n`;
      output += `${'='.repeat(40)}\n`;
      
      if (winesWithStatus === wines.length && wines.length > 0) {
        output += `✅ SUCCESS!\n\n`;
        output += `All wines have been migrated to My Cellar format.\n`;
        output += `The data structure is ready for new features.\n\n`;
        output += `📝 NOTE: The UI still shows "Favorites" instead of\n`;
        output += `"My Cellar" - that will be updated in the next step.`;
      } else if (winesWithStatus > 0) {
        output += `⚠️  PARTIAL MIGRATION\n\n`;
        output += `Some wines were migrated, but not all.\n`;
        output += `You may need to trigger manual migration.`;
      } else {
        output += `❌ NOT MIGRATED\n\n`;
        output += `No wines have been migrated yet.\n`;
        output += `The migration should happen automatically when\n`;
        output += `the app loads. If this persists, we may need to\n`;
        output += `trigger manual migration.`;
      }
      
      setResult(output);
    } catch (error: any) {
      setResult(
        `❌ ERROR OCCURRED\n\n` +
        `Message: ${error.message}\n\n` +
        `Stack: ${error.stack || 'No stack trace available'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Migration Verification</Text>
        <Text style={styles.subtitle}>Check My Cellar migration status</Text>
      </View>
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={runVerification}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Running...' : '▶ Run Verification'}
        </Text>
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.resultContainer}
        contentContainerStyle={styles.resultContent}
      >
        <Text style={styles.resultText}>{result}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary[500],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  button: {
    backgroundColor: COLORS.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  resultContent: {
    padding: 16,
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
});





