import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ResponsibleDrinkingDisclaimerProps {
  style?: any;
  compact?: boolean; // Compact version for smaller spaces
}

export default function ResponsibleDrinkingDisclaimer({ 
  style, 
  compact = false 
}: ResponsibleDrinkingDisclaimerProps) {
  const [expanded, setExpanded] = useState(false); // Default to collapsed

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Ionicons name="warning-outline" size={14} color="#856404" />
        <Text style={styles.compactText}>
          Please drink responsibly. Must be 21+ to purchase alcohol.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.expandableHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name="warning-outline" size={20} color="#856404" />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Responsible Drinking Notice</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#856404"
          style={styles.expandIcon}
        />
      </TouchableOpacity>

      {!expanded && (
        <Text style={styles.expandHint}>Tap to expand for important safety information</Text>
      )}

      {expanded && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            Please drink responsibly. This app provides wine recommendations for educational and entertainment purposes only.
          </Text>
          <Text style={styles.text}>
            You must be 21 years of age or older (or the legal drinking age in your jurisdiction) to purchase and consume alcohol.
          </Text>
          <Text style={styles.text}>
            Never drink and drive. If you choose to drink, please do so responsibly and in moderation.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(133, 100, 4, 0.2)',
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  expandIcon: {
    position: 'absolute',
    right: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  expandHint: {
    fontSize: 11,
    color: '#856404',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    opacity: 0.8,
  },
  textContainer: {
    marginTop: 12,
    paddingTop: 0,
  },
  text: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 6,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  compactText: {
    fontSize: 12,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

