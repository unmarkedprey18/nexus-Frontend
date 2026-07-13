import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../store/useTheme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Oops', 'Please fill in both fields');
      return;
    }
    try {
      setLoading(true);
      setShowResend(false);

      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      // Pull everything directly from response
      const accessToken = data.accessToken;
      const user = {
        id: data.username || data.email,
        name: data.fullName,
        email: data.email,
        role: data.role,
      };

      await setAuth(accessToken, user);

      // Send admin to dashboard, users to home
      if (data.role === 'ADMIN') {
        router.replace('/admin-dashboard');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error || 'Something went wrong';

      // Check if email not verified
      if (errorMsg.toLowerCase().includes('verify your email') ||
          errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('verif')) {
        setShowResend(true);
        Alert.alert(
          '📧 Email Not Verified',
          'Please verify your email before logging in. Check your inbox for the verification link.',
          [
            { text: 'Resend Email', onPress: handleResendVerification },
            { text: 'OK', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Login failed', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Oops', 'Please enter your email first');
      return;
    }
    try {
      setResending(true);
      await api.post('/auth/resend-verification', { email });
      Alert.alert('✅ Email Sent!', 'A new verification link has been sent to your email. Check your inbox!');
      setShowResend(false);
    } catch (err: any) {
      Alert.alert('Failed', err.response?.data?.error || 'Could not resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Welcome to Nexus</Text>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>Sign in to continue</Text>

      {/* Email input */}
      <Text style={[styles.label, { color: colors.subtitle }]}>Email</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password input */}
      <Text style={[styles.label, { color: colors.subtitle }]}>Password</Text>
      <View style={[styles.passwordRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.passwordInput, { color: colors.text }]}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Forgot password link */}
      <TouchableOpacity
        style={styles.forgotButton}
        onPress={() => router.push('/forgot-password')}
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Resend verification button */}
      {showResend && (
        <TouchableOpacity
          style={[styles.resendButton, { borderColor: colors.border }]}
          onPress={handleResendVerification}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color="#534AB7" size="small" />
          ) : (
            <Text style={styles.resendText}>📧 Resend Verification Email</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15 },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15 },
  forgotButton: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 },
  forgotText: { color: '#534AB7', fontSize: 13, fontWeight: '600' },
  button: {
    backgroundColor: '#534AB7', padding: 16,
    borderRadius: 10, alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resendButton: {
    borderWidth: 1, padding: 14, borderRadius: 10,
    alignItems: 'center', marginTop: 12,
  },
  resendText: { color: '#534AB7', fontSize: 14, fontWeight: '600' },
  link: { marginTop: 20, textAlign: 'center', color: '#534AB7', fontSize: 14 },
});