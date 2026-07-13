import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet, Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

// Configure how notifications appear when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
  shouldShowAlert: true,
  shouldPlaySound: true,
  shouldSetBadge: false,
  shouldShowBanner: true,
  shouldShowList: true,
  priority: Notifications.AndroidNotificationPriority.HIGH,
}),
});

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [fetching, setFetching] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [settings, setSettings] = useState({
    healthNews: true,
    firstAidAlerts: true,
    appUpdates: false,
    weeklySummary: false,
  });

  // Reload settings every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  // Register for push notifications when screen loads
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      setFetching(true);
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (err) {
      // Keep defaults if load fails
    } finally {
      setFetching(false);
    }
  };

  // Register device for push notifications
  const registerForPushNotifications = async () => {
    try {
      // Only works on real devices not simulators
      if (!Device.isDevice) return;

      // Check existing permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Ask for permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      // Android needs a notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Nexus Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#534AB7',
        });
      }

      // Get the push token for this device
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;

      // Save token locally
      await AsyncStorage.setItem('pushToken', pushToken);

      // Send token to backend
      setRegistering(true);
      try {
        await api.post('/notifications/register-token', { pushToken });
        console.log('✅ Push token registered:', pushToken);
      } catch (err) {
        console.log('Push token registration pending backend setup');
      } finally {
        setRegistering(false);
      }

    } catch (err) {
      console.log('Push notification setup error:', err);
    }
  };

  // Toggle a setting and save locally
  const handleToggle = async (key: string) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings],
    };
    setSettings(newSettings);
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));

    // If turning off all notifications show message
    const allOff = Object.values(newSettings).every(v => !v);
    if (allOff) {
      Alert.alert(
        'All Notifications Off',
        'You have turned off all notifications. You can turn them back on anytime.',
        [{ text: 'OK' }]
      );
    }
  };

  const notificationItems = [
    {
      key: 'healthNews',
      title: 'Health News',
      subtitle: 'Get notified when new health articles are published',
      icon: 'newspaper-outline',
      color: '#534AB7',
    },
    {
      key: 'firstAidAlerts',
      title: 'First Aid Alerts',
      subtitle: 'Receive important first aid updates and tips',
      icon: 'medkit-outline',
      color: '#E24B4A',
    },
    {
      key: 'appUpdates',
      title: 'App Updates',
      subtitle: 'Get notified about new features and improvements',
      icon: 'refresh-outline',
      color: '#1D9E75',
    },
    {
      key: 'weeklySummary',
      title: 'Weekly Summary',
      subtitle: 'Receive a weekly summary of health news',
      icon: 'calendar-outline',
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
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Info box */}
      <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
        <Ionicons name="notifications-outline" size={20} color="#534AB7" />
        <Text style={[styles.infoText, { color: colors.subtitle }]}>
          {registering
            ? 'Setting up push notifications...'
            : 'Manage which notifications you want to receive from Nexus.'}
        </Text>
      </View>

      {/* Loading */}
      {fetching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#534AB7" />
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {notificationItems.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.row,
                index < notificationItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }
              ]}
            >
              {/* Icon */}
              <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>

              {/* Text */}
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.subtitle }]}>{item.subtitle}</Text>
              </View>

              {/* Toggle */}
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

      {/* Push notification status */}
      <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
        <Ionicons name="phone-portrait-outline" size={20} color="#1D9E75" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Push Notifications
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors.subtitle }]}>
            Your device is registered to receive real-time notifications from Nexus
          </Text>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
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
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    margin: 16, borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
  card: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, marginBottom: 16,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  rowSubtitle: { fontSize: 12, lineHeight: 18 },
  centered: { alignItems: 'center', paddingVertical: 40 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, borderRadius: 16, padding: 16,
    marginBottom: 32, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statusTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  statusSubtitle: { fontSize: 12, lineHeight: 18 },
  activeBadge: {
    backgroundColor: '#d1fae5', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 10,
  },
  activeBadgeText: { color: '#065f46', fontSize: 11, fontWeight: '700' },
});