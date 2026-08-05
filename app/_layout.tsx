import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function RootLayout() {
  const loadAuth = useAuthStore((state: any) => state.loadAuth);
  const loadTheme = useThemeStore((state: any) => state.loadTheme);

  useEffect(() => {
    loadAuth();
    loadTheme();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin-dashboard" />
      <Stack.Screen name="admin-users" />
      <Stack.Screen name="admin-news" />
      <Stack.Screen name="admin-videos" />
      <Stack.Screen name="admin-logs" />
      <Stack.Screen name="admin-stats" />
      <Stack.Screen name="admin-health" />
      <Stack.Screen name="admin-profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="language" />
      <Stack.Screen name="help" />
      <Stack.Screen name="about" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="article-detail" />
      <Stack.Screen name="firstaid-detail" />
    </Stack>
  );
}