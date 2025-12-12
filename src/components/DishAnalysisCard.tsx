import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DishAnalysis } from '../types/wine';

interface DishAnalysisCardProps {
  dish: string;
  dishAnalysis?: DishAnalysis | undefined;
  pairingPrinciples?: string[] | undefined;
}

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Helper function to capitalize first letter only
const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const DishAnalysisCard: React.FC<DishAnalysisCardProps> = ({
  dish,
  dishAnalysis,
  pairingPrinciples,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      {/* Expand/Collapse Arrow - Top Right */}
      <TouchableOpacity
        style={styles.expandButtonTopRight}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#8B0000"
        />
      </TouchableOpacity>

      {/* Header - Always visible, clickable to expand/collapse */}
      <TouchableOpacity
        style={[styles.header, expanded && styles.headerExpanded]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="restaurant" size={24} color="#8B0000" />
        <Text style={styles.dishTitle}>Wine Recommendations for</Text>
        <Text style={styles.dishName}>"{capitalizeWords(dish)}"</Text>
      </TouchableOpacity>
      {!expanded && (
        <Text style={styles.expandHint}>Expand for dish analysis</Text>
      )}

      {/* Dish Analysis - Only show when expanded */}
      {expanded && dishAnalysis && (
        <View style={[styles.analysisSection, { marginTop: 20 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={18} color="#8B0000" />
            <Text style={styles.sectionTitle}>Dish Analysis</Text>
          </View>

          {/* Analysis Grid */}
          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Weight</Text>
              <Text style={styles.analysisValue}>
                {capitalizeFirst(dishAnalysis.dominantWeight)}
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Fat Content</Text>
              <Text style={styles.analysisValue}>
                {capitalizeFirst(dishAnalysis.fatContent)}
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Protein</Text>
              <Text style={styles.analysisValue} numberOfLines={2}>
                {capitalizeFirst(dishAnalysis.primaryProtein)}
              </Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>Spice Level</Text>
              <Text style={styles.analysisValue}>
                {capitalizeFirst(dishAnalysis.spiceLevel)}
              </Text>
            </View>
            {/* New Enhanced Fields */}
            {dishAnalysis.acidityLevel && (
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Acidity Level</Text>
                <Text style={styles.analysisValue}>
                  {capitalizeFirst(dishAnalysis.acidityLevel)}
                </Text>
              </View>
            )}
          </View>

          {/* Key Challenge (Enhanced Format) */}
          {dishAnalysis.keyChallenge && (
            <View style={styles.challengeContainer}>
              <Text style={styles.challengeLabel}>Key Pairing Challenge</Text>
              <Text style={styles.challengeText}>{dishAnalysis.keyChallenge}</Text>
            </View>
          )}

          {/* Ideal Profile (Enhanced Format) */}
          {dishAnalysis.idealProfile && (
            <View style={styles.idealProfileContainer}>
              <Text style={styles.idealProfileLabel}>Ideal Wine Profile</Text>
              <View style={styles.idealProfileGrid}>
                {dishAnalysis.idealProfile.acidity && (
                  <View style={styles.idealProfileItem}>
                    <Text style={styles.idealProfileKey}>Acidity:</Text>
                    <Text style={styles.idealProfileValue}>
                      {capitalizeFirst(dishAnalysis.idealProfile.acidity)}
                    </Text>
                  </View>
                )}
                {dishAnalysis.idealProfile.tannin && (
                  <View style={styles.idealProfileItem}>
                    <Text style={styles.idealProfileKey}>Tannin:</Text>
                    <Text style={styles.idealProfileValue}>
                      {capitalizeFirst(dishAnalysis.idealProfile.tannin)}
                    </Text>
                  </View>
                )}
                {dishAnalysis.idealProfile.body && (
                  <View style={styles.idealProfileItem}>
                    <Text style={styles.idealProfileKey}>Body:</Text>
                    <Text style={styles.idealProfileValue}>
                      {capitalizeFirst(dishAnalysis.idealProfile.body)}
                    </Text>
                  </View>
                )}
                {dishAnalysis.idealProfile.sweetness && (
                  <View style={styles.idealProfileItem}>
                    <Text style={styles.idealProfileKey}>Sweetness:</Text>
                    <Text style={styles.idealProfileValue}>
                      {capitalizeFirst(dishAnalysis.idealProfile.sweetness)}
                    </Text>
                  </View>
                )}
              </View>
              {dishAnalysis.idealProfile.notes && (
                <Text style={styles.idealProfileNotes}>
                  {dishAnalysis.idealProfile.notes}
                </Text>
              )}
            </View>
          )}

          {/* Flavors */}
          {dishAnalysis.dominantFlavors && dishAnalysis.dominantFlavors.length > 0 && (
            <View style={styles.flavorsContainer}>
              <Text style={styles.flavorsLabel}>Dominant Flavors</Text>
              <View style={styles.flavorsTags}>
                {dishAnalysis.dominantFlavors.map((flavor, index) => (
                  <View key={index} style={styles.flavorTag}>
                    <Text style={styles.flavorText}>{capitalizeFirst(flavor)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Pairing Principles */}
          {pairingPrinciples && pairingPrinciples.length > 0 && (
            <View style={styles.principlesContainer}>
              <Text style={styles.principlesLabel}>Pairing Principles Applied</Text>
              <View style={styles.principlesList}>
                {pairingPrinciples.map((principle, index) => (
                  <View key={index} style={styles.principleItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#8B0000" />
                    <Text style={styles.principleText}>{principle}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  expandButtonTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000',
    position: 'relative',
  },
  headerExpanded: {
    marginBottom: 20,
  },
  expandHint: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  dishTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dishName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B0000',
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },
  analysisSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  analysisItem: {
    width: '50%',
    paddingVertical: 8,
    paddingRight: 12,
  },
  analysisLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  flavorsContainer: {
    marginTop: 8,
  },
  flavorsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  flavorsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flavorTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  flavorText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B0000',
  },
  principlesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  principlesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  principlesList: {
    gap: 8,
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  principleText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  challengeContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  challengeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  challengeText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  idealProfileContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  idealProfileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  idealProfileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  idealProfileItem: {
    width: '50%',
    marginBottom: 8,
  },
  idealProfileKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  idealProfileValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E7D32',
  },
  idealProfileNotes: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default DishAnalysisCard;

