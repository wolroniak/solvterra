// SolvTerra Mobile App Theme
// Based on React Native Paper and custom design tokens
// Brand Colors: Primary Green #2e6417, Background White #ffffff, Alt Background #eeebe3

import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { Colors } from '@solvterra/shared';

// Font configuration - Inter for titles, System for body
// Note: Inter font should be loaded via expo-font in _layout.tsx
const fontConfig = {
  displayLarge: { fontFamily: 'Inter-Bold', fontWeight: '700' as const },
  displayMedium: { fontFamily: 'Inter-SemiBold', fontWeight: '600' as const },
  displaySmall: { fontFamily: 'Inter-SemiBold', fontWeight: '600' as const },
  headlineLarge: { fontFamily: 'Inter-Bold', fontWeight: '700' as const },
  headlineMedium: { fontFamily: 'Inter-SemiBold', fontWeight: '600' as const },
  headlineSmall: { fontFamily: 'Inter-SemiBold', fontWeight: '600' as const },
  titleLarge: { fontFamily: 'Inter-SemiBold', fontWeight: '600' as const },
  titleMedium: { fontFamily: 'Inter-Medium', fontWeight: '500' as const },
  titleSmall: { fontFamily: 'Inter-Medium', fontWeight: '500' as const },
  bodyLarge: { fontFamily: 'System', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'System', fontWeight: '400' as const },
  bodySmall: { fontFamily: 'System', fontWeight: '400' as const },
  labelLarge: { fontFamily: 'Inter-Medium', fontWeight: '500' as const },
  labelMedium: { fontFamily: 'Inter-Medium', fontWeight: '500' as const },
  labelSmall: { fontFamily: 'Inter-Medium', fontWeight: '500' as const },
};

// Custom SolvTerra Theme - Forest Green + Warm Cream
export const theme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    // Primary - Forest Green
    primary: Colors.primary[600],           // #2e6417
    primaryContainer: Colors.primary[100],  // Light green container
    onPrimary: '#ffffff',
    onPrimaryContainer: Colors.primary[900],
    // Secondary - Teal for impact/success
    secondary: Colors.secondary[500],       // #14b8a6
    secondaryContainer: Colors.secondary[100],
    onSecondary: '#ffffff',
    onSecondaryContainer: Colors.secondary[900],
    // Tertiary - Amber for rewards/gamification
    tertiary: Colors.accent[500],           // #f59e0b
    tertiaryContainer: Colors.accent[100],
    onTertiary: '#ffffff',
    onTertiaryContainer: Colors.accent[900],
    // Backgrounds - White primary, Warm cream alt
    background: Colors.background,          // #ffffff
    onBackground: Colors.textPrimary,       // #1a1918
    surface: Colors.surface,                // #ffffff
    onSurface: Colors.textPrimary,
    surfaceVariant: Colors.backgroundAlt,   // #eeebe3 - warm cream
    onSurfaceVariant: Colors.textSecondary,
    // Error states
    error: Colors.error,
    errorContainer: '#fecdd3',
    onError: '#ffffff',
    onErrorContainer: '#7f1d1d',
    // Outlines and borders
    outline: Colors.neutral[300],
    outlineVariant: Colors.neutral[200],
    // Inverse colors
    inverseSurface: Colors.neutral[900],
    inverseOnSurface: Colors.neutral[50],
    inversePrimary: Colors.primary[300],
    // Elevation surfaces
    elevation: {
      level0: 'transparent',
      level1: Colors.surface,
      level2: Colors.surface,
      level3: Colors.surface,
      level4: Colors.surface,
      level5: Colors.surface,
    },
    // Disabled states
    surfaceDisabled: Colors.neutral[100],
    onSurfaceDisabled: Colors.neutral[400],
    backdrop: 'rgba(26, 25, 24, 0.5)',       // Warm black backdrop
  },
  roundness: 12,
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius scale
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Shadow styles - warmer tones
export const shadows = {
  sm: {
    shadowColor: '#1a1918',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1a1918',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1a1918',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Additional design tokens for convenience
export const designTokens = {
  // Brand colors direct access
  brandGreen: '#2e6417',
  brandCream: '#eeebe3',
  brandWhite: '#ffffff',
  // Semantic shortcuts
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
  info: Colors.info,
} as const;

export { Colors };
