import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useTheme';

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Nexus</Text>
      </View>

      {/* Logo section */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Ionicons name="heart-circle-outline" size={60} color="#fff" />
        </View>
        <Text style={styles.appName}>Nexus</Text>
        <Text style={styles.appTagline}>Connecting the World</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
      </View>

      {/* Mission */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="globe-outline" size={22} color="#008080" />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Our Mission</Text>
        </View>
        <Text style={[styles.cardText, { color: colors.subtitle }]}>
          Nexus bridges the communication gap between deaf and hard-of-hearing individuals and the broader healthcare system. We provide accessible health information, sign language interpretation, and emergency services in one unified platform.
        </Text>
      </View>

      {/* Features */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="star-outline" size={22} color="#008080" />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Key Features</Text>
        </View>
        {[
          { icon: 'newspaper-outline', text: 'Real-time health news feed' },
          { icon: 'hand-left-outline', text: 'AI-powered sign language interpreter' },
          { icon: 'language-outline', text: 'Multi-language text translation' },
          { icon: 'mic-outline', text: 'Speech to text transcription' },
          { icon: 'call-outline', text: 'Emergency services with GPS' },
          { icon: 'videocam-outline', text: 'Sign language tutorial videos' },
        ].map((item, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name={item.icon as any} size={18} color="#008080" />
            </View>
            <Text style={[styles.featureText, { color: colors.text }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Tech stack */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="code-slash-outline" size={22} color="#008080" />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Built With</Text>
        </View>
        {[
          'React Native + Expo SDK 54',
          'Spring Boot (Java) Backend',
          'PostgreSQL Database',
          'Groq AI (Translation + Speech)',
          'MediaPipe (Sign Language AI)',
          'Paystack (Payments)',
        ].map((tech, index) => (
          <View key={index} style={styles.techRow}>
            <View style={styles.techDot} />
            <Text style={[styles.techText, { color: colors.subtitle }]}>{tech}</Text>
          </View>
        ))}
      </View>

      {/* Info */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={22} color="#008080" />
          <Text style={[styles.cardTitle, { color: colors.text }]}>App Info</Text>
        </View>
        {[
          { label: 'Version', value: 'v1.0.0' },
          { label: 'Platform', value: 'iOS & Android' },
          { label: 'Backend', value: 'nexus-3rk7.onrender.com' },
          { label: 'Developer', value: 'Nexus Team' },
        ].map((item, index) => (
          <View
            key={index}
            style={[
              styles.infoRow,
              index < 3 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.infoLabel, { color: colors.subtitle }]}>{item.label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>

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
  logoSection: {
    backgroundColor: '#008080',
    alignItems: 'center',
    paddingBottom: 36,
  },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  appName: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 4 },
  appTagline: { fontSize: 16, color: '#B2EBF2', marginBottom: 8 },
  appVersion: {
    fontSize: 13, color: '#B2EBF2',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  card: {
    marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16,
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardText: { fontSize: 14, lineHeight: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#B2DFDB',
    justifyContent: 'center', alignItems: 'center',
  },
  featureText: { fontSize: 14 },
  techRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  techDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#008080' },
  techText: { fontSize: 14 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
});