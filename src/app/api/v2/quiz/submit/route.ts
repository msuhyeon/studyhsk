import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuizSubmission } from '@/types/quiz';

const handleInsertSession = async (supabase, user, submission) => {
  const { data: inputedQuiz, error } = await supabase
    .from('user_quiz_sessions')
    .insert({
      user_id: user.id,
      level: submission.level,
      duration: submission.duration,
      score: submission.score,
      total_questions: submission.questions.length,
      correct_count: submission.correct_count,
    })
    .select('id')
    .single();

  return { inputedQuiz, error };
};

const handleInsertAnswer = async (supabase, insertData) => {
  const { error: insertAnswerError } = await supabase
    .from('user_quiz_answers')
    .insert(insertData)
    .select('id');

  return insertAnswerError;
};

const handleInsertQuestion = async (supabase, insertQuestionData) => {
  const { error } = await supabase
    .from('quiz_questions')
    .insert(insertQuestionData)
    .select('id');

  return error;
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

    const { inputedQuiz, error } = await handleInsertSession(
      supabase,
      user,
      submission
    );

    if (error) {
      console.error(`[ERROR]: INSERT user_quiz_answers ${error}`);
      throw error;
    }

    const insertData = submission.questions.map((quiz) => ({
      session_id: inputedQuiz.id,
      word_id: quiz.question_word_id,
      quiz_type: quiz.question_type,
      is_correct: quiz.is_correct, // 정답 여부 (맞음/틀림)
      user_answer: quiz.user_answer, // 사용자가 실제로 입력한 답
      correct_answer: quiz.question_word_id, // 정답이 뭐였는지
      user_id: user.id,
    }));

    const { insertAnswerError } = await handleInsertAnswer(
      supabase,
      insertData
    );
    const insertQuestionData = submission.questions.map((quiz) => ({
      word_id: quiz.question_word_id,
      question_type: quiz.question_type,
      question_text: quiz.question,
      options: quiz.options,
      correct_answer: quiz.correct_answer,
      tokens: quiz.correct_order,
      pinyin: quiz.pinyin,
      meaning: quiz.translation,
    }));

    const { insertQuestionError } = await handleInsertQuestion(
      supabase,
      insertQuestionData
    );

    if (insertQuestionError || insertAnswerError) {
      console.error('[ERROR] Submit quiz failed:', {
        insertQuestionError: insertQuestionError?.message || null,
        insertAnswerError: insertAnswerError?.message || null,
      });

      throw insertQuestionError || insertAnswerError;
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
