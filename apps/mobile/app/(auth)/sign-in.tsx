// Sign In Screen
// User login with email or social login

import { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';
import LanguageToggle from '@/components/LanguageToggle';

export default function SignInScreen() {
  const { t } = useTranslation('auth');
  const { login, loginWithGoogle, isLoading, isAuthenticated } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = t('signup.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('signup.validation.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('signup.validation.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) return;
    await login(email, password);
    // Navigation happens after successful auth - check in useEffect
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    // Navigation happens after successful auth - check in useEffect
  };

  // Navigate to main app after successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Language Toggle */}
      <View style={styles.topBar}>
        <Button
          mode="text"
          onPress={() => router.back()}
          icon="arrow-left"
          textColor={Colors.textSecondary}
        >
          {t('signup.loginLink')}
        </Button>
        <View style={styles.languageToggleContainer}>
          <LanguageToggle />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.title}>
              {t('login.title')}
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              {t('welcome.subtitle')}
            </Text>
          </View>

          {/* Social Login Button */}
          <View style={styles.socialButtons}>
            <Button
              mode="outlined"
              onPress={handleGoogleLogin}
              style={styles.socialButton}
              contentStyle={styles.socialButtonContent}
              icon={() => (
                <MaterialCommunityIcons name="google" size={20} color={Colors.textPrimary} />
              )}
              loading={isLoading}
              disabled={isLoading}
            >
              {t('welcome.continueWithGoogle')}
            </Button>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text variant="bodySmall" style={styles.dividerText}>
              {t('welcome.orDivider')}
            </Text>
            <Divider style={styles.divider} />
          </View>

          {/* Email Form */}
          <View style={styles.form}>
            <TextInput
              label={t('login.email')}
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={!!errors.email}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
            {errors.email && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.email}
              </Text>
            )}

            <TextInput
              label={t('login.password')}
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              error={!!errors.password}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {errors.password && (
              <Text variant="bodySmall" style={styles.errorText}>
                {errors.password}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={handleEmailLogin}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              loading={isLoading}
              disabled={isLoading}
            >
              {t('login.loginButton')}
            </Button>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupLink}>
            <Text variant="bodyMedium" style={styles.signupText}>
              {t('login.noAccount')}{' '}
            </Text>
            <Button
              mode="text"
              compact
              onPress={() => router.push('/(auth)/sign-up')}
            >
              {t('login.signupLink')}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  languageToggleContainer: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: spacing.md,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
  socialButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  socialButton: {
    borderColor: Colors.neutral[200],
    borderRadius: 12,
  },
  socialButtonContent: {
    paddingVertical: spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: Colors.textMuted,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: '#fff',
  },
  inputOutline: {
    borderRadius: 12,
  },
  errorText: {
    color: Colors.error,
    marginTop: -spacing.sm,
  },
  submitButton: {
    borderRadius: 12,
    marginTop: spacing.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
  signupLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  signupText: {
    color: Colors.textSecondary,
  },
});
