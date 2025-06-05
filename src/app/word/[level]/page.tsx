import { createServerSupabaseClient } from '@/lib/supabase/server';

type Props = {
  params: {
    level: string;
  };
};

const WordPage = async ({ params }: Props) => {
  // Error: Route "/word/[level]" used `params.level`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
  const level = Number(params.level);
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
      <h1>{level}급 단어</h1>
      {data?.map((word) => (
        <div key={word.id}>{word.word}</div>
      ))}
    </div>
  );
};

export default WordPage;
