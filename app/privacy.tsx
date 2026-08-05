import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useTheme';
import api from '../services/api';

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    shareMedicalData: false,
    shareLocation: true,
    receiveNotifications: true,
    dataConsent: true,
  });

  useEffect(() => { fetchPrivacySettings(); }, []);

  const fetchPrivacySettings = async () => {
    try {
      const response = await api.get('/privacy/settings');
      const data = response.data?.data || response.data;
      if (data) setSettings(data);
    } catch (err) {
      console.log('Privacy settings load error');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/privacy/settings', settings);
      Alert.alert('Success', 'Privacy settings saved!');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save settings');
    } finally {
      setLoading(false);
    }
  };

  const privacyItems = [
    { key: 'shareMedicalData', title: 'Share Medical Data', subtitle: 'Allow Nexus to use health data to improve services', icon: 'heart-outline' },
    { key: 'shareLocation', title: 'Share Location', subtitle: 'Allow app to access location for emergency services', icon: 'location-outline' },
    { key: 'receiveNotifications', title: 'Receive Notifications', subtitle: 'Get health news and first aid alerts', icon: 'notifications-outline' },
    { key: 'dataConsent', title: 'Data Consent', subtitle: 'Consent to Nexus collecting and processing data', icon: 'shield-checkmark-outline' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Privacy Preferences
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {privacyItems.map((item, index) => (
          <View
            key={item.key}
            style={[
              styles.row,
              index < privacyItems.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={20} color="#008080" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.subtitle }]}>{item.subtitle}</Text>
              </View>
            </View>
            <Switch
              value={settings[item.key as keyof typeof settings]}
              onValueChange={(val) => setSettings(prev => ({ ...prev, [item.key]: val }))}
              trackColor={{ false: '#B2DFDB', true: '#008080' }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </>
        )}
      </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginTop: 24, marginBottom: 12,
  },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#008080', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#B2DFDB',
    justifyContent: 'center', alignItems: 'center',
  },
  rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  rowSubtitle: { fontSize: 12 },
  saveButton: {
    backgroundColor: '#008080', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, marginTop: 24, padding: 16, borderRadius: 12,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});