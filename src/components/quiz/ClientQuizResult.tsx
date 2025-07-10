'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/utils';
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2Icon,
  Target,
  ChevronDown,
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

type WrongAnswer = {
  user_answer: WordType;
  // correct_answer: string;
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
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);

  const [openItems, setOpenItems] = useState(new Set());

  const toggleAccordion = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🎉';
    if (score >= 70) return '👍';
    return '💪';
  };

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

  const { quiz } = quizResult;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          홈으로
        </button>
        <div className="text-gray-600">HSK {quiz.level}급 퀴즈 결과</div>
      </div>
      <div className="rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{getScoreEmoji(quiz.score)}</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">퀴즈 완료!</h1>
          <p className="text-gray-600">수고하셨습니다! 결과를 확인해보세요.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
              {quiz.score}점
            </div>
            <div className="text-sm text-gray-600">점수</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {quiz.level}
            </div>
            <div className="text-sm text-gray-600">급수</div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          {resultData.wrongAnswers.length > 0 && (
            <button
              onClick={() => setShowWrongAnswers(!showWrongAnswers)}
              className="bg-red-100 text-red-700 px-6 py-3 rounded-lg hover:bg-red-200 transition-colors"
            >
              {showWrongAnswers
                ? '틀린 문제 숨기기'
                : `틀린 문제 ${resultData.wrongAnswers.length}개 보기`}
            </button>
          )}
          <button
            onClick={() => router.push(`/quiz/${quiz.level}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 도전하기
          </button>
        </div>
      </div> */}
      {/* 틀린 문제 요약 */}
      {/* {showWrongAnswers && resultData.wrongAnswers.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <XCircle className="w-6 h-6 text-red-500 mr-2" />
            틀린 문제 요약
          </h2>
          <div className="space-y-4">
            {resultData.wrongAnswers.map((wrongAnswer) => (
              <div
                key={wrongAnswer.word_id}
                className="p-4 rounded-lg border-l-4 bg-red-50 border-red-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl font-bold text-gray-800 mr-3">
                        {wrongAnswer.words.word}
                      </span>
                      <span className="text-gray-600 text-sm">
                        [{wrongAnswer.words.pinyin}]
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-gray-500 mb-1">정답</div>
                        <div className="font-medium text-green-700">
                          {wrongAnswer.correct_answer}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-gray-500 mb-1">내 답</div>
                        <div className="font-medium text-red-700">
                          {wrongAnswer.user_answer}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-sm text-gray-500 mb-1">뜻</div>
                        <div className="font-medium text-gray-800">
                          {wrongAnswer.words.meaning}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 상단 결과 요약 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            🎉 퀴즈 풀이 완료!
          </h1>
          <p className="text-gray-600">수고하셨습니다! 결과를 확인해보세요.</p>
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
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <XCircle className="text-red-500 mr-2" size={24} />
              틀린 문제
              <span className="ml-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                {quizResult.wrongAnswers.length}개
              </span>
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {quizResult.wrongAnswers.map((question, index) => (
                  <AccordionItem
                    value={`item-${Number(index) + 1}`}
                    key={index}
                  >
                    <AccordionTrigger>
                      <div className="flex items-center space-x-4">
                        <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                          문제
                          {/* 번호는 인덱스? 굳이 문제 번호를 보여줘야할까...*/}
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
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors">
            다시 풀기
          </button>
          <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors border">
            다른 퀴즈
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientQuizResult;
