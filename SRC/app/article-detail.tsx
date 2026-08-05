import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useTheme';

export default function ArticleDetailScreen() {
  const { title, summary, content, category, sourceUrl, source, datePosted } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  // Show full content if available, otherwise fall back to summary
  const fullText = (content as string) || (summary as string) || '';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Article</Text>
      </View>

      <View style={styles.content}>
        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: '#B2DFDB' }]}>
          <Text style={styles.categoryText}>{category || 'Health'}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {/* Source and date */}
        {(source || datePosted) ? (
          <View style={styles.metaRow}>
            {source ? (
              <Text style={[styles.metaText, { color: colors.subtitle }]}>{source}</Text>
            ) : null}
            {datePosted ? (
              <Text style={[styles.metaText, { color: colors.subtitle }]}>
                {new Date(datePosted as string).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Full article content */}
        <Text style={[styles.body, { color: colors.text }]}>{fullText}</Text>

        {/* Read more button */}
        {sourceUrl ? (
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => Linking.openURL(sourceUrl as string)}
          >
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={styles.readMoreText}>Read Full Article Online</Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { padding: 24 },
  categoryBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 20, marginBottom: 14,
  },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#004D40' },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12, lineHeight: 30 },
  metaRow: {
    flexDirection: 'row', gap: 16, marginBottom: 16,
  },
  metaText: { fontSize: 12 },
  divider: { height: 1, marginBottom: 20 },
  body: { fontSize: 15, lineHeight: 26, marginBottom: 28 },
  readMoreButton: {
    backgroundColor: '#008080', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16, borderRadius: 12,
  },
  readMoreText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
