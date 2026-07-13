import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminLogsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Reload logs every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/audit-logs');
      const data = response.data?.data || response.data?.logs ||
        response.data?.content || response.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  // Get icon and color for each log action
  const getLogStyle = (action: string) => {
    const a = (action || '').toLowerCase();
    if (a.includes('login') || a.includes('auth')) return { icon: 'log-in-outline', color: '#534AB7' };
    if (a.includes('delete')) return { icon: 'trash-outline', color: '#E24B4A' };
    if (a.includes('create') || a.includes('publish') || a.includes('add')) return { icon: 'add-circle-outline', color: '#1D9E75' };
    if (a.includes('update') || a.includes('edit') || a.includes('change')) return { icon: 'create-outline', color: '#F59E0B' };
    if (a.includes('upload')) return { icon: 'cloud-upload-outline', color: '#06B6D4' };
    if (a.includes('disable') || a.includes('block')) return { icon: 'ban-outline', color: '#E24B4A' };
    if (a.includes('enable')) return { icon: 'checkmark-circle-outline', color: '#1D9E75' };
    if (a.includes('password')) return { icon: 'lock-closed-outline', color: '#8B5CF6' };
    if (a.includes('register')) return { icon: 'person-add-outline', color: '#1D9E75' };
    return { icon: 'ellipse-outline', color: '#999' };
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  // Filter options
  const filters = ['ALL', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE'];

  // Filter logs based on selected filter
  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    const action = (log.action || log.event || log.type || '').toLowerCase();
    return action.includes(filter.toLowerCase());
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <TouchableOpacity onPress={fetchLogs} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#534AB7' }]}>{logs.length}</Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#1D9E75' }]}>
            {logs.filter(l => (l.action || l.event || '').toLowerCase().includes('login')).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Logins</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#E24B4A' }]}>
            {logs.filter(l => (l.action || l.event || '').toLowerCase().includes('delete')).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Deletes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
            {logs.filter(l => (l.action || l.event || '').toLowerCase().includes('update')).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Updates</Text>
        </View>
      </View>

      {/* Filter buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#534AB7" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading logs...</Text>
        </View>
      )}

      {/* Error */}
      {error !== '' && !loading && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color="#E24B4A" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchLogs}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logs list */}
      {!loading && filteredLogs.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {filter === 'ALL' ? 'All Activity' : `${filter} Events`} ({filteredLogs.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {filteredLogs.map((log: any, index: number) => {
              const action = log.action || log.event || log.type || 'Unknown';
              const { icon, color } = getLogStyle(action);
              return (
                <View
                  key={log.id || index}
                  style={[
                    styles.logRow,
                    index < filteredLogs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]}
                >
                  {/* Icon */}
                  <View style={[styles.logIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon as any} size={18} color={color} />
                  </View>

                  {/* Log info */}
                  <View style={styles.logInfo}>
                    <Text style={[styles.logAction, { color: colors.text }]}>
                      {action}
                    </Text>
                    {(log.userEmail || log.email || log.user) && (
                      <Text style={[styles.logUser, { color: colors.subtitle }]}>
                        👤 {log.userEmail || log.email || log.user}
                      </Text>
                    )}
                    {(log.details || log.description || log.message) && (
                      <Text style={[styles.logDetails, { color: colors.subtitle }]} numberOfLines={2}>
                        {log.details || log.description || log.message}
                      </Text>
                    )}
                    <Text style={[styles.logTime, { color: colors.subtitle }]}>
                      🕐 {formatTime(log.timestamp || log.createdAt || log.date)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Empty state */}
      {!loading && filteredLogs.length === 0 && error === '' && (
        <View style={styles.centered}>
          <Ionicons name="list-outline" size={48} color="#ccc" />
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>
            {filter === 'ALL' ? 'No logs found' : `No ${filter} events found`}
          </Text>
          {filter !== 'ALL' && (
            <TouchableOpacity style={styles.clearFilter} onPress={() => setFilter('ALL')}>
              <Text style={styles.clearFilterText}>Show All Logs</Text>
            </TouchableOpacity>
          )}
        </View>
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
  statsRow: { flexDirection: 'row', gap: 8, padding: 16 },
  statCard: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statNumber: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 10, textAlign: 'center' },
  filterRow: { marginBottom: 8 },
  filterButton: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f0f0f0',
  },
  activeFilter: { backgroundColor: '#534AB7' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#666' },
  activeFilterText: { color: '#fff' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginBottom: 10, marginTop: 8,
  },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 32,
  },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  logIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  logInfo: { flex: 1 },
  logAction: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  logUser: { fontSize: 12, marginBottom: 3 },
  logDetails: { fontSize: 12, lineHeight: 18, marginBottom: 3 },
  logTime: { fontSize: 11 },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, margin: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991b1b' },
  retryText: { color: '#534AB7', fontWeight: '600', fontSize: 13 },
  clearFilter: {
    backgroundColor: '#534AB7', paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 8,
  },
  clearFilterText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});