import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function ArticleDetailScreen() {
  const router = useRouter();
  const { title, summary, category, id } = useLocalSearchParams();
  const { colors } = useTheme();

  // Holds the full article content from backend
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch full article when screen opens
  useEffect(() => {
    if (id) fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/health/news/${id}`);
      const data = response.data?.data || response.data;
      setArticle(data);
    } catch (err: any) {
      console.error('Article error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Purple header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{article?.category || category || 'Health'}</Text>
        </View>
        <Text style={styles.title}>{article?.title || title}</Text>
      </View>

      {/* Article body */}
      <View style={[styles.body, { backgroundColor: colors.card }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#534AB7" style={{ marginVertical: 20 }} />
        ) : (
          <>
            {/* Summary */}
            <Text style={[styles.summary, { color: colors.text }]}>
              {article?.summary || article?.description || summary}
            </Text>

            {/* Full content */}
            {article?.content && (
              <Text style={[styles.content, { color: colors.subtitle }]}>
                {article.content}
              </Text>
            )}

            {/* Published date if available */}
            {article?.publishedAt && (
              <Text style={[styles.date, { color: colors.subtitle }]}>
                📅 {new Date(article.publishedAt).toLocaleDateString()}
              </Text>
            )}
          </>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: 'absolute', top: 52, left: 20, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 20,
  },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 100, paddingBottom: 32, paddingHorizontal: 24,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', lineHeight: 30 },
  body: { margin: 16, borderRadius: 16, padding: 20, marginBottom: 32 },
  summary: { fontSize: 16, fontWeight: '600', lineHeight: 24, marginBottom: 16 },
  content: { fontSize: 15, lineHeight: 26, marginBottom: 16 },
  date: { fontSize: 13, marginTop: 8 },
});