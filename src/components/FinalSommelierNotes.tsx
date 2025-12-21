import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FinalSommelierNotesProps {
  closingNarrative?: string;
  avoid?: {
    types: string[];
    reason: string;
  };
  tierRationales?: Array<{ wineName: string; tierLabel?: string; rationale: string }>; // Menu V2.2: Tier rationales for each wine
  menuLimitations?: string; // Menu V2.2: Overall menu limitations
}

const FinalSommelierNotes: React.FC<FinalSommelierNotesProps> = ({
  closingNarrative,
  avoid,
  tierRationales,
  menuLimitations,
}) => {
  const [expanded, setExpanded] = useState(false); // Default to collapsed

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.expandableHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="information-circle-outline" size={20} color="#8B0000" />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Final Sommelier Notes</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#8B0000"
          style={styles.expandIcon}
        />
      </TouchableOpacity>
      
      {!expanded && (
        <Text style={styles.expandHint}>Expand for final sommelier notes</Text>
      )}

      {expanded && (
        <View style={styles.content}>
          {/* Closing Narrative */}
          {closingNarrative ? (
            <View style={styles.section}>
              <Text style={styles.sectionText}>{closingNarrative}</Text>
            </View>
          ) : null}

          {/* Menu Limitations (Menu V2.2) */}
          {menuLimitations ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="list" size={18} color="#8B0000" />
                <Text style={styles.sectionTitle}>Menu Overview</Text>
              </View>
              <Text style={styles.sectionText}>{menuLimitations}</Text>
            </View>
          ) : null}

          {/* Tier Rationales (Menu V2.2) */}
          {tierRationales && tierRationales.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={18} color="#8B0000" />
                <Text style={styles.sectionTitle}>Tier Classifications</Text>
              </View>
              {tierRationales.map((item, index) => (
                <View key={index} style={[
                  styles.tierRationaleItem,
                  index === tierRationales.length - 1 && styles.tierRationaleItemLast
                ]}>
                  <Text style={styles.tierRationaleWineName}>
                    {item.wineName}
                    {item.tierLabel ? ` • ${item.tierLabel}` : ''}
                  </Text>
                  <Text style={styles.tierRationaleText}>{item.rationale}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Avoid Section */}
          {avoid ? (
            <View style={styles.avoidSection}>
              <View style={styles.avoidHeader}>
                <Ionicons name="close-circle" size={18} color="#d32f2f" />
                <Text style={styles.avoidTitle}>Wines to Avoid</Text>
              </View>
              
              {avoid.types && avoid.types.length > 0 && (
                <View style={styles.avoidTypesContainer}>
                  {avoid.types.map((type, index) => (
                    <View key={index} style={styles.avoidTypeTag}>
                      <Text style={styles.avoidTypeText}>{type}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {avoid.reason && (
                <Text style={styles.avoidReason}>{avoid.reason}</Text>
              )}
            </View>
          ) : null}
          
          {!closingNarrative && !menuLimitations && (!tierRationales || tierRationales.length === 0) && !avoid && (
            <Text style={styles.emptyText}>No additional notes available.</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expandIcon: {
    position: 'absolute',
    right: 0,
  },
  expandHint: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    marginTop: 12,
    paddingTop: 0,
  },
  section: {
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  avoidSection: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    marginTop: 8,
  },
  avoidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avoidTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d32f2f',
    marginLeft: 6,
  },
  avoidTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    marginHorizontal: -3,
  },
  avoidTypeTag: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginHorizontal: 3,
    marginBottom: 6,
  },
  avoidTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d32f2f',
  },
  avoidReason: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B0000',
    marginLeft: 6,
  },
  tierRationaleItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tierRationaleItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  tierRationaleWineName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tierRationaleText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});

export default FinalSommelierNotes;

