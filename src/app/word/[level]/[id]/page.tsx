import { createServerSupabaseClient } from '@/lib/supabase/server';
import WordDetailClient from '@/components/word/WordDetailClient';

type Props = {
  params: {
    id: string;
  };
};

type ExampleType = {
  meaning: string;
  sentence: string;
  pinyin: string;
  context: string;
};

type AIGeneratedType = {
  examples: ExampleType[];
  synonyms: { word: string; meaning: string; pinyin: string }[];
  antonyms: { word: string; meaning: string; pinyin: string }[];
};

type RelationWordType = {
  word_id: string;
  meaning: string;
  pinyin: string;
  relationType: RelationType;
};

type RelationType = 'synonym' | 'antonym';

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
      meaning
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

    // const res = await fetch(
    //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/word/${word}`,
    //   {
    //     method: 'GET',
    //     headers: { 'Content-Type': 'application/json' },
    //   }
    // );

    // aiGenerated = await res.json();

    await insertGeneratedData({
      examples: [
        {
          sentence: '他喜欢喝茶，每天都喝好几杯。',
          pinyin: 'Tā xǐhuān hē chá, měitiān dōu hē hǎo jǐ bēi.',
          meaning: '그는 차를 마시는 것을 좋아하며, 매일 몇 잔씩 마신다.',
          context: '일상생활 - 차 마시는 습관',
        },
        {
          sentence: '这家咖啡馆的咖啡很香，你要来一杯喝吗？',
          pinyin:
            'Zhè jiā kāfēi guǎn de kāfēi hěn xiāng, nǐ yào lái yī bēi hē ma?',
          meaning: '이 커피숍의 커피는 매우 향기롭습니다. 한 잔 마실래요?',
          context: '일상생활 - 커피 주문하는 상황',
        },
      ],
      synonyms: [
        { word: '饮', meaning: '마시다', pinyin: 'Zhè jiā' },
        { word: '喝水', meaning: '물을 마시다', pinyin: 'Zhè jiā' },
      ],
      antonyms: [{ word: '吐', meaning: '토하다', pinyin: 'Zhè jiā' }],
    });
  }

  async function insertGeneratedData(generatedData: AIGeneratedType) {
    const exampleRows = generatedData.examples.map((ex: ExampleType) => ({
      word_id: id,
      sentence: ex.sentence,
      meaning: ex.meaning,
      pinyin: ex.pinyin,
      context: ex.context,
    }));

    const synonymRows = generatedData.synonyms.map((ex: RelationWordType) => ({
      word_id: id,
      word: data.word,
      relation_type: 'synonym',
    }));

    const antonymRows = generatedData.antonyms.map(
      (data: RelationWordType) => ({
        word_id: id,
        word: data.word,
        relation_type: 'antonym',
      })
    );

    // 타입 정의: const error: string = 'error';
    // 구조 분해 + 변수 이름 변경:  const { error: exError } = obj;
    const { error: exError } = await supabase
      .from('examples')
      .insert(exampleRows);

    const { error: relError } = await supabase
      .from('word_relations')
      .insert([...synonymRows, ...antonymRows]);

    if (exError || relError) {
      console.error(
        '인서트 에러!!',
        // Object pretty-print
        JSON.stringify({ exError, relError }, null, 2)
      );
      return <div>에러 발생</div>;
    }
  }

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
      <WordDetailClient {...{ ...audioUrl.url, aiGenerated, ...data[0] }} />
    </section>
  );
};

export default WordDetailPage;
