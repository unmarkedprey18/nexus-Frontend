import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminStatsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalNews: 0,
    totalVideos: 0,
    adminUsers: 0,
    disabledUsers: 0,
  });

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

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
        adminUsers: userList.filter((u: any) => u.role === 'ADMIN').length,
        disabledUsers: userList.filter((u: any) => u.active === false).length,
      });
    } catch (err) {
      console.log('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: 'people-outline', color: '#534AB7', bg: '#ede9ff', route: '/admin-users' },
    { title: 'Active Users', value: stats.activeUsers, icon: 'person-outline', color: '#1D9E75', bg: '#d1fae5', route: '/admin-users' },
    { title: 'Disabled Users', value: stats.disabledUsers, icon: 'ban-outline', color: '#E24B4A', bg: '#FEE2E2', route: '/admin-users' },
    { title: 'Admin Users', value: stats.adminUsers, icon: 'shield-outline', color: '#8B5CF6', bg: '#EDE9FE', route: '/admin-users' },
    { title: 'News Articles', value: stats.totalNews, icon: 'newspaper-outline', color: '#1D9E75', bg: '#d1fae5', route: '/admin-news' },
    { title: 'First Aid Videos', value: stats.totalVideos, icon: 'videocam-outline', color: '#E24B4A', bg: '#FEE2E2', route: '/admin-videos' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard Stats</Text>
        <TouchableOpacity onPress={fetchStats} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#534AB7" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading stats...</Text>
        </View>
      ) : (
        <>
          {/* Stats grid */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Analytics</Text>
          <View style={styles.grid}>
            {statCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.statCard, { backgroundColor: colors.card }]}
                onPress={() => router.push(card.route as any)}
              >
                <View style={[styles.statIconCircle, { backgroundColor: card.bg }]}>
                  <Ionicons name={card.icon as any} size={24} color={card.color} />
                </View>
                <Text style={[styles.statNumber, { color: colors.text }]}>{card.value}</Text>
                <Text style={[styles.statLabel, { color: colors.subtitle }]}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* User breakdown */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>User Breakdown</Text>
          <View style={[styles.breakdownCard, { backgroundColor: colors.card }]}>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: '#534AB7' }]} />
                <Text style={[styles.breakdownLabel, { color: colors.text }]}>Total Users</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: colors.text }]}>{stats.totalUsers}</Text>
            </View>

            <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: '#1D9E75' }]} />
                <Text style={[styles.breakdownLabel, { color: colors.text }]}>Active Users</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#1D9E75' }]}>{stats.activeUsers}</Text>
            </View>

            <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: '#E24B4A' }]} />
                <Text style={[styles.breakdownLabel, { color: colors.text }]}>Disabled Users</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#E24B4A' }]}>{stats.disabledUsers}</Text>
            </View>

            <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={[styles.breakdownLabel, { color: colors.text }]}>Admin Users</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#8B5CF6' }]}>{stats.adminUsers}</Text>
            </View>

          </View>

          {/* Content breakdown */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Content Breakdown</Text>
          <View style={[styles.breakdownCard, { backgroundColor: colors.card }]}>

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: '#1D9E75' }]} />
                <Text style={[styles.breakdownLabel, { color: colors.text }]}>News Articles</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#1D9E75' }]}>{stats.totalNews}</Text>
            </View>

            <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: '#E24B4A' }]} />
                <Text style={[styles.breakdownLabel, { color: colors.text }]}>First Aid Videos</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: '#E24B4A' }]}>{stats.totalVideos}</Text>
            </View>

          </View>

          {/* Quick actions */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={[styles.actionsCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[styles.actionButton, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={() => router.push('/admin-users')}
            >
              <Ionicons name="people-outline" size={20} color="#534AB7" />
              <Text style={[styles.actionText, { color: colors.text }]}>Manage Users</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={() => router.push('/admin-news')}
            >
              <Ionicons name="newspaper-outline" size={20} color="#1D9E75" />
              <Text style={[styles.actionText, { color: colors.text }]}>Publish News</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/admin-logs')}
            >
              <Ionicons name="list-outline" size={20} color="#F59E0B" />
              <Text style={[styles.actionText, { color: colors.text }]}>View Audit Logs</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          </View>

        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  refreshButton: { padding: 4 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginTop: 20, marginBottom: 10,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
  },
  statCard: {
    width: '47%', borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  statNumber: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, textAlign: 'center', fontWeight: '500' },
  breakdownCard: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { fontSize: 14, fontWeight: '500' },
  breakdownValue: { fontSize: 18, fontWeight: '700' },
  actionsCard: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  actionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
});