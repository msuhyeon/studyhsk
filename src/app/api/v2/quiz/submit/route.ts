import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuizSubmission, UserAnswer, QuestionData } from '@/types/quiz';
import { SupabaseClient, User } from '@supabase/supabase-js';

const handleInsertSession = async (
  supabase: SupabaseClient,
  user: User,
  submission: QuizSubmission
) => {
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

const handleInsertAnswer = async (
  supabase: SupabaseClient,
  insertData: UserAnswer[]
) => {
  const { error } = await supabase
    .from('user_quiz_answers')
    .insert(insertData)
    .select('id');

  return error;
};

const handleInsertQuestion = async (
  supabase: SupabaseClient,
  insertQuestionData: QuestionData[]
) => {
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
      console.error(`[ERROR]: INSERT user_quiz_sessions ${error.message}`);
      throw error;
    }

    const insertData: UserAnswer[] = submission.questions.map((quiz) => ({
      session_id: inputedQuiz?.id || '',
      word_id: quiz.word_id,
      question_type: quiz.question_type,
      question: quiz.question,
      options: quiz.options,
      correct_answer: quiz.correct_answer,
      is_correct: quiz.is_correct,
      user_answer: quiz.user_answer,
      user_answer_order: quiz.user_answer_order,
      pinyin: quiz.pinyin,
      translation: quiz.translation,
      user_id: user.id,
    }));

    const insertAnswerError = await handleInsertAnswer(supabase, insertData);

    // const insertQuestionData: QuestionData[] = submission.questions.map(
    //   (quiz) => ({
    //     word_id: quiz.word_id,
    //     question_type: quiz.question_type,
    //     question_text: quiz.question,
    //     options: quiz.options,
    //     correct_answer: quiz.correct_answer,
    //     tokens: quiz.correct_order,
    //     pinyin: quiz.pinyin,
    //     meaning: quiz.translation,
    //   })
    // );
    const insertQuestionData: QuestionData[] = submission.questions.map(
      (quiz) => ({
        word_id: quiz.word_id,
        question_type: quiz.question_type,
        question_text: quiz.question ?? '',
        options: quiz.options ?? [],
        correct_answer: quiz.correct_answer ?? '',
        tokens: quiz.tokens ?? [],
        pinyin: quiz.pinyin ?? '',
        meaning: quiz.translation ?? '',
      })
    );

    const insertQuestionError = await handleInsertQuestion(
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
