import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface SkeletonWineCardProps {
  style?: any;
  delay?: number; // For staggered animations
}

const SkeletonWineCard: React.FC<SkeletonWineCardProps> = ({ style, delay = 0 }) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const breathingAnimation = useRef(new Animated.Value(1)).current;
  const winePourAnimation = useRef(new Animated.Value(0)).current;
  const floatingAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered start for multiple cards
    const startDelay = delay;

    // Shimmer effect
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    // Breathing effect on the card
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnimation, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Wine pouring animation
    const winePour = Animated.loop(
      Animated.sequence([
        Animated.timing(winePourAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(winePourAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(1000), // Pause between pours
      ])
    );

    // Floating animation for wine glass
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations with delay
    setTimeout(() => {
      shimmer.start();
      breathing.start();
      winePour.start();
      floating.start();
    }, startDelay);

    return () => {
      shimmer.stop();
      breathing.stop();
      winePour.stop();
      floating.stop();
    };
  }, [shimmerAnimation, breathingAnimation, winePourAnimation, floatingAnimation, delay]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.8],
    }),
  };

  const breathingStyle = {
    transform: [{ scale: breathingAnimation }],
  };

  const winePourStyle = {
    opacity: winePourAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 0],
    }),
    transform: [
      {
        translateY: winePourAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
    ],
  };

  const floatingStyle = {
    transform: [
      {
        translateY: floatingAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -5],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, style, breathingStyle]}>
      {/* Background shimmer */}
      <Animated.View style={[styles.backgroundShimmer, shimmerStyle]} />
      
      {/* Wine accent bar with pulse */}
      <Animated.View style={[styles.accentBar, shimmerStyle]} />
      
      {/* Wine pouring animation overlay */}
      <Animated.View style={[styles.winePourOverlay, winePourStyle, floatingStyle]}>
        <View style={styles.wineGlass}>
          <View style={styles.wineGlassStem} />
          <View style={styles.wineGlassBowl} />
          <Animated.View style={[styles.winePour, winePourStyle]} />
        </View>
      </Animated.View>
      
      {/* Content */}
      <View style={styles.content}>
        {/* Header with rating and price */}
        <View style={styles.header}>
          <View style={styles.ratingContainer}>
            <Animated.View style={[styles.ratingShimmer, shimmerStyle]} />
          </View>
          <View style={styles.priceContainer}>
            <Animated.View style={[styles.priceShimmer, shimmerStyle]} />
          </View>
        </View>

        {/* Wine name and producer */}
        <View style={styles.titleSection}>
          <Animated.View style={[styles.titleShimmer, shimmerStyle]} />
          <Animated.View style={[styles.producerShimmer, shimmerStyle]} />
        </View>

        {/* Tasting notes */}
        <View style={styles.notesSection}>
          <Animated.View style={[styles.notesShimmer, shimmerStyle]} />
          <Animated.View style={[styles.notesShimmer2, shimmerStyle]} />
        </View>

        {/* Confidence bar */}
        <View style={styles.confidenceSection}>
          <Animated.View style={[styles.confidenceShimmer, shimmerStyle]} />
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Animated.View style={[styles.buttonShimmer, shimmerStyle]} />
          <Animated.View style={[styles.buttonShimmer, shimmerStyle]} />
        </View>
      </View>
    </Animated.View>
  );
};

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
  style?: any;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  showSpinner = true,
  style,
}) => {
  const spinAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();

    return () => spin.stop();
  }, [spinAnimation]);

  const spinStyle = {
    transform: [
      {
        rotate: spinAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={[styles.loadingContainer, style]}>
      {showSpinner && (
        <Animated.View style={spinStyle}>
          <Ionicons name="wine" size={32} color="#BF9694" />
        </Animated.View>
      )}
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

interface ProgressIndicatorProps {
  progress: number; // 0 to 1
  message?: string;
  style?: any;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  message,
  style,
}) => {
  return (
    <View style={[styles.progressContainer, style]}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, Math.max(0, progress * 100))}%` },
          ]}
        />
      </View>
      {message && <Text style={styles.progressText}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  // Skeleton Wine Card Styles
  container: {
    width: screenWidth - 40,
    height: 320,
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#F7F4F0',
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(191, 150, 148, 0.15)', // Metallic accent shimmer
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#5B2433', // Dark tone accent - consistent with wine cards
  },
  // Wine pouring animation styles
  winePourOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wineGlass: {
    width: 30,
    height: 50,
    position: 'relative',
  },
  wineGlassStem: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 20,
    backgroundColor: 'rgba(191, 150, 148, 0.6)',
    borderRadius: 1,
  },
  wineGlassBowl: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: 'rgba(191, 150, 148, 0.6)',
    borderRadius: 15,
    backgroundColor: 'transparent',
  },
  winePour: {
    position: 'absolute',
    top: -10,
    left: 10,
    width: 10,
    height: 15,
    backgroundColor: 'rgba(91, 36, 51, 0.7)',
    borderRadius: 5,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingShimmer: {
    width: 60,
    height: 16,
    backgroundColor: 'rgba(191, 150, 148, 0.3)',
    borderRadius: 8,
  },
  priceContainer: {
    backgroundColor: 'rgba(191, 150, 148, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceShimmer: {
    width: 40,
    height: 12,
    backgroundColor: 'rgba(191, 150, 148, 0.3)',
    borderRadius: 6,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleShimmer: {
    width: '80%',
    height: 20,
    backgroundColor: 'rgba(191, 150, 148, 0.3)',
    borderRadius: 10,
    marginBottom: 8,
  },
  producerShimmer: {
    width: '60%',
    height: 16,
    backgroundColor: 'rgba(191, 150, 148, 0.3)',
    borderRadius: 8,
  },
  notesSection: {
    marginBottom: 16,
  },
  notesShimmer: {
    width: '100%',
    height: 16,
    backgroundColor: 'rgba(191, 150, 148, 0.3)',
    borderRadius: 8,
    marginBottom: 8,
  },
  notesShimmer2: {
    width: '75%',
    height: 16,
    backgroundColor: 'rgba(191, 150, 148, 0.3)',
    borderRadius: 8,
  },
  confidenceSection: {
    marginBottom: 16,
  },
  confidenceShimmer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(191, 150, 148, 0.3)',
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  buttonShimmer: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(191, 150, 148, 0.3)',
    borderRadius: 12,
  },

  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F4F0',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#5B2433',
    marginTop: 16,
    textAlign: 'center',
  },

  // Progress Indicator Styles
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(191, 150, 148, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#BF9694',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6C6C6C',
    textAlign: 'center',
    marginTop: 8,
  },
});

export { SkeletonWineCard, LoadingState, ProgressIndicator };
