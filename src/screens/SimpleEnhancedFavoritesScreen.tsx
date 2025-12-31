import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FavoritesService, PaginationOptions } from '../services/favoritesService';
import { LayoutPreferencesService, LayoutType } from '../services/layoutPreferencesService';
import { MyCellarWine } from '../types/wine';
import MasonryGrid from '../components/favorites/MasonryGrid';
import FavoritesListView from '../components/favorites/FavoritesListView';
import LayoutToggleButton from '../components/favorites/LayoutToggleButton';
import WineDetailModal from '../components/favorites/WineDetailModal';
import StatusBadge from '../components/myCellar/StatusBadge';
import StarRating from '../components/myCellar/StarRating';

const SimpleEnhancedFavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<MyCellarWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedWine, setSelectedWine] = useState<MyCellarWine | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [stats, setStats] = useState({ total: 0, wantToTry: 0, haveTried: 0, favorites: 0, averageRating: 0 });
  const [statusFilter, setStatusFilter] = useState<'all' | 'wantToTry' | 'haveTried' | 'favorite'>('all');
  const navigation = useNavigation();

  const PAGE_SIZE = 20; // Items per page

  useEffect(() => {
    loadLayoutPreference();
    loadFavorites(1, false);
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStats();
  }, [favorites]);

  const loadStats = async () => {
    try {
      const statsData = await FavoritesService.getMyCellarStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadLayoutPreference = async () => {
    try {
      const savedLayout = await LayoutPreferencesService.getLayoutPreference();
      setLayout(savedLayout);
    } catch (error) {
      console.error('Error loading layout preference:', error);
    }
  };

  const handleLayoutToggle = useCallback(async (newLayout: LayoutType) => {
    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setLayout(newLayout);
    try {
      await LayoutPreferencesService.saveLayoutPreference(newLayout);
    } catch (error) {
      console.error('Error saving layout preference:', error);
    }
  }, [fadeAnim]);

  const loadFavorites = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const paginationOptions: PaginationOptions = {
        page,
        pageSize: PAGE_SIZE,
        sortBy: 'date',
        sortOrder: 'desc',
      };

      const result = await FavoritesService.getFavoritesPaginated(paginationOptions);
      
      if (append) {
        setFavorites(prev => [...prev, ...result.data]);
      } else {
        setFavorites(result.data);
      }

      setHasMore(result.pagination.hasNextPage);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    await loadFavorites(1, false);
    setRefreshing(false);
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadFavorites(currentPage + 1, true);
    }
  }, [currentPage, hasMore, loadingMore, loading]);

  const handleDiscoverWines = () => {
    navigation.navigate('Home' as never);
  };

  const handleRemoveFavorite = async (wine: MyCellarWine) => {
    try {
      await FavoritesService.removeFromFavorites(wine);
      setFavorites(prev => prev.filter(fav => fav.id !== wine.id));
      await loadStats();
    } catch (error) {
      console.error('Error removing wine:', error);
      Alert.alert('Error', 'Failed to remove wine from My Cellar');
    }
  };

  const confirmRemoveFavorite = (wine: MyCellarWine) => {
    Alert.alert(
      'Remove from My Cellar',
      `Are you sure you want to remove ${wine.wineName} from your cellar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => handleRemoveFavorite(wine) },
      ]
    );
  };

  const handleWinePress = useCallback((wine: MyCellarWine) => {
    // Removed modal - let cards flip instead
    // Cards now handle their own flip interaction
    // setSelectedWine(wine);
    // setModalVisible(true);
  }, []);

  const handleStatusChange = async (wine: MyCellarWine, newStatus: 'wantToTry' | 'haveTried' | 'favorite') => {
    try {
      await FavoritesService.updateWineStatus(wine.id, newStatus);
      // Update local state
      setFavorites(prev => prev.map(w => 
        w.id === wine.id ? { ...w, status: newStatus } : w
      ));
      await loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update wine status');
    }
  };

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedWine(null);
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="wine-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>My Cellar is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring wines and add them to your cellar. Track what you've tried, what you want to try, and your favorites!
      </Text>
      <TouchableOpacity 
        style={styles.emptyActionContainer}
        onPress={handleDiscoverWines}
        activeOpacity={0.7}
      >
        <Ionicons name="wine" size={24} color="#8B0000" />
        <Text style={styles.emptyActionText}>Discover amazing wines</Text>
        <Ionicons name="chevron-forward" size={16} color="#8B0000" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Ionicons name="wine" size={48} color="#8B0000" />
          <Text style={styles.loadingText}>Loading your cellar...</Text>
        </View>
      </View>
    );
  }

  const renderListHeader = () => {
    // Filter wines by status
    const filteredWines = statusFilter === 'all' 
      ? favorites 
      : favorites.filter(w => w.status === statusFilter);

    return (
      <View>
        {/* Dashboard Summary */}
        <View style={styles.dashboardSummary}>
          <Text style={styles.dashboardTitle}>My Cellar</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.wantToTry}</Text>
              <Text style={styles.statLabel}>Want to Try</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.haveTried}</Text>
              <Text style={styles.statLabel}>Have Tried</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.favorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
          {stats.averageRating > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>Average Rating:</Text>
              <StarRating rating={stats.averageRating} size={16} readonly showLabel />
            </View>
          )}
        </View>

        {/* Status Filter */}
        {favorites.length > 0 && (
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {(['all', 'favorite', 'wantToTry', 'haveTried'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    statusFilter === filter && styles.filterButtonActive,
                  ]}
                  onPress={() => setStatusFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      statusFilter === filter && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter === 'all' ? 'All' : filter === 'wantToTry' ? 'Want to Try' : filter === 'haveTried' ? 'Have Tried' : 'Favorites'}
                  </Text>
                  {statusFilter === filter && favorites.filter(w => w.status === filter).length > 0 && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>
                        {filter === 'all' ? favorites.length : favorites.filter(w => w.status === filter).length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Layout Toggle Button */}
        {filteredWines.length > 0 && (
          <View style={styles.layoutToggleContainer}>
            <LayoutToggleButton
              layout={layout}
              onToggle={handleLayoutToggle}
            />
          </View>
        )}
      </View>
    );
  };

  // Get filtered wines for display
  const getFilteredWines = () => {
    return statusFilter === 'all' 
      ? favorites 
      : favorites.filter(w => w.status === statusFilter);
  };

  return (
    <View style={styles.container}>
      {/* Wine Cellar Background */}
      <ImageBackground
        source={require('../../assets/images/wine-cellar-background.jpg')}
        style={styles.wineCellarBackground}
        resizeMode="cover"
      />
      <View style={styles.wineCellarOverlay} />
      
      {/* Animated Layout Container */}
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            flex: 1,
          },
        ]}
      >
        {layout === 'grid' ? (
          <MasonryGrid
            data={getFilteredWines()}
            loading={loading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onRemoveFromFavorites={confirmRemoveFavorite}
            onPress={handleWinePress}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={[
              getFilteredWines().length === 0 && styles.emptyListContainer
            ]}
          />
        ) : (
          <FavoritesListView
            data={getFilteredWines()}
            loading={loading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onRemoveFromFavorites={confirmRemoveFavorite}
            onPress={handleWinePress}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={[
              getFilteredWines().length === 0 && styles.emptyListContainer
            ]}
            onWineUpdated={async () => {
              await loadFavorites(currentPage, false);
              await loadStats();
            }}
          />
        )}
      </Animated.View>

      {/* Wine Detail Modal - Disabled: Cards now flip instead */}
      {/* <WineDetailModal
        visible={modalVisible}
        wine={selectedWine}
        onClose={handleCloseModal}
        onRemoveFromFavorites={confirmRemoveFavorite}
        index={selectedWine ? favorites.findIndex(w => {
          const selectedId = (selectedWine as any).id;
          const wineId = (w as any).id;
          if (selectedId && wineId) {
            return selectedId === wineId;
          }
          return w.wineName === selectedWine.wineName && 
                 w.producer === selectedWine.producer && 
                 w.vintage === selectedWine.vintage;
        }) : 0}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dashboardSummary: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone with transparency
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#BF9694', // Metallic accent
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  dashboardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5B2433', // Dark tone
    marginBottom: 8,
    textAlign: 'center',
  },
  dashboardSubtitle: {
    fontSize: 16,
    color: '#5B2433', // Dark tone
    textAlign: 'center',
  },
  layoutToggleContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  wineCellarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  wineCellarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(91, 36, 51, 0.2)', // Dark tone overlay
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4F0', // Light tone
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#5B2433', // Dark tone
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 150, 148, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B0000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#5B2433',
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 150, 148, 0.2)',
    justifyContent: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#5B2433',
    marginRight: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 244, 240, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)',
  },
  filterButtonActive: {
    backgroundColor: '#8B0000',
    borderColor: '#8B0000',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B2433',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(247, 244, 240, 0.1)', // Light tone
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F7F4F0', // Light tone
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5B2433', // Dark tone
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#5B2433', // Dark tone
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#BF9694', // Metallic accent
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.2)', // Metallic accent
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B2433', // Dark tone
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
});

export default SimpleEnhancedFavoritesScreen;
