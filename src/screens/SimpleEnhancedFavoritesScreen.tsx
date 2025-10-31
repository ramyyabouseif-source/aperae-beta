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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FavoritesService } from '../services/favoritesService';
import { WineRecommendation } from '../types/wine';
import AdaptiveWineCard from '../components/AdaptiveWineCard';

const SimpleEnhancedFavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<WineRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="heart" size={32} color="#8B0000" />
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
          <Ionicons name="wine" size={48} color="#8B0000" />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Wine Cellar Background */}
      <Animated.Image
        source={require('../../assets/images/wine-cellar-background.jpg')}
        style={styles.wineCellarBackground}
        resizeMode="cover"
      />
      
      {/* Wine Cellar Overlay */}
      <View style={styles.wineCellarOverlay} />
      
      <FlatList
        data={favorites}
        renderItem={renderWineCard}
        keyExtractor={(item) => `${item.wineName}-${item.vintage}`}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B0000']}
            tintColor="#8B0000"
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          favorites.length === 0 && styles.emptyListContainer
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4F0', // Light tone
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
  flatList: {
    flex: 1,
    backgroundColor: 'transparent',
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
  listContainer: {
    paddingBottom: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8B0000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8B0000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.3)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B0000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B0000',
    textAlign: 'center',
  },
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
