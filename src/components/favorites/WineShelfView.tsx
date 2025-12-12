import React, { useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Animated,
  ImageBackground,
} from 'react-native';
import { WineRecommendation } from '../../types/wine';
import ShelfRow from './ShelfRow';

interface WineShelfViewProps {
  data: WineRecommendation[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  onPress?: (wine: WineRecommendation) => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

interface GroupedWines {
  [key: string]: WineRecommendation[];
}

const WineShelfView: React.FC<WineShelfViewProps> = ({
  data,
  loading = false,
  refreshing = false,
  onRefresh,
  onRemoveFromFavorites,
  onPress,
  ListHeaderComponent,
  ListEmptyComponent,
}) => {
  // Group wines by producer
  const groupedWines = useMemo(() => {
    const groups: GroupedWines = {};

    data.forEach((wine) => {
      const producer = wine.producer || 'Unknown Producer';
      if (!groups[producer]) {
        groups[producer] = [];
      }
      groups[producer].push(wine);
    });

    // Sort groups alphabetically
    const sortedGroups: GroupedWines = {};
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  }, [data]);

  // Calculate total wines for index tracking
  const getStartIndex = useCallback((producer: string) => {
    let index = 0;
    for (const [key, wines] of Object.entries(groupedWines)) {
      if (key === producer) {
        return index;
      }
      index += wines.length;
    }
    return index;
  }, [groupedWines]);

  if (data.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        {ListHeaderComponent && (
          <View>{typeof ListHeaderComponent === 'function' ? <ListHeaderComponent /> : ListHeaderComponent}</View>
        )}
        {ListEmptyComponent && (
          <View>{typeof ListEmptyComponent === 'function' ? <ListEmptyComponent /> : ListEmptyComponent}</View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Wine Cellar Background */}
      <ImageBackground
        source={require('../../../assets/images/wine-cellar-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        showsVerticalScrollIndicator={false}
      >
        {ListHeaderComponent && (
          <View style={styles.headerWrapper}>
            {typeof ListHeaderComponent === 'function' ? <ListHeaderComponent /> : ListHeaderComponent}
          </View>
        )}

        {/* Wine Cellar Content */}
        <View style={styles.cellarContent}>
          {/* Render shelf rows for each producer group */}
          {Object.entries(groupedWines).map(([producer, wines]) => (
            <ShelfRow
              key={producer}
              title={producer}
              wines={wines}
              onWinePress={onPress}
              onRemoveFromFavorites={onRemoveFromFavorites}
              startIndex={getStartIndex(producer)}
            />
          ))}

          {/* Empty space at bottom */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(91, 36, 51, 0.15)', // Dark tone overlay
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerWrapper: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  cellarContent: {
    paddingTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default WineShelfView;
