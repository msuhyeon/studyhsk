import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;

  try {
    const supabase = await createClient();

    const { data: quizData, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('level, score')
      .eq('id', id)
      .single();

    if (quizError) {
      throw quizError;
    }

    // 틀린 문제만 가져오기
    const { data: wrongAnswers, error: wrongError } = await supabase
      .from('quiz_responses')
      .select(
        `
        user_answer,
        correct_answer,
        word_id,
        words (
          word,
          pinyin,
          meaning
        )
      `
      )
      .eq('attempt_id', id)
      .eq('is_correct', false);

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
