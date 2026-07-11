import { create } from 'zustand';
import type { Session } from 'next-auth';

interface AuthState {
  user: Session['user'] | null;
  isLoading: boolean;
  setUser: (user: Session['user'] | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      user: null,
      isLoading: false,
    }),
}));