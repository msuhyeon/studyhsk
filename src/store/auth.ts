import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type AuthState = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      isAuthenticated: false,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
    }),
    { name: 'AuthStore' }
  )
);