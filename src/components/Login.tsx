'use client';

import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { logout, loginWithGoogle } from '@/lib/supabase/userApi';
import { LogInIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import { useModal } from '@/hooks/useMoal';

import { GoogleIcon } from '@/components/icons/GoogleIcon';

export default function Login() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { loginOpen, openLoginModal, closeLoginModal } = useModal();

  const handleLogin = async () => {
    try {
      // 브라우저에서 팝업 또는 리다이렉트를 통해 동작하므로 client component
      await loginWithGoogle();
    } catch (error) {
      console.error(`[ERROR] Failed login: ${error}`);
      toast.error('로그인 실패. 다시 시도해주세요.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // 사용자 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (error) {
      console.error(`[ERROR] Failed logout: ${error}`);
      toast.error('로그아웃 실패. 다시 시도해주세요.');
    }
  };

  return (
    <>
      {user ? (
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="flex items-center justify-center p-0 mr-5 hover:bg-transparent"
            onClick={() => router.push('/mypage')}
          >
            <Avatar className="rounded-lg">
              <AvatarImage
                className="mr-3 rounded-full"
                src={user?.user_metadata?.avatar_url}
                alt="profile image"
              />
              <AvatarFallback className="rounded-full bg-zinc-600 text-white text-sm">
                {user?.user_metadata.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>

          <Button variant="outline" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      ) : (
        <>
          {/* 기존 DialogTrigger에서 사용하던 주석 */}
          {/* asChild: 중첩된 DOM 태그를 없애고 자식 컴포넌트를 그대로 트리거로 사용 */}
          {/* 지금은 trigger를 상태 기반으로 제어하므로 asChild는 사용되지 않음 */}

          {/* 트리거 버튼 */}
          <Button
            className="flex justify-center items-center gap-2"
            variant="outline"
            onClick={openLoginModal}
          >
            <LogInIcon />
            <span>로그인</span>
          </Button>

          {/* 로그인 모달 */}
          <Dialog
            open={loginOpen}
            onOpenChange={(open) => {
              if (!open) closeLoginModal();
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>로그인</DialogTitle>

                <DialogDescription className="py-10 flex justify-center">
                  <Button
                    onClick={handleLogin}
                    variant="outline"
                    className="w-full p-6 gap-3 flex items-center justify-center"
                  >
                    <GoogleIcon />
                    <span className="text-sm text-gray-700">
                      구글 계정으로 로그인
                    </span>
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
