import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminNewsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/health/news');
      const data = response.data?.data || response.data?.news || response.data || [];
      const articleList = Array.isArray(data) ? data : [];
      // Log first article to see all available fields
      if (articleList.length > 0) {
        console.log('=== FIRST ARTICLE OBJECT ===');
        console.log(JSON.stringify(articleList[0], null, 2));
        console.log('============================');
      }
      setArticles(articleList);
    } catch (err: any) {
      setError('Failed to load articles.');
    } finally {
      setLoading(false);
    }
  };

  // Get the correct article ID
  const getArticleId = (article: any) => {
    const id = article.id || article._id || article.newsId ||
      article.entryId || article.entry_id || article.articleId;
    console.log('getArticleId result:', id);
    return id;
  };

  const handlePublish = async () => {
    if (!title || !category || !content) {
      Alert.alert('Oops', 'Please fill in title, category and content');
      return;
    }
    if (!source) {
      Alert.alert('Oops', 'Please fill in the source field');
      return;
    }
    try {
      setPublishing(true);
      await api.post('/health/news', {
        title,
        headline: title,
        category,
        content,
        summary: summary || content.substring(0, 150) + '...',
        description: summary || content.substring(0, 150) + '...',
        source: source || 'Nexus Admin',
        sourceUrl: sourceUrl || 'https://nexus-3rk7.onrender.com',
        language: 'en',
        priority: 1,
      });
      Alert.alert('✅ Published!', 'Article published successfully!');
      setTitle('');
      setCategory('');
      setContent('');
      setSummary('');
      setSource('');
      setSourceUrl('');
      setShowForm(false);
      fetchArticles();
    } catch (err: any) {
      console.log('Publish error:', JSON.stringify(err.response?.data));
      Alert.alert('Failed', err.response?.data?.message || err.response?.data?.error || 'Could not publish article');
    } finally {
      setPublishing(false);
    }
  };

  // Delete an article
  const handleDelete = async (article: any) => {
    console.log('=== ARTICLE TO DELETE ===');
    console.log(JSON.stringify(article, null, 2));
    console.log('========================');
    const articleId = getArticleId(article);
    Alert.alert(
      '⚠️ Delete Article',
      `Are you sure you want to delete "${article.title || article.headline}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/health/news/${articleId}`);
              setArticles(articles.filter(a => getArticleId(a) !== articleId));
              Alert.alert('✅ Deleted', 'Article deleted successfully!');
            } catch (err: any) {
              console.log('Delete error:', JSON.stringify(err.response?.data));
              Alert.alert('Failed', err.response?.data?.error || err.response?.data?.message || 'Could not delete article');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publish News</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addButton}>
          <Ionicons name={showForm ? 'close' : 'add'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Publish form */}
      {showForm && (
        <View style={[styles.form, { backgroundColor: colors.card }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>New Article</Text>

          <Text style={[styles.label, { color: colors.subtitle }]}>Title *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Article title"
            placeholderTextColor="#999"
          />

          <Text style={[styles.label, { color: colors.subtitle }]}>Category *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Health, Education, Fitness"
            placeholderTextColor="#999"
          />

          <Text style={[styles.label, { color: colors.subtitle }]}>Source *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={source}
            onChangeText={setSource}
            placeholder="e.g. Nexus Admin, WHO, BBC Health"
            placeholderTextColor="#999"
          />

          <Text style={[styles.label, { color: colors.subtitle }]}>Source URL</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={sourceUrl}
            onChangeText={setSourceUrl}
            placeholder="e.g. https://who.int"
            placeholderTextColor="#999"
            keyboardType="url"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: colors.subtitle }]}>Summary</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            value={summary}
            onChangeText={setSummary}
            placeholder="Brief summary (optional)"
            placeholderTextColor="#999"
          />

          <Text style={[styles.label, { color: colors.subtitle }]}>Content *</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, minHeight: 120, textAlignVertical: 'top' }]}
            value={content}
            onChangeText={setContent}
            placeholder="Write your article content here..."
            placeholderTextColor="#999"
            multiline
          />

          <TouchableOpacity style={styles.publishButton} onPress={handlePublish} disabled={publishing}>
            {publishing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.publishButtonText}>📤 Publish Article</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1D9E75" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading articles...</Text>
        </View>
      )}

      {/* Error */}
      {error !== '' && !loading && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color="#E24B4A" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Articles list */}
      {!loading && articles.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Articles ({articles.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {articles.map((article: any, index: number) => (
              <View
                key={getArticleId(article) || index.toString()}
                style={[styles.articleRow, index < articles.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <View style={styles.articleInfo}>
                  <Text style={[styles.articleTitle, { color: colors.text }]}>
                    {article.title || article.headline || 'No title'}
                  </Text>
                  <View style={styles.articleMeta}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{article.category || 'Health'}</Text>
                    </View>
                    {article.source && (
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceText}>{article.source}</Text>
                      </View>
                    )}
                    <View style={[styles.statusBadge, { backgroundColor: '#d1fae5' }]}>
                      <Text style={[styles.statusText, { color: '#065f46' }]}>Published</Text>
                    </View>
                  </View>
                </View>
                {/* Delete button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(article)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E24B4A" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Empty state */}
      {!loading && articles.length === 0 && error === '' && (
        <View style={styles.centered}>
          <Ionicons name="newspaper-outline" size={48} color="#ccc" />
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>No articles yet</Text>
          <TouchableOpacity style={styles.publishButton} onPress={() => setShowForm(true)}>
            <Text style={styles.publishButtonText}>Publish First Article</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#1D9E75',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  addButton: { padding: 4 },
  form: {
    margin: 16, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  publishButton: {
    backgroundColor: '#1D9E75', padding: 14,
    borderRadius: 10, alignItems: 'center', marginTop: 16,
  },
  publishButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginBottom: 10, marginTop: 8,
  },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 32,
  },
  articleRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  articleInfo: { flex: 1 },
  articleTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  articleMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  categoryBadge: {
    backgroundColor: '#ede9ff', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  categoryText: { color: '#534AB7', fontSize: 10, fontWeight: '600' },
  sourceBadge: {
    backgroundColor: '#f0f0f0', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 8,
  },
  sourceText: { color: '#666', fontSize: 10, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '600' },
  deleteButton: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center',
  },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, margin: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991b1b' },
});