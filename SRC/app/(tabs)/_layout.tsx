import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useThemeStore } from '../../store/themeStore';

export default function TabLayout() {
  const { isDark } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#008080',
        tabBarInactiveTintColor: isDark ? '#80CBC4' : '#B2DFDB',
        tabBarStyle: {
          backgroundColor: isDark ? '#0A1F1F' : '#fff',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1A3A3A' : '#B2DFDB',
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
