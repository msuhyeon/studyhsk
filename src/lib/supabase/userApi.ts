import { supabase } from './client';
import { useUserStore } from '@/store/user';

// localStorage의 저장된 세션을 읽어옴, 미로그인 상태에선 null 리턴
export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error(`유저 데이터 조회 에러 발생: ${error}`);
  }

  useUserStore.getState().setUser(data.user ?? null);
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(`로그아웃 발생: ${error}`);
  } else {
    const { clearUser } = useUserStore.getState();
    clearUser();
  }
};
