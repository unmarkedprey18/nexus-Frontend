import { useThemeStore } from './themeStore';

// This hook gives any screen easy access to theme colors
// Instead of typing the same colors on every screen,
// just call useTheme() and get everything ready to use
export function useTheme() {
  const isDark = useThemeStore((state) => state.isDark);

  return {
    isDark,
    colors: {
      background: isDark ? '#1a1a1a' : '#f9f9f9',
      card: isDark ? '#2a2a2a' : '#fff',
      text: isDark ? '#fff' : '#1a1a1a',
      subtitle: isDark ? '#aaa' : '#666',
      border: isDark ? '#444' : '#e0e0e0',
      tabBar: isDark ? '#1e1e1e' : '#fff',
    },
  };
}