import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeState = {
  isDark: boolean;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  toggleTheme: async () => {
    const newValue = !get().isDark;
    set({ isDark: newValue });
    await AsyncStorage.setItem('isDark', JSON.stringify(newValue));
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem('isDark');
    if (saved !== null) {
      set({ isDark: JSON.parse(saved) });
    }
  },
}));
