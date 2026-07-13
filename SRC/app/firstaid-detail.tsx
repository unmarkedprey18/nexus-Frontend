import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../store/useTheme';

// Emergency numbers by country code
const EMERGENCY_NUMBERS: { [key: string]: { police: string; ambulance: string; fire: string; general: string; country: string } } = {
  GH: { police: '191', ambulance: '193', fire: '192', general: '112', country: 'Ghana' },
  US: { police: '911', ambulance: '911', fire: '911', general: '911', country: 'United States' },
  GB: { police: '999', ambulance: '999', fire: '999', general: '999', country: 'United Kingdom' },
  NG: { police: '199', ambulance: '199', fire: '199', general: '112', country: 'Nigeria' },
  ZA: { police: '10111', ambulance: '10177', fire: '10177', general: '112', country: 'South Africa' },
  KE: { police: '999', ambulance: '999', fire: '999', general: '112', country: 'Kenya' },
  AU: { police: '000', ambulance: '000', fire: '000', general: '000', country: 'Australia' },
  CA: { police: '911', ambulance: '911', fire: '911', general: '911', country: 'Canada' },
  IN: { police: '100', ambulance: '102', fire: '101', general: '112', country: 'India' },
  DE: { police: '110', ambulance: '112', fire: '112', general: '112', country: 'Germany' },
  FR: { police: '17', ambulance: '15', fire: '18', general: '112', country: 'France' },
  CN: { police: '110', ambulance: '120', fire: '119', general: '110', country: 'China' },
  BR: { police: '190', ambulance: '192', fire: '193', general: '190', country: 'Brazil' },
  MX: { police: '911', ambulance: '911', fire: '911', general: '911', country: 'Mexico' },
  JP: { police: '110', ambulance: '119', fire: '119', general: '110', country: 'Japan' },
  AE: { police: '999', ambulance: '998', fire: '997', general: '999', country: 'UAE' },
  SA: { police: '999', ambulance: '997', fire: '998', general: '911', country: 'Saudi Arabia' },
  EG: { police: '122', ambulance: '123', fire: '180', general: '122', country: 'Egypt' },
  ET: { police: '991', ambulance: '907', fire: '939', general: '991', country: 'Ethiopia' },
  TZ: { police: '112', ambulance: '112', fire: '112', general: '112', country: 'Tanzania' },
};

// Default fallback
const DEFAULT_EMERGENCY = { police: '112', ambulance: '112', fire: '112', general: '112', country: 'International' };

const steps = [
  'Call emergency services immediately using the button below.',
  'Keep the person calm and still — do not move them unnecessarily.',
  'Check if the person is conscious and breathing.',
  'Follow the specific first aid steps for this emergency.',
  'Stay with the person until emergency services arrive.',
];

export default function FirstAidDetailScreen() {
  const router = useRouter();
  const { title, description, color } = useLocalSearchParams();
  const { colors } = useTheme();

  const handleEmergencyCall = async () => {
    try {
      // Ask for location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      let emergencyInfo = DEFAULT_EMERGENCY;
      let locationFound = false;

      if (status === 'granted') {
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        // Reverse geocode to get country
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode.length > 0) {
          const countryCode = geocode[0].isoCountryCode || 'GH';
          emergencyInfo = EMERGENCY_NUMBERS[countryCode] || DEFAULT_EMERGENCY;
          locationFound = true;
        }
      }

      // Show emergency options
      Alert.alert(
        '🚨 Emergency Services',
        `${locationFound ? `Location detected: ${emergencyInfo.country}` : 'Using default emergency numbers'}\n\nWhich service do you need?`,
        [
          {
            text: `🚑 Ambulance (${emergencyInfo.ambulance})`,
            onPress: () => Linking.openURL(`tel:${emergencyInfo.ambulance}`),
          },
          {
            text: `👮 Police (${emergencyInfo.police})`,
            onPress: () => Linking.openURL(`tel:${emergencyInfo.police}`),
          },
          {
            text: `🚒 Fire (${emergencyInfo.fire})`,
            onPress: () => Linking.openURL(`tel:${emergencyInfo.fire}`),
          },
          {
            text: `📞 General (${emergencyInfo.general})`,
            onPress: () => Linking.openURL(`tel:${emergencyInfo.general}`),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      // If location fails just use Ghana numbers as default
      Alert.alert(
        '🚨 Emergency Services',
        'Call emergency services now:',
        [
          { text: '🚑 Ambulance (193)', onPress: () => Linking.openURL('tel:193') },
          { text: '👮 Police (191)', onPress: () => Linking.openURL('tel:191') },
          { text: '🚒 Fire (192)', onPress: () => Linking.openURL('tel:192') },
          { text: '📞 General (112)', onPress: () => Linking.openURL('tel:112') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={[styles.header, { backgroundColor: color as string || '#E24B4A' }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.stepsTitle, { color: colors.text }]}>What to do:</Text>

        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: color as string || '#E24B4A' }]}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.subtitle }]}>{step}</Text>
          </View>
        ))}

        {/* Emergency call button — detects location and calls real number */}
        <TouchableOpacity style={[styles.emergencyButton, { backgroundColor: color as string || '#E24B4A' }]} onPress={handleEmergencyCall}>
          <Ionicons name="call-outline" size={22} color="#fff" />
          <Text style={styles.emergencyButtonText}>Call Emergency Services</Text>
        </TouchableOpacity>

        <Text style={[styles.locationNote, { color: colors.subtitle }]}>
          📍 Your location will be used to find the correct emergency number for your country
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: 'absolute', top: 52, left: 20, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 20,
  },
  header: { paddingTop: 100, paddingBottom: 32, paddingHorizontal: 24 },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 8 },
  description: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  body: { padding: 24 },
  stepsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 14 },
  stepNumber: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  stepNumberText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stepText: { flex: 1, fontSize: 15, lineHeight: 24 },
  emergencyButton: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    padding: 18, borderRadius: 14, marginTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  emergencyButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  locationNote: { fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18 },
});