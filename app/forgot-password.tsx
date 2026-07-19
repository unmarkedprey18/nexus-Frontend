import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator, Alert,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import api from '../services/api';
import { useTheme } from '../store/useTheme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1 — Send OTP to email
  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Oops', 'Please enter your email');
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      setStep('otp');
      Alert.alert('✅ OTP Sent!', 'Check your email for the 6-digit code. It expires in 15 minutes.');
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || err.response?.data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Reset password with OTP
  const handleResetPassword = async () => {
    if (!otp.trim()) {
      Alert.alert('Oops', 'Please enter the OTP from your email');
      return;
    }
    if (!newPassword || !confirmPassword) {
      Alert.alert('Oops', 'Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Oops', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Oops', 'Password must be at least 8 characters');
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        token: otp,
        newPassword,
      });
      Alert.alert('✅ Password Reset!', 'Your password has been changed. Please log in with your new password.', [
        { text: 'Go to Login', onPress: () => router.replace('/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || err.response?.data?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#534AB7" />
      </TouchableOpacity>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="lock-open-outline" size={48} color="#534AB7" />
      </View>

      {/* Step 1 — Enter email */}
      {step === 'email' && (
        <>
          <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            Enter your email and we'll send you a 6-digit code to reset your password.
          </Text>

          <Text style={[styles.label, { color: colors.subtitle }]}>Email Address</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Code</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Step 2 — Enter OTP and new password */}
      {step === 'otp' && (
        <>
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            Enter the 6-digit code sent to {email} and your new password.
          </Text>

          <Text style={[styles.label, { color: colors.subtitle }]}>6-Digit Code</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Enter OTP from email"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Text style={[styles.label, { color: colors.subtitle }]}>New Password</Text>
          <View style={[styles.passwordRow, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              placeholder="Min 8 characters"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
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
              placeholder="Confirm new password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <TouchableOpacity
            style={[styles.resendButton, { borderColor: colors.border }]}
            onPress={() => setStep('email')}
          >
            <Text style={[styles.resendText, { color: colors.subtitle }]}>
              Didn't get the code? Go back
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.link}>Back to Login</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingVertical: 60 },
  backButton: { marginBottom: 20 },
  iconContainer: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#ede9ff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, alignSelf: 'center',
  },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15 },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15 },
  button: {
    backgroundColor: '#534AB7', padding: 16,
    borderRadius: 10, alignItems: 'center', marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resendButton: {
    borderWidth: 1, padding: 14, borderRadius: 10,
    alignItems: 'center', marginTop: 12,
  },
  resendText: { fontSize: 14 },
  link: { marginTop: 20, textAlign: 'center', color: '#534AB7', fontSize: 14 },
});