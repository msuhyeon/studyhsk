import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import HanziWriter from '@/components/HanziWriter';
import Bookmark from '@/components/Bookmark';
import PlayAudioButton from '@/components/PlayAudioButton';

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
  const res = await fetch(
    `https://pinyin-word-api.vercel.app//api/${data[0].word}`
  );
  const audioUrl = await res.json();

  // TODO: 간체 단어를 번체로 번역해서 한자 하나하나의 뜻 음을 표시 필요
  return (
    <section className="flex gap-10">
      <Card className="w-full">
        <CardHeader>{data[0].level}급</CardHeader>
        <CardContent className="text-center">
          <div className="flex justify-end">
            <Bookmark />
            <PlayAudioButton audioUrl={audioUrl.url} />
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
      <Card className="w-full">
        <CardHeader>카드헤더</CardHeader>
        <CardContent>
          <ul>
            <li className="">
              <h4>예문</h4>
              <p></p>
            </li>
            <li className="">
              <h4>유의어</h4>
              <p></p>
            </li>
            <li className="">
              <h4>반의어</h4>
              <p></p>
            </li>
          </ul>
        </CardContent>
      </Card>
      {/* 예문 */}
      {/* 유의어 */}
      {/* 반의어 */}
      {/* 이 단어로 퀴즈 바로가기 */}
    </section>
  );
};

export default WordDetail;
