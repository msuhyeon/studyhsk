// 'use client';

import Bookmark from '@/components/mypage/Bookmark';
import QuizHistory from '@/components/mypage/QuizHistory';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  // Settings,
  Trophy,
  BookOpen,
  TrendingUp,
  Star,
} from 'lucide-react';
// import Link from 'next/link';

// 공식 예제들이 대부분 async function을 씀. 이유는 TypeScript 타입 추론과 displayName (디버깅 시 이름) 때문에.
// const로 하면 스택트레이스에서 함수 이름이 익명으로 보이거나 최적화가 덜 되는 경우가 있었음.

const MyPage = () => {
  return (
    <div className="min-h-screen to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <h1 className="title">마이페이지</h1>
          {/* TODO: 계정 정보 뭘 수정할지 확인 */}
          {/* <Button
            variant="outline"
            className="flex items-center space-x-2"
            asChild
          >
            <Link href="/mypage/settings">
              <Settings className="w-4 h-4" />
              <span>계정 정보 수정</span>
            </Link>
          </Button> */}
        </div>
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              🎯 현재 도전 급수
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="blur-sm">
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
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700 mb-2 text-white">
                  🚧 서비스를 준비중입니다.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Bookmark />
          <QuizHistory />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="p-6 relative">
              <div className="blur-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">1,250</div>
                <div className="text-sm text-gray-600">학습한 단어</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold text-gray-700 mb-2">
                    🚧 서비스를 준비중입니다.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6 relative">
              <div className="blur-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">퀴즈 완료</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold text-gray-700 mb-2">
                    🚧 서비스를 준비중입니다.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6 relative">
              <div className="blur-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">80</div>
                <div className="text-sm text-gray-600">평균 점수</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold text-gray-700 mb-2">
                    🚧 서비스를 준비중입니다.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6 relative">
              <div className="blur-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {/* <Heart className="w-6 h-6 text-red-600" /> */}
                  <Star className="w-6 h-6 text-[#facc15]" />
                </div>
                <div className="text-2xl font-bold text-gray-900">124</div>
                <div className="text-sm text-gray-600">찜한 단어</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold text-gray-700 mb-2">
                    🚧 서비스를 준비중입니다.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
