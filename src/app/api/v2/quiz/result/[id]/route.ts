import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;

  try {
    const supabase = await createClient();

    const { data: quizData, error: quizError } = await supabase
      .from('user_quiz_sessions')
      .select('level, score, duration')
      .eq('id', id)
      .single();

    if (quizError) {
      throw quizError;
    }

    // 틀린 문제만 가져오기
    const { data: wrongAnswers, error: wrongError } = await supabase
      .from('user_quiz_answers')
      .select(
        `
      word_id,
      user_answer,
      quiz_type,
      correct_word:words!correct_answer (
        word,
        pinyin,
        meaning
      )
      `
      )
      .eq('session_id', id)
      .eq('is_correct', false);

    // TODO: 예문 모두 셋팅되면 그때 사용
    // example:examples!word_id (
    //   sentence,
    //   meaning,
    //   pinyin,
    //   context
    // )

    if (wrongError) {
      throw wrongError;
    }

    return NextResponse.json({
      quiz: quizData,
      wrongAnswers: wrongAnswers || [],
    });
  } catch (error) {
    console.error('[ERROR] Quiz result API:', error);
    return NextResponse.json(
      { error: '결과를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
