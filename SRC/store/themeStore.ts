import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type ThemeState = {
  isDark: boolean;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
};

// This store controls the app's dark/light mode globally
export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  toggleTheme: async () => {
    const newValue = !get().isDark;
    // Save the preference so it persists after app restart
    await AsyncStorage.setItem('isDark', JSON.stringify(newValue));
    set({ isDark: newValue });
  },

  loadTheme: async () => {
    // Load saved theme when app opens
    const saved = await AsyncStorage.getItem('isDark');
    if (saved !== null) {
      set({ isDark: JSON.parse(saved) });
    }
  },
}));