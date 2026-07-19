import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../store/useTheme';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

// Health related categories — only show these
const healthCategories = [
  'health', 'medical', 'fitness', 'wellness',
  'nutrition', 'mental health', 'healthcare',
  'medicine', 'disease', 'covid', 'cancer',
  'diabetes', 'heart', 'surgery', 'pharmacy',
  'vaccine', 'therapy', 'diet', 'exercise',
  'deaf', 'hearing', 'disability', 'sign language',
];

// Check if a news item is health related
const isHealthRelated = (item: any) => {
  const category = (item.category || '').toLowerCase();
  const title = (item.title || item.headline || '').toLowerCase();
  const summary = (item.summary || '').toLowerCase();

  if (healthCategories.some(c => category.includes(c))) return true;

  const keywords = ['health', 'medical', 'fitness', 'wellness', 'doctor',
    'hospital', 'disease', 'treatment', 'medicine', 'patient',
    'deaf', 'hearing', 'disability', 'sign language', 'surgery',
    'vaccine', 'therapy', 'diet', 'exercise', 'nutrition', 'mental'];
  if (keywords.some(k => title.includes(k))) return true;
  if (keywords.some(k => summary.includes(k))) return true;

  return false;
};

const categories = ['All', 'Health', 'Fitness', 'Mental Health', 'Nutrition', 'Medical'];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const { colors } = useTheme();

  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showHealthOnly, setShowHealthOnly] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/health/news');
      const data = response.data?.data || response.data?.news || response.data || [];
      setNews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Failed to load news. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const handleForceRefresh = async () => {
    try {
      setRefreshing(true);
      await api.post('/health/news/refresh');
      await fetchNews();
    } catch (err) {
      await fetchNews();
    }
  };

  const getFilteredNews = () => {
    let filtered = news;
    if (showHealthOnly) {
      filtered = filtered.filter(item => isHealthRelated(item));
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item =>
        (item.category || '').toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    return filtered;
  };

  const filteredNews = getFilteredNews();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#534AB7']} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'there'} 👋</Text>
            <Text style={styles.subGreeting}>Your health news feed</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshIcon}
            onPress={handleForceRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="refresh-outline" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Health only toggle */}
        <TouchableOpacity
          style={[styles.healthToggle, showHealthOnly && styles.healthToggleActive]}
          onPress={() => setShowHealthOnly(!showHealthOnly)}
        >
          <Ionicons
            name={showHealthOnly ? 'medical' : 'medical-outline'}
            size={16}
            color={showHealthOnly ? '#fff' : '#d0ccff'}
          />
          <Text style={[styles.healthToggleText, showHealthOnly && styles.healthToggleTextActive]}>
            {showHealthOnly ? 'Health Only ✓' : 'Show All News'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, selectedCategory === cat && styles.activeCategoryButton]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.activeCategoryText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News feed section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {showHealthOnly ? '🏥 Health News' : '📰 Latest News'}
          </Text>
          <Text style={[styles.newsCount, { color: colors.subtitle }]}>
            {filteredNews.length} articles
          </Text>
        </View>

        {/* Loading state */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#534AB7" />
            <Text style={[styles.loadingText, { color: colors.subtitle }]}>
              Loading news...
            </Text>
          </View>
        )}

        {/* Error state */}
        {error !== '' && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchNews} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* News cards */}
        {!loading && filteredNews.map((item: any, index: number) => (
          <TouchableOpacity
            key={item.entryId || item.id || item._id || index.toString()}
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={() =>
              router.push({
                pathname: '/article-detail',
                params: {
                  title: item.title || item.headline,
                  summary: item.summary || item.description || item.content,
                  category: item.category || 'Health',
                  id: item.entryId || item.id || item._id,
                },
              })
            }
          >
            <View style={[styles.badge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
              <Text style={[styles.badgeText, { color: getCategoryColor(item.category) }]}>
                {item.category || 'Health'}
              </Text>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {item.title || item.headline || 'No title'}
            </Text>
            <Text style={[styles.cardSummary, { color: colors.subtitle }]} numberOfLines={3}>
              {item.summary || item.description || item.content?.substring(0, 150) + '...'}
            </Text>
            <View style={styles.cardFooter}>
              {item.source && (
                <Text style={[styles.source, { color: colors.subtitle }]}>
                  📰 {item.source}
                </Text>
              )}
              {item.datePosted && (
                <Text style={[styles.date, { color: colors.subtitle }]}>
                  {new Date(item.datePosted).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty state */}
        {!loading && filteredNews.length === 0 && error === '' && (
          <View style={styles.centered}>
            <Ionicons name="newspaper-outline" size={48} color="#ccc" />
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>
              {showHealthOnly ? 'No health news available right now' : 'No news articles yet 📰'}
            </Text>
            {showHealthOnly && (
              <TouchableOpacity style={styles.retryButton} onPress={() => setShowHealthOnly(false)}>
                <Text style={styles.retryText}>Show All News</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.retryButton, { marginTop: 8 }]} onPress={handleForceRefresh}>
              <Text style={styles.retryText}>Refresh News</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const getCategoryColor = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('health')) return '#1D9E75';
  if (cat.includes('fitness')) return '#534AB7';
  if (cat.includes('mental')) return '#8B5CF6';
  if (cat.includes('nutrition')) return '#F59E0B';
  if (cat.includes('medical')) return '#E24B4A';
  if (cat.includes('deaf') || cat.includes('hearing')) return '#06B6D4';
  return '#534AB7';
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  greeting: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subGreeting: { fontSize: 14, color: '#d0ccff' },
  refreshIcon: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  healthToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  healthToggleActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  healthToggleText: { fontSize: 13, color: '#d0ccff', fontWeight: '600' },
  healthToggleTextActive: { color: '#fff' },
  categoryRow: { marginVertical: 12 },
  categoryButton: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f0f0f0',
  },
  activeCategoryButton: { backgroundColor: '#534AB7' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#666' },
  activeCategoryText: { color: '#fff' },
  section: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  newsCount: { fontSize: 13 },
  card: {
    borderRadius: 12, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20, marginBottom: 10,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardSummary: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  source: { fontSize: 12, fontStyle: 'italic' },
  date: { fontSize: 11 },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  errorBox: {
    backgroundColor: '#FEE2E2', borderRadius: 10,
    padding: 14, alignItems: 'center', gap: 10,
  },
  errorText: { fontSize: 13, color: '#991b1b', textAlign: 'center' },
  retryButton: {
    backgroundColor: '#534AB7', paddingHorizontal: 20,
    paddingVertical: 8, borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
