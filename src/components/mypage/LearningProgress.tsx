'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import Link from 'next/link';

const LearningProgress = () => {
  const { data, error, isLoading } = useLearningProgress();

  if (error) <div>잠시 후 다시 시도해주세요</div>;
  if (isLoading) <div>로딩중!</div>;

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          🎯 현재 도전 급수
        </CardTitle>
      </CardHeader>
      {data ? (
        <CardContent className="relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-2">HSK 3급</div>
              {/* TODO: 진행률 어떻게 산정할건지 고민 */}
              <div className="text-blue-100">진행률: 10% 완료</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">60 / 600</div>
              <div className="text-blue-100 text-sm">학습한 단어</div>
            </div>
          </div>
          <Progress value={60} className="mt-4 bg-blue-400" />
        </CardContent>
      ) : (
        <CardContent className="relative ">
          <div className="text-center space-y-4">
            {/* <div className="text-3xl md:text-6xl mb-4">📚</div> */}
            <div className="md:text-xl font-semibold mb-2">
              도전 중인 급수가 없어요
            </div>
            <div className="text-blue-100 text-xs md:text-sm">
              첫 퀴즈를 풀고 HSK 학습을 시작해보세요!
            </div>
            <Link
              href="/quiz/1"
              className="inline-block mt-4 px-4 py-2 md:px-6 md:py-3 text-sm md:text-md bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              퀴즈 시작하기
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default LearningProgress;
