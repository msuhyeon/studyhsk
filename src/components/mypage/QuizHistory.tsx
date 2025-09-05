'use client';

import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Trophy, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// interface QuizType = {

// }

const QuizHistory = () => {
  // const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quizzes, setQuizzes] = useState([]);

  async function fetchQuizHistorys(limit: number) {
    const response = await fetch(`/api/quiz/history?limit=${limit}`, {
      method: 'GET',
    });
    const { quizHistory } = await response.json();

    if (!response.ok) {
      throw new Error(
        quizHistory?.error || '퀴즈 내역을 불러오는데 실패했습니다.'
      );
    }
  }
  useEffect(() => {
    fetchQuizHistorys(3);
  }, []);

  return (
    <Card className="h-[450px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>퀴즈 히스토리</span>
        </CardTitle>
        <CardDescription>최근 퀴즈 결과를 확인하세요</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-3 h-64">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">3급</div>
                <div className="text-xs text-gray-600">2일 전</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">4/5</div>
              {/* <div className="text-sm text-gray-600">1:22</div> */}
              <div className="text-sm text-gray-600">총 5문제</div>
            </div>
          </div>
          {/* <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">2급</div>
                <div className="text-sm text-gray-600">1일 전</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-blue-600">92%</div>
              <div className="text-sm text-gray-600">23/25</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">3급</div>
                <div className="text-sm text-gray-600">3일 전</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-orange-600">76%</div>
              <div className="text-sm text-gray-600">15/20</div>
            </div>
          </div> */}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">총 12회 응시</span>
            {/* {count > 3 && ( */}
            <Button variant="outline" className="w-27">
              <Link href="/mypage/quizzes" className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>전체 보기</span>
              </Link>
            </Button>
            {/* )} */}
          </div>
        </div>
        {/* <div className="blur-sm">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-700 mb-2">
                      🚧 서비스를 준비중입니다.
                    </div>
                  </div>
                </div>
              </div> */}
      </CardContent>
    </Card>
  );
};

export default QuizHistory;
