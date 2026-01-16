'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';

import RequireLogin from '@/components/RequireLogin';
import Bookmark from './Bookmark';
import LearningProgress from './LearningProgress';
import QuizHistory from './QuizHistory';
import { QuizType } from '@/types/quiz';

import { Card, CardContent } from '@/components/ui/card';
import { Trophy, BookOpen, TrendingUp, Star } from 'lucide-react';
import QuizScoreChart from './QuizScoreChart';

async function fetchQuizHistorys() {
  const response = await fetch(`/api/v2/quiz/history`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(
      errorResponse?.error || '퀴즈 내역을 불러오는데 실패했습니다.'
    );
  }

  const { quizHistory, totalCount } = await response.json();

  return { quizHistory, totalCount } as {
    quizHistory: QuizType[];
    totalCount: number;
  };
}

export default function ClientMyPage() {
  const { data: user, error: getUserError } = useUser();
  const { data, isLoading, error } = useQuery({
    queryKey: ['quizHistory'],
    queryFn: () => fetchQuizHistorys(),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
    refetchInterval: 1000 * 60,
  });

  const { quizHistory = [], totalCount = 0 } = data || {};

  if (!user) {
    toast.error('로그인이 필요합니다');
    return <RequireLogin />;
  } else if (getUserError) {
    toast.error(getUserError.message);
  }

  return (
    <>
      <LearningProgress />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Bookmark />
        <QuizHistory
          quizHistory={quizHistory}
          totalCount={totalCount}
          isLoading={isLoading}
          error={error}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuizScoreChart quizHistory={quizHistory} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="md:p-6 relative">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1,250</div>
            <div className="text-sm text-gray-600">학습한 단어</div>
            {/* <div className="blur-sm">
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold text-gray-700 mb-2">
                    🚧 서비스를 준비중입니다.
                  </div>
                </div>
              </div> */}
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="md:p-6 relative">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <div className="text-sm text-gray-600">퀴즈 완료</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="md:p-6 relative">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">80</div>
            <div className="text-sm text-gray-600">평균 점수</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="md:p-6 relative">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <Heart className="w-6 h-6 text-red-600" /> */}
              <Star className="w-6 h-6 text-[#facc15]" />
            </div>
            <div className="text-2xl font-bold text-gray-900">124</div>
            <div className="text-sm text-gray-600">찜한 단어</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
