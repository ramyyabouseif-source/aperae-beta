import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LEGAL_CONFIG } from '../config/legal';

interface GeoBlockedScreenProps {
  country?: string;
  countryName?: string;
}

export default function GeoBlockedScreen({ country, countryName }: GeoBlockedScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/Aperae Logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Service Not Available</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🌍</Text>
        </View>

        <Text style={styles.mainMessage}>
          Aperae is currently available in the United States only.
        </Text>

        {(country || countryName) && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>
              We detected that you're accessing from:
            </Text>
            <Text style={styles.countryText}>
              {countryName || country || 'Unknown Location'}
            </Text>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Why is access restricted?</Text>
          <Text style={styles.infoText}>
            Aperae is currently in beta and available only to users in the United States. 
            We are working to expand our service to additional regions in the future.
          </Text>
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Questions?</Text>
          <Text style={styles.contactText}>
            For questions about regional availability, please contact:
          </Text>
          <Text style={styles.contactEmail}>
            {LEGAL_CONFIG.contact.support}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4F0', // Light tone background
  },
  header: {
    backgroundColor: '#5B2433', // Dark tone background
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  mainMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5B2433',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 28,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 14,
    color: '#5B2433',
    marginBottom: 8,
  },
  countryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B2433',
  },
  infoCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC107',
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B2433',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#5B2433',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  contactEmail: {
    fontSize: 14,
    color: '#BF9694',
    fontWeight: '600',
  },
});


