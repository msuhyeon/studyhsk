import { createServerSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Props = {
  params: {
    level: string;
  };
};

const WordPage = async ({ params }: Props) => {
  const { level } = params;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('level', level);

  if (error) {
    console.error(error);
    return <div>에러 발생</div>;
  }

  return (
    <div>
      <h1 className="mb-10 text-2xl font-semibold">{level}급 단어</h1>
      <div className="grid grid-cols-5 gap-5">
        {data?.map((word) => (
          <Link key={word.id} href={`/word/${level}/${word.id}`}>
            <Card className="hover:bg-sky-100">
              <CardHeader className="text-center">
                <CardTitle className="text-4xl">{word.word}</CardTitle>
                <CardDescription className="text-xl">
                  {word.pinyin}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {word.meaning}{' '}
                <span className="text-blue-400">{word.part_of_speech}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WordPage;
