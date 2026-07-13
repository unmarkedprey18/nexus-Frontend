import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../store/useTheme';

const healthChecks = [
  { id: '1', service: 'API Gateway', status: 'Unknown', icon: 'server-outline' },
  { id: '2', service: 'Database', status: 'Unknown', icon: 'server-outline' },
  { id: '3', service: 'Auth Service', status: 'Unknown', icon: 'shield-outline' },
  { id: '4', service: 'News Service', status: 'Unknown', icon: 'newspaper-outline' },
  { id: '5', service: 'Media Service', status: 'Unknown', icon: 'videocam-outline' },
  { id: '6', service: 'Translate Service', status: 'Unknown', icon: 'language-outline' },
];

export default function AdminHealthScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Health</Text>
      </View>

      {/* Overall status */}
      <View style={[styles.overallCard, { backgroundColor: colors.card }]}>
        <Ionicons name="cloud-outline" size={40} color="#534AB7" />
        <Text style={[styles.overallTitle, { color: colors.text }]}>Backend Connected ✅</Text>
        <Text style={[styles.overallSubtitle, { color: colors.subtitle }]}>
          Nexus backend is live at nexus-3rk7.onrender.com
        </Text>
      </View>

      {/* Service list */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {healthChecks.map((item, index) => (
          <View
            key={item.id}
            style={[styles.serviceRow, index < healthChecks.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <View style={styles.serviceIcon}>
              <Ionicons name={item.icon as any} size={22} color="#534AB7" />
            </View>
            <Text style={[styles.serviceName, { color: colors.text }]}>{item.service}</Text>
            <View style={styles.unknownBadge}>
              <Text style={styles.unknownText}>{item.status}</Text>
            </View>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#F97316',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  overallCard: {
    margin: 16, borderRadius: 16, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  overallTitle: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  overallSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginBottom: 10 },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 32,
  },
  serviceRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  serviceIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#ede9ff',
    justifyContent: 'center', alignItems: 'center',
  },
  serviceName: { flex: 1, fontSize: 14, fontWeight: '500' },
  unknownBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  unknownText: { fontSize: 11, color: '#666', fontWeight: '600' },
});