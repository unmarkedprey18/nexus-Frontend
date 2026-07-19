import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/useTheme';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const plans = [
  { id: 'monthly', name: '1 Month', price: 40, duration: '1 month', popular: false, saving: null },
  { id: 'bimonthly', name: '2 Months', price: 80, duration: '2 months', popular: true, saving: null },
  { id: 'biannual', name: '6 Months', price: 240, duration: '6 months', popular: false, saving: null },
  { id: 'annual', name: '1 Year', price: 480, duration: '12 months', popular: false, saving: 'Best Value!' },
];

const premiumFeatures = [
  { icon: 'videocam-outline', title: 'Live Camera Translation', desc: 'Real-time sign language interpretation' },
  { icon: 'download-outline', title: 'Offline Videos', desc: 'Download sign language videos to watch offline' },
  { icon: 'infinite-outline', title: 'Unlimited Recordings', desc: 'Record unlimited videos for AI interpretation' },
  { icon: 'hand-left-outline', title: 'Unlimited Sign Language', desc: 'Convert text to sign language anytime' },
  { icon: 'mic-outline', title: 'Unlimited Transcriptions', desc: 'Transcribe speech to text without limits' },
  { icon: 'star-outline', title: 'Priority Support', desc: 'Get help faster as a premium member' },
];

