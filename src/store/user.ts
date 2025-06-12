import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { devtools } from 'zustand/middleware';

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'UserStore' }
  )
);
