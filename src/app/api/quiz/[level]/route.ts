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

  try {
    // RPC(Remote Procedure Call): supabase api에서 random()을 지원하지 않아서 프로시저로 만들어 호출
    const { data: allWords, error } = await supabase.rpc('get_random_words', {
      level: '3',
      count,
    });

    if (error) {
      console.error(`[ERROR] SELECT Quiz: ${error}`);
      throw error;
    }

    if (!allWords || allWords.length < count + 3) {
      return NextResponse.json(
        { error: '퀴즈로 출제할 단어가 없습니다.' },
        { status: 400 }
      );
    }

    // 랜덤하게 섞기
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    const questionWords = shuffledWords.slice(0, count);
    const answerPool = shuffledWords.slice(count, count * 4);

    // 현재 값이랑 다른거 중에서 랜덤하게 뽑아옴
    // 정답이 항상 첫번째 일 순 없으니 정오답 순서 셔플
    const questions = questionWords.map((word) => {
      const shuffledAnswers = [...answerPool].sort(() => Math.random() - 0.5);
      const wrongAnswers = shuffledAnswers.slice(0, 3);
      const allChoices = [word, ...wrongAnswers];
      const shuffledChoices = [...allChoices].sort(() => Math.random() - 0.5);
      const choices = shuffledChoices.map((w) => ({
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
