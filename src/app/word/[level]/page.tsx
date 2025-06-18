import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ClientWordList from './ClientWordList';
import ErrorFallback from '@/components/ErrorFallback';

type Props = {
  params: {
    level: string;
  };
};

const WordPage = async ({ params }: Props) => {
  const { level } = params;

  const supabase = createServerSupabaseClient();
  // 렌더링 속도가 느려 SSR 렌더링 시 28글자만 가져옴
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('level', level)
    .range(0, 27);

  if (error) {
    console.error(`[ERROR] SELECT words data:`, error);
    console.error(`[ERROR] Error details:`, JSON.stringify(error, null, 2));
    return <ErrorFallback />;
  }

  return (
    <div>
      <h1 className="mb-10 text-2xl font-semibold">{level}급 단어</h1>
      <div className="flex justify-end mb-10 animate-wiggle">
        <Button className="">HSK{level}급 도전💪</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {data?.map((word) => (
          <Link key={word.id} href={`/word/${level}/${word.id}`}>
            <Card className="hover:bg-sky-100">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl">{word.word}</CardTitle>
                <CardDescription className="text-xl">
                  [{word.pinyin}]
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {word.meaning}{' '}
                <span className="text-blue-400">{word.part_of_speech}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
        <ClientWordList level={Number(level)} />
      </div>
    </div>
  );
};

export default WordPage;
