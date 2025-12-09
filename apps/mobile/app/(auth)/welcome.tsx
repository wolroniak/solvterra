// Welcome Screen
// First screen users see - introduces the app

import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';
import LanguageToggle from '@/components/LanguageToggle';

const { width } = Dimensions.get('window');

// SolvTerra logo asset
const SolvTerraLogo = require('@/assets/logo.png');

export default function WelcomeScreen() {
  const { t } = useTranslation('auth');
  const { resetToExistingUser } = useUserStore();

  const handleGetStarted = () => {
    router.push('/(auth)/sign-up');
  };

  // Demo shortcut: Skip to main app with existing user
  const handleDemoLogin = () => {
    resetToExistingUser();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Toggle - top right */}
      <View style={styles.languageToggleContainer}>
        <LanguageToggle />
      </View>

      <View style={styles.content}>
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

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="clock-outline"
            text={t('welcome.features.time')}
          />
          <FeatureItem
            icon="trophy-outline"
            text={t('welcome.features.points')}
          />
          <FeatureItem
            icon="account-group-outline"
            text={t('welcome.features.support')}
          />
        </View>
      </View>

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
  languageToggleContainer: {
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
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
