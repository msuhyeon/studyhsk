'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

type ChallengeButtonProps = {
  level: string;
};

const ChallengeButton = ({ level }: ChallengeButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const { data: user } = useUser();

  const handleChallenge = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsLoading(true);

    try {
      // DB에 학습 시작 상태 업데이트
      const { error } = await supabase.from('learning_progress').upsert({
        user_id: user.id,
        level: level,
        learning_status: 'studying',
        started_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`[ERROR] UPSERT user_progress: ${JSON.stringify(error)}`);
        throw error;
      }

      setIsStarted(true);
      toast.success(`HSK${level}급 도전을 시작했습니다! 💪`);
    } catch (error) {
      console.error('도전 실패:', error);
      toast.error('시스템상의 오류로 도전을 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={isStarted ? 'bg-green-500 hover:bg-green-600' : ''}
      onClick={handleChallenge}
      disabled={isLoading}
    >
      {isLoading
        ? '시작 중...'
        : isStarted
        ? `HSK${level}급 학습중 ✨`
        : `HSK${level}급 도전💪`}
    </Button>
  );
};

export default ChallengeButton;
