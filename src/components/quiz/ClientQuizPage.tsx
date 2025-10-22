'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2Icon, XCircle, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { QuizData, UserAnswer, ClientUserAnswer } from '@/types/quiz';
import { WordText } from '@/types/word';

// import QuizTimer from './QuizTimer';

// type QuizData = {
//   level: string;
//   total_questions: number;
//   quiz_type: string;
//   session_id: string;
//   questions: Question[];
// };

type Props = {
  level: string;
};

const ClientQuizPage = ({ level }: Props) => {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData[]>();
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<ClientUserAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [draggedTokens, setDraggedTokens] = useState<WordText[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { data: user, error: getUserError } = useUser();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(`/api/v2/quiz/${level}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '퀴즈를 불러오는데 실패했습니다.');
        }

        setQuizData(data);
        setStartTime(Date.now());
      } catch (error) {
        console.error('[ERROR] Quiz fetch:', error);
        console.log('캐치');
        toast.error(
          error instanceof Error
            ? error.message
            : '퀴즈를 불러오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      setLoading(false);
      toast.error('로그인이 필요합니다');
      return;
    } else {
      fetchQuizData();
    }
  }, [level, user]);

  const handleSubmit = useCallback(async () => {
    if (!quizData || quizData.length === 0) return;

    setIsSubmitting(true);

    try {
      const duration = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0;
      const correctCount = userAnswers.filter((item) => item.is_correct).length;
      const score = Math.round((correctCount / quizData.length) * 100);
      const quizResult = {
        correct_count: correctCount,
        score,
        duration,
        questions: userAnswers,
        level,
      };
      const response = await fetch('/api/v2/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizResult),
      });

      if (!response.ok) {
        throw new Error('퀴즈 제출에 실패했습니다.');
      }

      const result = await response.json();

      router.push(`/quiz/result/${result.inputedQuiz.id}`);
    } catch (error) {
      console.error('[ERROR] Quiz submit:', error);
      toast.error('퀴즈 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [quizData, router, startTime, userAnswers]);

  const currentData = useMemo(
    () => quizData?.[currentQuestionIndex] ?? null,
    [quizData, currentQuestionIndex]
  );

  const totalQuestions = quizData?.length ?? 0;
  const progress = useMemo(
    () =>
      totalQuestions ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0,
    [currentQuestionIndex, totalQuestions]
  );

  const handleAnswerSelect = (option: string) => {
    if (showResult) return;
    setSelectedAnswer(option);
  };

  const upsertUserAnswer = useCallback((answer: ClientUserAnswer) => {
    setUserAnswers((prev) => {
      const filtered = prev.filter((item) => item.word_id !== answer.word_id);
      return [...filtered, answer];
    });
  }, []);

  const buildOrderingTokens = useCallback(() => {
    if (
      !currentData ||
      currentData.question_type !== 'ordering' ||
      !currentData.tokens
    ) {
      setDraggedTokens([]);
      return;
    }

    const tokens = currentData.tokens;

    // 초기값
    const initial =
      currentData.initial_order && currentData.initial_order.length
        ? currentData.initial_order
        : tokens.map((token) => token.id);

    setDraggedTokens(
      initial.map((tokenId, index) => {
        const tokenById = tokens.find((token) => token.id === tokenId);
        const tokenByText = tokens.find((token) => token.text === tokenId);
        const fallbackToken = tokens[index];
        const sourceToken = tokenById ??
          tokenByText ??
          fallbackToken ?? { id: tokenId, text: String(tokenId) };

        return { id: sourceToken.id, text: sourceToken.text };
      })
    );
  }, [currentData]);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    buildOrderingTokens();
  }, [buildOrderingTokens, currentQuestionIndex]);

  // DnD: 단순 로컬 구현 (모바일 터치 고려 X)
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();

    const id = e.dataTransfer.getData('text/plain');
    const from = draggedTokens.findIndex((t) => t.id === id);

    if (from === -1) return;

    const next = [...draggedTokens];
    const [moved] = next.splice(from, 1);

    next.splice(index, 0, moved);
    setDraggedTokens(next);
    setDragOverIndex(null);
  };

  const checkOrderCorrect = () => {
    if (!currentData?.correct_order) return false;
    const cur = draggedTokens.map((t) => t.id);

    return JSON.stringify(cur) === JSON.stringify(currentData.correct_order);
  };

  const revealResult = () => {
    if (!currentData) return;

    const baseAnswer = {
      word_id: currentData.word_id ?? '',
      question_type: currentData.question_type ?? '',
      question: currentData.question ?? '',
      correct_answer: currentData.correct_answer ?? currentData.correct_order,
      correct_sentence: currentData.correct_sentence ?? '',
      translation: currentData.translation ?? currentData.sentence,
      pinyin: currentData.pinyin ?? '',
      sentence: currentData.sentence ?? '',
      marked_sentence: currentData.marked_sentence ?? '',
      situation: currentData.situation ?? '',
      word_display: currentData.word_display ?? '',
      options: currentData.options ?? [],
    };

    if (currentData.question_type === 'ordering') {
      const isCorrect = checkOrderCorrect();
      const userOrderIds = draggedTokens.map((token) => token.id);
      const userOrderTexts = draggedTokens.map((token) => token.text);

      setSelectedAnswer(isCorrect ? 'correct' : 'incorrect');
      upsertUserAnswer({
        ...baseAnswer,
        user_answer: userOrderTexts.join(''),
        user_answer_order: userOrderIds,
        is_correct: isCorrect,
      } as unknown as UserAnswer);
      setShowResult(true);
      return;
    }

    if (!selectedAnswer) return;

    const isCorrect = currentData.correct_answer === selectedAnswer;

    upsertUserAnswer({
      ...baseAnswer,
      user_answer: selectedAnswer,
      is_correct: isCorrect,
    } as unknown as UserAnswer);

    setShowResult(true);
  };

  const goNext = () => {
    setCurrentQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1));
  };

  const renderBasicQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          {currentData?.question}
        </h2>
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="p-8"
        >
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {currentData?.word_display}
          </div>
          <div className="flex items-center justify-center gap-2 text-base text-gray-600 dark:text-gray-300">
            <span>[{currentData?.pinyin}]</span>
            <Button
              className="h-8 w-8 p-0 rounded-full"
              variant="ghost"
              aria-label="음성 재생"
            >
              <Volume2 size={16} />
            </Button>
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {currentData?.options?.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentData?.correct_answer;
          const isWrong = isSelected && !isCorrect;

          return (
            <Button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              variant="outline"
              disabled={showResult}
              className={[
                // base
                'w-full p-5 text-left',
                'hover:bg-gray-50',
                'transition-all duration-200 ease-out',
                // states
                !showResult &&
                  isSelected &&
                  'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
                showResult &&
                  isCorrect &&
                  'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200',
                showResult &&
                  isWrong &&
                  'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200',
                !isSelected &&
                  !showResult &&
                  'hover:bg-blue-50 hover:text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle className="text-emerald-600" size={18} />
                )}
                {showResult && isWrong && (
                  <XCircle className="text-rose-600" size={18} />
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );

  const renderSentenceQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {currentData?.question}
        </h2>
        <Card className="p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {currentData?.marked_sentence &&
              currentData?.marked_sentence
                .split(/(\[.*?\])/)
                .map((part, index) =>
                  part.startsWith('[') && part.endsWith(']') ? (
                    <span
                      key={index}
                      className="bg-yellow-200/70 dark:bg-yellow-400/20 px-2 py-1 rounded"
                    >
                      {part.slice(1, -1)}
                    </span>
                  ) : (
                    part
                  )
                )}
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
            <span>{currentData?.pinyin}</span>
            <Button className="h-8 w-8 p-0 rounded-full" variant="ghost">
              <Volume2 size={16} />
            </Button>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {currentData?.options &&
          currentData?.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentData?.correct_answer;
            const isWrong = isSelected && !isCorrect;
            return (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                variant="outline"
                disabled={showResult}
                className={[
                  'w-full rounded-xl px-4 py-3 text-left',
                  'border border-transparent bg-white/70 dark:bg-white/5',
                  'transition-all duration-200 ease-out',
                  'shadow-sm hover:shadow-md active:scale-[0.99]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  'focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
                  !showResult &&
                    isSelected &&
                    'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
                  showResult &&
                    isCorrect &&
                    'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200',
                  showResult &&
                    isWrong &&
                    'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200',
                  !isSelected &&
                    !showResult &&
                    'hover:bg-gray-50 dark:hover:bg-white/10',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle className="text-emerald-600" size={18} />
                  )}
                  {showResult && isWrong && (
                    <XCircle className="text-rose-600" size={18} />
                  )}
                </div>
              </Button>
            );
          })}
      </div>
    </div>
  );

  const renderConstructionQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {currentData?.question}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          단어를 드래그하여 올바른 문장을 만드세요
        </p>
      </div>
      <div className="p-6 min-h-[120px]">
        <div className="flex flex-wrap gap-2 justify-center">
          {draggedTokens.map((token, index) => (
            // TODO: 모바일 기기에서 사용 할 수 있게 dnd 라이브러리로 수정
            <div
              key={token.id}
              draggable
              onDragStart={(e) => handleDragStart(e, token.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white dark:bg-neutral-800 border-2 rounded-lg px-3 py-2 cursor-move transition-all hover:shadow-md ${
                dragOverIndex === index ? 'border-blue-400' : 'border-gray-300'
              }`}
            >
              <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                {token.text}
              </span>
            </div>
          ))}
        </div>
      </div>
      {showResult && (
        <Card
          className={`p-4 text-center ${
            selectedAnswer === 'correct'
              ? 'border-emerald-300/70'
              : 'border-rose-300/70'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {selectedAnswer === 'correct' ? (
              <CheckCircle className="text-emerald-600" size={22} />
            ) : (
              <XCircle className="text-rose-600" size={22} />
            )}
            <span className="font-semibold">
              {selectedAnswer === 'correct' ? '정답입니다!' : '틀렸습니다!'}
            </span>
          </div>
          <div className="text-lg font-medium mb-1">
            {currentData?.correct_sentence}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {currentData?.translation}
          </div>
        </Card>
      )}
    </div>
  );

  const renderSituationQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {currentData?.question}
        </h2>
        <Card className="p-6">
          <div className="text-base md:text-lg font-medium text-gray-800 dark:text-gray-100">
            {currentData?.situation}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentData?.options &&
          currentData?.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentData?.correct_answer;
            const isWrong = isSelected && !isCorrect;
            return (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                variant="outline"
                disabled={showResult}
                className={[
                  'w-full rounded-xl px-4 py-3 text-left',
                  'border border-transparent bg-white/70 dark:bg-white/5',
                  'transition-all duration-200 ease-out',
                  'shadow-sm hover:shadow-md active:scale-[0.99]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  'focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
                  !showResult &&
                    isSelected &&
                    'border-blue-300 bg-blue-50 text-blue-800 dark:bg-blue-400/10 dark:text-blue-200',
                  showResult &&
                    isCorrect &&
                    'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200',
                  showResult &&
                    isWrong &&
                    'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200',
                  !isSelected &&
                    !showResult &&
                    'hover:bg-gray-50 dark:hover:bg-white/10',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle className="text-emerald-600" size={18} />
                  )}
                  {showResult && isWrong && (
                    <XCircle className="text-rose-600" size={18} />
                  )}
                </div>
              </Button>
            );
          })}
      </div>
    </div>
  );

  const renderQuiz = () => {
    switch (currentData?.question_type) {
      case 'basic':
        return renderBasicQuiz();
      case 'sentence':
        return renderSentenceQuiz();
      case 'ordering':
        return renderConstructionQuiz();
      case 'situation':
        return renderSituationQuiz();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2Icon className="animate-spin text-gray-400" />
      </div>
    );
  }

  const handleLogin = () => {
    try {
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_BASE_URL,
        },
      });

      // 로그인 완료 후 home으로 이동함
    } catch (error) {
      console.error(`[ERROR] Failed login: ${error}`);
      toast.error('로그인 실패. 다시 시도해주세요.');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6">
        <Card className="p-10 max-w-sm border-none">
          <div className="flex flex-col items-center space-y-3">
            <div className="text-3xl">🚨</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              로그인해주세요.
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-10">
              계정이 없으시다면 회원가입 후 이용 가능합니다.
            </p>
            <Button
              onClick={handleLogin}
              className="w-full font-semibold py-5 mt-2"
            >
              로그인하기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isLast = currentQuestionIndex === totalQuestions - 1;
  const isOrdering = currentData?.question_type === 'ordering';

  const revealButton = !showResult ? (
    <Button
      onClick={revealResult}
      disabled={!isOrdering && !selectedAnswer}
      className="px-4 cursor-pointer w-30 py-5 font-semibold"
    >
      정답 확인
    </Button>
  ) : null;

  const nextButton =
    showResult && !isLast ? (
      <Button
        className="px-4 cursor-pointer w-30 py-5 font-semibold"
        onClick={goNext}
      >
        다음 퀴즈
      </Button>
    ) : null;

  const submitButton =
    showResult && isLast ? (
      <Button
        className="px-4 cursor-pointer w-30 py-5 font-semibold"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? '제출 중…' : '퀴즈 제출'}
      </Button>
    ) : null;

  return (
    <div className="min-w-full lg:min-w-2xl max-w-3xl mx-auto p-4 sm:p-6">
      <div className="sticky top-2 z-20">
        <div className="mt-4">
          {quizData && (
            <Card className="p-4 sm:p-6">
              <div className="mb-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      HSK 퀴즈
                    </h1>
                    <Badge variant="secondary" className="ml-1">
                      Level {level || '3'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    문제 {Math.min(currentQuestionIndex + 1, totalQuestions)} /{' '}
                    {totalQuestions || '-'}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>진행률</span>
                    <span>{Math.ceil(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </div>
              {renderQuiz()}
              <div>
                <hr className="flex-1 mt-5 mb-10 border-t border-gray-200" />
                <div className="text-right">
                  {revealButton}
                  {nextButton}
                  {submitButton}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientQuizPage;
