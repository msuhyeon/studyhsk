import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const RequireLogin = () => {
  const handleLogin = () => {
    try {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
      <div className="text-4xl">🔒</div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        로그인 후 이용할 수 있어요
      </h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        북마크, 학습 기록 등 모든 기능을 사용하려면 로그인해주세요.
      </p>
      <Button onClick={handleLogin} className="px-8 py-5 font-semibold">
        로그인하기
      </Button>
    </div>
  );
};

export default RequireLogin;
