import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

type Props = {
  params: {
    level: string;
  };
};

export async function GET(request: NextRequest, { params }: Props) {
  const { level } = params;
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '10');
  const levelMaxMap: Record<number, number> = {
    1: 150,
    2: 150,
    3: 300,
    4: 300,
    5: 1200,
    6: 1500,
  };

  const maxId = levelMaxMap[Number(level)];

  try {
    // 필요한 단어 수 계산 (문제 5개 + 오답풀 15개)
    const neededWords = count + 15;
    const randomStart =
      Math.floor(Math.random() * Math.max(1, maxId - neededWords)) + 1;

    console.log('검색 범위:', randomStart, '~', randomStart + neededWords - 1);

    // 디비에서 필요한 단어들 가져오기
    const { data: allWords, error } = await supabase
      .from('words')
      .select('id, word, meaning, pinyin, word_index')
      .eq('level', level)
      .gte('word_index', randomStart)
      .lte('word_index', randomStart + neededWords)
      .order('word_index');

    if (error) {
      console.error(`왠 에러? ${error}`);
      throw error;
    }

    console.log('allWords 개수:', allWords?.length);
    console.log(
      '실제 word_index 범위:',
      allWords?.[0]?.word_index,
      '~',
      allWords?.[allWords?.length - 1]?.word_index
    );

    if (!allWords || allWords.length < count + 3) {
      return NextResponse.json(
        { error: '퀴즈로 출제할 단어가 없습니다.' },
        { status: 400 }
      );
    }

    const questionWords = allWords.slice(0, count);
    const answerPool = allWords.slice(count);

    const questions = questionWords.map((word) => {
      // answerPool 복사본 만들어서 섞기 (원본 보호)
      const shuffledAnswers = [...answerPool].sort(() => Math.random() - 0.5);
      const wrongAnswers = shuffledAnswers.slice(0, 3);

      // 선택지 생성 (정답 + 오답 3개)
      const choices = [word, ...wrongAnswers]
        .sort(() => Math.random() - 0.5)
        .map((w) => ({
          id: w.id,
          text: w.meaning,
        }));

      return {
        id: word.id,
        question: word.word,
        pinyin: word.pinyin,
        choices,
        correct_answer: word.id,
      };
    });

    return NextResponse.json({
      level,
      total_questions: count,
      questions,
    });
  } catch (error) {
    console.error('[ERROR] Quiz API:', error);
    return NextResponse.json(
      { error: '퀴즈를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
