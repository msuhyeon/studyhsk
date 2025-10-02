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
  quiz_type: string;
  correct_count: number;
};

export async function POST(request: NextRequest) {
  try {
    const submission: QuizSubmission = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log('submission: ', submission);

    if (userError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { data: inputedQuiz, error: insertQuizSessionError } = await supabase
      .from('user_quiz_sessions')
      .insert({
        user_id: user.id,
        level: submission.level,
        duration: submission.duration,
        score: submission.score,
        total_questions: submission.total_questions,
        correct_count: submission.correct_count,
      })
      .select('id')
      .single();

    if (insertQuizSessionError) {
      console.error(
        `[ERROR]: INSERT user_quiz_answers ${insertQuizSessionError}`
      );
      throw insertQuizSessionError;
    }

    const insertData = submission.questions.map((quiz) => ({
      session_id: inputedQuiz.id,
      word_id: quiz.question_word_id,
      quiz_type: submission.quiz_type, 
      is_correct: quiz.is_correct, // 정답 여부 (맞음/틀림)
      user_answer: quiz.user_choice_id, // 사용자가 실제로 입력한 답
      correct_answer: quiz.question_word_id, // 정답이 뭐였는지
      user_id: user.id,
    }));

    const { error } = await supabase
      .from('user_quiz_answers')
      .insert(insertData)
      .select('id');

    if (error) {
      console.error(`[ERROR]: INSERT user_quiz_answers ${error.message}`);
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
