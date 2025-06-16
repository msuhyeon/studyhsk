import { createServerSupabaseClient } from '@/lib/supabase/server';
import WordDetailClient from '@/components/word/WordDetailClient';

type Props = {
  params: {
    id: string;
  };
};

// TODO: 간체 단어를 번체로 번역해서 한자 하나하나의 뜻 음을 표시 필요

// 서버 컴포넌트: 데이터 페칭
const WordDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('words')
    .select(
      `
    *,
    examples (
      id,
      sentence,
      translation
    )
  `
    )
    .eq('id', id);

  if (error || !data || data.length === 0) {
    console.error(error);
    return <div>에러 발생</div>;
  }

  const word = data[0].word.split('');
  const res = await fetch(
    `https://pinyin-word-api.vercel.app//api/${data[0].word}`
  );
  const audioUrl = await res.json();
  let aiGenerated = null;

  // 이 단어의 예문이 db에 존재하지 않음
  if (!data?.examples) {
    // openAI를 호출해서 생성

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/word/${word}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    aiGenerated = await res.json();

    console.log('examples?', aiGenerated.examples);
  }

  // 예문 mock data
  // const examples = [
  //   {
  //     id: 1,
  //     chinese: '我没有时间去购物。',
  //     pinyin: 'Wǒ méiyǒu shíjiān qù gòuwù.',
  //     korean: '나는 쇼핑갈 시간이 없다.',
  //     context: '일상생활 - 시간 부족 표현',
  //   },
  //   {
  //     id: 2,
  //     chinese: '时间过得真快！',
  //     pinyin: 'Shíjiān guòde zhēn kuài!',
  //     korean: '시간이 정말 빨리 간다!',
  //     context: '감탄 - 시간의 빠름',
  //   },
  // ];

  // // 연관 단어 mock data
  // const relatedWords = {
  //   sameCharacter: [
  //     { hanzi: '时候', pinyin: 'shíhou', meaning: '때, 시기' },
  //     { hanzi: '时常', pinyin: 'shícháng', meaning: '때때로' },
  //     { hanzi: '间接', pinyin: 'jiànjiē', meaning: '간접적' },
  //     { hanzi: '空间', pinyin: 'kōngjiān', meaning: '공간' },
  //   ],
  //   similar: [
  //     { hanzi: '时刻', pinyin: 'shíkè', meaning: '시각, 순간' },
  //     { hanzi: '期间', pinyin: 'qījiān', meaning: '기간' },
  //     { hanzi: '瞬间', pinyin: 'shùnjiān', meaning: '순간' },
  //   ],
  //   opposite: [
  //     { hanzi: '永远', pinyin: 'yǒngyuǎn', meaning: '영원' },
  //     { hanzi: '瞬间', pinyin: 'shùnjiān', meaning: '순간' },
  //   ],
  // };

  return (
    <section className="w-full p-6 bg-white">
      <WordDetailClient {...{ audioUrl, data, aiGenerated }} />
    </section>
  );
};

export default WordDetailPage;
