import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useTheme';

const faqs = [
  { q: 'How do I use sign language interpreter?', a: 'Go to the Translate tab, tap Sign, then tap Record Video. Point your camera at the person signing and stop the recording. The AI will interpret the signs.' },
  { q: 'How do I upgrade to premium?', a: 'Go to Profile tab and tap Go Premium. Select your plan and complete payment via Mobile Money or Paystack.' },
  { q: 'Why is the app slow to load?', a: 'The backend server may be sleeping. Wait a few seconds and try again. This is normal for the free hosting tier.' },
  { q: 'How do I reset my password?', a: 'On the login screen tap Forgot Password, enter your email and we will send you a 6-digit OTP to reset your password.' },
  { q: 'How do I call emergency services?', a: 'Go to the First Aid tab and tap Emergency Services. The app will detect your location and open the phone dialer.' },
  { q: 'How do I change the app language?', a: 'Go to Profile tab, tap Language and select your preferred language from the list.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Frequently Asked Questions
      </Text>

      {faqs.map((faq, index) => (
        <View key={index} style={[styles.faqCard, { backgroundColor: colors.card }]}>
          <View style={styles.faqQuestion}>
            <View style={styles.questionIcon}>
              <Ionicons name="help-circle-outline" size={20} color="#008080" />
            </View>
            <Text style={[styles.questionText, { color: colors.text }]}>{faq.q}</Text>
          </View>
          <Text style={[styles.answerText, { color: colors.subtitle }]}>{faq.a}</Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Support</Text>

      <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.contactRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          onPress={() => Linking.openURL('https://wa.me/233536764978')}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>WhatsApp Support</Text>
            <Text style={[styles.contactSubtitle, { color: colors.subtitle }]}>0536764978</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B2DFDB" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => Linking.openURL('mailto:support@nexusapp.com')}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="mail-outline" size={22} color="#008080" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Email Support</Text>
            <Text style={[styles.contactSubtitle, { color: colors.subtitle }]}>support@nexusapp.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B2DFDB" />
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginTop: 24, marginBottom: 12,
  },
  faqCard: {
    marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  faqQuestion: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  questionIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#B2DFDB',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  questionText: { flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  answerText: { fontSize: 13, lineHeight: 20, paddingLeft: 42 },
  contactCard: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  contactIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#B2DFDB',
    justifyContent: 'center', alignItems: 'center',
  },
  contactTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  contactSubtitle: { fontSize: 12 },
});