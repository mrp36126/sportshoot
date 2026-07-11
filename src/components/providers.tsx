'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { getProfile } from '@/lib/supabase/queries';
import type { Session } from '@supabase/supabase-js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setProfile, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    const initAuth = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const profile = await getProfile(user.id);
        setProfile(profile);
      } else {
        reset();
      }
      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: unknown, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        const profile = await getProfile(session.user.id);
        setProfile(profile);
      } else {
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading, reset]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}