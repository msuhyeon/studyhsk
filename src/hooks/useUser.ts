import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '@/lib/supabase/userApi';

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지
    retry: 1,
  });
};