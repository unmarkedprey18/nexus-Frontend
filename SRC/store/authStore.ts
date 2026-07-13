import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  profileImage?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  loadAuth: () => Promise<void>;
  updateProfileImage: (imageUrl: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: async (token, user) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('profileImage');
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    const profileImage = await AsyncStorage.getItem('profileImage');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (profileImage) user.profileImage = profileImage;
      set({ token, user, isAuthenticated: true });
    }
  },

  // Save profile image separately so it persists
  updateProfileImage: async (imageUrl: string) => {
    await AsyncStorage.setItem('profileImage', imageUrl);
    const user = get().user;
    if (user) {
      const updatedUser = { ...user, profileImage: imageUrl };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));