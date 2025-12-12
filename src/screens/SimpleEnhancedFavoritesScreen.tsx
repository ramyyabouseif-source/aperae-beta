import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FavoritesService, PaginationOptions } from '../services/favoritesService';
import { LayoutPreferencesService, LayoutType } from '../services/layoutPreferencesService';
import { WineRecommendation } from '../types/wine';
import MasonryGrid from '../components/favorites/MasonryGrid';
import FavoritesListView from '../components/favorites/FavoritesListView';
import LayoutToggleButton from '../components/favorites/LayoutToggleButton';
import WineDetailModal from '../components/favorites/WineDetailModal';

const SimpleEnhancedFavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<WineRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedWine, setSelectedWine] = useState<WineRecommendation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [fadeAnim] = useState(new Animated.Value(1));
  const navigation = useNavigation();

  const PAGE_SIZE = 20; // Items per page

  useEffect(() => {
    loadLayoutPreference();
    loadFavorites(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleRemoveFavorite = async (wine: WineRecommendation) => {
    try {
      // Pass the wine object directly - the service will handle ID matching
      await FavoritesService.removeFromFavorites(wine as any);
      // Update local state by filtering out the removed wine
      setFavorites(prev => prev.filter(fav => {
        // Match by ID if available, otherwise match by wine details
        if ((fav as any).id && (wine as any).id) {
          return (fav as any).id !== (wine as any).id;
        }
        return !(fav.wineName === wine.wineName && 
                fav.producer === wine.producer && 
                fav.vintage === wine.vintage);
      }));
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

  const handleWinePress = useCallback((wine: WineRecommendation) => {
    setSelectedWine(wine);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedWine(null);
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring wines and add your favorites here. Your personal wine collection awaits!
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
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </View>
    );
  }

  const renderListHeader = () => {
    return (
      <View>
        {/* Dashboard Summary */}
        <View style={styles.dashboardSummary}>
          <Text style={styles.dashboardTitle}>My Wine Collection</Text>
          <Text style={styles.dashboardSubtitle}>
            {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'} saved
          </Text>
        </View>
        
        {/* Layout Toggle Button */}
        {favorites.length > 0 && (
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
            data={favorites}
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
              favorites.length === 0 && styles.emptyListContainer
            ]}
          />
        ) : (
          <FavoritesListView
            data={favorites}
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
              favorites.length === 0 && styles.emptyListContainer
            ]}
          />
        )}
      </Animated.View>

      {/* Wine Detail Modal */}
      <WineDetailModal
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
      />
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
