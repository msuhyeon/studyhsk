import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type UserAnswer = {
  question_word_id: string;
  user_choice_id: string;
  is_correct: boolean;
  quiz_type: string;
};

type QuizSubmission = {
  level: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  duration: number;
  questions: UserAnswer[];
};

export async function POST(request: NextRequest) {
  try {
    const submission: QuizSubmission = await request.json();
    const supabase = await createClient();

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

    const { data: inputedQuiz, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        level: submission.level,
        duration: submission.duration,
        score: submission.score,
      })
      .select('id')
      .single();

    if (attemptsError) {
      console.error(`[ERROR]: INSERT quiz_responses ${attemptsError}`);
      throw attemptsError;
    }

    const insertData = submission.questions.map((quiz) => ({
      attempt_id: inputedQuiz.id,
      word_id: quiz.question_word_id,
      quiz_type: quiz.quiz_type || null,
      user_answer: quiz.user_choice_id, // uuid
      correct_answer: quiz.question_word_id, // uuid
      is_correct: quiz.is_correct,
      user_id: user.id,
    }));

    const { error } = await supabase
      .from('quiz_responses')
      .insert(insertData)
      .select('id');

    if (error) {
      console.error(`[ERROR]: INSERT quiz_responses ${error.message}`);
      throw error;
    }

    return NextResponse.json({
      success: true,
      inputedQuiz,
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
