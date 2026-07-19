import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_LIMIT = 7;

// Feature keys
export const FEATURES = {
  TRANSCRIBE: 'transcribe',
  SIGN_LANGUAGE: 'sign_language',
  RECORDING: 'recording',
};

// Get today's date as string
const getToday = () => new Date().toISOString().split('T')[0];

// Get usage count for a feature today
export const getUsageCount = async (feature: string): Promise<number> => {
  const key = `usage_${feature}_${getToday()}`;
  const count = await AsyncStorage.getItem(key);
  return count ? parseInt(count) : 0;
};

// Increment usage count for a feature
export const incrementUsage = async (feature: string): Promise<number> => {
  const key = `usage_${feature}_${getToday()}`;
  const count = await getUsageCount(feature);
  const newCount = count + 1;
  await AsyncStorage.setItem(key, newCount.toString());
  return newCount;
};

// Check if user can use a feature
export const canUseFeature = async (
  feature: string,
  isPremium: boolean
): Promise<boolean> => {
  if (isPremium) return true;
  const count = await getUsageCount(feature);
  return count < DAILY_LIMIT;
};

// Get remaining uses for a feature today
export const getRemainingUses = async (
  feature: string,
  isPremium: boolean
): Promise<number> => {
  if (isPremium) return Infinity;
  const count = await getUsageCount(feature);
  return Math.max(0, DAILY_LIMIT - count);
};