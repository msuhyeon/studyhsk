import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
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

      // 로그인 완료 후 home으로 이동함
    } catch (error) {
      console.error(`[ERROR] Failed login: ${error}`);
      toast.error('로그인 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
      <Card className="p-10 max-w-sm border-none">
        <div className="flex flex-col items-center space-y-3">
          <div className="text-3xl">🚨</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            로그인해주세요.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-10">
            계정이 없다면 회원가입 후 이용 가능합니다.
          </p>
          <Button
            onClick={handleLogin}
            className="w-full font-semibold py-5 mt-2"
          >
            로그인하기
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RequireLogin;
