import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConfidenceBreakdownProps {
  breakdown: {
    pairingScience: number;
    wineKnowledge: number;
    complexityHandling: number;
  };
  totalScore: number;
}

const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({ breakdown, totalScore }) => {
  const maxScores = {
    pairingScience: 50,
    wineKnowledge: 30,
    complexityHandling: 20,
  };

  const colors = {
    pairingScience: '#2E7D32', // Green
    wineKnowledge: '#1976D2', // Blue
    complexityHandling: '#F57C00', // Orange
  };

  const getPercentage = (score: number, max: number) => {
    return Math.min((score / max) * 100, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.breakdownContainer}>
        {/* Pairing Science */}
        <View style={styles.category}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryLabel}>Pairing Science</Text>
            <Text style={styles.categoryScore}>
              {breakdown.pairingScience}/{maxScores.pairingScience}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                styles.progressBarFill,
                {
                  width: `${getPercentage(breakdown.pairingScience, maxScores.pairingScience)}%`,
                  backgroundColor: colors.pairingScience,
                }
              ]}
            />
          </View>
        </View>

        {/* Wine Knowledge */}
        <View style={styles.category}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryLabel}>Wine Knowledge</Text>
            <Text style={styles.categoryScore}>
              {breakdown.wineKnowledge}/{maxScores.wineKnowledge}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                styles.progressBarFill,
                {
                  width: `${getPercentage(breakdown.wineKnowledge, maxScores.wineKnowledge)}%`,
                  backgroundColor: colors.wineKnowledge,
                }
              ]}
            />
          </View>
        </View>

        {/* Complexity Handling */}
        <View style={styles.category}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryLabel}>Complexity Handling</Text>
            <Text style={styles.categoryScore}>
              {breakdown.complexityHandling}/{maxScores.complexityHandling}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar,
                styles.progressBarFill,
                {
                  width: `${getPercentage(breakdown.complexityHandling, maxScores.complexityHandling)}%`,
                  backgroundColor: colors.complexityHandling,
                }
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  breakdownContainer: {
    gap: 12,
  },
  category: {
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  categoryScore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarFill: {
    // Width set dynamically
  },
});

export default ConfidenceBreakdown;

