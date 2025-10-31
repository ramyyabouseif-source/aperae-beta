import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesService } from '../services/favoritesService';
import { WineRecommendation } from '../types/wine';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../design';
import AdaptiveWineCard from '../components/AdaptiveWineCard';
import { UI_CONFIG, hasEnhancedComponents } from '../config/uiConfig';

const { width } = Dimensions.get('window');

const EnhancedFavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<WineRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const savedFavorites = await FavoritesService.getFavorites();
      setFavorites(savedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (wine: WineRecommendation) => {
    try {
      await FavoritesService.removeFromFavorites(wine);
      setFavorites(prev => prev.filter(fav => fav.wineName !== wine.wineName));
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Failed to remove favorite');
    }
  };

  const confirmRemoveFavorite = (wine: WineRecommendation) => {
    Alert.alert(
      'Remove Favorite',
      `Are you sure you want to remove ${wine.wineName} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => handleRemoveFavorite(wine) },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color={COLORS.neutral[300]} />
      </View>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring wines and add your favorites here. Your personal wine collection awaits!
      </Text>
      <View style={styles.emptyActionContainer}>
        <Ionicons name="wine" size={24} color={COLORS.primary[500]} />
        <Text style={styles.emptyActionText}>Discover amazing wines</Text>
      </View>
    </View>
  );

  const renderWineCard = ({ item }: { item: WineRecommendation }) => (
    <View style={styles.cardContainer}>
      <AdaptiveWineCard
        wine={item}
        onRemoveFromFavorites={confirmRemoveFavorite}
        isFavorite={true}
        showRemoveButton={true}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="heart" size={32} color={COLORS.primary[500]} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Wine Collection</Text>
          <Text style={styles.headerSubtitle}>
            {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'} saved
          </Text>
        </View>
      </View>
      
      {favorites.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {favorites.filter(w => w.pricePoint?.includes('$')).length}
            </Text>
            <Text style={styles.statLabel}>Price Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Set(favorites.map(w => w.producer)).size}
            </Text>
            <Text style={styles.statLabel}>Producers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {new Set(favorites.map(w => w.vintage)).size}
            </Text>
            <Text style={styles.statLabel}>Vintages</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="wine" size={48} color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderWineCard}
        keyExtractor={(item) => `${item.wineName}-${item.vintage}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary[500]]}
            tintColor={COLORS.primary[500]}
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          favorites.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body.large,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  listContainer: {
    paddingBottom: SPACING.xl,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading.large,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.heading.medium,
    color: COLORS.primary[500],
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption.medium,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  cardContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading.large,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body.large,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  emptyActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  emptyActionText: {
    ...TYPOGRAPHY.button.medium,
    color: COLORS.primary[500],
    marginLeft: SPACING.sm,
  },
});

export default EnhancedFavoritesScreen;




