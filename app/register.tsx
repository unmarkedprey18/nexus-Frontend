import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@#$%^&+=!]/.test(password);
    const isLong = password.length >= 8;
    const score = [hasUpper, hasLower, hasNumber, hasSpecial, isLong].filter(Boolean).length;
    if (score <= 2) return { label: 'Weak', color: '#E24B4A' };
    if (score <= 3) return { label: 'Fair', color: '#F59E0B' };
    if (score <= 4) return { label: 'Good', color: '#008080' };
    return { label: 'Strong', color: '#1D9E75' };
  };

  const getRegisterError = (err: any) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || '';

    if (status === 409) return 'This email is already registered. Please log in instead!';
    if (status === 400) {
      if (message.toLowerCase().includes('password')) return 'Your password is too weak. Use at least 8 characters with uppercase, number and special character!';
      if (message.toLowerCase().includes('email')) return 'Please enter a valid email address!';
      return 'Please check your details and try again!';
    }
    if (message.toLowerCase().includes('already exists')) return 'This email is already registered. Please log in instead!';
    if (message.toLowerCase().includes('password')) return 'Your password is too weak. Add uppercase, number and special character!';
    if (message.toLowerCase().includes('email')) return 'Please enter a valid email address!';
    return 'Could not create account. Please try again!';
  };

  const strength = getPasswordStrength();

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Oops', 'Please enter your full name!');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Oops', 'Please enter a valid email address!');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Oops', 'Please enter a password!');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Oops', 'Password must be at least 8 characters long!');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      Alert.alert('Oops', 'Password must have at least one uppercase letter!');
      return;
    }
    if (!/[0-9]/.test(password)) {
      Alert.alert('Oops', 'Password must have at least one number!');
      return;
    }
    if (!/[@#$%^&+=!]/.test(password)) {
      Alert.alert('Oops', 'Password must have at least one special character like @ # $ % !');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Oops', 'Passwords do not match. Please check and try again!');
      return;
    }
    try {
      setLoading(true);
      const indexNumber = email.split('@')[0];
      await api.post('/auth/register', { fullName, email, password, indexNumber });
      Alert.alert(
        'Account Created!',
        'We sent a verification link to your email. Please check your inbox and click the link to activate your account!',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', getRegisterError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart-circle-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.appName}>Nexus</Text>
          <Text style={styles.tagline}>Create Your Account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign Up</Text>
          <Text style={styles.formSubtitle}>Join the Nexus community today</Text>

          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={20} color="#008080" />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#80CBC4"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color="#008080" />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#80CBC4"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#008080" />
            <TextInput
              style={styles.input}
              placeholder="Min 8 chars, uppercase, number, special"
              placeholderTextColor="#80CBC4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#80CBC4"
              />
            </TouchableOpacity>
          </View>

          {strength && (
            <View style={styles.strengthRow}>
              <View style={[styles.strengthBar, {
                backgroundColor: strength.color,
                width: `${((['Weak', 'Fair', 'Good', 'Strong'].indexOf(strength.label) + 1) / 4) * 100}%`
              }]} />
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#008080" />
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#80CBC4"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#80CBC4"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FFF4' },
  scroll: { flexGrow: 1 },
  header: {
    backgroundColor: '#008080',
    paddingTop: 80, paddingBottom: 40, alignItems: 'center',
  },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 4 },
  tagline: { fontSize: 16, color: '#B2EBF2' },
  form: {
    flex: 1, backgroundColor: '#F0FFF4',
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    marginTop: -20, padding: 28,
  },
  formTitle: {
    fontSize: 24, fontWeight: '700', color: '#004D40',
    marginBottom: 6, marginTop: 10,
  },
  formSubtitle: { fontSize: 14, color: '#00695C', marginBottom: 24 },
  label: {
    fontSize: 14, fontWeight: '600', color: '#004D40',
    marginBottom: 8, marginTop: 12,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, borderWidth: 1, borderColor: '#B2DFDB',
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#004D40' },
  strengthRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginTop: 6, marginBottom: 4,
  },
  strengthBar: { height: 4, borderRadius: 2, flex: 1 },
  strengthLabel: { fontSize: 12, fontWeight: '600', width: 50 },
  registerButton: {
    backgroundColor: '#008080', padding: 16,
    borderRadius: 12, alignItems: 'center',
    marginTop: 24, marginBottom: 20,
  },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: '#00695C' },
  loginLink: { fontSize: 14, color: '#008080', fontWeight: '700' },
});