'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// 탭 포커스 시 토큰이 자동 갱신되므로 toast 중복 노출 방지 필요
let hasShownLoginToast = false;

// layout.tsx는 서버 컴포넌트이므로 클라이언트 전용 로직을 분리해 유저 정보 초기화
export default function ClientUserProvider() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        setAuthenticated(true);
        // 사용자 데이터를 쿼리 캐시에 설정
        queryClient.setQueryData(['user'], user);
      } else {
        setAuthenticated(false);
        queryClient.setQueryData(['user'], null);
      }
    };

    initializeAuth();

    // Auth state 변화 감지
    // https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !hasShownLoginToast) {
        const user = session.user;
        setAuthenticated(true);
        queryClient.setQueryData(['user'], user);
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
        setAuthenticated(true);
        queryClient.setQueryData(['user'], session.user);
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
        queryClient.setQueryData(['user'], null);
        hasShownLoginToast = false;
        toast.info('로그아웃되었습니다.');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuthenticated, queryClient]);

  return null;
}
