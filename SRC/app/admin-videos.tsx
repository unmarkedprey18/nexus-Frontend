import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminVideosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/media/first-aid');
      const data = response.data?.data || response.data?.videos || response.data || [];
      setVideos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  };

  // Upload video from gallery
  const handleUploadVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your media library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        setUploading(true);

        const formData = new FormData();
        formData.append('file', {
          uri: videoUri,
          type: 'video/mp4',
          name: 'first-aid-video.mp4',
        } as any);

        await api.post('/media/first-aid', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        Alert.alert('✅ Uploaded!', 'Video uploaded successfully!');
        fetchVideos();
      }
    } catch (err: any) {
      Alert.alert('Upload failed', err.response?.data?.error || 'Could not upload video');
    } finally {
      setUploading(false);
    }
  };

  // Delete a video
  const handleDelete = async (video: any) => {
    Alert.alert(
      '⚠️ Delete Video',
      `Are you sure you want to delete "${video.title || video.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/media/first-aid/${video.id}`);
              setVideos(videos.filter(v => v.id !== video.id));
              Alert.alert('✅ Deleted', 'Video deleted successfully!');
            } catch (err: any) {
              Alert.alert('Failed', err.response?.data?.error || 'Could not delete video');
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
        <Text style={styles.headerTitle}>First Aid Videos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleUploadVideo}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="add" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Upload hint */}
      <View style={[styles.hintBox, { backgroundColor: colors.card }]}>
        <Ionicons name="videocam-outline" size={20} color="#E24B4A" />
        <Text style={[styles.hintText, { color: colors.subtitle }]}>
          Tap the + button to upload a new first aid video from your gallery
        </Text>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E24B4A" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading videos...</Text>
        </View>
      )}

      {/* Uploading indicator */}
      {uploading && (
        <View style={styles.uploadingBox}>
          <ActivityIndicator color="#E24B4A" />
          <Text style={styles.uploadingText}>Uploading video...</Text>
        </View>
      )}

      {/* Error */}
      {error !== '' && !loading && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color="#E24B4A" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Videos list */}
      {!loading && videos.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            All Videos ({videos.length})
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {videos.map((video: any, index: number) => (
              <View
                key={video.id || index.toString()}
                style={[styles.videoRow, index < videos.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <View style={styles.videoIcon}>
                  <Ionicons name="play-circle-outline" size={36} color="#E24B4A" />
                </View>
                <View style={styles.videoInfo}>
                  <Text style={[styles.videoTitle, { color: colors.text }]}>
                    {video.title || video.name || 'Untitled'}
                  </Text>
                  <Text style={[styles.videoCategory, { color: colors.subtitle }]}>
                    {video.category || 'First Aid'} {video.duration ? `• ${video.duration}` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(video)}
                >
                  <Ionicons name="trash-outline" size={18} color="#E24B4A" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Empty state */}
      {!loading && videos.length === 0 && error === '' && (
        <View style={styles.centered}>
          <Ionicons name="videocam-outline" size={48} color="#ccc" />
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>No videos yet</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadVideo}>
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload First Video</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#E24B4A',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  addButton: { padding: 4 },
  hintBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  hintText: { flex: 1, fontSize: 13, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginBottom: 10, marginTop: 8 },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 32,
  },
  videoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  videoIcon: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  videoCategory: { fontSize: 12 },
  deleteButton: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center',
  },
  uploadingBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, margin: 16,
  },
  uploadingText: { fontSize: 13, color: '#991b1b', fontWeight: '600' },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15 },
  uploadButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#E24B4A', padding: 14, borderRadius: 10,
  },
  uploadButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, margin: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991b1b' },
});