import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { NDAService } from '../services/ndaService';

interface NDAScreenProps {
  onAccept: () => void;
}

export default function NDAScreen({ onAccept }: NDAScreenProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [previousAcceptance, setPreviousAcceptance] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadPreviousAcceptance();
  }, []);

  const loadPreviousAcceptance = async () => {
    try {
      const timestamp = await NDAService.getNDATimestamp();
      setPreviousAcceptance(timestamp);
    } catch (error) {
      console.error('Error loading previous acceptance:', error);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    
    if (isCloseToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (!hasScrolledToBottom) {
      Alert.alert('Please Scroll', 'Please scroll to the bottom of the NDA to continue.');
      return;
    }
    
    if (!isAgreed) {
      Alert.alert('Please Agree', 'Please check the agreement box to continue.');
      return;
    }
    
    onAccept();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/pocketsomm-logo.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Confidentiality Agreement</Text>
        <Text style={styles.subtitle}>Required before accessing PocketSomm</Text>
        {previousAcceptance && (
          <Text style={styles.previousAcceptance}>
            Last accepted: {new Date(previousAcceptance).toLocaleString()}
          </Text>
        )}
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>PocketSomm Mobile App NDA (Short Form)</Text>
          <Text style={styles.effectiveDate}>Effective Date: [Insert Date]</Text>
          
          <Text style={styles.introText}>
            By tapping "Agree", you ("Recipient") agree to keep PocketSomm's ("Disclosing Party") confidential information private as described below.
          </Text>

          <Text style={styles.subsectionTitle}>1. Purpose</Text>
          <Text style={styles.paragraph}>
            You may receive confidential info from PocketSomm to explore a business, product, or collaboration opportunity.
          </Text>

          <Text style={styles.subsectionTitle}>2. What Is Confidential</Text>
          <Text style={styles.paragraph}>
            "Confidential Information" includes, but is not limited to:
          </Text>
          <Text style={styles.bulletPoint}>• App designs, AI algorithms, code, and technical details</Text>
          <Text style={styles.bulletPoint}>• Business strategies, pricing, marketing, and financial info</Text>
          <Text style={styles.bulletPoint}>• Customer or partner information</Text>
          <Text style={styles.bulletPoint}>• Any notes, summaries, or analyses derived from the above</Text>
          <Text style={styles.paragraph}>
            Not confidential: information already public, independently developed, or legally obtained elsewhere.
          </Text>

          <Text style={styles.subsectionTitle}>3. Your Obligations</Text>
          <Text style={styles.paragraph}>You agree to:</Text>
          <Text style={styles.bulletPoint}>• Keep Confidential Information private</Text>
          <Text style={styles.bulletPoint}>• Use it only for the stated Purpose</Text>
          <Text style={styles.bulletPoint}>• Share only with those who need to know and are bound by similar confidentiality obligations</Text>
          <Text style={styles.bulletPoint}>• Not copy, reverse-engineer, or misuse the information</Text>

          <Text style={styles.subsectionTitle}>4. Legal Requirements</Text>
          <Text style={styles.paragraph}>
            If law requires disclosure, notify PocketSomm promptly and cooperate to limit disclosure.
          </Text>

          <Text style={styles.subsectionTitle}>5. Ownership & No License</Text>
          <Text style={styles.paragraph}>
            PocketSomm retains ownership of all Confidential Information. You get no rights or licenses except as expressly stated.
          </Text>

          <Text style={styles.subsectionTitle}>6. Term & Survival</Text>
          <Text style={styles.paragraph}>
            NDA is effective for 2 years from today.
          </Text>
          <Text style={styles.paragraph}>
            Confidentiality obligations last 5 years after termination.
          </Text>
          <Text style={styles.paragraph}>
            Trade secrets remain protected indefinitely under the law.
          </Text>

          <Text style={styles.subsectionTitle}>7. Remedies</Text>
          <Text style={styles.paragraph}>
            PocketSomm may seek injunctive relief and other remedies if this NDA is breached.
          </Text>

          <Text style={styles.subsectionTitle}>8. Governing Law & Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            This NDA is governed by New York law.
          </Text>
          <Text style={styles.paragraph}>
            Any disputes go to binding arbitration in New York (AAA rules).
          </Text>

          <Text style={styles.subsectionTitle}>9. Acceptance</Text>
          <Text style={styles.paragraph}>By tapping "Agree", you confirm:</Text>
          <Text style={styles.bulletPoint}>• You have read and understand this NDA</Text>
          <Text style={styles.bulletPoint}>• You agree to be legally bound by it</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkboxContainer, isAgreed && styles.checkboxChecked]}
          onPress={() => setIsAgreed(!isAgreed)}
        >
          <Text style={styles.checkboxText}>✓</Text>
        </TouchableOpacity>
        <Text style={styles.agreementText}>
          I have read and agree to the Confidentiality Agreement
        </Text>
        
        <TouchableOpacity
          style={[styles.acceptButton, (!hasScrolledToBottom || !isAgreed) && styles.acceptButtonDisabled]}
          onPress={handleAccept}
          disabled={!hasScrolledToBottom || !isAgreed}
        >
          <Text style={styles.acceptButtonText}>
            {!hasScrolledToBottom ? 'Scroll to Continue' : !isAgreed ? 'Check Agreement' : 'AGREE'}
          </Text>
        </TouchableOpacity>
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
    paddingTop: 60, // Push header down to prevent cutoff
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
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
  previousAcceptance: {
    fontSize: 12,
    color: '#fff',
    fontStyle: 'italic',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5B2433', // Dark tone text
    marginTop: 20,
    marginBottom: 10,
  },
  effectiveDate: {
    fontSize: 14,
    color: '#5B2433', // Dark tone text
    fontStyle: 'italic',
    marginBottom: 15,
  },
  introText: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    lineHeight: 24,
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5B2433', // Dark tone text
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 10,
  },
  footer: {
    backgroundColor: 'rgba(247, 244, 240, 0.95)', // Light tone background
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 150, 148, 0.3)', // Metallic accent border
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#5B2433', // Dark tone border
    borderRadius: 4,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5B2433', // Dark tone background
  },
  checkboxText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agreementText: {
    fontSize: 16,
    color: '#5B2433', // Dark tone text
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: '#5B2433', // Dark tone background
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#ccc',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});