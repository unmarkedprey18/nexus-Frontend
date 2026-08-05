import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

const BASE_URL = 'https://nexus-3rk7.onrender.com/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Before every request attach the token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors cleanly — no more ugly logs!
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isNetworkError = !error.response && !isTimeout;

    // Backend sleeping or timeout
    if (isTimeout) {
      Alert.alert(
        'Connection Timeout',
        'The server is taking too long to respond. It may be waking up — please try again in a few seconds!',
        [{ text: 'OK' }]
      );
      return Promise.reject(error);
    }

    // No internet connection
    if (isNetworkError) {
      Alert.alert(
        'No Connection',
        'Please check your internet connection and try again!',
        [{ text: 'OK' }]
      );
      return Promise.reject(error);
    }

    // Don't show alerts for these — screens handle them themselves
    if (status === 401 || status === 403 || status === 404) {
      return Promise.reject(error);
    }

    // All other errors — reject silently without logging
    return Promise.reject(error);
  }
);

export default api;