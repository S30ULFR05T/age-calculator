import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AntProvider from '@ant-design/react-native/lib/provider';
import enUS from '@ant-design/react-native/lib/locale-provider/en_US';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import 'react-native-gesture-handler';

// Prevent the splash screen from automatically hiding before assets are loaded.
SplashScreen.preventAutoHideAsync();

const darkAntTheme = {
  fill_base: '#18191D',
  fill_body: '#000000',
  fill_tap: '#26272B',
  color_text_base: '#FFFFFF',
  color_text_caption: '#9CA3AF',
  color_text_placeholder: '#6B7280',
  border_color_base: '#26272B',
};

export default function RootLayout() {
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
    <AntProvider theme={darkAntTheme} locale={enUS}>
      <ThemeProvider value={DarkTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AntProvider>
  );
}
