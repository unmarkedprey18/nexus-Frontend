import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

// This draws the "N" as an actual shape instead of using the letter "N" from a font.
// It's two vertical bars (with rounded ends) joined by a diagonal bar, just like the
// reference logo. The green zig-zag line is drawn separately on top, crossing through
// the middle of the diagonal, to look like a heartbeat/pulse line.
function NexusLogo({ size = 78 }: { size?: number }) {
  // height keeps the same proportions as the reference image (roughly 100 wide x 76 tall)
  const height = (size * 76) / 100;

  return (
    <Svg width={size} height={height} viewBox="0 0 100 76">
      {/* Left vertical bar of the N */}
      <Path
        d="M18,8 L18,68"
        stroke="#7B2FBE"
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Right vertical bar of the N */}
      <Path
        d="M82,8 L82,68"
        stroke="#7B2FBE"
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Diagonal bar connecting them */}
      <Path
        d="M18,8 L82,68"
        stroke="#7B2FBE"
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Green heartbeat/pulse line running straight across, spiking where it
          crosses the diagonal — same as the reference logo */}
      <Path
        d="M4,38 L38,38 L46,20 L54,54 L62,38 L96,38"
        stroke="#00C853"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state: any) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getLoginError = (err: any) => {
    const status = err?.response?.status;
    const message = (err?.response?.data?.message || '').toLowerCase();

    if (status === 401) return 'Wrong email or password. Please try again!';
    if (status === 403) return 'Your account is not verified. Check your email for the verification link!';
    if (status === 404) return 'Account not found. Please check your email or sign up!';
    if (status === 423) return 'Your account has been disabled. Contact support for help!';

    if (message.includes('disabled')) return 'Your account has been disabled. Contact support for help!';
    if (message.includes('verified')) return 'Please verify your email before logging in. Check your inbox!';
    if (message.includes('password')) return 'Wrong email or password. Please try again!';
    if (message.includes('not found')) return 'Account not found. Please check your email!';
    if (message.includes('invalid')) return 'Wrong email or password. Please try again!';
    if (message.includes('credentials')) return 'Wrong email or password. Please try again!';

    if (!err?.response) return 'No internet connection. Please check your network!';

    return 'Could not log in. Please try again!';
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Oops', 'Please enter your email address!');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Oops', 'Please enter your password!');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Oops', 'Please enter a valid email address!');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      const token = data.accessToken || data.token;
      const user = {
        id: data.id || data.userId,
        name: data.fullName || data.name,
        email: data.email,
        role: data.role,
      };
      await setAuth(token, user);
      if (data.role === 'ADMIN') {
        router.replace('/admin-dashboard');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', getLoginError(err));
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

          {/* Logo row — SVG N + EXUS */}
          <View style={styles.logoRow}>
            <View style={styles.nLogoWrapper}>
              <NexusLogo size={78} />
            </View>

            {/* EXUS */}
            <Text style={styles.appNameRest}>EXUS</Text>
          </View>

          {/* Slogan */}
          <View style={styles.taglineRow}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>Connecting the World</Text>
            <View style={styles.taglineLine} />
          </View>

        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to your account</Text>

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
              placeholder="Enter your password"
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

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.resendRow}
            onPress={async () => {
              if (!email.trim()) {
                Alert.alert('Oops', 'Please enter your email address first!');
                return;
              }
              try {
                await api.post('/auth/resend-verification', { email });
                Alert.alert('Email Sent', 'Check your inbox for the verification link!');
              } catch (err: any) {
                Alert.alert('Oops', 'Could not send email. Please try again!');
              }
            }}
          >
            <Text style={styles.resendText}>Resend verification email</Text>
          </TouchableOpacity>
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
    paddingTop: 100,
    paddingBottom: 50,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Just gives the SVG logo a little breathing room next to the "EXUS" text
  nLogoWrapper: {
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appNameRest: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
    marginLeft: 2,
    marginTop: 4,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taglineLine: {
    height: 1,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tagline: {
    fontSize: 12,
    color: '#B2EBF2',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  form: {
    flex: 1,
    backgroundColor: '#F0FFF4',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    padding: 28,
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
  forgotPassword: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 24 },
  forgotPasswordText: { fontSize: 13, color: '#008080', fontWeight: '600' },
  loginButton: {
    backgroundColor: '#008080', padding: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 20,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  registerText: { fontSize: 14, color: '#00695C' },
  registerLink: { fontSize: 14, color: '#008080', fontWeight: '700' },
  resendRow: { alignItems: 'center' },
  resendText: { fontSize: 13, color: '#00695C' },
});