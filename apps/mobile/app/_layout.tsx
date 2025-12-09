// Root Layout
// App entry point with providers

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { theme } from '@/constants/theme';
import i18n from '../i18n';

// Inner component that uses translation hook
function RootLayoutNav() {
  const { t } = useTranslation('common');

  return (
    <>
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
            headerBackTitle: t('back'),
            headerTintColor: theme.colors.primary,
            headerStyle: { backgroundColor: '#fff' },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <PaperProvider theme={theme}>
          <RootLayoutNav />
        </PaperProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