const mobileMoneyOptions = [
  { id: 'mtn', name: 'MTN Mobile Money', color: '#FFC107', icon: '📱' },
  { id: 'vodafone', name: 'Vodafone Cash', color: '#E53935', icon: '📱' },
  { id: 'airteltigo', name: 'AirtelTigo Money', color: '#1565C0', icon: '📱' },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((state: any) => state.user);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedNetwork, setSelectedNetwork] = useState('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  const handleSubscribe = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Oops', 'Please enter your mobile money number');
      return;
    }
    if (phoneNumber.length < 10) {
      Alert.alert('Oops', 'Please enter a valid 10-digit phone number');
      return;
    }
    try {
      setLoading(true);
      await api.post('/subscription/initiate', {
        plan: selectedPlan,
        network: selectedNetwork,
        phoneNumber,
        amount: selectedPlanData?.price,
      });
      setStep('success');
    } catch (err: any) {
      Alert.alert(
        '📱 Complete Payment',
        `Please send GH₵${selectedPlanData?.price} to our Mobile Money number:\n\n` +
        `MTN: 0XX XXX XXXX\n` +
        `Vodafone: 0XX XXX XXXX\n` +
        `AirtelTigo: 0XX XXX XXXX\n\n` +
        `Reference: NEXUS-${user?.email?.split('@')[0]?.toUpperCase()}\n\n` +
        `After payment send your receipt to support and we will activate your subscription within 24 hours.`,
        [{ text: 'OK', onPress: () => setStep('success') }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#1D9E75" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Payment Initiated! 🎉</Text>
          <Text style={[styles.successSubtitle, { color: colors.subtitle }]}>
            Your payment request has been sent. Once confirmed your Nexus Premium account will be activated within 24 hours!
          </Text>
          <View style={[styles.successCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.successCardTitle, { color: colors.text }]}>What happens next?</Text>
            <View style={styles.successStep}>
              <View style={styles.successStepNumber}><Text style={styles.successStepNumberText}>1</Text></View>
              <Text style={[styles.successStepText, { color: colors.subtitle }]}>Complete payment on your mobile money app</Text>
            </View>
            <View style={styles.successStep}>
              <View style={styles.successStepNumber}><Text style={styles.successStepNumberText}>2</Text></View>
              <Text style={[styles.successStepText, { color: colors.subtitle }]}>Send your receipt to our support team</Text>
            </View>
            <View style={styles.successStep}>
              <View style={styles.successStepNumber}><Text style={styles.successStepNumberText}>3</Text></View>
              <Text style={[styles.successStepText, { color: colors.subtitle }]}>Your premium access will be activated within 24 hours</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Back to App</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Payment screen
  if (step === 'payment') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('plans')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Payment</Text>
        </View>

        {/* Order summary */}
        <View style={[styles.orderSummary, { backgroundColor: colors.card }]}>
          <Text style={[styles.orderTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={styles.orderRow}>
            <Text style={[styles.orderLabel, { color: colors.subtitle }]}>Plan</Text>
            <Text style={[styles.orderValue, { color: colors.text }]}>{selectedPlanData?.name}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={[styles.orderLabel, { color: colors.subtitle }]}>Duration</Text>
            <Text style={[styles.orderValue, { color: colors.text }]}>{selectedPlanData?.duration}</Text>
          </View>
          <View style={[styles.orderRow, styles.orderTotal]}>
            <Text style={styles.orderTotalLabel}>Total</Text>
            <Text style={styles.orderTotalValue}>GH₵ {selectedPlanData?.price}</Text>
          </View>
        </View>

        {/* Select network */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Network</Text>
        <View style={styles.networkRow}>
          {mobileMoneyOptions.map((network) => (
            <TouchableOpacity
              key={network.id}
              style={[
                styles.networkButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedNetwork === network.id && { borderColor: network.color, borderWidth: 2 },
              ]}
              onPress={() => setSelectedNetwork(network.id)}
            >
              <Text style={styles.networkIcon}>{network.icon}</Text>
              <Text style={[styles.networkName, { color: colors.text }]}>{network.name}</Text>
              {selectedNetwork === network.id && (
                <Ionicons name="checkmark-circle" size={18} color={network.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone number */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mobile Money Number</Text>
        <TouchableOpacity
          style={[styles.phoneInput, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Alert.prompt(
              'Enter Phone Number',
              'Enter your mobile money number',
              (text) => setPhoneNumber(text),
              'plain-text',
              phoneNumber,
              'phone-pad'
            );
          }}
        >
          <Ionicons name="call-outline" size={20} color="#534AB7" />
          <Text style={[styles.phoneInputText, { color: phoneNumber ? colors.text : '#999' }]}>
            {phoneNumber || 'Tap to enter your mobile money number'}
          </Text>
        </TouchableOpacity>

        {/* Pay button */}
        <TouchableOpacity style={styles.payButton} onPress={handleSubscribe} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" />
              <Text style={styles.payButtonText}>Pay GH₵ {selectedPlanData?.price}</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={[styles.secureNote, { color: colors.subtitle }]}>
          🔒 Your payment is secure and encrypted
        </Text>
      </ScrollView>
    );
  }

  // Plans screen
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nexus Premium</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.crownContainer}>
          <Ionicons name="star" size={48} color="#FFC107" />
        </View>
        <Text style={styles.heroTitle}>Upgrade to Premium</Text>
        <Text style={styles.heroSubtitle}>
          Unlock unlimited access to all Nexus features and help the deaf community better!
        </Text>
      </View>

      {/* Free vs Premium */}
      <View style={[styles.comparisonCard, { backgroundColor: colors.card }]}>
        <View style={styles.comparisonHeader}>
          <Text style={[styles.comparisonTitle, { color: colors.text }]}>Free</Text>
          <Text style={styles.comparisonTitlePremium}>Premium ⭐</Text>
        </View>
        <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.comparisonFeature, { color: colors.text }]}>Live Camera</Text>
          <Ionicons name="close-circle" size={20} color="#E24B4A" />
          <Ionicons name="checkmark-circle" size={20} color="#1D9E75" />
        </View>
        <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.comparisonFeature, { color: colors.text }]}>Offline Videos</Text>
          <Ionicons name="close-circle" size={20} color="#E24B4A" />
          <Ionicons name="checkmark-circle" size={20} color="#1D9E75" />
        </View>
        <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.comparisonFeature, { color: colors.text }]}>Sign Language (daily)</Text>
          <Text style={[styles.comparisonLimit, { color: colors.subtitle }]}>7x/day</Text>
          <Text style={styles.comparisonUnlimited}>Unlimited</Text>
        </View>
        <View style={[styles.comparisonRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.comparisonFeature, { color: colors.text }]}>Transcriptions (daily)</Text>
          <Text style={[styles.comparisonLimit, { color: colors.subtitle }]}>7x/day</Text>
          <Text style={styles.comparisonUnlimited}>Unlimited</Text>
        </View>
        <View style={styles.comparisonRow}>
          <Text style={[styles.comparisonFeature, { color: colors.text }]}>Video Recordings (daily)</Text>
          <Text style={[styles.comparisonLimit, { color: colors.subtitle }]}>7x/day</Text>
          <Text style={styles.comparisonUnlimited}>Unlimited</Text>
        </View>
      </View>

      {/* Premium features */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Premium Features</Text>
      <View style={styles.featuresGrid}>
        {premiumFeatures.map((feature, index) => (
          <View key={index} style={[styles.featureCard, { backgroundColor: colors.card }]}>
            <View style={styles.featureIconCircle}>
              <Ionicons name={feature.icon as any} size={24} color="#534AB7" />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
            <Text style={[styles.featureDesc, { color: colors.subtitle }]}>{feature.desc}</Text>
          </View>
        ))}
      </View>

      {/* Plans */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Your Plan</Text>
      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedPlan === plan.id && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>POPULAR</Text>
              </View>
            )}
            {plan.saving && (
              <View style={styles.savingBadge}>
                <Text style={styles.savingBadgeText}>{plan.saving}</Text>
              </View>
            )}
            <View style={styles.planLeft}>
              <View style={[styles.planRadio, selectedPlan === plan.id && styles.planRadioActive]}>
                {selectedPlan === plan.id && <View style={styles.planRadioDot} />}
              </View>
              <View>
                <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                <Text style={[styles.planDuration, { color: colors.subtitle }]}>{plan.duration}</Text>
              </View>
            </View>
            <Text style={[styles.planPrice, selectedPlan === plan.id && styles.planPriceActive]}>
              GH₵ {plan.price}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subscribe button */}
      <TouchableOpacity style={styles.subscribeButton} onPress={() => setStep('payment')}>
        <Ionicons name="star-outline" size={20} color="#fff" />
        <Text style={styles.subscribeButtonText}>
          Subscribe for GH₵ {selectedPlanData?.price}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.termsNote, { color: colors.subtitle }]}>
        By subscribing you agree to our Terms of Service. Subscriptions are activated after payment confirmation.
      </Text>

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
  hero: {
    backgroundColor: '#534AB7',
    paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center',
  },
  crownContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, color: '#d0ccff', textAlign: 'center', lineHeight: 22 },
  comparisonCard: {
    marginHorizontal: 16, borderRadius: 16, overflow: 'hidden',
    marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  comparisonHeader: {
    flexDirection: 'row', padding: 14,
    backgroundColor: '#534AB7', justifyContent: 'flex-end', gap: 32,
  },
  comparisonTitle: { fontSize: 14, fontWeight: '700', color: '#d0ccff', flex: 1, marginLeft: 8 },
  comparisonTitlePremium: { fontSize: 14, fontWeight: '700', color: '#FFC107' },
  comparisonRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, gap: 8,
  },
  comparisonFeature: { flex: 1, fontSize: 13, fontWeight: '500' },
  comparisonLimit: { fontSize: 12, fontWeight: '600' },
  comparisonUnlimited: { fontSize: 12, fontWeight: '700', color: '#1D9E75' },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    marginHorizontal: 16, marginTop: 24, marginBottom: 12,
  },
  featuresGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
  },
  featureCard: {
    width: '47%', borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  featureIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ede9ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  featureTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  featureDesc: { fontSize: 11, lineHeight: 16 },
  plansContainer: { paddingHorizontal: 16, gap: 10 },
  planCard: {
    borderRadius: 14, padding: 16, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    position: 'relative',
  },
  selectedPlan: { borderColor: '#534AB7', borderWidth: 2 },
  popularBadge: {
    position: 'absolute', top: -10, left: 16,
    backgroundColor: '#534AB7', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 10,
  },
  popularBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  savingBadge: {
    position: 'absolute', top: -10, right: 16,
    backgroundColor: '#1D9E75', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 10,
  },
  savingBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center',
  },
  planRadioActive: { borderColor: '#534AB7' },
  planRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#534AB7' },
  planName: { fontSize: 15, fontWeight: '700' },
  planDuration: { fontSize: 12, marginTop: 2 },
  planPrice: { fontSize: 18, fontWeight: '800', color: '#999' },
  planPriceActive: { color: '#534AB7' },
  subscribeButton: {
    backgroundColor: '#534AB7', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, marginTop: 20, padding: 18, borderRadius: 14,
    shadowColor: '#534AB7', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  subscribeButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  termsNote: {
    fontSize: 12, textAlign: 'center',
    marginHorizontal: 24, marginBottom: 32, lineHeight: 18,
  },
  orderSummary: {
    margin: 16, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  orderTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderLabel: { fontSize: 14 },
  orderValue: { fontSize: 14, fontWeight: '600' },
  orderTotal: {
    borderTopWidth: 1, borderTopColor: '#eee',
    paddingTop: 10, marginTop: 4,
  },
  orderTotalLabel: { fontSize: 16, fontWeight: '700', color: '#534AB7' },
  orderTotalValue: { fontSize: 20, fontWeight: '800', color: '#534AB7' },
  networkRow: { paddingHorizontal: 16, gap: 10 },
  networkButton: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 4,
  },
  networkIcon: { fontSize: 20 },
  networkName: { flex: 1, fontSize: 14, fontWeight: '600' },
  phoneInput: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 1,
  },
  phoneInputText: { flex: 1, fontSize: 15 },
  payButton: {
    backgroundColor: '#534AB7', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: 16, marginTop: 24, padding: 18, borderRadius: 14,
  },
  payButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secureNote: { fontSize: 12, textAlign: 'center', marginBottom: 32 },
  successContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  successIcon: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#d1fae5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  successSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  successCard: { borderRadius: 16, padding: 20, width: '100%', marginBottom: 24 },
  successCardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  successStep: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  successStepNumber: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#534AB7',
    justifyContent: 'center', alignItems: 'center',
  },
  successStepNumberText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  successStepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  doneButton: {
    backgroundColor: '#534AB7', padding: 16,
    borderRadius: 12, width: '100%', alignItems: 'center',
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
