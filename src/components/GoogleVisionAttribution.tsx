import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoogleVisionAttributionProps {
  style?: any;
  compact?: boolean;
}

export default function GoogleVisionAttribution({ style, compact = false }: GoogleVisionAttributionProps) {
  const handleGoogleVisionLink = () => {
    Linking.openURL('https://cloud.google.com/vision');
  };

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <Ionicons name="logo-google" size={14} color="#4285F4" />
        <Text style={styles.compactText}>
          Text extracted using{' '}
          <Text style={styles.compactLink} onPress={handleGoogleVisionLink}>
            Google Cloud Vision API
          </Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name="logo-google" size={20} color="#4285F4" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Text Recognition</Text>
        <Text style={styles.text}>
          Menu text was extracted using{' '}
          <Text style={styles.link} onPress={handleGoogleVisionLink}>
            Google Cloud Vision API
          </Text>
          {' '}for optical character recognition (OCR).
        </Text>
        <Text style={styles.attributionText}>
          Powered by Google Cloud Vision API
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 20,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  link: {
    color: '#4285F4',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  attributionText: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  compactText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  compactLink: {
    color: '#4285F4',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

