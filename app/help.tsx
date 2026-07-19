import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../store/useTheme';

const faqs = [
  { id: '1', question: 'How does the sign language translation work?', answer: 'Point your camera at someone signing and the AI will translate their gestures into text in real time.' },
  { id: '2', question: 'Is the app free to use?', answer: 'Yes! Nexus is completely free for all users.' },
  { id: '3', question: 'How do I change my profile information?', answer: 'Go to Profile → Edit Profile to update your name, email and photo.' },
  { id: '4', question: 'What languages are supported?', answer: 'We currently support 10 languages including English, French, Spanish, Arabic and more.' },
  { id: '5', question: 'How do I report a problem?', answer: 'Contact us at support@nexusapp.com and we will get back to you within 24 hours.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      {/* Contact card */}
      <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
        <Ionicons name="mail-outline" size={24} color="#534AB7" />
        <View style={styles.contactText}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>Contact Support</Text>
          <Text style={styles.contactSubtitle}>support@nexusapp.com</Text>
        </View>
      </View>

      <Text style={[styles.faqTitle, { color: colors.text }]}>Frequently Asked Questions</Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {faqs.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.faqRow, index < faqs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => setExpanded(expanded === item.id ? null : item.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
              <Ionicons name={expanded === item.id ? 'chevron-up' : 'chevron-down'} size={18} color="#999" />
            </View>
            {expanded === item.id && (
              <Text style={[styles.answer, { color: colors.subtitle }]}>{item.answer}</Text>
            )}
          </TouchableOpacity>
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  contactText: { flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '600' },
  contactSubtitle: { fontSize: 13, color: '#534AB7', marginTop: 2 },
  faqTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginBottom: 10 },
  card: {
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
  faqRow: { padding: 16 },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  question: { flex: 1, fontSize: 14, fontWeight: '600', marginRight: 10 },
  answer: { fontSize: 13, lineHeight: 22, marginTop: 10 },
});