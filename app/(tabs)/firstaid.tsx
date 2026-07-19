import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../store/useTheme';

const firstAidData = [
  { id: '1', title: 'Heart Attack', description: 'Recognize and respond to a heart attack emergency.', icon: 'heart-outline', color: '#E24B4A' },
  { id: '2', title: 'Choking', description: 'Learn how to help someone who is choking.', icon: 'alert-circle-outline', color: '#F59E0B' },
  { id: '3', title: 'Burns', description: 'How to treat minor and major burn injuries.', icon: 'flame-outline', color: '#F97316' },
  { id: '4', title: 'Bleeding', description: 'Steps to control and manage heavy bleeding.', icon: 'bandage-outline', color: '#E24B4A' },
  { id: '5', title: 'Fractures', description: 'What to do when someone has a broken bone.', icon: 'body-outline', color: '#534AB7' },
  { id: '6', title: 'Seizures', description: 'How to safely help someone having a seizure.', icon: 'flash-outline', color: '#8B5CF6' },
];

export default function FirstAidScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>First Aid</Text>
        <Text style={styles.headerSubtitle}>Quick guides for emergency situations 🚑</Text>
      </View>

      <View style={styles.grid}>
        {firstAidData.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() =>
              router.push({
                pathname: '/firstaid-detail',
                params: { title: item.title, description: item.description, color: item.color },
              })
            }
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.cardDescription, { color: colors.subtitle }]}>{item.description}</Text>
            <View style={styles.arrowRow}>
              <Text style={[styles.learnMore, { color: item.color }]}>Learn more</Text>
              <Ionicons name="arrow-forward" size={14} color={item.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#E24B4A',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: '#ffd0d0' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  cardDescription: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  arrowRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  learnMore: { fontSize: 12, fontWeight: '600' },
});