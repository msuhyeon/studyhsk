import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type UserAnswer = {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
};

type QuizSubmission = {
  level: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  duration: number;
  answers: UserAnswer[];
};

export async function POST(request: NextRequest) {
  try {
    const submission: QuizSubmission = await request.json();
    const cookieStore = await cookies();

    console.log('====>', submission);

    // 쿠키 디버깅
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { data: quiz, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        level: submission.level,
        total_questions: submission.total_questions,
        score: submission.score,
        duration: submission.duration,
      })
      .select('id')
      .single();

    if (attemptsError) {
      throw attemptsError;
    }

    const { data, error: responsesError } = await supabase
      .from('quiz_responses')
      .insert({
        attemp_id: quiz.id,
        word_id: word.id,
        quiz_type: quiz.type,
        user_response: quiz.response,
        correct_answers: submission.correct_answers,
        is_correct: quiz.isCorrect,
      });

    if (responsesError) {
      throw responsesError;
    }

    return NextResponse.json({
      success: true,
      quiz,
      message: '퀴즈가 성공적으로 제출되었습니다.',
    });
  } catch (error) {
    console.error('[ERROR] Quiz submit:', error);
    return NextResponse.json(
      {
        success: false,
        error: '퀴즈 제출에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
