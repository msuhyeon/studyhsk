'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import QuizTimer from './QuizTimer';

type Choice = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  word_id: string;
  question: string;
  pinyin: string;
  choices: Choice[];
  correct_answer: string;
};

type QuizData = {
  level: string;
  total_questions: number;
  quiz_type: string;
  attempt_id: string;
  questions: Question[];
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
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedChoice, setSelectedChoice] =
    useState<SelectedAnswerType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(`/api/quiz/${level}?count=2`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '퀴즈를 불러오는데 실패했습니다.');
        }

        setQuizData(data);
        setStartTime(Date.now());
      } catch (error) {
        console.error('[ERROR] Quiz fetch:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : '퀴즈를 불러오는데 실패했습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [level]);

  const handleChoiceSelect = (choiceId: string, text: string) => {
    setSelectedChoice({ id: choiceId, meaning: text });
  };
  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const progress = useMemo(
    () =>
      quizData
        ? ((currentQuestionIndex + 1) / quizData.total_questions) * 100
        : 0,
    [currentQuestionIndex, quizData]
  );

  const handleNextQuestion = () => {
    if (!selectedChoice || !quizData) return;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = selectedChoice.id === currentQuestion.word_id;
    const userAnswer: UserAnswer = {
      user_choice_id: selectedChoice.id,
      // selected_meaning: selectedChoice.meaning,
      question_word_id: currentQuestion.word_id,
      is_correct: isCorrect,
    };

    setUserAnswers((data) => [...data, userAnswer]);
    setSelectedChoice(null);

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((data) => data + 1);
    }
  };

  // userAnswers가 업데이트될 때마다 퀴즈 완료 여부 체크
  useEffect(() => {
    if (quizData && userAnswers.length === quizData.total_questions) {
      handleQuizComplete();
    }
  }, [userAnswers, quizData]);

  const handleQuizComplete = async () => {
    if (!quizData) return;

    setIsSubmitting(true);

    const finalAnswers = userAnswers;

    try {
      const correctCount = finalAnswers.filter(
        (answer) => answer.is_correct
      ).length;
      const score = Math.round((correctCount / quizData.total_questions) * 100);
      const duration = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0;
      const quizResult = {
        score,
        duration,
        ...quizData,
        questions: userAnswers,
      };

      const response = await fetch('/api/quiz/submit', {
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
  };

  // 스켈레톤 UI 적용 필요
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2Icon className="animate-spin" />
      </div>
    );
  }

  // 퀴즈가 없는 경우
  if (!quizData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-xl mb-4">퀴즈를 불러올 수 없습니다🫢</div>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  } else {
    if (quizData.questions.length < 1) {
      return (
        <div className="flex flex-col justify-center items-center min-h-screen gap-4">
          <div className="text-xl">
            {level}급 퀴즈를 준비 중 이에요. 조금만 기다려주세요😅
          </div>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      );
    }
  }

  return (
    <div className="min-w-full lg:min-w-2xl max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-gray-600">
          <Clock className="w-5 h-5 mr-2" />
          HSK {level}급 퀴즈
        </div>
        <QuizTimer startTime={startTime} />
      </div>
      {/* 진행 상황 */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            문제 {currentQuestionIndex + 1} / {quizData?.total_questions}
          </span>
          <span>{Math.ceil(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>
      {/* 문제 */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
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
    </div>
  );
};

export default ClientQuizPage;
