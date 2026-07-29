import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useTheme';
import api from '../services/api';

const languages = [
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'fr', name: 'French', flag: 'FR' },
  { code: 'es', name: 'Spanish', flag: 'ES' },
  { code: 'ar', name: 'Arabic', flag: 'SA' },
  { code: 'pt', name: 'Portuguese', flag: 'PT' },
  { code: 'de', name: 'German', flag: 'DE' },
  { code: 'zh', name: 'Chinese', flag: 'CN' },
  { code: 'ja', name: 'Japanese', flag: 'JP' },
  { code: 'ko', name: 'Korean', flag: 'KR' },
  { code: 'ru', name: 'Russian', flag: 'RU' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedLang, setSelectedLang] = useState('en');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/profile', { language: selectedLang });
      Alert.alert('Success', 'Language preference saved!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save language');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Select Your Language
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {languages.map((lang, index) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.row,
              index < languages.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
              selectedLang === lang.code && { backgroundColor: '#E0F2F1' },
            ]}
            onPress={() => setSelectedLang(lang.code)}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="language-outline" size={20} color="#008080" />
            </View>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{lang.name}</Text>
            {selectedLang === lang.code && (
              <Ionicons name="checkmark-circle" size={22} color="#008080" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Language</Text>
          </>
        )}
      </TouchableOpacity>
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
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#B2DFDB',
    justifyContent: 'center', alignItems: 'center',
  },
  rowTitle: { flex: 1, fontSize: 15, fontWeight: '500' },
  saveButton: {
    backgroundColor: '#008080', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, marginTop: 24, padding: 16, borderRadius: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
