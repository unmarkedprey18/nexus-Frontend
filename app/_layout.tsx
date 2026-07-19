import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

// Create one QueryClient for the whole app
const queryClient = new QueryClient();

// This is a separate component so it can read the theme store
// after the providers are set up
function AppContent() {
  const loadAuth = useAuthStore((state: any) => state.loadAuth);
  const { isDark, loadTheme } = useThemeStore();

  // Load both auth and theme when app first opens
  useEffect(() => {
    loadAuth();
    loadTheme();
  }, []);

  return (
    // This View wraps every single screen in the app
    // so the background color changes everywhere at once
    <View style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#fff' }}>
      {/* StatusBar changes color based on theme */}
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#1a1a1a' : '#fff'}
      />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}