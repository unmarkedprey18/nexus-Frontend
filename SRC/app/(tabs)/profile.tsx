import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../store/useTheme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const clearAuth = useAuthStore((state: any) => state.clearAuth);
  const { colors } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Reload profile every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTokenAndProfile();
    }, [])
  );

  const loadTokenAndProfile = async () => {
    try {
      // Get token from storage
      const savedToken = await AsyncStorage.getItem('token');
      setToken(savedToken);

      // First show locally saved image immediately so it never goes blank
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) setProfileImage(savedImage);

      // Then fetch fresh from backend
      await fetchProfilePicture(savedToken);
    } catch (err) {
      console.log('Profile load error:', err);
    }
  };

  const fetchProfilePicture = async (savedToken: string | null) => {
    try {
      const response = await api.get('/profile');
      const data = response.data?.data || response.data;
      if (data?.profilePictureUrl) {
        const url = `https://nexus-3rk7.onrender.com${data.profilePictureUrl}`;
        setProfileImage(url);
        // Save locally so it shows even when backend sleeps
        await AsyncStorage.setItem('profileImage', url);
      }
    } catch (err) {
      // Backend sleeping — already showing local saved image above
      console.log('Profile fetch failed — using local image');
    }
  };

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/login');
  };

  const menuItems = [
    { id: '1', title: 'Edit Profile', icon: 'person-outline', color: '#534AB7', route: '/edit-profile' },
    { id: '2', title: 'Notifications', icon: 'notifications-outline', color: '#534AB7', route: '/notifications' },
    { id: '3', title: 'Language', icon: 'language-outline', color: '#534AB7', route: '/language' },
    { id: '4', title: 'Privacy Settings', icon: 'shield-outline', color: '#534AB7', route: '/privacy' },
    { id: '5', title: 'Help & Support', icon: 'help-circle-outline', color: '#534AB7', route: '/help' },
    { id: '6', title: 'About Nexus', icon: 'information-circle-outline', color: '#534AB7', route: '/about' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      {/* Purple header with avatar */}
      <View style={styles.header}>
        {profileImage && token ? (
          // Pass token in headers so backend serves the protected image
          <Image
            source={{
              uri: profileImage,
              headers: { Authorization: `Bearer ${token}` },
            }}
            style={styles.avatarImage}
            onError={() => {
              // If image fails to load try local storage
              AsyncStorage.getItem('profileImage').then(saved => {
                if (saved && saved !== profileImage) setProfileImage(saved);
                else setProfileImage(null);
              });
            }}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
        <Text style={styles.email}>{user?.email || 'No email available'}</Text>
      </View>

      {/* Menu items */}
      <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.subtitle }]}>Nexus v2.0.0</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 60, paddingBottom: 36, alignItems: 'center',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  avatarImage: {
    width: 80, height: 80, borderRadius: 40,
    marginBottom: 14, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#d0ccff' },
  menuContainer: {
    marginTop: 20, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1,
  },
  menuIconCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#ede9ff',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: '500' },
  logoutButton: {
    backgroundColor: '#534AB7', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, margin: 16, padding: 16,
    borderRadius: 12, marginTop: 20,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 13, marginBottom: 32 },
});