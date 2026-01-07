import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ChallengeButton from '@/features/word/ChallengeButton';
import ErrorFallback from '@/components/ErrorFallback';
import ClientWordList from '@/features/word/ClientWordList';

type Props = {
  params: Promise<{
    level: string;
  }>;
};

export default async function WordPage({ params }: Props) {
  const { level } = await params;
  const supabase = await createClient();
  // 렌더링 속도가 느려 SSR 렌더링 시 28글자만 가져옴, 나머진 CSR로 가져옴
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
    <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 mx-auto py-10 lg:py-15">
      <h1 className="title">{level}급 단어</h1>
      <div className="flex justify-end mb-10 animate-wiggle">
        {/* 학습중 으로 상태 변경하려면... usestate 필요. */}
        <ChallengeButton level={level} />
      </div>
      <ClientWordList wordList={words} level={Number(level)} />
    </div>
  );
}
