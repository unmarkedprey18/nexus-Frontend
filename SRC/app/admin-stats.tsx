import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminStatsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    disabledUsers: 0,
    adminUsers: 0,
    totalNews: 0,
    totalVideos: 0,
  });

  useEffect(() => { fetchStats(); }, []);

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
        disabledUsers: userList.filter((u: any) => u.active === false).length,
        adminUsers: userList.filter((u: any) => u.role === 'ADMIN').length,
        totalNews: newsList.length,
        totalVideos: videosList.length,
      });
    } catch (err) {
      console.log('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'people-outline', color: '#008080' },
    { label: 'Active Users', value: stats.activeUsers, icon: 'person-outline', color: '#006666' },
    { label: 'Disabled Users', value: stats.disabledUsers, icon: 'ban-outline', color: '#E24B4A' },
    { label: 'Admin Users', value: stats.adminUsers, icon: 'shield-outline', color: '#00897B' },
    { label: 'News Articles', value: stats.totalNews, icon: 'newspaper-outline', color: '#00796B' },
    { label: 'First Aid Videos', value: stats.totalVideos, icon: 'videocam-outline', color: '#004D40' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
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
          <ActivityIndicator size="large" color="#008080" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>
            Loading stats...
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Platform Overview
          </Text>

          <View style={styles.statsGrid}>
            {statCards.map((stat, index) => (
              <View
                key={index}
                style={[styles.statCard, { backgroundColor: colors.card }]}
              >
                <View style={[styles.statIconCircle, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={[styles.statNumber, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subtitle }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Summary card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Platform Health
            </Text>
            <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.subtitle }]}>User Activity Rate</Text>
              <Text style={[styles.summaryValue, { color: '#008080' }]}>
                {stats.totalUsers > 0
                  ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                  : 0}%
              </Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.subtitle }]}>Total Content</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {stats.totalNews + stats.totalVideos} items
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.subtitle }]}>Admin to User Ratio</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {stats.totalUsers > 0
                  ? `1 : ${Math.round((stats.totalUsers - stats.adminUsers) / Math.max(stats.adminUsers, 1))}`
                  : '0 : 0'}
              </Text>
            </View>
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#008080',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  refreshButton: { padding: 4 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginTop: 20, marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12, marginBottom: 20,
  },
  statCard: {
    width: '47%', borderRadius: 16, padding: 16,
    alignItems: 'center',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  statNumber: { fontSize: 32, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  summaryCard: {
    marginHorizontal: 16, borderRadius: 16, padding: 20,
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1,
  },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '700' },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
});
