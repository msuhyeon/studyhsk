'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserStore } from '@/store/user';

// layout.tsx는 서버 컴포넌트이므로 클라이언트 전용 로직을 분리해 유저 정보 초기화
const ClientUserProvider = () => {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return null;
};

export default ClientUserProvider;
