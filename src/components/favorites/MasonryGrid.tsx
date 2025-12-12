import React, { useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { WineRecommendation } from '../../types/wine';
import MasonryCard from './MasonryCard';
import GridSkeletonLoader from './GridSkeletonLoader';

const { width: screenWidth } = Dimensions.get('window');

// Determine number of columns based on screen width
const getNumColumns = (): number => {
  if (screenWidth >= 768) {
    return 3; // Tablets
  }
  return 2; // Phones
};

interface MasonryGridProps {
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
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
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
}) => {
  const numColumns = useMemo(() => getNumColumns(), []);

  // Calculate item layout for better performance
  const getItemLayout = useCallback(
    (_: any, index: number) => {
      const horizontalPadding = 24;
      const gapSpacing = 12;
      const totalSpacing = horizontalPadding + (gapSpacing * (numColumns - 1));
      const cardWidth = (screenWidth - totalSpacing) / numColumns;
      const cardHeight = 260; // Approximate card height with spacing
      const rowIndex = Math.floor(index / numColumns);
      return {
        length: cardHeight,
        offset: cardHeight * rowIndex,
        index,
      };
    },
    [numColumns]
  );

  const renderItem: ListRenderItem<WineRecommendation> = useCallback(
    ({ item, index }) => (
      <MasonryCard
        wine={item}
        numColumns={numColumns}
        onRemoveFromFavorites={onRemoveFromFavorites}
        onPress={onPress}
        index={index}
      />
    ),
    [numColumns, onRemoveFromFavorites, onPress]
  );

  const keyExtractor = useCallback(
    (item: WineRecommendation, index: number) => {
      // Use ID if available, otherwise use combination of name, producer, vintage
      const id = (item as any).id;
      if (id) {
        return `wine-${id}`;
      }
      return `wine-${item.wineName}-${item.producer}-${item.vintage}-${index}`;
    },
    []
  );

  if (loading && data.length === 0) {
    return (
      <View style={styles.container}>
        {ListHeaderComponent && (
          <View>{typeof ListHeaderComponent === 'function' ? <ListHeaderComponent /> : ListHeaderComponent}</View>
        )}
        <GridSkeletonLoader numColumns={numColumns} numRows={4} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={`grid-${numColumns}`} // Force re-render when columns change
        getItemLayout={getItemLayout}
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
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true} // Performance optimization
        maxToRenderPerBatch={10} // Render 10 items per batch
        updateCellsBatchingPeriod={50} // Update every 50ms
        initialNumToRender={6} // Initial render count
        windowSize={10} // Render window size
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
});

export default MasonryGrid;

