import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../design';
import AdaptiveButton from '../components/AdaptiveButton';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  image?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to Aperae',
    subtitle: 'Your Personal Wine Expert',
    description: 'Discover the perfect wine for any occasion with AI-powered recommendations tailored to your taste.',
    icon: 'wine',
    color: COLORS.primary[500],
  },
  {
    id: 2,
    title: 'Smart Recommendations',
    subtitle: 'AI-Powered Wine Discovery',
    description: 'Our advanced AI analyzes your preferences and food pairings to suggest wines you\'ll love.',
    icon: 'bulb',
    color: COLORS.accent.gold,
  },
  {
    id: 3,
    title: 'Build Your Collection',
    subtitle: 'Save Your Favorites',
    description: 'Keep track of wines you love and build your personal collection with detailed tasting notes.',
    icon: 'heart',
    color: COLORS.accent.rose,
  },
  {
    id: 4,
    title: 'Perfect Pairings',
    subtitle: 'Food & Wine Harmony',
    description: 'Get expert recommendations for pairing wines with your favorite dishes and special occasions.',
    icon: 'restaurant',
    color: COLORS.accent.burgundy,
  },
];

interface EnhancedOnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

const EnhancedOnboardingScreen: React.FC<EnhancedOnboardingScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        // Animate in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const renderStep = (step: OnboardingStep) => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconBackground, { backgroundColor: step.color }]}>
          <Ionicons name={step.icon as any} size={48} color="white" />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
    </Animated.View>
  );

  const renderProgressDots = () => (
    <View style={styles.progressContainer}>
      {onboardingSteps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index === currentStep && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderNavigationButtons = () => (
    <View style={styles.navigationContainer}>
      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={prevStep}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.secondary} />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <AdaptiveButton
          title={currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          onPress={nextStep}
          variant="primary"
          size="large"
          style={styles.nextButton}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aperae</Text>
        <Text style={styles.headerSubtitle}>Your Wine Journey Starts Here</Text>
      </View>

      <View style={styles.content}>
        {renderStep(onboardingSteps[currentStep])}
        {renderProgressDots()}
      </View>

      {renderNavigationButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.display.large,
    color: COLORS.primary[500],
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body.large,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  stepTitle: {
    ...TYPOGRAPHY.heading.large,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    ...TYPOGRAPHY.heading.medium,
    color: COLORS.primary[500],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  stepDescription: {
    ...TYPOGRAPHY.body.large,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.neutral[300],
    marginHorizontal: SPACING.xs,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary[500],
    width: 24,
  },
  navigationContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  navButtonText: {
    ...TYPOGRAPHY.button.medium,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  spacer: {
    flex: 1,
  },
  skipButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.md,
  },
  skipButtonText: {
    ...TYPOGRAPHY.button.medium,
    color: COLORS.text.secondary,
  },
  nextButton: {
    minWidth: 120,
  },
});

export default EnhancedOnboardingScreen;




