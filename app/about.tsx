import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      <View style={[styles.logoSection, { backgroundColor: colors.card }]}>
        <View style={styles.logoCircle}>
          <Ionicons name="accessibility-outline" size={48} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>Nexus</Text>
        <Text style={[styles.version, { color: colors.subtitle }]}>Version 2.0.0</Text>
      </View>

      {/* Mission */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.aboutTitle, { color: colors.text }]}>Our Mission</Text>
        <Text style={[styles.aboutText, { color: colors.subtitle }]}>
          Nexus is a mobile health companion designed specifically for the deaf and
          hard-of-hearing community. We believe everyone deserves equal access to
          health information and communication tools.
        </Text>
      </View>

      {/* Info rows */}
      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        {[
          { label: 'Version', value: '2.0.0' },
          { label: 'Platform', value: 'iOS & Android' },
          { label: 'Developer', value: 'Nexus Team' },
          { label: 'Contact', value: 'support@nexusapp.com' },
        ].map((item, index) => (
          <View key={index} style={[styles.infoRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.subtitle }]}>{item.label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#534AB7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  appName: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  version: { fontSize: 14 },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  aboutTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  aboutText: { fontSize: 14, lineHeight: 24 },
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
});