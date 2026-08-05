import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function AdminVideosScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/media/first-aid');
      const data = response.data?.data || response.data || [];
      setVideos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Failed to load videos.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Please allow access to your media library.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled) return;
      const videoUri = result.assets[0].uri;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', { uri: videoUri, type: 'video/mp4', name: 'first_aid_video.mp4' } as any);
      formData.append('title', 'First Aid Guide');
      formData.append('description', 'First aid tutorial video');
      await api.post('/media/first-aid/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Success', 'Video uploaded successfully!');
      fetchVideos();
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.message || 'Could not upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (video: any) => {
    const id = video.id || video._id;
    Alert.alert('Delete Video', `Delete "${video.title || 'this video'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/media/first-aid/${id}`);
            setVideos(videos.filter(v => (v.id || v._id) !== id));
            Alert.alert('Success', 'Video deleted!');
          } catch (err: any) {
            Alert.alert('Failed', err.response?.data?.message || 'Could not delete video');
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
        <Text style={styles.headerTitle}>First Aid Videos</Text>
        <TouchableOpacity onPress={fetchVideos} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Upload button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUploadVideo}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload New Video</Text>
          </>
        )}
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#008080" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading videos...</Text>
        </View>
      ) : error !== '' ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={22} color="#E24B4A" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Uploaded Videos ({videos.length})
          </Text>
          {videos.length === 0 ? (
            <View style={styles.centered}>
              <Ionicons name="videocam-outline" size={48} color="#B2DFDB" />
              <Text style={[styles.emptyText, { color: colors.subtitle }]}>
                No videos uploaded yet
              </Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {videos.map((video, index) => (
                <View
                  key={video.id || video._id || index}
                  style={[
                    styles.videoRow,
                    index < videos.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }
                  ]}
                >
                  <View style={styles.videoIcon}>
                    <Ionicons name="videocam-outline" size={22} color="#008080" />
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={1}>
                      {video.title || 'First Aid Video'}
                    </Text>
                    {video.description && (
                      <Text style={[styles.videoDesc, { color: colors.subtitle }]} numberOfLines={1}>
                        {video.description}
                      </Text>
                    )}
                    {video.createdAt && (
                      <Text style={[styles.videoDate, { color: colors.subtitle }]}>
                        {new Date(video.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteVideo(video)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#E24B4A" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
  refreshButton: { padding: 4 },
  uploadButton: {
    backgroundColor: '#008080', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, padding: 16, borderRadius: 14,
    shadowColor: '#008080', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  uploadButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginBottom: 10,
  },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 16,
  },
  videoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  videoIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#B2DFDB',
    justifyContent: 'center', alignItems: 'center',
  },
  videoInfo: { flex: 1 },
  videoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  videoDesc: { fontSize: 12, marginBottom: 2 },
  videoDate: { fontSize: 11 },
  deleteButton: { padding: 8 },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, margin: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: '#991b1b' },
});
