import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import useAuthStore from './src/store/authStore';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const hydrated = useAuthStore((s) => s._hasHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    async function loadResources() {
      try {
        await Promise.all([
          Font.loadAsync({
            'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
            'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
            'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
            'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
          }),
          hydrate(),
        ]);
      } catch (e) {
        console.log('Error loading resources:', e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadResources();
  }, [hydrate]);

  // Robustly hide splash screen when ready
  useEffect(() => {
    if (fontsLoaded && hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, hydrated]);

  if (!fontsLoaded || !hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
