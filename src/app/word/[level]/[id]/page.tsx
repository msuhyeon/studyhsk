import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import HanziWriter from '@/components/HanziWriter';
import Mark from '@/components/Mark';

type Props = {
  params: {
    id: string;
  };
};

const WordDetail = async ({ params }: Props) => {
  const { id } = params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('words').select('*').eq('id', id);

  if (error || !data || data.length === 0) {
    console.error(error);
    return <div>에러 발생</div>;
  }

  const word = data[0].word.split('');

  // TODO: 간체 단어를 번체로 번역해서 한자 하나하나의 뜻 음을 표시 필요

  return (
    <Card className="w-full ">
      <CardHeader>{data[0].level}급</CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-end">
          <Mark />
        </div>
        <div>
          <h3 className="font-semibold text-2xl ">
            <HanziWriter characters={word} />
          </h3>
          <span className="text-neutral-400 text-lg">[{data[0].pinyin}]</span>
        </div>
        <p>{data[0].meaning}</p>
      </CardContent>
    </Card>
  );
};

export default WordDetail;
