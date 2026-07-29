import { useThemeStore } from './themeStore';

export const useTheme = () => {
  const { isDark } = useThemeStore();

  const colors = isDark ? {
    // Dark mode colors
    background: '#0A1F1F',
    card: '#112A2A',
    text: '#E0FFF4',
    subtitle: '#80CBC4',
    border: '#1A3A3A',
    input: '#0D2525',
  } : {
    // Light mode colors — Teal and Mint Green theme
    background: '#F0FFF4',
    card: '#E0F2F1',
    text: '#004D40',
    subtitle: '#00695C',
    border: '#B2DFDB',
    input: '#FFFFFF',
  };

  return { colors, isDark };
};
