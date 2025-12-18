import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { WineRecommendation } from '../../types/wine';
import AdaptiveWineCard from '../AdaptiveWineCard';

interface FavoritesListViewProps {
  data: WineRecommendation[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  onPress?: (wine: WineRecommendation) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  contentContainerStyle?: any;
  onWineUpdated?: () => void; // Callback when wine data is updated
}

const FavoritesListView: React.FC<FavoritesListViewProps> = ({
  data,
  loading = false,
  refreshing = false,
  onRefresh,
  onRemoveFromFavorites,
  onPress,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
  onWineUpdated,
}) => {
  const renderItem: ListRenderItem<WineRecommendation> = useCallback(
    ({ item, index }) => (
      <View style={styles.cardContainer}>
        <AdaptiveWineCard
          wine={item}
          onRemoveFromFavorites={onRemoveFromFavorites}
          isFavorite={true}
          showRemoveButton={true}
          onPress={undefined}
          index={index}
          onWineUpdated={onWineUpdated}
        />
      </View>
    ),
    [onRemoveFromFavorites, onPress]
  );

  const keyExtractor = useCallback(
    (item: WineRecommendation, index: number) => {
      const id = (item as any).id;
      if (id) {
        return `wine-${id}`;
      }
      return `wine-${item.wineName}-${item.producer}-${item.vintage}-${index}`;
    },
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8B0000']}
              tintColor="#8B0000"
            />
          ) : undefined
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={6}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  cardContainer: {
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
});

export default FavoritesListView;





