import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert, Image, Modal, ScrollView, StyleSheet, Text,
  TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';
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
  const [showImageModal, setShowImageModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTokenAndProfile();
    }, [])
  );

  const loadTokenAndProfile = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      setToken(savedToken);
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) setProfileImage(savedImage);
      await fetchProfilePicture();
    } catch (err) {
      console.log('Profile load error:', err);
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const response = await api.get('/profile');
      const data = response.data?.data || response.data;
      if (data?.profilePictureUrl) {
        const url = `https://nexus-3rk7.onrender.com${data.profilePictureUrl}`;
        setProfileImage(url);
        await AsyncStorage.setItem('profileImage', url);
      }
    } catch (err) {
      console.log('Profile fetch failed — using local image');
    }
  };

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/login');
  };

  const menuItems = [
    { id: '0', title: 'View Profile Photo', icon: 'image-outline', route: null },
    { id: '1', title: 'Edit Profile', icon: 'person-outline', route: '/edit-profile' },
    { id: '2', title: 'Notifications', icon: 'notifications-outline', route: '/notifications' },
    { id: '3', title: 'Language', icon: 'language-outline', route: '/language' },
    { id: '4', title: 'Privacy Settings', icon: 'shield-outline', route: '/privacy' },
    { id: '5', title: 'Help & Support', icon: 'help-circle-outline', route: '/help' },
    { id: '6', title: 'About Nexus', icon: 'information-circle-outline', route: '/about' },
    { id: '7', title: 'Go Premium', icon: 'star-outline', route: '/subscription' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {profileImage && token ? (
            <Image
              source={{
                uri: profileImage,
                headers: { Authorization: `Bearer ${token}` },
              }}
              style={styles.avatarImage}
              onError={() => {
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
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
                item.id === '7' && styles.premiumItem,
                item.id === '0' && styles.viewPhotoItem,
              ]}
              onPress={() => {
                if (item.id === '0') {
                  Alert.alert('Test', 'Tapped View Profile Photo!');
                  setShowImageModal(true);
                } else {
                  router.push(item.route as any);
                }
              }}
            >
              <View style={[
                styles.menuIconCircle,
                item.id === '7' && styles.premiumIconCircle,
                item.id === '0' && styles.viewPhotoIconCircle,
              ]}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={
                    item.id === '7' ? '#006666' :
                    item.id === '0' ? '#004D40' :
                    '#008080'
                  }
                />
              </View>
              <Text style={[
                styles.menuTitle,
                { color: colors.text },
                item.id === '7' && styles.premiumTitle,
                item.id === '0' && styles.viewPhotoTitle,
              ]}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#B2DFDB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.subtitle }]}>Nexus v1.0.0</Text>

      </ScrollView>

      {/* Modal OUTSIDE ScrollView */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowImageModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>

                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowImageModal(false)}
                >
                  <Ionicons name="close-outline" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Full size profile picture */}
                {profileImage ? (
                  <Image
                    source={{
                      uri: profileImage,
                      headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.modalPlaceholder}>
                    <Text style={styles.modalPlaceholderText}>
                      {user?.name ? user.name[0].toUpperCase() : '?'}
                    </Text>
                  </View>
                )}

                {/* User name at bottom */}
                <View style={styles.modalFooter}>
                  <Text style={styles.modalName}>{user?.name || 'Profile Photo'}</Text>
                </View>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#008080',
    paddingTop: 60,
    paddingBottom: 36,
    alignItems: 'center',
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#B2EBF2' },
  menuContainer: {
    marginTop: 20, marginHorizontal: 16,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 16,
  },
  viewPhotoItem: { backgroundColor: '#E0F2F1' },
  premiumItem: { backgroundColor: '#E0F2F1' },
  menuIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#B2DFDB',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  premiumIconCircle: { backgroundColor: '#80CBC4' },
  viewPhotoIconCircle: { backgroundColor: '#80CBC4' },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: '500' },
  premiumTitle: { color: '#004D40', fontWeight: '700' },
  viewPhotoTitle: { color: '#004D40', fontWeight: '700' },
  logoutButton: {
    backgroundColor: '#008080', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, padding: 16, borderRadius: 12, marginTop: 20,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 13, marginBottom: 32 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
  },
  closeButton: {
    position: 'absolute', top: 60, right: 20, zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  modalPlaceholder: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#008080',
    justifyContent: 'center', alignItems: 'center',
  },
  modalPlaceholderText: {
    fontSize: 80, fontWeight: '800', color: '#fff',
  },
  modalFooter: {
    position: 'absolute', bottom: 60, alignItems: 'center',
  },
  modalName: {
    fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center',
  },
});