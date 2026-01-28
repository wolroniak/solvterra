// Welcome Screen
// First screen users see - introduces the app

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Dimensions, Animated } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';
import { supabase } from '@/lib/supabase';
import LanguageToggle from '@/components/LanguageToggle';
import OnboardingProgress from '@/components/OnboardingProgress';

const { width } = Dimensions.get('window');

// SolvTerra logo asset
const SolvTerraLogo = require('@/assets/logo.png');

export default function WelcomeScreen() {
  const { t } = useTranslation('auth');
  const { login } = useUserStore();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const featureAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Animate content in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger feature items
    Animated.stagger(100, featureAnims.map(anim =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    )).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/(auth)/sign-up');
  };

  // Demo shortcut: Login with demo student account via Supabase
  const handleDemoLogin = async () => {
    await login('max.mustermann@stud.tu-darmstadt.de', 'Test1234');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Language Toggle and Progress */}
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <OnboardingProgress currentStep={1} totalSteps={4} />
        <View style={styles.languageToggleContainer}>
          <LanguageToggle />
        </View>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* SolvTerra Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={SolvTerraLogo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Subtitle */}
        <Text variant="titleMedium" style={styles.subtitle}>
          {t('welcome.subtitle')}
        </Text>

        {/* Features - with staggered animation */}
        <View style={styles.features}>
          {[
            { icon: 'clock-outline', text: t('welcome.features.time') },
            { icon: 'trophy-outline', text: t('welcome.features.points') },
            { icon: 'account-group-outline', text: t('welcome.features.support') },
          ].map((feature, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: featureAnims[index],
                transform: [{
                  translateX: featureAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                }],
              }}
            >
              <FeatureItem icon={feature.icon} text={feature.text} />
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {t('welcome.getStarted')}
        </Button>

        <Button
          mode="text"
          onPress={handleDemoLogin}
          style={styles.textButton}
          textColor={Colors.textSecondary}
        >
          {t('welcome.demoMode')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={Colors.secondary[500]}
      />
      <Text variant="bodyLarge" style={styles.featureText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  languageToggleContainer: {
    width: 60,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.45,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  featureText: {
    color: Colors.textPrimary,
    flex: 1,
  },
  buttons: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  primaryButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    marginTop: spacing.xs,
  },
});
