import React from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface GridSkeletonLoaderProps {
  numColumns: number;
  numRows?: number;
}

const GridSkeletonLoader: React.FC<GridSkeletonLoaderProps> = ({
  numColumns,
  numRows = 4,
}) => {
  const cardWidth = (screenWidth - (numColumns + 1) * 16) / numColumns;
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderSkeletonCard = () => (
    <Animated.View
      style={[
        styles.skeletonCard,
        { width: cardWidth, opacity },
      ]}
    >
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
        <View style={styles.skeletonText} />
        <View style={[styles.skeletonText, { width: '60%' }]} />
      </View>
    </Animated.View>
  );

  const items = Array.from({ length: numColumns * numRows }, (_, i) => i);

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item} style={styles.cardWrapper}>
          {renderSkeletonCard()}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardWrapper: {
    marginBottom: 12,
    marginHorizontal: 8,
  },
  skeletonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    overflow: 'hidden',
    height: 280,
  },
  skeletonImage: {
    width: '100%',
    height: 150,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonSubtitle: {
    height: 16,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonText: {
    height: 12,
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 6,
    width: '100%',
  },
});

export default GridSkeletonLoader;





