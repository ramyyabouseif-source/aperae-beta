import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { FavoritesService } from '../services/favoritesService';
import { FavoriteWine } from '../types/wine';
import WineCard from '../components/WineCard';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteWine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favs = await FavoritesService.getFavorites();
      setFavorites(favs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load favorites');
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (wine: FavoriteWine) => {
    try {
      if (wine.id) {
        await FavoritesService.removeFromFavorites(wine.id);
        await loadFavorites();
        Alert.alert('Success', 'Wine removed from favorites');
      } else {
        Alert.alert('Error', 'Cannot remove wine - missing ID');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove favorite');
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start exploring wines and add them to your favorites!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Favorite Wines</Text>
        <Text style={styles.subtitle}>
          {favorites.length} wine{favorites.length !== 1 ? 's' : ''} saved
        </Text>
      </View>

      {favorites.map((wine) => (
        <WineCard
          key={wine.id}
          wine={wine}
          onRemoveFromFavorites={handleRemoveFavorite}
          isFavorite={true}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#8B0000',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});