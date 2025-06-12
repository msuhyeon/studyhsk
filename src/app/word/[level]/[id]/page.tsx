import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Link, ArrowRight } from 'lucide-react';
import Bookmark from '@/components/Bookmark';
import PlayAudioButton from '@/components/PlayAudioButton';
import HanziWriter from '@/components/HanziWriter';

type Props = {
  params: {
    id: string;
  };
};

// TODO: 간체 단어를 번체로 번역해서 한자 하나하나의 뜻 음을 표시 필요
const WordDetailPage = async ({ params }: Props) => {
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

  // 예문 mock data
  const examples = [
    {
      id: 1,
      chinese: '我没有时间去购物。',
      pinyin: 'Wǒ méiyǒu shíjiān qù gòuwù.',
      korean: '나는 쇼핑갈 시간이 없다.',
      context: '일상생활 - 시간 부족 표현',
    },
    {
      id: 2,
      chinese: '时间过得真快！',
      pinyin: 'Shíjiān guòde zhēn kuài!',
      korean: '시간이 정말 빨리 간다!',
      context: '감탄 - 시간의 빠름',
    },
  ];

  // 연관 단어 mock data
  const relatedWords = {
    sameCharacter: [
      { hanzi: '时候', pinyin: 'shíhou', meaning: '때, 시기' },
      { hanzi: '时常', pinyin: 'shícháng', meaning: '때때로' },
      { hanzi: '间接', pinyin: 'jiànjiē', meaning: '간접적' },
      { hanzi: '空间', pinyin: 'kōngjiān', meaning: '공간' },
    ],
    similar: [
      { hanzi: '时刻', pinyin: 'shíkè', meaning: '시각, 순간' },
      { hanzi: '期间', pinyin: 'qījiān', meaning: '기간' },
      { hanzi: '瞬间', pinyin: 'shùnjiān', meaning: '순간' },
    ],
    opposite: [
      { hanzi: '永远', pinyin: 'yǒngyuǎn', meaning: '영원' },
      { hanzi: '瞬间', pinyin: 'shùnjiān', meaning: '순간' },
    ],
  };

  return (
    <section className="w-full p-6 bg-white">
      <div className="text-center mb-8">
        <HanziWriter characters={word} />
        <div className="text-2xl text-gray-600 mb-2">[{data[0].pinyin}]</div>
        <div className="text-xl text-gray-700 mb-4">
          {data[0].meaning} <span>{data[0].part_of_speech}</span>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          <Bookmark />
          <PlayAudioButton audioUrl={audioUrl.url} />
        </div>
      </div>
      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="w-full h-15">
          <TabsTrigger value="examples">
            <BookOpen className="w-4 h-4 inline mr-2" />
            예문 활용
          </TabsTrigger>
          <TabsTrigger value="related">
            <Link className="w-4 h-4 inline mr-2" />
            연관 단어
          </TabsTrigger>
        </TabsList>
        <TabsContent value="examples">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              예문으로 학습하기
            </h3>
            {examples.map((example) => (
              <div
                key={example.id}
                className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors mb-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-gray-900 mb-2">
                      {example.chinese}
                    </div>
                    <div className="text-gray-600 mb-2">{example.pinyin}</div>
                    <div className="text-gray-800 font-medium">
                      {example.korean}
                    </div>
                  </div>
                  {/* TODO: 예문 발음 듣기 시 TTS 필요*/}
                  {/* <PlayAudioButton audioUrl={audioUrl.url} /> */}
                </div>
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                  💡 {example.context}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="related">
          <div className="p-4">
            {/* 같은 한자 단어 */}
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                같은 한자가 들어간 단어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedWords.sameCharacter.map((word, index) => (
                  <div
                    key={index}
                    className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {word.hanzi}
                        </div>
                        <div className="text-gray-600 text-sm">
                          [{word.pinyin}]
                        </div>
                        <div className="text-gray-800 font-medium">
                          {word.meaning}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 유사한 뜻 단어 */}
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                비슷한 뜻의 단어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedWords.similar.map((word, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {word.hanzi}
                        </div>
                        <div className="text-gray-600 text-sm">
                          [{word.pinyin}]
                        </div>
                        <div className="text-gray-800 font-medium">
                          {word.meaning}
                        </div>
                      </div>
                      {/* <ArrowRight className="w-5 h-5 text-gray-400" /> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 반대/대조 단어 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                반대/대조 단어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedWords.opposite.map((word, index) => (
                  <div
                    key={index}
                    className="bg-red-50 rounded-lg p-4 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {word.hanzi}
                        </div>
                        <div className="text-gray-600 text-sm">
                          [{word.pinyin}]
                        </div>
                        <div className="text-gray-800 font-medium">
                          {word.meaning}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default WordDetailPage;
