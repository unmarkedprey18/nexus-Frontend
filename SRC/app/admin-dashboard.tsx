import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useTheme } from '../store/useTheme';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isDark, toggleTheme } = useThemeStore();
  const clearAuth = useAuthStore((state: any) => state.clearAuth);
  const user = useAuthStore((state: any) => state.user);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalNews: 0,
    totalVideos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [savedToken, setSavedToken] = useState<string | null>(null);

  // Reload stats and profile every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchStats();
      fetchProfilePicture();
    }, [])
  );

  const fetchProfilePicture = async () => {
    try {
      const t = await AsyncStorage.getItem('token');
      setSavedToken(t);
      const response = await api.get('/profile');
      const data = response.data?.data || response.data;
      if (data?.profilePictureUrl) {
        setProfileImage(`https://nexus-3rk7.onrender.com${data.profilePictureUrl}`);
      }
    } catch (err) {
      // Keep no image if fetch fails
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [usersRes, newsRes, videosRes] = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/health/news'),
        api.get('/media/first-aid'),
      ]);

      const usersData = usersRes.status === 'fulfilled'
        ? usersRes.value.data?.data || usersRes.value.data?.content || usersRes.value.data || []
        : [];
      const userList = Array.isArray(usersData) ? usersData : [];

      const newsData = newsRes.status === 'fulfilled'
        ? newsRes.value.data?.data || newsRes.value.data || []
        : [];
      const newsList = Array.isArray(newsData) ? newsData : [];

      const videosData = videosRes.status === 'fulfilled'
        ? videosRes.value.data?.data || videosRes.value.data || []
        : [];
      const videosList = Array.isArray(videosData) ? videosData : [];

      setStats({
        totalUsers: userList.length,
        activeUsers: userList.filter((u: any) => u.active !== false).length,
        totalNews: newsList.length,
        totalVideos: videosList.length,
      });

    } catch (err) {
      console.log('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/login');
  };

  const menuItems = [
    {
      id: '1',
      title: 'Manage Users',
      subtitle: `${stats.totalUsers} total · ${stats.activeUsers} active`,
      icon: 'people-outline',
      color: '#534AB7',
      bg: '#ede9ff',
      route: '/admin-users',
    },
    {
      id: '2',
      title: 'Publish News',
      subtitle: `${stats.totalNews} articles published`,
      icon: 'newspaper-outline',
      color: '#1D9E75',
      bg: '#d1fae5',
      route: '/admin-news',
    },
    {
      id: '3',
      title: 'First Aid Videos',
      subtitle: `${stats.totalVideos} videos uploaded`,
      icon: 'videocam-outline',
      color: '#E24B4A',
      bg: '#FEE2E2',
      route: '/admin-videos',
    },
    {
      id: '4',
      title: 'Audit Logs',
      subtitle: 'View all system activity',
      icon: 'list-outline',
      color: '#F59E0B',
      bg: '#FEF3C7',
      route: '/admin-logs',
    },
    {
      id: '5',
      title: 'Dashboard Stats',
      subtitle: 'View detailed statistics',
      icon: 'bar-chart-outline',
      color: '#06B6D4',
      bg: '#E0F7FA',
      route: '/admin-stats',
    },
    {
      id: '6',
      title: 'System Health',
      subtitle: 'Check backend status',
      icon: 'pulse-outline',
      color: '#8B5CF6',
      bg: '#EDE9FE',
      route: '/admin-health',
    },
    {
      id: '7',
      title: 'My Profile',
      subtitle: 'Edit name, photo and password',
      icon: 'person-circle-outline',
      color: '#534AB7',
      bg: '#ede9ff',
      route: '/admin-profile',
    },
    {
      id: '8',
      title: isDark ? 'Light Mode' : 'Dark Mode',
      subtitle: isDark ? 'Switch to light theme' : 'Switch to dark theme',
      icon: isDark ? 'sunny-outline' : 'moon-outline',
      color: '#F59E0B',
      bg: '#FEF3C7',
      route: null,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      {/* Header with profile picture */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Profile picture — tap to go to admin profile */}
          <TouchableOpacity onPress={() => router.push('/admin-profile')}>
            {profileImage ? (
              <Image
                source={{
                  uri: profileImage,
                  headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
                }}
                style={styles.headerAvatar}
                onError={() => setProfileImage(null)}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarText}>
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back, {user?.name || 'Admin'} 👋</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => { fetchStats(); fetchProfilePicture(); }}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats cards */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#534AB7" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading stats...</Text>
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#534AB7' }]}
            onPress={() => router.push('/admin-users')}
          >
            <Ionicons name="people-outline" size={28} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#1D9E75' }]}
            onPress={() => router.push('/admin-users')}
          >
            <Ionicons name="person-outline" size={28} color="#fff" />
            <Text style={styles.statNumber}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#E24B4A' }]}
            onPress={() => router.push('/admin-news')}
          >
            <Ionicons name="newspaper-outline" size={28} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalNews}</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#F59E0B' }]}
            onPress={() => router.push('/admin-videos')}
          >
            <Ionicons name="videocam-outline" size={28} color="#fff" />
            <Text style={styles.statNumber}>{stats.totalVideos}</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick actions */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
            ]}
            onPress={() => {
              if (item.route === null) {
                // Toggle dark/light mode
                toggleTheme();
              } else {
                router.push(item.route as any);
              }
            }}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.menuSubtitle, { color: colors.subtitle }]}>{item.subtitle}</Text>
            </View>
            {item.route !== null ? (
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            ) : (
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={20}
                color="#F59E0B"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.subtitle }]}>Nexus Admin v2.0.0</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  headerAvatarPlaceholder: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  headerAvatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#d0ccff' },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16,
  },
  statCard: {
    width: '47%', borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  statNumber: { fontSize: 32, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginBottom: 10,
  },
  menuContainer: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, gap: 14,
  },
  menuIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  menuSubtitle: { fontSize: 12 },
  logoutButton: {
    backgroundColor: '#534AB7', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, margin: 16, padding: 16,
    borderRadius: 12, marginTop: 20,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 13, marginBottom: 32 },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
});