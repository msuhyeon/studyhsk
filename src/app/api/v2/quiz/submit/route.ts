import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { QuizSubmission, UserAnswer, QuestionData } from '@/types/quiz';
import { SupabaseClient, User } from '@supabase/supabase-js';

// 1. 퀴즈 세션(한 세션의 퀴즈 결과) 저장
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

// 2. quiz_questions (문제들) 저장
const handleInsertQuestion = async (
  supabase: SupabaseClient,
  insertQuestionData: QuestionData[]
) => {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert(insertQuestionData)
    .select('id, word_id'); // 새로 생성된 question id와 word_id를 같이 가져옴

  return { data, error };
};

// 3. user_quiz_answers (사용자의 답변들) 저장
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

export async function POST(request: NextRequest) {
  try {
    const submission: QuizSubmission = await request.json();
    const supabase = await createServerClient();

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

    // user_quiz_sessions 저장
    const { inputedQuiz, error: sessionError } = await handleInsertSession(
      supabase,
      user,
      submission
    );
    if (sessionError) throw sessionError;

    // quiz_questions 먼저 저장
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

    const { data: insertedQuestions, error: insertQuestionError } =
      await handleInsertQuestion(supabase, insertQuestionData);

    if (insertQuestionError) throw insertQuestionError;

    // word_id 기준으로 quiz_question.id 매핑 테이블 생성
    const questionIdMap = Object.fromEntries(
      insertedQuestions.map((q) => [q.word_id, q.id])
    );

    // user_quiz_answers 데이터 생성 (question_id 매핑 포함)
    const insertData: UserAnswer[] = submission.questions.map((quiz) => ({
      session_id: inputedQuiz?.id || '',
      question_id: questionIdMap[quiz.word_id], // FK 연결
      word_id: quiz.word_id,
      question_type: quiz.question_type,
      correct_answer: quiz.correct_answer,
      is_correct: quiz.is_correct,
      user_answer: (quiz.user_answer || quiz.user_answer_order) ?? null,
      user_id: user.id,
    }));

    const insertAnswerError = await handleInsertAnswer(supabase, insertData);

    if (insertAnswerError) throw insertAnswerError;

    return NextResponse.json({
      success: true,
      inputedQuiz,
      message: '퀴즈가 성공적으로 제출되었습니다.',
    });
  } catch (error) {
    console.error('[ERROR] Quiz submit:', error);
    return NextResponse.json(
      { success: false, error: '퀴즈 제출에 실패했습니다.' },
      { status: 500 }
    );
  }
}
