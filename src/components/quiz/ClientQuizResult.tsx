'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/utils';
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Loader2Icon,
  Target,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { toast } from 'sonner';

type QuizResult = {
  id: string;
  level: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  duration: number;
  created_at: string;
};

type WordType = {
  word: string;
  pinyin: string;
  meaning: string;
};

type QuestionWordType = {
  word: string;
  pinyin: string;
  meaning: string;
};

type WrongAnswer = {
  user_word: WordType;
  question_word: QuestionWordType;
  example: string;
  word_id: string;
  words: WordType;
};

type QuizResultData = {
  quiz: QuizResult;
  wrongAnswers: WrongAnswer[];
};

type ClientQuizResultProps = {
  quizId: string;
};

const ClientQuizResult = ({ quizId }: ClientQuizResultProps) => {
  const router = useRouter();
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  // const [openItems, setOpenItems] = useState(new Set());

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/quiz/result/${quizId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '결과를 불러오는데 실패했습니다.');
        }

        setQuizResult(data);
      } catch (error) {
        console.error('[ERROR] Quiz result fetch:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : '결과를 불러오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [quizId]);

  // const getScoreColor = (score: number) => {
  //   if (score >= 90) return 'text-green-600';
  //   if (score >= 70) return 'text-yellow-600';
  //   return 'text-red-600';
  // };

  // const getScoreEmoji = (score: number) => {
  //   if (score >= 90) return '🎉';
  //   if (score >= 70) return '👍';
  //   return '💪';
  // };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-xl mb-4">결과를 불러올 수 없습니다</div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { quiz, wrongAnswers } = quizResult;

  console.log('wrongAnswers?', wrongAnswers);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-center mb-3">
            🎉 퀴즈 풀이 완료!
          </h1>
          <p className="text-gray-600 text-center mb-6">
            수고하셨습니다. 결과를 확인해보세요.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="text-blue-500 mr-2" size={20} />
                <span className="text-sm text-gray-600">점수</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {quiz.score}/100
              </div>
              {/* <div className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded mt-1">
              {percentage}%
            </div> */}
            </div>
            <div className="bg-white rounded-lg border p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-green-500 mr-2" size={20} />
                <span className="text-sm text-gray-600">소요 시간</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatDuration(quizResult.quiz.duration)}
              </div>
            </div>
          </div>
        </div>
        {/* 틀린 문제 섹션 */}
        {wrongAnswers.length > 0 ? (
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <XCircle className="text-red-500 mr-2" size={24} />
                틀린 문제
                <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                  {wrongAnswers.length}개
                </span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {wrongAnswers.map((question, index) => (
                    <AccordionItem
                      value={`item-${Number(index) + 1}`}
                      key={index}
                    >
                      <AccordionTrigger>
                        <div className="flex items-center space-x-4">
                          <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                            문제
                          </span>
                          <div>
                            <span className="text-2xl font-bold mr-3">
                              {question.question_word.word}
                            </span>
                            <span className="text-gray-600">
                              [{question.question_word.pinyin}]
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-4 text-balance">
                        <div className="p-6 bg-white border-t space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <CheckCircle
                                  className="text-green-600 mr-2"
                                  size={18}
                                />
                                <span className="font-medium text-green-700">
                                  정답
                                </span>
                              </div>
                              <div className="text-lg font-semibold text-green-800">
                                {question.question_word.meaning}
                              </div>
                            </div>

                            <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <XCircle
                                  className="text-red-600 mr-2"
                                  size={18}
                                />
                                <span className="font-medium text-red-700">
                                  내가 선택한 답
                                </span>
                              </div>
                              <div className="text-lg font-semibold text-red-800">
                                {question.user_word.meaning}
                              </div>
                            </div>
                          </div>
                          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                              📖 예문
                            </h4>
                            <p className="text-blue-800">{question.example}</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        ) : (
          // 완벽한 점수일 때 축하 섹션
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                완벽합니다!
              </h2>
              <p className="text-green-700 mb-4">
                모든 문제를 정확히 맞혔습니다. 대단해요!
              </p>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <Trophy className="mr-2" size={20} />
                <span className="font-semibold">Perfect Score!</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <Link
            href={`/quiz/${quiz.level}`}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-12 rounded-lg font-medium transition-colors"
          >
            다음 퀴즈 도전
          </Link>
          {/* TODO: 틀린 단어만 모아논 페이지를 만들어서 연결하는 버튼 고려 */}
        </div>
      </div>
    </div>
  );
};

export default ClientQuizResult;
