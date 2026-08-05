import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useTheme } from '../store/useTheme';
import { useAuthStore } from '../store/authStore';

export default function AdminProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((state: any) => state.user);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => { loadProfile(); }, []);

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
      if (data?.profilePictureUrl) {
        const url = `https://nexus-3rk7.onrender.com${data.profilePictureUrl}`;
        setProfileImage(url);
        await AsyncStorage.setItem('profileImage', url);
      }
    } catch (err) {
      console.log('Profile load error:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.put('/profile', { fullName, email });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      Alert.alert('Oops', 'Please fill in all password fields!');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Oops', 'New passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Oops', 'New password must be at least 8 characters!');
      return;
    }
    try {
      setLoading(true);
      await api.put('/profile/password', { currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Please allow photo access');
        return;
      }
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
        <Text style={styles.headerTitle}>My Profile</Text>
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
                {fullName ? fullName[0].toUpperCase() : 'A'}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera-outline" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.changePhotoText, { color: 'rgba(255,255,255,0.7)' }]}>
          Tap to change photo
        </Text>
        <Text style={styles.adminBadge}>Admin</Text>
      </View>

      {/* Edit profile form */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Ionicons name="person-outline" size={18} color="#008080" />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#80CBC4"
              />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Email Address</Text>
            <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
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
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Change password */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {[
            { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrentPassword, toggleShow: () => setShowCurrentPassword(!showCurrentPassword) },
            { label: 'New Password', value: newPassword, setter: setNewPassword, show: showNewPassword, toggleShow: () => setShowNewPassword(!showNewPassword) },
            { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, show: showConfirmPassword, toggleShow: () => setShowConfirmPassword(!showConfirmPassword) },
          ].map((field, index) => (
            <View key={index} style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
              <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#008080" />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  placeholderTextColor="#80CBC4"
                  secureTextEntry={!field.show}
                />
                <TouchableOpacity onPress={field.toggleShow}>
                  <Ionicons
                    name={field.show ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#80CBC4"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="key-outline" size={18} color="#fff" />
                <Text style={styles.saveButtonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

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
  avatarSection: {
    backgroundColor: '#008080',
    alignItems: 'center', paddingBottom: 32,
  },
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
  changePhotoText: { fontSize: 13, marginBottom: 8 },
  adminBadge: {
    fontSize: 11, fontWeight: '700', color: '#004D40',
    backgroundColor: '#B2DFDB', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 20,
  },
  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  card: {
    borderRadius: 16, padding: 16,
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  formField: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15 },
  saveButton: {
    backgroundColor: '#008080', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 12, marginTop: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});