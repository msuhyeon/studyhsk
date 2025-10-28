import { WordText } from './word';

export type QuestionType = 'basic' | 'sentence' | 'ordering' | 'situation';

export interface QuizData {
  word_id: string;
  question_type: QuestionType;
  question?: string;
  options?: string[];
  correct_answer?: string;
  pinyin?: string | '';
  sentence?: string | undefined;
  marked_sentence?: string | undefined;
  situation?: string | undefined;
  word_display?: string | undefined;
  tokens?: WordText[];
  initial_order?: string[];
  correct_order?: string[];
  correct_sentence?: string;
  translation?: string;
}

export interface ClientUserAnswer extends QuizData {
  user_answer: string | null;
  user_answer_order?: string[];
  is_correct: boolean;
}

export interface UserAnswer extends ClientUserAnswer {
  session_id: string;
  user_id: string;
  question_id?: string;
}

export interface QuizSubmission {
  level: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  duration: number;
  questions: UserAnswer[];
  quiz_type: string;
  correct_count: number;
  user_answer: string | string[] | null;
}

export interface QuestionData extends QuizData {
  question_text: QuizData['question'];
  meaning: QuizData['translation'];
}
