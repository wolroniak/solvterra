// Entry point - Redirect to appropriate screen
// Based on auth state

import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUserStore } from '@/store';
import { Colors } from '@/constants/theme';

export default function Index() {
  const { isAuthenticated, user, isLoading } = useUserStore();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </View>
    );
  }

  // Not authenticated -> Welcome screen
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Authenticated but onboarding not complete -> Interests selection
  if (user && !user.onboardingCompleted) {
    return <Redirect href="/(auth)/interests" />;
  }

  // Authenticated and onboarded -> Main app
  return <Redirect href="/(tabs)" />;
}
