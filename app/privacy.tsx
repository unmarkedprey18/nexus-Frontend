import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet, Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [settings, setSettings] = useState({
    shareMedicalData: false,
    shareLocation: false,
    receiveNotifications: true,
    dataConsent: false,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Reload settings every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPrivacySettings();
    }, [])
  );

  const fetchPrivacySettings = async () => {
    try {
      setFetching(true);
      const response = await api.get('/privacy/settings');
      const data = response.data?.data || response.data;
      if (data) {
        setSettings({
          shareMedicalData: data.shareMedicalData || false,
          shareLocation: data.shareLocation || false,
          receiveNotifications: data.receiveNotifications ?? true,
          dataConsent: data.dataConsent || false,
        });
      }
    } catch (err) {
      // Backend error — load from local storage as fallback
      try {
        const saved = await AsyncStorage.getItem('privacySettings');
        if (saved) setSettings(JSON.parse(saved));
      } catch (e) {
        // Keep defaults
      }
    } finally {
      setFetching(false);
    }
  };

  // Toggle a setting and save to backend + locally
  const handleToggle = async (key: string) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings],
    };
    setSettings(newSettings);
    // Save locally as backup
    await AsyncStorage.setItem('privacySettings', JSON.stringify(newSettings));
    try {
      setSaving(true);
      await api.put('/privacy/settings', {
        shareMedicalData: newSettings.shareMedicalData,
        shareLocation: newSettings.shareLocation,
        receiveNotifications: newSettings.receiveNotifications,
        dataConsent: newSettings.dataConsent,
      });
    } catch (err) {
      // Settings already saved locally so it still works
      console.log('Backend save failed — using local storage');
    } finally {
      setSaving(false);
    }
  };

  // Request data deletion
  const handleDeleteData = () => {
    Alert.alert(
      '⚠️ Delete My Data',
      'Are you sure you want to request data deletion? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/privacy/data');
              Alert.alert('✅ Request Submitted', 'Your data deletion request has been submitted. You will be contacted within 30 days.');
            } catch (err: any) {
              Alert.alert('Failed', err.response?.data?.error || 'Could not submit request');
            }
          },
        },
      ]
    );
  };

  // Change password via backend
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
      setLoading(true);
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      Alert.alert('✅ Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || err.response?.data?.message || 'Could not change password');
    } finally {
      setLoading(false);
    }
  };

  const privacyItems = [
    {
      key: 'shareMedicalData',
      title: 'Share Medical Data',
      subtitle: 'Allow Nexus to use your health data to improve services',
      icon: 'heart-outline',
      color: '#E24B4A',
    },
    {
      key: 'shareLocation',
      title: 'Share Location',
      subtitle: 'Allow app to access your location for emergency services',
      icon: 'location-outline',
      color: '#534AB7',
    },
    {
      key: 'receiveNotifications',
      title: 'Receive Notifications',
      subtitle: 'Get health news and first aid alerts from Nexus',
      icon: 'notifications-outline',
      color: '#1D9E75',
    },
    {
      key: 'dataConsent',
      title: 'Data Consent',
      subtitle: 'I consent to Nexus collecting and processing my data',
      icon: 'shield-checkmark-outline',
      color: '#F59E0B',
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        {saving && <ActivityIndicator color="#fff" size="small" />}
      </View>

      {/* Privacy toggles */}
      {fetching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#534AB7" />
          <Text style={[styles.loadingText, { color: colors.subtitle }]}>
            Loading settings...
          </Text>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {privacyItems.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.row,
                index < privacyItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }
              ]}
            >
              {/* Icon */}
              <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>

              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.subtitle }]}>{item.subtitle}</Text>
              </View>
              <Switch
                value={settings[item.key as keyof typeof settings]}
                onValueChange={() => handleToggle(item.key)}
                trackColor={{ false: '#ddd', true: '#534AB7' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      )}

      {/* Change password */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Change Password</Text>
      <View style={[styles.passwordCard, { backgroundColor: colors.card }]}>

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
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Data deletion */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Data</Text>
      <View style={[styles.deleteCard, { backgroundColor: colors.card }]}>
        <Ionicons name="trash-outline" size={22} color="#E24B4A" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.deleteTitle, { color: colors.text }]}>Delete My Data</Text>
          <Text style={[styles.deleteSubtitle, { color: colors.subtitle }]}>
            Request deletion of all your personal data from Nexus
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteData}>
          <Text style={styles.deleteButtonText}>Request</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#534AB7',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff' },
  card: {
    margin: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  rowSubtitle: { fontSize: 13 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginBottom: 10,
  },
  passwordCard: {
    marginHorizontal: 16, borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
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
  deleteCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  deleteTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  deleteSubtitle: { fontSize: 12, lineHeight: 18 },
  deleteButton: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 8,
  },
  deleteButtonText: { color: '#E24B4A', fontWeight: '700', fontSize: 13 },
  centered: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14 },
});