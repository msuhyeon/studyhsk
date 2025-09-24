'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Loader2Icon,
  RotateCcw,
  XCircle,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// import { toast } from 'sonner';
// import QuizTimer from './QuizTimer';

/**
 * NOTE: 요구사항에 따라 기존 주석 코드는 그대로 유지했습니다. (아래 원문 주석 블록 보존)
 */

type Choice = {
  id: number;
  text: string;
};

// type QuizData = {
//   level: string;
//   total_questions: number;
//   quiz_type: string;
//   session_id: string;
//   questions: Question[];
// };

type WordText = {
  id: string;
  text: string;
};

type QuizData = {
  word_id: string;
  type: 'basic' | 'sentence' | 'ordering' | 'construction' | 'situation';
  question: string;
  options?: string[];
  correct_answer?: string;
  pinyin?: string | undefined; // undefined가 아니라 '' 이어야할듯해..
  sentence?: string | undefined;
  marked_sentence?: string | undefined;
  situation?: string | undefined;
  word_display?: string | undefined;
  tokens?: WordText[];
  initial_order?: string[];
  correct_order?: string[];
  correct_sentence?: string;
  translation?: string;
};

type UserAnswer = {
  question_word_id: string;
  user_choice_id: string;
  is_correct: boolean;
};

type Props = {
  level: string;
};

type SelectedAnswerType = {
  id: string;
  meaning: string;
};

