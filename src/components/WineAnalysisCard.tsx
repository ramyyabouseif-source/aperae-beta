import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineAnalysis, WineServingGuidance } from '../types/dish';

interface WineAnalysisCardProps {
  wine: string;
  wineAnalysis: WineAnalysis;
  wineServingGuidance?: WineServingGuidance;
}

const WineAnalysisCard: React.FC<WineAnalysisCardProps> = ({
  wine,
  wineAnalysis,
  wineServingGuidance,
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
        <Ionicons name="wine" size={24} color="#8B0000" />
        <Text style={styles.dishTitle}>DISH RECOMMENDATIONS FOR</Text>
        <Text style={styles.dishName}>"{wine}"</Text>
      </TouchableOpacity>
      {!expanded && (
        <Text style={styles.expandHint}>Expand for wine analysis</Text>
      )}

      {/* Wine Analysis - Only show when expanded */}
      {expanded && wineAnalysis && (
        <View style={[styles.analysisSection, { marginTop: 20 }]}>
          {/* Wine Profile Summary */}
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={18} color="#8B0000" />
            <Text style={styles.sectionTitle}>Wine Profile</Text>
          </View>

          <View style={styles.profileContainer}>
            {wineAnalysis.producer && wineAnalysis.producer !== 'Unknown' && wineAnalysis.producer !== 'unknown' && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Producer:</Text>
                <Text style={styles.profileValue}>{wineAnalysis.producer}</Text>
              </View>
            )}
            {wineAnalysis.region && wineAnalysis.region !== 'Unknown' && wineAnalysis.region !== 'unknown' && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Region:</Text>
                <Text style={styles.profileValue}>{wineAnalysis.region}</Text>
              </View>
            )}
            {wineAnalysis.color && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Color:</Text>
                <Text style={styles.profileValue}>
                  {wineAnalysis.color.charAt(0).toUpperCase() + wineAnalysis.color.slice(1)}
                </Text>
              </View>
            )}
            {wineAnalysis.structure?.body && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Body:</Text>
                <Text style={styles.profileValue}>
                  {wineAnalysis.structure.body.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join('-')}
                </Text>
              </View>
            )}
            {wineAnalysis.structure?.acidity && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Acidity:</Text>
                <Text style={styles.profileValue}>
                  {wineAnalysis.structure.acidity.charAt(0).toUpperCase() + wineAnalysis.structure.acidity.slice(1)}
                </Text>
              </View>
            )}
            {wineAnalysis.structure?.acidType && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Acid Type:</Text>
                <Text style={styles.profileValue}>
                  {wineAnalysis.structure.acidType.charAt(0).toUpperCase() + wineAnalysis.structure.acidType.slice(1)}
                </Text>
              </View>
            )}
            {wineAnalysis.structure?.tannin && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Tannin:</Text>
                <Text style={styles.profileValue}>
                  {wineAnalysis.structure.tannin.charAt(0).toUpperCase() + wineAnalysis.structure.tannin.slice(1)}
                </Text>
              </View>
            )}
            {wineAnalysis.structure?.sweetness && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Sweetness:</Text>
                <Text style={styles.profileValue}>
                  {wineAnalysis.structure.sweetness.charAt(0).toUpperCase() + wineAnalysis.structure.sweetness.slice(1)}
                </Text>
              </View>
            )}
            {wineAnalysis.structure?.abv && (
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>ABV:</Text>
                <Text style={styles.profileValue}>{wineAnalysis.structure.abv}</Text>
              </View>
            )}
          </View>

          {/* Key Strength */}
          {wineAnalysis.keyStrength && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>Key Strength</Text>
              <Text style={styles.strengthText}>{wineAnalysis.keyStrength}</Text>
            </View>
          )}

          {/* Ideal Dish Profile */}
          {wineAnalysis.idealDishProfile && (
            <View style={styles.idealDishContainer}>
              <Text style={styles.idealDishLabel}>Ideal Dish Profile</Text>
              <Text style={styles.idealDishText}>{wineAnalysis.idealDishProfile}</Text>
            </View>
          )}

          {/* Aromatic Profile */}
          {(wineAnalysis.aromaticProfile?.primaryAromas?.length > 0 ||
            wineAnalysis.aromaticProfile?.secondaryAromas?.length > 0 ||
            wineAnalysis.aromaticProfile?.tertiaryAromas?.length > 0 ||
            wineAnalysis.aromaticProfile?.dominantCompounds?.length > 0) && (
            <View style={styles.aromasContainer}>
              <Text style={styles.aromasLabel}>Aromatic Profile</Text>
              {wineAnalysis.aromaticProfile.primaryAromas?.length > 0 && (
                <View style={styles.aromasSection}>
                  <Text style={styles.aromasSectionLabel}>Primary:</Text>
                  <View style={styles.aromasTags}>
                    {wineAnalysis.aromaticProfile.primaryAromas.map((aroma, index) => (
                      <View key={index} style={styles.aromaTag}>
                        <Text style={styles.aromaText}>{aroma}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {wineAnalysis.aromaticProfile.secondaryAromas?.length > 0 && (
                <View style={styles.aromasSection}>
                  <Text style={styles.aromasSectionLabel}>Secondary:</Text>
                  <View style={styles.aromasTags}>
                    {wineAnalysis.aromaticProfile.secondaryAromas.map((aroma, index) => (
                      <View key={index} style={styles.aromaTag}>
                        <Text style={styles.aromaText}>{aroma}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {wineAnalysis.aromaticProfile.tertiaryAromas?.length > 0 && (
                <View style={styles.aromasSection}>
                  <Text style={styles.aromasSectionLabel}>Tertiary:</Text>
                  <View style={styles.aromasTags}>
                    {wineAnalysis.aromaticProfile.tertiaryAromas.map((aroma, index) => (
                      <View key={index} style={styles.aromaTag}>
                        <Text style={styles.aromaText}>{aroma}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {wineAnalysis.aromaticProfile.dominantCompounds?.length > 0 && (
                <View style={styles.aromasSection}>
                  <Text style={styles.aromasSectionLabel}>Dominant Compounds:</Text>
                  <View style={styles.aromasTags}>
                    {wineAnalysis.aromaticProfile.dominantCompounds.map((compound, index) => (
                      <View key={index} style={styles.aromaTag}>
                        <Text style={styles.aromaText}>{compound}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Wine Serving Guidance */}
          {wineServingGuidance && (
            <View style={styles.servingGuidanceContainer}>
              <View style={styles.sectionHeader}>
                <Ionicons name="wine-outline" size={18} color="#8B0000" />
                <Text style={styles.sectionTitle}>Serving Guidance</Text>
              </View>
              {wineServingGuidance.temperature && (
                <View style={styles.servingItem}>
                  <Text style={styles.servingLabel}>Temperature:</Text>
                  <Text style={styles.servingValue}>{wineServingGuidance.temperature}</Text>
                </View>
              )}
              {wineServingGuidance.glassware && (
                <View style={styles.servingItem}>
                  <Text style={styles.servingLabel}>Glassware:</Text>
                  <Text style={styles.servingValue}>{wineServingGuidance.glassware}</Text>
                </View>
              )}
              {wineServingGuidance.decanting && (
                <View style={styles.servingItem}>
                  <Text style={styles.servingLabel}>Decanting:</Text>
                  <Text style={styles.servingValue}>{wineServingGuidance.decanting}</Text>
                </View>
              )}
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
  profileContainer: {
    marginBottom: 16,
  },
  profileItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  strengthContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  strengthText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  idealDishContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  idealDishLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  idealDishText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  aromasContainer: {
    marginTop: 16,
  },
  aromasLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aromasSection: {
    marginBottom: 12,
  },
  aromasSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B0000',
    marginBottom: 6,
  },
  aromasTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aromaTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  aromaText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B0000',
  },
  servingGuidanceContainer: {
    marginTop: 16,
  },
  servingItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  servingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  servingValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
});

export default WineAnalysisCard;

