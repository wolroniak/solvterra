// Root Layout
// App entry point with providers

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '@/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="challenge/[id]"
            options={{
              headerShown: true,
              headerTitle: '',
              headerBackTitle: 'Zurück',
              headerTintColor: theme.colors.primary,
              headerStyle: { backgroundColor: '#fff' },
            }}
          />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
