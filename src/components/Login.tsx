'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { logout } from '@/lib/supabase/userApi';
import { LogInIcon } from 'lucide-react';
import { useUserStore } from '@/store/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-5 h-5"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

const Login = () => {
  const user = useUserStore((state) => state.user);
  const handleLogin = () => {
    try {
      // 브라우저에서 팝업 또는 리다이렉트를 통해 동작하므로 client component
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_BASE_URL,
        },
      });
    } catch (error) {
      console.error(`[ERROR] Failed login: ${error}`);
      toast.error('로그인 실패. 다시 시도해주세요.');
    }
  };

  const router = useRouter();

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
                src={user.user_metadata.avatar_url}
                alt="profile image"
                width="50"
                height="50"
              />
              <AvatarFallback className="rounded-full bg-zinc-600 text-white text-sm">
                {user.user_metadata.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
          <Button variant={'outline'} onClick={() => logout()}>
            로그아웃
          </Button>
        </div>
      ) : (
        <Dialog>
          {/* asChild: 중첩된 DOM 태그를 없애고 자식 컴포넌트를 그대로 트리거로 사용 */}
          <DialogTrigger asChild>
            <Button
              className="flex justify-center items-center gap-2"
              variant="outline"
            >
              <LogInIcon />
              <span>로그인</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="">로그인</DialogTitle>
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
      )}
    </>
  );
};

export default Login;
