import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from '../../store/useTheme';

// This file controls the bottom tab bar for the whole app
export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // In dark mode — active tab is white, inactive is light purple
        // In light mode — active tab is purple, inactive is grey
        tabBarActiveTintColor: isDark ? '#fff' : '#534AB7',
        tabBarInactiveTintColor: isDark ? '#a78bfa' : '#999',
        tabBarStyle: {
          // Purple background in dark mode, white in light mode
          backgroundColor: isDark ? '#534AB7' : '#fff',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#6d5fd1' : '#f0f0f0',
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="translate"
        options={{
          title: 'Translate',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="language-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="firstaid"
        options={{
          title: 'First Aid',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}