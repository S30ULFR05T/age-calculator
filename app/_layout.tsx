import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AntProvider from '@ant-design/react-native/lib/provider';
import enUS from '@ant-design/react-native/lib/locale-provider/en_US';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

// Prevent the splash screen from automatically hiding before assets are loaded.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    'antoutline': require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
    'antfill': require('@ant-design/icons-react-native/fonts/antfill.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AntProvider locale={enUS}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AntProvider>
  );
}
