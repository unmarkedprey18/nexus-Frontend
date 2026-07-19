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
  Text,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../store/useTheme';

export default function AdminProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const token = useAuthStore((state: any) => state.token);
  const { colors } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Change password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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
      const response = await api.put('/profile', { fullName, email });
      const updatedProfile = response.data?.data || response.data;
      await setAuth(token, {
        ...user,
        name: updatedProfile?.fullName || fullName,
        email: updatedProfile?.email || email,
      });
      Alert.alert('✅ Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Oops', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Oops', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Oops', 'Password must be at least 8 characters');
      return;
    }
    try {
      setChangingPassword(true);
      await api.put('/auth/change-password', { currentPassword, newPassword });
      Alert.alert('✅ Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || err.response?.data?.message || 'Could not change password');
    } finally {
      setChangingPassword(false);
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Profile</Text>
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
                {fullName ? fullName[0].toUpperCase() : 'A'}
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
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#fff" />
          <Text style={styles.adminBadgeText}>Administrator</Text>
        </View>
      </View>

      {/* Profile form */}
      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Personal Information</Text>

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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Change password */}
      <View style={[styles.form, { backgroundColor: colors.card }]}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Change Password</Text>

        <Text style={[styles.label, { color: colors.subtitle }]}>Current Password</Text>
        <View style={[styles.passwordRow, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor="#999"
            secureTextEntry={!showCurrent}
          />
          <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
            <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.subtitle }]}>New Password</Text>
        <View style={[styles.passwordRow, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Min 8 characters"
            placeholderTextColor="#999"
            secureTextEntry={!showNew}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.subtitle }]}>Confirm New Password</Text>
        <View style={[styles.passwordRow, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: '#E24B4A' }]}
          onPress={handleChangePassword}
          disabled={changingPassword}
        >
          {changingPassword ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Update Password</Text>
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
  changePhotoText: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#534AB7', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 20,
  },
  adminBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  form: {
    marginHorizontal: 16, borderRadius: 16, padding: 20,
    marginBottom: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15 },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15 },
  saveButton: {
    backgroundColor: '#534AB7', padding: 16,
    borderRadius: 10, alignItems: 'center', marginTop: 24,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});