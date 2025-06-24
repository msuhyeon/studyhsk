import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

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

    // TODO: 테스트용 하드코딩 auth.id 가져오도록 수정 필요
    const user_id = '9741253a-93a2-441a-9201-3cecfc5ad5c2';

    // 1. quiz 테이블에 퀴즈 결과 저장
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        user_id,
        level: submission.level,
        total_questions: submission.total_questions,
        correct_answers: submission.correct_answers,
        score: submission.score,
        duration: submission.duration,
      })
      .select('id')
      .single();

    if (quizError) {
      throw quizError;
    }

    const quiz_id = quizData.id;

    // 2. quiz_logs 테이블에 각 문제별 결과 저장
    const quizLogs = submission.answers.map((answer) => ({
      quiz_id,
      word_id: answer.question_id,
      selected_answer: answer.selected_answer,
      is_correct: answer.is_correct,
    }));

    const { error: logsError } = await supabase
      .from('quiz_logs')
      .insert(quizLogs);

    if (logsError) {
      throw logsError;
    }

    return NextResponse.json({
      success: true,
      quiz_id,
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
