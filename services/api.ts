import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Real backend URL deployed on Render.com
const BASE_URL = 'https://nexus-3rk7.onrender.com/api/v1';

// Create our main axios instance with default settings
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // wait max 60 seconds — Render.com free tier needs time to wake up
  headers: {
    'Content-Type': 'application/json',
  },
});

// Before every request, grab the user's token and attach it
// This way we don't have to manually add it on every screen
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request fails, log the error so we can see what went wrong
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;