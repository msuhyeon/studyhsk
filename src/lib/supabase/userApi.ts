import { supabase } from './client';
import type { User } from '@supabase/supabase-js';

// TanStack Query에서 사용할 fetcher 함수
export const fetchCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error(`[ERROR] SELECT User data: ${error}`);
    throw error;
  }

  return data.user;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(`[ERROR] failed logout: ${error}`);
    throw error;
  }
};
