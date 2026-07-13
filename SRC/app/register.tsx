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

// Auto-generates an index number from the user's email
const generateIndexNumber = (email: string) => {
  const emailPrefix = email.split('@')[0].substring(0, 6);
  return emailPrefix.toUpperCase();
};

// Check password strength
const checkPassword = (password: string) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@#$%^&+=!]/.test(password);
  const hasLength = password.length >= 8;
  return { hasUppercase, hasLowercase, hasNumber, hasSpecial, hasLength };
};

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const passwordCheck = checkPassword(password);
  const isPasswordValid = Object.values(passwordCheck).every(Boolean);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Oops', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Oops', 'Passwords do not match');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Weak Password', 'Password must have uppercase, lowercase, number and special character (@#$%^&+=!)');
      return;
    }
    try {
      setLoading(true);
      const indexNumber = generateIndexNumber(email);
      await api.post('/auth/register', {
        fullName,
        email,
        password,
        indexNumber,
      });
      setRegistered(true);
    } catch (error: any) {
      Alert.alert(
        'Registration failed',
        error.response?.data?.message || error.response?.data?.error || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  // Email verification screen
  if (registered) {
    return (
      <View style={[styles.verifyContainer, { backgroundColor: colors.background }]}>
        <View style={styles.verifyIcon}>
          <Ionicons name="mail-outline" size={60} color="#534AB7" />
        </View>
        <Text style={[styles.verifyTitle, { color: colors.text }]}>Check Your Email! 📧</Text>
        <Text style={[styles.verifySubtitle, { color: colors.subtitle }]}>
          We sent a verification link to:
        </Text>
        <Text style={[styles.verifyEmail, { color: '#534AB7' }]}>{email}</Text>
        <Text style={[styles.verifyInfo, { color: colors.subtitle }]}>
          Click the link in the email to verify your account before logging in. The link expires in 24 hours.
        </Text>
        <View style={styles.verifySteps}>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={[styles.stepText, { color: colors.text }]}>Open your email inbox</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={[styles.stepText, { color: colors.text }]}>Find the email from Nexus Team</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={[styles.stepText, { color: colors.text }]}>Click "Verify My Account"</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
            <Text style={[styles.stepText, { color: colors.text }]}>Come back and log in!</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/login')}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.resendButton, { borderColor: colors.border }]}
          onPress={() => {
            setRegistered(false);
            setFullName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }}
        >
          <Text style={[styles.resendButtonText, { color: colors.subtitle }]}>
            Use a different email
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>Join Nexus today</Text>

      {/* Full name */}
      <Text style={[styles.label, { color: colors.subtitle }]}>Full Name</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Enter your full name"
        placeholderTextColor="#999"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      {/* Email */}
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

      {/* Password */}
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

      {/* Password strength indicators */}
      {password.length > 0 && (
        <View style={styles.strengthBox}>
          <View style={styles.strengthRow}>
            <Ionicons name={passwordCheck.hasLength ? 'checkmark-circle' : 'close-circle'} size={16} color={passwordCheck.hasLength ? '#1D9E75' : '#E24B4A'} />
            <Text style={[styles.strengthText, { color: passwordCheck.hasLength ? '#1D9E75' : '#E24B4A' }]}>At least 8 characters</Text>
          </View>
          <View style={styles.strengthRow}>
            <Ionicons name={passwordCheck.hasUppercase ? 'checkmark-circle' : 'close-circle'} size={16} color={passwordCheck.hasUppercase ? '#1D9E75' : '#E24B4A'} />
            <Text style={[styles.strengthText, { color: passwordCheck.hasUppercase ? '#1D9E75' : '#E24B4A' }]}>One uppercase letter (A-Z)</Text>
          </View>
          <View style={styles.strengthRow}>
            <Ionicons name={passwordCheck.hasLowercase ? 'checkmark-circle' : 'close-circle'} size={16} color={passwordCheck.hasLowercase ? '#1D9E75' : '#E24B4A'} />
            <Text style={[styles.strengthText, { color: passwordCheck.hasLowercase ? '#1D9E75' : '#E24B4A' }]}>One lowercase letter (a-z)</Text>
          </View>
          <View style={styles.strengthRow}>
            <Ionicons name={passwordCheck.hasNumber ? 'checkmark-circle' : 'close-circle'} size={16} color={passwordCheck.hasNumber ? '#1D9E75' : '#E24B4A'} />
            <Text style={[styles.strengthText, { color: passwordCheck.hasNumber ? '#1D9E75' : '#E24B4A' }]}>One number (0-9)</Text>
          </View>
          <View style={styles.strengthRow}>
            <Ionicons name={passwordCheck.hasSpecial ? 'checkmark-circle' : 'close-circle'} size={16} color={passwordCheck.hasSpecial ? '#1D9E75' : '#E24B4A'} />
            <Text style={[styles.strengthText, { color: passwordCheck.hasSpecial ? '#1D9E75' : '#E24B4A' }]}>One special character (@#$%^&+=!)</Text>
          </View>
        </View>
      )}

      {/* Confirm Password */}
      <Text style={[styles.label, { color: colors.subtitle }]}>Confirm Password</Text>
      <View style={[styles.passwordRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.passwordInput, { color: colors.text }]}
          placeholder="Confirm your password"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Register button */}
      <TouchableOpacity
        style={[styles.button, { opacity: isPasswordValid ? 1 : 0.7 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingVertical: 60 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15 },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15 },
  strengthBox: {
    backgroundColor: '#f9f9f9', borderRadius: 10,
    padding: 12, marginTop: 8, gap: 6,
  },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  strengthText: { fontSize: 13 },
  button: {
    backgroundColor: '#534AB7', padding: 16,
    borderRadius: 10, alignItems: 'center', marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { marginTop: 20, textAlign: 'center', color: '#534AB7', fontSize: 14 },
  verifyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28,
  },
  verifyIcon: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#ede9ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  verifyTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  verifySubtitle: { fontSize: 15, marginBottom: 6, textAlign: 'center' },
  verifyEmail: { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  verifyInfo: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  verifySteps: { width: '100%', marginBottom: 32, gap: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#534AB7',
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumberText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  stepText: { fontSize: 14, flex: 1 },
  loginButton: {
    backgroundColor: '#534AB7', padding: 16, borderRadius: 10,
    alignItems: 'center', width: '100%', marginBottom: 12,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resendButton: {
    padding: 14, borderRadius: 10, alignItems: 'center',
    width: '100%', borderWidth: 1,
  },
  resendButtonText: { fontSize: 14 },
});