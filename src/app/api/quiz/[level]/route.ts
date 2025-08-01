import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

type Props = {
  params: Promise<{
    level: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { level } = await params;
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '10');

  // 4급, 5급, 6급은 아직 데이터가 없음
  if (['4', '5', '6'].includes(level)) {
    return NextResponse.json(
      {
        error: `${level}급 퀴즈는 아직 준비 중입니다. 현재 1급, 2급, 3급 퀴즈만 이용 가능합니다.`,
      },
      { status: 400 }
    );
  }

  try {
    // RPC(Remote Procedure Call): supabase api에서 random()을 지원하지 않아서 프로시저로 만들어 호출
    const { data: allWords, error } = await supabase.rpc('get_random_words', {
      level: level,
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
        word_id: word.id,
        question: word.word,
        pinyin: word.pinyin,
        choices,
        correct_answer: word.id,
      };
    });

    // TODO: 다양한 타입 처리 필요
    // meaning: 뜻 맞추기
    // pronunciation: 발음 맞추기
    return NextResponse.json({
      level,
      total_questions: count,
      questions,
      quiz_type: 'meaning',
    });
  } catch (error) {
    console.error('[ERROR] Quiz API:', error);
    return NextResponse.json(
      { error: '퀴즈를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
