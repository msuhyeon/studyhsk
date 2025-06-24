import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import ChallengeButton from '@/components/word/ChallengeButton';
import ErrorFallback from '@/components/ErrorFallback';
import ClientWordList from './ClientWordList';

type Props = {
  params: {
    level: string;
  };
};

const WordPage = async ({ params }: Props) => {
  const { level } = params;
  const supabase = createServerSupabaseClient();
  // 렌더링 속도가 느려 SSR 렌더링 시 28글자만 가져옴
  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .eq('level', level)
    .range(0, 27);

  if (error) {
    console.error(`[ERROR] SELECT words data:`, error);
    console.error(`[ERROR] Error details:`, JSON.stringify(error, null, 2));
    return <ErrorFallback />;
  }

  if (words.length < 1) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-xl">
          {level}급 단어를 준비 중 이에요. 조금만 기다려주세요😅
        </div>
        <Link
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-10 text-2xl font-semibold">{level}급 단어</h1>
      <div className="flex justify-end mb-10 animate-wiggle">
        {/* 학습중 으로 상태 변경하려면... usestate 필요. */}
        <ChallengeButton level={level} />
      </div>
      <ClientWordList wordList={words} level={Number(level)} />
    </div>
  );
};

export default WordPage;
