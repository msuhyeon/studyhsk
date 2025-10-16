import { WordText } from './word';

export type QuizData = {
  word_id: string;
  type: 'basic' | 'sentence' | 'ordering' | 'construction' | 'situation';
  question: string;
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
};

export type UserAnswer = {
  question_word_id: string;
  question_type: QuizData['type'];
  question: string;
  user_answer: string | null;
  user_answer_order?: string[];
  correct_answer?: string | null;
  correct_order?: string[];
  correct_sentence?: string;
  translation?: string;
  pinyin?: string;
  sentence?: string;
  marked_sentence?: string;
  situation?: string;
  word_display?: string;
  options?: string[];
  is_correct: boolean;
};

export type QuizSubmission = {
  level: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  duration: number;
  questions: UserAnswer[];
  quiz_type: string;
  correct_count: number;
  user_answer: string;
};
