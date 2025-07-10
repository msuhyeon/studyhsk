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
      .from('quiz_attempts')
      .select('level, score, duration')
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
        word_id,
        user_answer,
        correct_answer,
        question_word:words!word_id (
          word,
          pinyin,
          meaning
        ),
        user_word:words!user_answer (
          word,
          pinyin,
          meaning
        ),
        correct_word:words!correct_answer (
          word,
          pinyin,
          meaning
        )
        example_sentence:examples!word_id (
          sentence,
          meaning,
          pinyin
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
