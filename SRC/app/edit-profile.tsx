import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useTheme';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isDark, toggleTheme } = useThemeStore();
  const user = useAuthStore((state: any) => state.user);
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('token');
      setToken(savedToken);
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) setProfileImage(savedImage);
      const response = await api.get('/profile');
      const data = response.data?.data || response.data;
      if (data?.fullName) setFullName(data.fullName);
      if (data?.email) setEmail(data.email);
      if (data?.phone) setPhone(data.phone);
      if (data?.bio) setBio(data.bio);
      if (data?.profilePictureUrl) {
        const url = `https://nexus-3rk7.onrender.com${data.profilePictureUrl}`;
        setProfileImage(url);
        await AsyncStorage.setItem('profileImage', url);
      }
    } catch (err) {
      console.log('Profile load error:', err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/profile', { fullName, email, phone, bio });
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) { Alert.alert('Permission needed', 'Please allow photo access'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append('file', { uri, type: 'image/jpeg', name: 'profile.jpg' } as any);
      setLoading(true);
      await api.post('/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileImage(uri);
      await AsyncStorage.setItem('profileImage', uri);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not upload picture');
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Profile picture */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
          {profileImage && token ? (
            <Image
              source={{ uri: profileImage, headers: { Authorization: `Bearer ${token}` } }}
              style={styles.avatarImage}
              onError={() => setProfileImage(null)}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {fullName ? fullName[0].toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera-outline" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.changePhotoText, { color: colors.subtitle }]}>
          Tap to change photo
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="person-outline" size={18} color="#008080" />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#80CBC4"
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="mail-outline" size={18} color="#008080" />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#80CBC4"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="call-outline" size={18} color="#008080" />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            placeholderTextColor="#80CBC4"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border, alignItems: 'flex-start', paddingTop: 12 }]}>
          <Ionicons name="document-text-outline" size={18} color="#008080" style={{ marginTop: 2 }} />
          <TextInput
            style={[styles.input, { color: colors.text, minHeight: 80 }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#80CBC4"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Dark mode toggle */}
        <View style={[styles.themeRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.themeLeft}>
            <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={20} color="#008080" />
            <View>
              <Text style={[styles.themeTitle, { color: colors.text }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.themeSubtitle, { color: colors.subtitle }]}>
                {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: isDark ? '#008080' : '#B2DFDB' }]}
            onPress={toggleTheme}
          >
            <View style={[styles.themeToggleDot, { transform: [{ translateX: isDark ? 20 : 0 }] }]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
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
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  avatarSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#008080' },
  avatarWrapper: { position: 'relative', marginBottom: 10 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarImage: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#fff' },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#006666', width: 28, height: 28,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  changePhotoText: { fontSize: 13 },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  themeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 20,
  },
  themeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeTitle: { fontSize: 15, fontWeight: '600' },
  themeSubtitle: { fontSize: 12, marginTop: 2 },
  themeToggle: {
    width: 46, height: 26, borderRadius: 13,
    padding: 3, justifyContent: 'center',
  },
  themeToggleDot: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#008080', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16, borderRadius: 12, marginTop: 24,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
