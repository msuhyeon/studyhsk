'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useUserStore } from '@/store/user';
import { toast } from 'sonner';

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

    // 탭 포커스 시 토큰이 자동 갱신되므로 toast 중복 노출 방지 필요
    let hasShownLoginToast = false;

    // Auth state 변화 감지
    // https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', !!session?.user);

      if (event === 'SIGNED_IN' && session?.user && !hasShownLoginToast) {
        const user = session.user;
        setUser(user);
        hasShownLoginToast = true;

        // 사용자 생성 시간과 현재 시간을 비교해서 신규 가입인지 판단
        const userCreatedAt = new Date(user.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - userCreatedAt.getTime();
        const isNewUser = timeDiff < 10000; // 10초 이내면 신규 가입으로 판단

        if (isNewUser) {
          toast.success(
            '🎉 회원가입이 완료되었습니다! HSKPass와 함께 HSK를 준비해볼까요?'
          );
        } else {
          toast.success('로그인되었습니다.');
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // 토큰 갱신 시에는 토스트 표시하지 않음
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        hasShownLoginToast = false;
        toast.info('로그아웃되었습니다.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  return null;
};

export default ClientUserProvider;
