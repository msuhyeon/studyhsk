'use client';

import Link from 'next/link';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { loginWithGoogle } from '@/lib/supabase/userApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/useMoal';
import { toast } from 'sonner';
import { ArrowRight, BookOpen, Sparkles, Trophy } from 'lucide-react';

export function HeroSection() {
  const { loginOpen, openLoginModal, closeLoginModal } = useModal();

  const hskLevels = [
    { level: 1, words: 150, color: 'from-green-400 to-emerald-500' },
    { level: 2, words: 300, color: 'from-blue-400 to-cyan-500' },
    { level: 3, words: 600, color: 'from-purple-400 to-pink-500' },
    { level: 4, words: 1200, color: 'from-orange-400 to-red-500' },
    { level: 5, words: 2500, color: 'from-indigo-400 to-purple-500' },
    { level: 6, words: 5000, color: 'from-rose-400 to-pink-500' },
  ];

  const features = [
    { icon: Sparkles, text: 'AI 생성 예문 & 퀴즈' },
    { icon: BookOpen, text: '획순 애니메이션 학습' },
    { icon: Trophy, text: '개인화된 북마크 시스템' },
  ];

  const floatingChars = [
    { char: '学', left: '10%', top: '15%' },
    { char: '习', left: '75%', top: '25%' },
    { char: '语', left: '20%', top: '70%' },
    { char: '言', left: '85%', top: '65%' },
    { char: '中', left: '50%', top: '40%' },
    { char: '文', left: '65%', top: '80%' },
  ];

  const handleLogin = async () => {
    try {
      // 브라우저에서 팝업 또는 리다이렉트를 통해 동작하므로 client component
      await loginWithGoogle();
    } catch (error) {
      console.error(`[ERROR] Failed login: ${error}`);
      toast.error('로그인 실패. 다시 시도해주세요.');
    }
  };

  return (
    <section className="relative h-[850px] overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50">
      {/* 백그라운드에 한자 플로팅 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        {floatingChars.map((item, i) => (
          <div
            key={i}
            className="absolute text-9xl font-bold text-gray-900 animate-float"
            style={{
              left: item.left,
              top: item.top,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i}s`,
            }}
          >
            {item.char}
          </div>
        ))}
      </div>

      {/* 배경 그라데이션 원형 효과 */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative container max-w-[1400px] mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4 text-left">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI와 함께하는
                </span>
                <br />
                <span className="text-gray-900">똑똑한 HSK 학습</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-2xl">
                10,000개 이상의 HSK 단어를
                <br />
                AI가 생성한 예문과 퀴즈로 학습하세요
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-5 py-3 shadow-sm border border-gray-200"
                >
                  <feature.icon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                className="group bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                onClick={openLoginModal}
              >
                시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-purple-300 transition-all duration-200">
                둘러보기
              </button>
            </div>
          </div>

          {/* Right Content - HSK Level Cards - 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                HSK 급수 선택
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                {hskLevels.map((level) => (
                  <Link
                    href={`/word/${level.level}`}
                    key={level.level}
                    className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-100 hover:border-transparent"
                  >
                    {/* Gradient Background on Hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="text-4xl font-bold text-gray-800 group-hover:text-white transition-colors mb-2">
                        {level.level}급
                      </div>
                      <div className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">
                        {level.words.toLocaleString()}개 단어
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  급수를 선택하여 학습을 시작하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      <Dialog
        open={loginOpen}
        onOpenChange={(open) => {
          if (!open) closeLoginModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그인</DialogTitle>

            <DialogDescription className="py-10 flex justify-center">
              <Button
                onClick={handleLogin}
                variant="outline"
                className="w-full p-6 gap-3 flex items-center justify-center"
              >
                <GoogleIcon />
                <span className="text-sm text-gray-700">
                  구글 계정으로 로그인
                </span>
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}
