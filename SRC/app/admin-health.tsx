import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

type ServiceStatus = 'checking' | 'online' | 'offline';

export default function AdminHealthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState('');
  const [services, setServices] = useState<{ name: string; status: ServiceStatus; message: string }[]>([
    { name: 'Auth Service', status: 'checking', message: 'Checking...' },
    { name: 'Health News Service', status: 'checking', message: 'Checking...' },
    { name: 'Translation Service', status: 'checking', message: 'Checking...' },
    { name: 'Media Service', status: 'checking', message: 'Checking...' },
    { name: 'Subscription Service', status: 'checking', message: 'Checking...' },
    { name: 'Admin Service', status: 'checking', message: 'Checking...' },
  ]);

  useEffect(() => { checkHealth(); }, []);

  const checkHealth = async () => {
    setLoading(true);
    setLastChecked(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

    const checks = [
      { name: 'Auth Service', endpoint: '/auth/health' },
      { name: 'Health News Service', endpoint: '/health/news' },
      { name: 'Translation Service', endpoint: '/translate/languages' },
      { name: 'Media Service', endpoint: '/media/first-aid' },
      { name: 'Subscription Service', endpoint: '/subscription/status' },
      { name: 'Admin Service', endpoint: '/admin/users' },
    ];

    const results = await Promise.allSettled(
      checks.map(check => api.get(check.endpoint))
    );

    const updated = checks.map((check, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        return { name: check.name, status: 'online' as ServiceStatus, message: 'Service is running normally' };
      } else {
        const err = result.reason;
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          return { name: check.name, status: 'online' as ServiceStatus, message: 'Service is running (auth required)' };
        }
        return { name: check.name, status: 'offline' as ServiceStatus, message: err?.message || 'Service unavailable' };
      }
    });

    setServices(updated);
    setLoading(false);
  };

  const onlineCount = services.filter(s => s.status === 'online').length;
  const offlineCount = services.filter(s => s.status === 'offline').length;

  const getStatusColor = (status: ServiceStatus) => {
    if (status === 'online') return '#008080';
    if (status === 'offline') return '#E24B4A';
    return '#F59E0B';
  };

  const getStatusIcon = (status: ServiceStatus) => {
    if (status === 'online') return 'checkmark-circle';
    if (status === 'offline') return 'close-circle';
    return 'time-outline';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Health</Text>
        <TouchableOpacity onPress={checkHealth} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Overall status */}
      <View style={[styles.overallCard, {
        backgroundColor: offlineCount === 0 ? '#E0F2F1' : '#FEE2E2',
      }]}>
        <Ionicons
          name={offlineCount === 0 ? 'checkmark-circle' : 'warning-outline'}
          size={32}
          color={offlineCount === 0 ? '#008080' : '#E24B4A'}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.overallTitle, { color: offlineCount === 0 ? '#004D40' : '#991b1b' }]}>
            {loading ? 'Checking services...' : offlineCount === 0 ? 'All Systems Operational' : `${offlineCount} Service${offlineCount > 1 ? 's' : ''} Down`}
          </Text>
          <Text style={[styles.overallSub, { color: offlineCount === 0 ? '#00695C' : '#E24B4A' }]}>
            {loading ? 'Please wait...' : `${onlineCount}/${services.length} services online · Last checked ${lastChecked}`}
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#008080' }]}>{onlineCount}</Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Online</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: '#E24B4A' }]}>{offlineCount}</Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Offline</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{services.length}</Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Total</Text>
        </View>
      </View>

      {/* Services list */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Status</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#008080" />
            <Text style={[styles.loadingText, { color: colors.subtitle }]}>
              Checking all services...
            </Text>
          </View>
        ) : (
          services.map((service, index) => (
            <View
              key={service.name}
              style={[
                styles.serviceRow,
                index < services.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }
              ]}
            >
              <View style={[styles.serviceIconCircle, { backgroundColor: getStatusColor(service.status) + '20' }]}>
                <Ionicons name="server-outline" size={18} color={getStatusColor(service.status)} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                <Text style={[styles.serviceMessage, { color: colors.subtitle }]} numberOfLines={1}>
                  {service.message}
                </Text>
              </View>
              <Ionicons
                name={getStatusIcon(service.status) as any}
                size={22}
                color={getStatusColor(service.status)}
              />
            </View>
          ))
        )}
      </View>

      {/* Refresh button */}
      <TouchableOpacity
        style={styles.refreshFullButton}
        onPress={checkHealth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.refreshFullButtonText}>Run Health Check Again</Text>
          </>
        )}
      </TouchableOpacity>

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
  overallCard: {
    margin: 16, borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  overallTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  overallSub: { fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 8 },
  statCard: {
    flex: 1, borderRadius: 12, padding: 14, alignItems: 'center',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statNumber: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 16,
  },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  serviceIconCircle: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  serviceMessage: { fontSize: 12 },
  refreshFullButton: {
    backgroundColor: '#008080', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, padding: 16, borderRadius: 14,
  },
  refreshFullButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
});