const ClientQuizPage = ({ level }: Props) => {
  const router = useRouter();
  // const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizData, setQuizData] = useState<QuizData[]>();
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedChoice, setSelectedChoice] =
    useState<SelectedAnswerType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  /**
   * Demo 데이터 주입 (원문 유지)
   */
  useEffect(() => {
    setQuizData([
      {
        word_id: 'a47c63b0-aef6-4a63-ba63-289e04f27524',
        type: 'basic',
        question: '다음 한자의 의미는?',
        options: ['기실 사실', '사실상', '진실', '사실적인'],
        correct_answer: '기실 사실',
        pinyin: 'qíshí',
        sentence: undefined,
        marked_sentence: undefined,
        situation: undefined,
        word_display: '其实',
      },
      {
        word_id: 'ac0091e2-fa75-415e-99aa-addcbc99074d',
        type: 'basic',
        question: '다음 한자의 의미는?',
        options: ['이모', '어머니', '아주머니', '할머니'],
        correct_answer: '아주머니',
        pinyin: 'āyí',
        sentence: undefined,
        marked_sentence: undefined,
        situation: undefined,
        word_display: '阿姨',
      },
      {
        word_id: '0a8ed132-53b2-41b9-98f8-52450dcdb511',
        type: 'basic',
        question: '다음 한자의 의미는?',
        options: ['비행하다', '도착하다', '이륙하다', '착륙하다'],
        correct_answer: '이륙하다',
        pinyin: 'qǐfēi',
        sentence: undefined,
        marked_sentence: undefined,
        situation: undefined,
        word_display: '起飞',
      },
      {
        word_id: '81b87119-c154-491d-a49f-010bfa2484c0',
        type: 'sentence',
        question: '다음 문장에서 대괄호로 표시된 단어의 의미는?',
        options: ['나무 수목', '꽃', '草', '灌木'],
        correct_answer: '나무 수목',
        pinyin: 'gōngyuán lǐ yǒu hěnduō gāodà de shù.',
        sentence: '公园里有很多高大的树。',
        marked_sentence: '公园里有很多高大的 [树]。',
        situation: undefined,
        word_display: undefined,
      },
      {
        word_id: 'c4461165-a6f5-49d1-8823-d5e8417b8e8d',
        type: 'sentence',
        question: '다음 문장에서 대괄호로 표시된 단어의 의미는?',
        options: ['늘 언제나', '자주', '가끔', '때때로'],
        correct_answer: '늘 언제나',
        pinyin: 'Wǒ [zǒngshì] zài túshūguǎn xuéxí zhōngwén.',
        sentence: '我[总是]在图书馆学习中文。',
        marked_sentence: '我[总是]在图书馆学习中文。',
        situation: undefined,
        word_display: undefined,
      },
      {
        word_id: '8cdad292-d3ab-4b92-943a-76d05ba92fe9',
        type: 'sentence',
        question: '다음 문장에서 대괄호로 표시된 단어의 의미는?',
        options: ['케이크', '과자', '빵', '쿠키'],
        correct_answer: '케이크',
        pinyin: 'jīntiān shì wǒ de shēngrì, wǒ xiǎng yào yīgè [dàngāo]。',
        sentence: '今天是我的生日，我想要一个[蛋糕]。',
        marked_sentence: '今天是我的生日，我想要一个[蛋糕]。',
        situation: undefined,
        word_display: undefined,
      },
      {
        word_id: 'd95bfb82-75fe-4bd7-947c-7359aa716ba9',
        type: 'sentence',
        question: '다음 문장에서 대괄호로 표시된 단어의 의미는?',
        options: ['아마', '확실히', '반드시', '절대로'],
        correct_answer: '아마',
        pinyin: 'Míngtiān [kěnéng] huì xià yǔ.',
        sentence: '明天[可能]会下雨。',
        marked_sentence: '明天[可能]会下雨。',
        situation: undefined,
        word_display: undefined,
      },
      {
        word_id: '349d6f80-201f-44ff-b7a0-45b7e4488956',
        type: 'ordering',
        question: '다음 단어들을 올바른 순서로 배열하세요:',
        tokens: [
          { id: 't1', text: '단어1' },
          { id: 't2', text: '단어2' },
          { id: 't3', text: '단어3' },
          { id: 't4', text: '단어4' },
        ],
        initial_order: ['t2', 't4', 't1', 't3'],
        correct_order: ['t1', 't2', 't3', 't4'],
        correct_sentence: '我决定去旅行',
        translation: '나는 여행을 가기로 결정했다',
      },
      {
        word_id: 'e1fe7dc6-5ece-4661-af1e-9f00d8819315',
        type: 'ordering',
        question: '다음 단어들을 올바른 순서로 배열하세요:',
        tokens: [
          { id: 't1', text: '단어1' },
          { id: 't2', text: '단어2' },
          { id: 't3', text: '단어3' },
          { id: 't4', text: '단어4' },
        ],
        initial_order: ['t3', 't1', 't4', 't2'],
        correct_order: ['t1', 't2', 't3', 't4'],
        correct_sentence: '我喜欢玩游戏。',
        translation: '나는 게임을 하는 것을 좋아한다.',
      },
      {
        word_id: 'f86562a7-1e29-4724-ab6f-06676d242ab9',
        type: 'situation',
        question: '다음 상황에서 가장 자연스러운 표현은?',
        options: [
          '学生们进教室了。',
          '我进了教室的门。',
          '老师进教室的时候。',
          '他们进教室很快。',
        ],
        correct_answer: '学生们进教室了。',
        pinyin: undefined,
        sentence: undefined,
        marked_sentence: undefined,
        situation:
          '학교에서 수업이 시작되기 전에 학생들이 교실 안으로 들어오고 있습니다.',
        word_display: undefined,
      },
    ]);
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   const fetchQuizData = async () => {
  //     try {
  //       const response = await fetch(`/api/v2/quiz/${level}`);
  //       const data = await response.json();

  //       if (!response.ok) {
  //         throw new Error(data.error || '퀴즈를 불러오는데 실패했습니다.');
  //       }

  //       setQuizData(data);
  //       setStartTime(Date.now());
  //     } catch (error) {
  //       console.error('[ERROR] Quiz fetch:', error);
  //       toast.error(
  //         error instanceof Error
  //           ? error.message
  //           : '퀴즈를 불러오는데 실패했습니다.'
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchQuizData();
  // }, [level]);

  // const handleChoiceSelect = (choiceId: string, text: string) => {
  //   setSelectedChoice({ id: choiceId, meaning: text });
  // };
  // const currentQuestion = quizData?.questions[currentQuestionIndex];
  // const progress = useMemo(
  //   () =>
  //     quizData
  //       ? ((currentQuestionIndex + 1) / quizData.total_questions) * 100
  //       : 0,
  //   [currentQuestionIndex, quizData]
  // );

  // const handleNextQuestion = () => {
  //   if (!selectedChoice || !quizData) return;

  //   const currentQuestion = quizData.questions[currentQuestionIndex];
  //   const isCorrect = selectedChoice.id === currentQuestion.word_id;
  //   const userAnswer: UserAnswer = {
  //     user_choice_id: selectedChoice.id,
  //     // selected_meaning: selectedChoice.meaning,
  //     question_word_id: currentQuestion.word_id,
  //     is_correct: isCorrect,
  //   };

  //   setUserAnswers((data) => [...data, userAnswer]);
  //   setSelectedChoice(null);

  //   if (currentQuestionIndex < quizData.questions.length - 1) {
  //     setCurrentQuestionIndex((data) => data + 1);
  //   }
  // };

  // const handleQuizComplete = useCallback(async () => {
  //   if (!quizData) return;

  //   setIsSubmitting(true);

  //   const finalAnswers = userAnswers;

  //   try {
  //     const correctCount = finalAnswers.filter(
  //       (answer) => answer.is_correct
  //     ).length;
  //     const score = Math.round((correctCount / quizData.total_questions) * 100);
  //     const duration = startTime
  //       ? Math.floor((Date.now() - startTime) / 1000)
  //       : 0;
  //     const quizResult = {
  //       correct_count: correctCount,
  //       score,
  //       duration,
  //       ...quizData,
  //       questions: userAnswers,
  //     };

  //     const response = await fetch('/api/v1/quiz/submit', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(quizResult),
  //     });

  //     if (!response.ok) {
  //       throw new Error('퀴즈 제출에 실패했습니다.');
  //     }

  //     const result = await response.json();

  //     router.push(`/quiz/result/${result.inputedQuiz.id}`);
  //   } catch (error) {
  //     console.error('[ERROR] Quiz submit:', error);
  //     toast.error('퀴즈 제출에 실패했습니다.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }, [quizData, userAnswers, startTime, router]);

  // userAnswers가 업데이트될 때마다 퀴즈 완료 여부 체크
  // useEffect(() => {
  //   if (quizData && userAnswers.length === quizData.total_questions) {
  //     handleQuizComplete();
  //   }
  // }, [userAnswers, quizData, handleQuizComplete]);

  // // 스켈레톤 UI 적용 필요
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <Loader2Icon className="animate-spin" />
  //     </div>
  //   );
  // }

  // // 퀴즈가 없는 경우
  // if (!quizData) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <div className="text-center">
  //         <div className="text-xl mb-4">퀴즈를 불러올 수 없습니다🫢</div>
  //         <button
  //           onClick={() => router.back()}
  //           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
  //         >
  //           돌아가기
  //         </button>
  //       </div>
  //     </div>
  //   );
  // } else {
  //   if (quizData.questions.length < 1) {
  //     return (
  //       <div className="flex flex-col justify-center items-center min-h-screen gap-4">
  //         <div className="text-xl">
  //           {level}급 퀴즈를 준비 중 이에요. 조금만 기다려주세요😅
  //         </div>
  //         <button
  //           onClick={() => router.back()}
  //           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
  //         >
  //           돌아가기
  //         </button>
  //       </div>
  //     );
  //   }
  // }

  const [currentQuiz, setCurrentQuiz] = useState<string>('basic');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [draggedTokens, setDraggedTokens] = useState<WordText[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // useEffect(() => {
  //   if (quizData) {
  //     setCurrentData(quizData[currentQuestionIndex]);
  //   }
  // }, [quizData, currentQuestionIndex]);

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

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    if (currentData?.type === 'ordering' && currentData.tokens) {
      // 초기 토큰 셋업
      const initial =
        currentData.initial_order || currentData.tokens.map((t) => t.id);
      const dict = new Map(currentData.tokens.map((t) => [t.id, t.text]));
      setDraggedTokens(initial.map((id) => ({ id, text: dict.get(id) || '' })));
    }
  }, [currentQuestionIndex]);

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
    if (currentData.type === 'ordering') {
      const ok = checkOrderCorrect();
      setSelectedAnswer(ok ? 'correct' : 'incorrect');
      setShowResult(true);
      return;
    }
    if (!selectedAnswer) return;
    setShowResult(true);
  };

  const goPrev = () => setCurrentQuestionIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setCurrentQuestionIndex((i) => Math.min(totalQuestions - 1, i + 1));

  /** UI 파트: 공통 카드 래퍼 */
  const Card = ({
    children,
    className = '',
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={[
        'rounded-2xl border border-gray-200/60 bg-white/90 dark:bg-neutral-900/60 backdrop-blur',
        'shadow-sm hover:shadow-md transition-shadow',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );

  /** 개별 렌더러들 */
  const renderBasicQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          {currentData?.question}
        </h2>
        <Card className="p-8">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className=""
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
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* 원문 주석 유지 */}
        {/* {currentData?.options?.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            variant={'outline'}
            className={`p-4 text-left rounded-lg border border-[#ff0000] transition-all duration-300 py-2 ${
              selectedAnswer === option
                ? option === currentData?.correct_answer
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-red-50 border-red-500 text-red-800'
                : 'hover:bg-neutral-500 hover:text-white'
            }`}
            disabled={showResult}
          >
            <div className="flex items-center justify-between">
              <span className="">{option}</span>
              {showResult && option === currentData?.correct_answer && (
                <CheckCircle className="text-green-600" size={20} />
              )}
              {showResult &&
                selectedAnswer === option &&
                option !== currentData?.correct_answer && (
                  <XCircle className="text-red-600" size={20} />
                )}
            </div>
          </Button>
        ))} */}

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
                'w-full rounded-xl px-4 py-3 text-left',
                'border border-transparent bg-white/70 dark:bg-white/5',
                'transition-all duration-200 ease-out',
                'shadow-sm hover:shadow-md active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                'focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
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

      <Card className="p-6 min-h-[120px]">
        <div className="flex flex-wrap gap-2 justify-center">
          {draggedTokens.map((token, index) => (
            <div
              key={token.id}
              draggable
              onDragStart={(e) => handleDragStart(e, token.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white dark:bg-neutral-800 border-2 rounded-lg px-3 py-2 cursor-move shadow-sm transition-all hover:shadow-md ${
                dragOverIndex === index ? 'border-blue-400' : 'border-gray-300'
              }`}
            >
              <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                {token.text}
              </span>
            </div>
          ))}
        </div>
      </Card>

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
    switch (currentData?.type) {
      case 'basic':
        return renderBasicQuiz();
      case 'sentence':
        return renderSentenceQuiz();
      case 'construction':
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

  const isLast = currentQuestionIndex === totalQuestions - 1;
  const isFirst = currentQuestionIndex === 0;
  const isCorrectSelected =
    selectedAnswer && selectedAnswer === currentData?.correct_answer;

  return (
    <div className="min-w-full lg:min-w-2xl max-w-3xl mx-auto p-4 sm:p-6">
      <div className="sticky top-2 z-20">
        <div className="rounded-2xl border border-gray-200/60 bg-white/90 dark:bg-neutral-900/70 backdrop-blur shadow-sm p-4">
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
      </div>

      <div className="mt-4">
        {quizData && <Card className="p-4 sm:p-6">{renderQuiz()}</Card>}
      </div>

      <div className="sticky bottom-2 mt-6 z-20">
        <div className="rounded-2xl border border-gray-200/60 bg-white/90 dark:bg-neutral-900/70 backdrop-blur shadow-sm p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={isFirst}
              className="gap-1"
            >
              <ChevronLeft className="size-4" /> 이전
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={isLast}
              className="gap-1"
            >
              다음 <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {currentData?.type === 'ordering' ? (
              <Button onClick={revealResult} className="px-4">
                정답 확인
              </Button>
            ) : (
              <Button
                onClick={revealResult}
                disabled={!selectedAnswer}
                className="px-4"
              >
                정답 확인
              </Button>
            )}

            {showResult && (
              <Badge
                className={[
                  'text-sm',
                  isCorrectSelected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800',
                ].join(' ')}
              >
                {isCorrectSelected ? '정답' : '오답'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 원문 구 버전(주석) UI 블록 보존 */}
      {/*
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {currentQuestion?.question}
          </h2>
          <p className="text-lg text-gray-600 mb-1">
            [{currentQuestion?.pinyin}]
          </p>
        </div>
        <div className="space-y-3">
          {currentQuestion?.choices.map((answer, index) => (
            <button
              key={answer.id}
              onClick={() => handleChoiceSelect(answer.id, answer.text)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all cursor-pointer ${
                selectedChoice?.id === answer.id
                  ? 'bg-blue-100'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium text-gray-700">
                {String.fromCharCode(65 + index)}. {answer.text}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleNextQuestion}
          disabled={!selectedChoice?.id || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium flex items-center ${
            selectedChoice?.id && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <p>제출 중...</p>
          ) : currentQuestionIndex === (quizData?.total_questions || 0) - 1 ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              퀴즈 완료
            </>
          ) : (
            '다음 문제'
          )}
        </Button>
      </div>
      */}
    </div>
  );
};

export default ClientQuizPage;
