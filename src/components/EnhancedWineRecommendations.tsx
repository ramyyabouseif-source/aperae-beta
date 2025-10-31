/**
 * Enhanced Wine Service Integration Example
 * Demonstrates how to integrate all foundation improvements:
 * - Enhanced error handling
 * - Loading states
 * - Performance monitoring
 * - Privacy compliance
 * - API rate limiting and retry
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { WineService } from '../services/wineService';
import { EnhancedErrorHandler, EnhancedError } from '../utils/enhancedErrorHandler';
import { SkeletonWineCard, LoadingState, ProgressIndicator } from '../components/LoadingStates';
import EnhancedErrorDisplay from '../components/EnhancedErrorDisplay';
import performanceMonitor from '../utils/performanceMonitor';
import privacyManager from '../utils/privacyManager';
import apiService from '../services/enhancedApiService';

interface EnhancedWineRecommendationsProps {
  dish: string;
  onRecommendationsReceived?: (recommendations: any) => void;
}

const EnhancedWineRecommendations: React.FC<EnhancedWineRecommendationsProps> = ({
  dish,
  onRecommendationsReceived,
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Getting wine recommendations...');

  useEffect(() => {
    if (dish) {
      fetchRecommendations();
    }
  }, [dish]);

  /**
   * Fetches wine recommendations with all enhancements integrated
   */
  const fetchRecommendations = async () => {
    const timingId = performanceMonitor.startTiming('wine_recommendations', {
      dish,
      timestamp: new Date().toISOString(),
    });

    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      // Set expectation without changing skeleton behavior
      const startTs = Date.now();
      setLoadingMessage('Generating recommendations (10–30s)...');

      // Check privacy consent
      if (!privacyManager.hasConsentFor('wine_preferences')) {
        const consent = await privacyManager.requestConsent();
        if (!consent.personalization) {
          throw new Error('Personalization consent required for wine recommendations');
        }
      }

      // Record data collection
      await privacyManager.recordDataCollection(
        'wine_preferences',
        'Provide personalized wine recommendations',
        { dish }
      );

      setProgress(0.2);
      setLoadingMessage('Analyzing dish...');

      // Simulate progress updates + dynamic ETA
      const progressInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTs) / 1000);
        const estTotal = 30; // upper-bound estimate
        const remaining = Math.max(3, estTotal - elapsedSec);
        setLoadingMessage(`Generating recommendations (~${remaining}s remaining)...`);
        setProgress(prev => {
          if (prev >= 0.9) {
            clearInterval(progressInterval);
            return 0.9;
          }
          return prev + 0.1;
        });
      }, 1000);

      setProgress(0.3);
      setLoadingMessage('Finding perfect wine pairings...');

      // Make API call with enhanced service
      const result = await apiService.request({
        method: 'POST',
        url: '/recommendations',
        data: { dish },
        retries: 3,
        retryDelay: 1000,
        timeout: 30000,
      });

      clearInterval(progressInterval);
      setProgress(1.0);
      setLoadingMessage('Complete!');

      // Track API performance
      performanceMonitor.trackApiCall(
        '/recommendations',
        'POST',
        performance.now() - 1000, // Approximate start time
        performance.now(),
        200,
        JSON.stringify(result).length
      );

      setRecommendations(result.recommendations || []);
      onRecommendationsReceived?.(result);

      // Record successful data collection
      await privacyManager.recordDataCollection(
        'wine_preferences',
        'Successfully provided wine recommendations',
        { dish, recommendationCount: result.recommendations?.length || 0 }
      );

    } catch (error) {
      // Create enhanced error
      const enhancedError = EnhancedErrorHandler.createEnhancedError(error, {
        operation: 'getWineRecommendations',
        component: 'EnhancedWineRecommendations',
        userAction: 'fetchRecommendations',
        retryable: true,
      });

      setError(enhancedError);

      // Log error for monitoring
      EnhancedErrorHandler.logError(enhancedError);

      // Record error in privacy system
      await privacyManager.recordDataCollection(
        'usage_analytics',
        'Track error for improvement',
        { error: error.message, dish }
      );

    } finally {
      setLoading(false);
      setProgress(0);
      setLoadingMessage('');

      // End performance timing
      performanceMonitor.endTiming(timingId, {
        success: !error,
        recommendationCount: recommendations.length,
      });
    }
  };

  /**
   * Handles retry action from error display
   */
  const handleRetry = () => {
    fetchRecommendations();
  };

  /**
   * Handles error dismissal
   */
  const handleDismissError = () => {
    setError(null);
  };

  /**
   * Renders loading state with skeleton cards
   */
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ProgressIndicator progress={progress} message={loadingMessage} />
      <View style={styles.skeletonContainer}>
        <SkeletonWineCard />
        <SkeletonWineCard />
        <SkeletonWineCard />
      </View>
    </View>
  );

  /**
   * Renders error state with enhanced error display
   */
  const renderErrorState = () => {
    if (!error) return null;

    return (
      <EnhancedErrorDisplay
        error={error}
        onDismiss={handleDismissError}
        style={styles.errorContainer}
      />
    );
  };

  /**
   * Renders wine recommendations
   */
  const renderRecommendations = () => (
    <ScrollView style={styles.recommendationsContainer}>
      {recommendations.map((wine, index) => (
        <View key={index} style={styles.wineCard}>
          <Text style={styles.wineName}>{wine.wineName}</Text>
          <Text style={styles.producer}>{wine.producer}</Text>
          <Text style={styles.pricePoint}>{wine.pricePoint}</Text>
          <Text style={styles.rationale}>{wine.rationale}</Text>
        </View>
      ))}
    </ScrollView>
  );

  /**
   * Renders performance summary (development only)
   */
  const renderPerformanceSummary = () => {
    if (!__DEV__) return null;

    return (
      <TouchableOpacity
        style={styles.performanceButton}
        onPress={() => performanceMonitor.logPerformanceSummary()}
      >
        <Text style={styles.performanceButtonText}>View Performance</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && renderLoadingState()}
      {error && renderErrorState()}
      {!loading && !error && recommendations.length > 0 && renderRecommendations()}
      {!loading && !error && recommendations.length === 0 && (
        <LoadingState message="No recommendations available" showSpinner={false} />
      )}
      {renderPerformanceSummary()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4F0',
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  skeletonContainer: {
    marginTop: 20,
  },
  errorContainer: {
    marginTop: 20,
  },
  recommendationsContainer: {
    flex: 1,
    padding: 16,
  },
  wineCard: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 150, 148, 0.3)',
    shadowColor: '#BF9694',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  wineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5B2433',
    marginBottom: 4,
  },
  producer: {
    fontSize: 14,
    color: '#6C6C6C',
    marginBottom: 8,
  },
  pricePoint: {
    fontSize: 16,
    fontWeight: '600',
    color: '#BF9694',
    marginBottom: 8,
  },
  rationale: {
    fontSize: 14,
    color: '#5B2433',
    lineHeight: 20,
  },
  performanceButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#5B2433',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  performanceButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default EnhancedWineRecommendations;



