import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Go to login screen
    router.replace('/login');
  }, [ready, isAuthenticated]);

  return null;
}