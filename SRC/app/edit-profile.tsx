import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useTheme } from '../store/useTheme';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const token = useAuthStore((state: any) => state.token);
  const { isDark, toggleTheme } = useThemeStore();
  const { colors } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadTokenAndProfile();
  }, []);

  const loadTokenAndProfile = async () => {
    const t = await AsyncStorage.getItem('token');
    setSavedToken(t);
    await fetchProfile();
  };

  const fetchProfile = async () => {
    try {
      setFetching(true);
      const response = await api.get('/profile');
      const data = response.data?.data || response.data;
      setFullName(data?.fullName || user?.name || '');
      setEmail(data?.email || user?.email || '');
      setPhoneNumber(data?.phoneNumber || '');
      setBio(data?.bio || '');
      if (data?.profilePictureUrl) {
        setProfileImage(`https://nexus-3rk7.onrender.com${data.profilePictureUrl}`);
      }
    } catch (err) {
      setFullName(user?.name || '');
      setEmail(user?.email || '');
    } finally {
      setFetching(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await handleUploadImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await handleUploadImage(result.assets[0].uri);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Change Profile Photo', 'Choose an option', [
      { text: '📷 Take Photo', onPress: handleTakePhoto },
      { text: '🖼 Choose from Gallery', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleUploadImage = async (imageUri: string) => {
    try {
      setUploading(true);
      setProfileImage(imageUri);

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await api.post('/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const photoUrl = response.data?.data?.profilePictureUrl;
      if (photoUrl) {
        const fullUrl = `https://nexus-3rk7.onrender.com${photoUrl}`;
        setProfileImage(fullUrl);
        await setAuth(token, { ...user, profileImage: fullUrl });
      }
      Alert.alert('✅ Success', 'Profile photo updated!');
    } catch (err: any) {
      Alert.alert('Upload failed', err.response?.data?.error || 'Could not upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Oops', 'Name cannot be empty');
      return;
    }
    try {
      setLoading(true);
      const response = await api.put('/profile', {
        fullName,
        email,
        phoneNumber,
        bio,
      });

      const updatedProfile = response.data?.data || response.data;

      await setAuth(token, {
        ...user,
        name: updatedProfile?.fullName || fullName,
        email: updatedProfile?.email || email,
        profileImage: updatedProfile?.profilePictureUrl
          ? `https://nexus-3rk7.onrender.com${updatedProfile.profilePictureUrl}`
          : user?.profileImage,
      });

      Alert.alert('✅ Success', 'Profile updated successfully!');
      router.back();
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#534AB7" />
        <Text style={[styles.loadingText, { color: colors.subtitle }]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Profile photo */}
      <View style={[styles.avatarSection, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={handleChangePhoto} style={styles.avatarContainer}>
          {profileImage ? (
            <Image
              source={{
                uri: profileImage,
                headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
              }}
              style={styles.avatarImage}
              onError={() => setProfileImage(null)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {fullName ? fullName[0].toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.cameraOverlay}>
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="camera" size={18} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={[styles.changePhotoText, { color: '#534AB7' }]}>
          {uploading ? 'Uploading...' : 'Tap to change photo'}
        </Text>
      </View>

      {/* Dark mode toggle */}
      <View style={[styles.themeCard, { backgroundColor: colors.card }]}>
        <View style={styles.themeRow}>
          <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={22} color="#534AB7" />
          <View style={styles.themeText}>
            <Text style={[styles.themeTitle, { color: colors.text }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Text style={[styles.themeSubtitle, { color: colors.subtitle }]}>
              Switch between dark and light theme
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ddd', true: '#534AB7' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Form fields */}
      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.subtitle }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: colors.subtitle }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.subtitle }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: colors.subtitle }]}>Bio</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, minHeight: 80, textAlignVertical: 'top' }]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  avatarSection: {
    alignItems: 'center', paddingVertical: 28, marginBottom: 16,
  },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#534AB7',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: '700', color: '#fff' },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#534AB7', width: 32, height: 32,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  changePhotoText: { fontSize: 14, fontWeight: '600' },
  themeCard: {
    marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  themeText: { flex: 1 },
  themeTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  themeSubtitle: { fontSize: 13 },
  form: {
    marginHorizontal: 16, borderRadius: 16, padding: 20, marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15 },
  saveButton: {
    backgroundColor: '#534AB7', padding: 16,
    borderRadius: 10, alignItems: 'center', marginTop: 24,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});