import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  setUser: (user) => set({ user, isLoading: false }),
  setProfile: (profile) =>
    set({ profile, isAdmin: profile?.role === 'admin' }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      user: null,
      profile: null,
      isLoading: false,
      isAdmin: false,
    }),
}));