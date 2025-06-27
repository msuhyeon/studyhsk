'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2Icon,
} from 'lucide-react';
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

type QuizDetail = {
  id: string;
  word_id: string;
  selected_answer: string;
  is_correct: boolean;
  words: {
    word: string;
    pinyin: string;
    meaning: string;
    part_of_speech: string;
  };
};

type QuizResultData = {
  quiz: QuizResult;
  details: QuizDetail[];
};

type ClientQuizResultProps = {
  quizId: string;
};

const ClientQuizResult = ({ quizId }: ClientQuizResultProps) => {
  const router = useRouter();
  const [resultData, setResultData] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/quiz/result/${quizId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '결과를 불러오는데 실패했습니다.');
        }

        setResultData(data);
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

  if (!resultData) {
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

  const { quiz } = resultData;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
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
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showDetails ? '상세 결과 숨기기' : '상세 결과 보기'}
          </button>
          <button
            onClick={() => router.push(`/quiz/${quiz.level}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 도전하기
          </button>
        </div>
      </div>
      {/* 상세 결과 데이터 쌓기 */}
      {/*
      {showDetails && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            문제별 상세 결과
          </h2>
          <div className="space-y-4">
            {details.map((detail, index) => (
              <div
                key={detail.id}
                className={`p-4 rounded-lg border-l-4 ${
                  detail.is_correct
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg font-medium text-gray-800 mr-2">
                        {index + 1}. {detail.words.word}
                      </span>
                      {detail.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="text-gray-600 text-sm mb-1">
                      [{detail.words.pinyin}] ({detail.words.part_of_speech})
                    </div>
                    <div className="text-gray-800 font-medium">
                      정답: {detail.words.meaning}
                    </div>
                  </div>
                  <div
                    className={`text-sm px-3 py-1 rounded-full ${
                      detail.is_correct
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {detail.is_correct ? '정답' : '오답'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ClientQuizResult;
