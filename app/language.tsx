import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'tw', name: 'Twi', flag: '🇬🇭' },
  { code: 'ha', name: 'Hausa', flag: '🇬🇭' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load saved language from backend when screen opens
  useEffect(() => {
    fetchLanguage();
  }, []);

  const fetchLanguage = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      const data = response.data?.data || response.data;
      if (data?.preferredLanguage) {
        setSelected(data.preferredLanguage);
      }
    } catch (err) {
      // Keep default if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLanguage = async (code: string) => {
    setSelected(code);
    try {
      setSaving(true);
      // Save preferred language to backend
      await api.put('/profile', { preferredLanguage: code });
      const langName = languages.find(l => l.code === code)?.name || code;
      Alert.alert('✅ Language Updated', `Your preferred language is now ${langName}`);
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || 'Could not save language');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        {saving && <ActivityIndicator color="#fff" size="small" />}
      </View>

      {/* Info box */}
      <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
        <Ionicons name="information-circle-outline" size={20} color="#534AB7" />
        <Text style={[styles.infoText, { color: colors.subtitle }]}>
          Your preferred language is saved to your profile and used across the app.
        </Text>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#534AB7" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading...</Text>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.row,
                index < languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                selected === lang.code && { backgroundColor: '#ede9ff' },
              ]}
              onPress={() => handleSelectLanguage(lang.code)}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[styles.langName, { color: colors.text }]}>{lang.name}</Text>
              {selected === lang.code && (
                <Ionicons name="checkmark-circle" size={22} color="#534AB7" />
              )}
            </TouchableOpacity>
          ))}
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
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    margin: 16, borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 32,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  flag: { fontSize: 24 },
  langName: { flex: 1, fontSize: 15, fontWeight: '500' },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
});