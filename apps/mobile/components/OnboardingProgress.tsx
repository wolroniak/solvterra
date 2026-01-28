import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, spacing } from '@/constants/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const scaleAnims = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    // Animate the current step dot
    Animated.sequence([
      Animated.timing(scaleAnims[currentStep - 1], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[currentStep - 1], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              isActive && styles.dotActive,
              isCompleted && styles.dotCompleted,
              { transform: [{ scale: scaleAnims[index] }] },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary[600],
    borderRadius: 4,
  },
  dotCompleted: {
    backgroundColor: Colors.primary[400],
  },
});
