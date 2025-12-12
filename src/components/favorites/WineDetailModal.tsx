import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineRecommendation } from '../../types/wine';
import { getServingGuidance } from '../../utils/wineTypeHelpers';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WineDetailModalProps {
  visible: boolean;
  wine: WineRecommendation | null;
  onClose: () => void;
  onRemoveFromFavorites?: (wine: WineRecommendation) => void;
  index?: number;
}

const WineDetailModal: React.FC<WineDetailModalProps> = ({
  visible,
  wine,
  onClose,
  onRemoveFromFavorites,
  index = 0,
}) => {
  if (!wine) return null;

  // Get wine image
  const getWineImage = () => {
    const wineImages = [
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=400&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&q=80',
    ];
    const imageIndex = index % wineImages.length;
    return wineImages[imageIndex];
  };

  const handleRemoveFavorite = () => {
    onRemoveFromFavorites?.(wine);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wine Details</Text>
          <TouchableOpacity
            onPress={handleRemoveFavorite}
            style={styles.removeButton}
          >
            <Ionicons name="heart" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image */}
          <View style={styles.heroSection}>
            <Image
              source={{ uri: getWineImage() }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />
            
            {/* Wine Info Overlay */}
            <View style={styles.heroContent}>
              <Text style={styles.wineName}>{wine.wineName}</Text>
              <Text style={styles.producer}>{wine.producer} • {wine.vintage}</Text>
              
              <View style={styles.heroBadges}>
                {wine.pricePoint && wine.pricePoint !== 'unknown' && wine.pricePoint !== 'Price N/A' && (
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{wine.pricePoint}</Text>
                  </View>
                )}
                {wine.expertRating && wine.expertRating !== 'unknown' && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{wine.expertRating}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsSection}>
            {wine.rationale && (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="wine" size={20} color="#5B2433" />
                  <Text style={styles.detailTitle}>Why This Wine</Text>
                </View>
                <Text style={styles.detailText}>{wine.rationale}</Text>
              </View>
            )}

            {wine.tastingNotes && (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="flask" size={20} color="#5B2433" />
                  <Text style={styles.detailTitle}>Tasting Notes</Text>
                </View>
                {(() => {
                  const tastingNotes = typeof wine.tastingNotes === 'string' 
                    ? { aromas: [], palate: wine.tastingNotes, finish: '' }
                    : wine.tastingNotes;
                  return (
                    <>
                      {tastingNotes.aromas && tastingNotes.aromas.length > 0 && (
                        <Text style={styles.detailText}>
                          Aromas: {tastingNotes.aromas.join(', ')}
                        </Text>
                      )}
                      <Text style={styles.detailText}>{tastingNotes.palate}</Text>
                      {tastingNotes.finish && (
                        <Text style={styles.detailText}>Finish: {tastingNotes.finish}</Text>
                      )}
                    </>
                  );
                })()}
              </View>
            )}

            {wine.servingGuidance && (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="thermometer" size={20} color="#5B2433" />
                  <Text style={styles.detailTitle}>Serving Guidance</Text>
                </View>
                <Text style={styles.detailText}>{getServingGuidance(wine)}</Text>
              </View>
            )}

            {wine.retailerSuggestion && (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="storefront" size={20} color="#5B2433" />
                  <Text style={styles.detailTitle}>Where to Buy</Text>
                </View>
                <Text style={styles.detailText}>{wine.retailerSuggestion}</Text>
              </View>
            )}

            {wine.storytellingElements && (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="book" size={20} color="#5B2433" />
                  <Text style={styles.detailTitle}>Story</Text>
                </View>
                <Text style={styles.detailText}>{wine.storytellingElements}</Text>
              </View>
            )}

            {wine.confidenceScore && (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#5B2433" />
                  <Text style={styles.detailTitle}>Confidence Score</Text>
                </View>
                <View style={styles.confidenceBar}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${wine.confidenceScore}%` },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {wine.confidenceScore}% confidence in this recommendation
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#5B2433',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  wineName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  producer: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  priceBadge: {
    backgroundColor: '#5B2433',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingText: {
    color: '#5B2433',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  detailsSection: {
    padding: 16,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5B2433',
    marginLeft: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#5B2433',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
});

export default WineDetailModal;





