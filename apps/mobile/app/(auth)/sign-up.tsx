// Sign Up Screen
// User registration with email or social login

import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, spacing } from '@/constants/theme';
import { useUserStore } from '@/store';

export default function SignUpScreen() {
  const { loginWithGoogle, loginWithApple, isLoading } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    if (!password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (password.length < 8) {
      newErrors.password = 'Mindestens 8 Zeichen';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async () => {
    if (!validateForm()) return;

    // For demo, go to interests selection
    router.push('/(auth)/interests');
  };

  const handleGoogleSignUp = async () => {
    await loginWithGoogle();
    router.push('/(auth)/interests');
  };

  const handleAppleSignUp = async () => {
    await loginWithApple();
    router.push('/(auth)/interests');
  };

  return (
    <SafeAreaView style={styles.container}>
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
              Konto erstellen
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Werde Teil der SolvTerra Community
            </Text>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <Button
              mode="outlined"
              onPress={handleGoogleSignUp}
              style={styles.socialButton}
              contentStyle={styles.socialButtonContent}
              icon={() => (
                <MaterialCommunityIcons name="google" size={20} color={Colors.textPrimary} />
              )}
              loading={isLoading}
            >
              Mit Google fortfahren
            </Button>

            {Platform.OS === 'ios' && (
              <Button
                mode="outlined"
                onPress={handleAppleSignUp}
                style={styles.socialButton}
                contentStyle={styles.socialButtonContent}
                icon={() => (
                  <MaterialCommunityIcons name="apple" size={20} color={Colors.textPrimary} />
                )}
                loading={isLoading}
              >
                Mit Apple fortfahren
              </Button>
            )}
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text variant="bodySmall" style={styles.dividerText}>
              oder
            </Text>
            <Divider style={styles.divider} />
          </View>

          {/* Email Form */}
          <View style={styles.form}>
            <TextInput
              label="E-Mail"
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
              label="Passwort"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
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

            <Text variant="bodySmall" style={styles.passwordHint}>
              Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl
            </Text>

            <Button
              mode="contained"
              onPress={handleEmailSignUp}
              style={styles.submitButton}
              contentStyle={styles.submitButtonContent}
              loading={isLoading}
            >
              Registrieren
            </Button>
          </View>

          {/* Terms */}
          <Text variant="bodySmall" style={styles.terms}>
            Mit der Registrierung akzeptierst du unsere{' '}
            <Text style={styles.link}>Nutzungsbedingungen</Text> und{' '}
            <Text style={styles.link}>Datenschutzerklärung</Text>.
          </Text>

          {/* Login Link */}
          <View style={styles.loginLink}>
            <Text variant="bodyMedium" style={styles.loginText}>
              Bereits ein Konto?{' '}
            </Text>
            <Button
              mode="text"
              compact
              onPress={() => {
                // For demo, just go back
                router.back();
              }}
            >
              Anmelden
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
  passwordHint: {
    color: Colors.textMuted,
    marginTop: -spacing.xs,
  },
  submitButton: {
    borderRadius: 12,
    marginTop: spacing.md,
  },
  submitButtonContent: {
    paddingVertical: spacing.sm,
  },
  terms: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 20,
  },
  link: {
    color: Colors.primary[600],
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    color: Colors.textSecondary,
  },
});
