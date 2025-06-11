'use client';

import { createClient } from '@supabase/supabase-js';
// import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LoginButton = () => {
  //   const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error(`로그인 실패: ${error}`);
    }

    console.log('data-?', data);
  };

  return (
    <Button className="cursor-pointer" onClick={handleLogin} variant="outline">
      Google로 로그인
    </Button>
  );
};

export default LoginButton;
