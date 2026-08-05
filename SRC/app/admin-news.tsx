import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminNewsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', headline: '', category: 'Health',
    content: '', summary: '', source: '',
    sourceUrl: '', language: 'en', priority: 'NORMAL',
  });

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/health/news');
      const data = response.data?.data || response.data?.news || response.data || [];
      setArticles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Failed to load articles.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Oops', 'Please fill in at least the title and content!');
      return;
    }
    try {
      setPublishing(true);
      await api.post('/health/news', {
        ...form,
        headline: form.headline || form.title,
        summary: form.summary || form.content.substring(0, 200),
      });
      Alert.alert('Success', 'Article published successfully!');
      setShowForm(false);
      setForm({ title: '', headline: '', category: 'Health', content: '', summary: '', source: '', sourceUrl: '', language: 'en', priority: 'NORMAL' });
      fetchArticles();
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.message || 'Could not publish article');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (article: any) => {
    const id = article.entryId || article.id || article._id;
    Alert.alert('Delete Article', `Delete "${article.title || article.headline}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/health/news/${id}`);
            setArticles(articles.filter(a => (a.entryId || a.id || a._id) !== id));
            Alert.alert('Success', 'Article deleted!');
          } catch (err: any) {
            Alert.alert('Failed', err.response?.data?.message || 'Could not delete article');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publish News</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addButton}>
          <Ionicons name={showForm ? 'close-outline' : 'add-outline'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Publish form */}
      {showForm && (
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>New Article</Text>

          {[
            { label: 'Title', key: 'title', placeholder: 'Article title' },
            { label: 'Summary', key: 'summary', placeholder: 'Short summary' },
            { label: 'Source', key: 'source', placeholder: 'e.g. WHO, BBC Health' },
            { label: 'Source URL', key: 'sourceUrl', placeholder: 'https://...' },
          ].map(field => (
            <View key={field.key} style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
              <TextInput
                value={form[field.key as keyof typeof form]}
                onChangeText={val => setForm(prev => ({ ...prev, [field.key]: val }))}
                placeholder={field.placeholder}
                placeholderTextColor="#80CBC4"
                style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              />
            </View>
          ))}

          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Content</Text>
            <TextInput
              value={form.content}
              onChangeText={val => setForm(prev => ({ ...prev, content: val }))}
              placeholder="Full article content..."
              placeholderTextColor="#80CBC4"
              multiline
              numberOfLines={5}
              style={[styles.fieldInput, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />
          </View>

          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Category</Text>
            <View style={styles.categoryRow}>
              {['Health', 'Fitness', 'Mental Health', 'Nutrition', 'Medical'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setForm(prev => ({ ...prev, category: cat }))}
                  style={[styles.categoryChip, { borderColor: colors.border }, form.category === cat && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, { color: colors.subtitle }, form.category === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity onPress={() => setShowForm(false)}
              style={[styles.cancelButton, { borderColor: colors.border }]}>
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePublish} disabled={publishing} style={styles.publishButton}>
              {publishing ? <ActivityIndicator color="#fff" size="small" /> : (
                <Text style={styles.publishButtonText}>Publish</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Articles list */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading articles...</Text>
        </View>
      ) : error !== '' ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color="#E24B4A" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Published Articles ({articles.length})
          </Text>
          {articles.map((article, index) => (
            <View key={article.entryId || article.id || index}
              style={[styles.articleCard, { backgroundColor: colors.card }]}>
              <View style={styles.articleHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: '#B2DFDB' }]}>
                  <Text style={styles.categoryBadgeText}>{article.category || 'Health'}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(article)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={18} color="#E24B4A" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.articleTitle, { color: colors.text }]} numberOfLines={2}>
                {article.title || article.headline}
              </Text>
              <Text style={[styles.articleSummary, { color: colors.subtitle }]} numberOfLines={2}>
                {article.summary || article.description}
              </Text>
              {article.source && (
                <Text style={[styles.articleSource, { color: colors.subtitle }]}>
                  {article.source}
                </Text>
              )}
            </View>
          ))}
        </>
      )}

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
  addButton: { padding: 4 },
  formCard: {
    margin: 16, borderRadius: 16, padding: 20,
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  formField: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  fieldInput: {
    borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  categoryChipActive: { backgroundColor: '#008080', borderColor: '#008080' },
  categoryChipText: { fontSize: 12, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },
  formButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelButton: {
    flex: 1, padding: 12, borderRadius: 10, borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 14, fontWeight: '600' },
  publishButton: {
    flex: 1, padding: 12, borderRadius: 10,
    backgroundColor: '#008080', alignItems: 'center',
  },
  publishButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginTop: 8, marginBottom: 10,
  },
  articleCard: {
    marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  articleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  categoryBadgeText: { fontSize: 11, fontWeight: '700', color: '#004D40' },
  deleteButton: { padding: 4 },
  articleTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  articleSummary: { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  articleSource: { fontSize: 11, fontStyle: 'italic' },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, margin: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991b1b' },
});
