import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { secureStorage } from './secureStorage';
import { router } from 'expo-router';

export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  loginUser: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      email: null,
      loginUser: (email: string) => {
        set({ isAuthenticated: true, email });
      },
      logout: () => {
        set({ isAuthenticated: false, email: null });
        router.replace('/');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
