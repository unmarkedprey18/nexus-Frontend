import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/useTheme';
import api from '../../services/api';

export default function FirstAidScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/media/first-aid');
      const data = response.data?.data || response.data || [];
      setGuides(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Could not load first aid guides.');
    } finally {
      setLoading(false);
    }
  };

  const defaultGuides = [
    {
      id: '1',
      title: 'CPR Guide',
      description: 'Learn how to perform cardiopulmonary resuscitation correctly',
      icon: 'heart-outline',
      color: '#006666',
    },
    {
      id: '2',
      title: 'Choking Response',
      description: 'How to help someone who is choking safely',
      icon: 'alert-circle-outline',
      color: '#008080',
    },
    {
      id: '3',
      title: 'Wound Care',
      description: 'How to clean and dress wounds properly',
      icon: 'bandage-outline',
      color: '#00897B',
    },
    {
      id: '4',
      title: 'Burn Treatment',
      description: 'First aid steps for burns and scalds',
      icon: 'flame-outline',
      color: '#00796B',
    },
    {
      id: '5',
      title: 'Seizure Response',
      description: 'How to help someone having a seizure',
      icon: 'flash-outline',
      color: '#004D40',
    },
    {
      id: '6',
      title: 'Allergic Reaction',
      description: 'Recognizing and responding to severe allergies',
      icon: 'warning-outline',
      color: '#006666',
    },
  ];

  const displayGuides = guides.length > 0 ? guides : defaultGuides;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>First Aid</Text>
        <Text style={styles.headerSubtitle}>
          Emergency guides and quick response tips
        </Text>
      </View>

      {/* Emergency call banner */}
      <TouchableOpacity
        style={styles.emergencyBanner}
        onPress={() => router.push('/firstaid-detail')}
      >
        <View style={styles.emergencyLeft}>
          <Ionicons name="call-outline" size={28} color="#fff" />
          <View>
            <Text style={styles.emergencyTitle}>Emergency Services</Text>
            <Text style={styles.emergencySubtitle}>
              Tap to call Ghana emergency numbers
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Ghana Emergency Numbers */}
      <View style={[styles.numbersCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.numbersTitle, { color: colors.text }]}>
          Ghana Emergency Numbers
        </Text>
        <View style={styles.numbersGrid}>
          {[
            { label: 'Police', number: '191', icon: 'shield-outline' },
            { label: 'Fire', number: '192', icon: 'flame-outline' },
            { label: 'Ambulance', number: '193', icon: 'medical-outline' },
            { label: 'General', number: '112', icon: 'call-outline' },
          ].map((item) => (
            <View key={item.number} style={[styles.numberCard, { backgroundColor: colors.background }]}>
              <Ionicons name={item.icon as any} size={20} color="#008080" />
              <Text style={[styles.numberLabel, { color: colors.subtitle }]}>{item.label}</Text>
              <Text style={[styles.numberValue, { color: colors.text }]}>{item.number}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* First Aid Guides */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        First Aid Guides
      </Text>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>
            Loading guides...
          </Text>
        </View>
      )}

      {!loading && displayGuides.map((guide: any) => (
        <TouchableOpacity
          key={guide.id}
          style={[styles.guideCard, { backgroundColor: colors.card }]}
          onPress={() => router.push({
            pathname: '/firstaid-detail',
            params: { id: guide.id, title: guide.title },
          })}
        >
          <View style={[styles.guideIcon, { backgroundColor: '#B2DFDB' }]}>
            <Ionicons
              name={(guide.icon || 'medical-outline') as any}
              size={24}
              color="#008080"
            />
          </View>
          <View style={styles.guideInfo}>
            <Text style={[styles.guideTitle, { color: colors.text }]}>
              {guide.title}
            </Text>
            <Text style={[styles.guideDesc, { color: colors.subtitle }]} numberOfLines={2}>
              {guide.description || 'Tap to view first aid guide'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B2DFDB" />
        </TouchableOpacity>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#008080',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  headerSubtitle: { fontSize: 14, color: '#B2EBF2' },
  emergencyBanner: {
    backgroundColor: '#006666',
    margin: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#006666',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  emergencySubtitle: { fontSize: 12, color: '#B2EBF2' },
  numbersCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#008080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  numbersTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  numbersGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  numberCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  numberLabel: { fontSize: 11 },
  numberValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#008080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideInfo: { flex: 1 },
  guideTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  guideDesc: { fontSize: 12, lineHeight: 18 },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
});