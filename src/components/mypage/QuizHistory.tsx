'use client';

import { Trophy, Award, Star } from 'lucide-react';
import { formatDuration, formatDate } from '@/lib/utils';
import DashboardCard from './DashboardCard';
import { useQuery } from '@tanstack/react-query';

interface QuizType {
  id: string;
  level: number;
  total_questions: number;
  correct_count: number;
  duration: number;
  created_at: string;
}

async function fetchQuizHistorys(limit: number) {
  const response = await fetch(`/api/v1/quiz/history?limit=${limit}`, {
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
const QuizHistory = ({ limit = 3 }: { limit?: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quizHistory', limit],
    queryFn: () => fetchQuizHistorys(limit),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { quizHistory = [], totalCount = 0 } = data || {};

  const renderQuizItem = (quiz: QuizType, index: number) => (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg h-[72px]"
      key={index}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Award className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{quiz.level}급</div>
          <div className="text-xs text-gray-600">
            {formatDate(quiz.created_at)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-600">
          {formatDuration(quiz.duration)}
        </div>
        <div className="font-semibold text-green-600">
          {quiz.correct_count}/{quiz.total_questions}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardCard
      title="퀴즈 히스토리"
      description="최근 퀴즈 결과를 확인하세요"
      titleIcon={<Trophy className="w-5 h-5 text-yellow-500" />}
      data={quizHistory}
      isLoading={isLoading}
      error={error?.message || null}
      totalCount={totalCount}
      renderItem={renderQuizItem}
      emptyState={{
        icon: <Star className="w-6 h-6 text-gray-400" />,
        message: '첫 번째 퀴즈에 도전해보세요!🚀',
      }}
      viewAllLink={{
        href: '/mypage/quizzes',
        label: '전체 보기',
      }}
      countLabel={`총 ${totalCount}회 응시`}
      displayLimit={3}
    />
  );
};

export default QuizHistory;
