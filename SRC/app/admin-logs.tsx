import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminLogsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/audit-logs');
      const data = response.data?.data || response.data?.logs || response.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const a = (action || '').toUpperCase();
    if (a.includes('DELETE')) return '#E24B4A';
    if (a.includes('CREATE') || a.includes('REGISTER')) return '#008080';
    if (a.includes('UPDATE') || a.includes('EDIT')) return '#F59E0B';
    if (a.includes('LOGIN')) return '#006666';
    if (a.includes('DISABLE')) return '#E24B4A';
    if (a.includes('ENABLE')) return '#008080';
    return '#00695C';
  };

  const filterTypes = ['ALL', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE'];

  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter(log => (log.action || '').toUpperCase().includes(filter));

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <TouchableOpacity onPress={fetchLogs} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {filterTypes.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              filter === f && styles.filterButtonActive,
            ]}
          >
            <Text style={[
              styles.filterText, { color: colors.subtitle },
              filter === f && styles.filterTextActive,
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading logs...</Text>
        </View>
      ) : error !== '' ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color="#E24B4A" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {filteredLogs.length} {filter === 'ALL' ? 'total' : filter.toLowerCase()} logs
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {filteredLogs.length === 0 ? (
              <View style={styles.centered}>
                <Ionicons name="document-text-outline" size={40} color="#B2DFDB" />
                <Text style={[styles.emptyText, { color: colors.subtitle }]}>No logs found</Text>
              </View>
            ) : (
              filteredLogs.map((log, index) => (
                <View
                  key={log.id || index}
                  style={[
                    styles.logRow,
                    index < filteredLogs.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }
                  ]}
                >
                  <View style={[styles.actionDot, { backgroundColor: getActionColor(log.action) }]} />
                  <View style={styles.logInfo}>
                    <View style={styles.logTop}>
                      <Text style={[styles.logAction, { color: getActionColor(log.action) }]}>
                        {log.action || 'ACTION'}
                      </Text>
                      <Text style={[styles.logTime, { color: colors.subtitle }]}>
                        {log.timestamp || log.createdAt
                          ? new Date(log.timestamp || log.createdAt).toLocaleString('en-GB', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })
                          : ''}
                      </Text>
                    </View>
                    {log.actorEmail && (
                      <Text style={[styles.logUser, { color: colors.subtitle }]}>
                        {log.actorEmail}
                      </Text>
                    )}
                    {log.details && (
                      <Text style={[styles.logDetails, { color: colors.subtitle }]} numberOfLines={2}>
                        {log.details}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
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
  filterRow: { marginVertical: 14 },
  filterButton: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  filterButtonActive: { backgroundColor: '#008080', borderColor: '#008080' },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  sectionTitle: {
    fontSize: 14, fontWeight: '600',
    marginHorizontal: 16, marginBottom: 10,
  },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 16,
  },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  actionDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  logInfo: { flex: 1 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logAction: { fontSize: 13, fontWeight: '700' },
  logTime: { fontSize: 11 },
  logUser: { fontSize: 12, marginBottom: 2 },
  logDetails: { fontSize: 12, lineHeight: 18 },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, margin: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991b1b' },
});
