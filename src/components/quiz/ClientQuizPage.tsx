'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Choice = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  question: string;
  pinyin: string;
  choices: Choice[];
  correct_answer: string;
};

type QuizData = {
  level: string;
  total_questions: number;
  questions: Question[];
};

type UserAnswer = {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
};

type Props = {
  level: string;
};

const ClientQuizPage = ({ level }: Props) => {
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch(`/api/quiz/${level}?count=5`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '퀴즈를 불러오는데 실패했습니다.');
        }

        setQuizData(data);
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

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
  };

  const handleNextQuestion = () => {
    if (!selectedChoice || !quizData) return;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = selectedChoice === currentQuestion.correct_answer;
    const userAnswer: UserAnswer = {
      question_id: currentQuestion.id,
      selected_answer: selectedChoice,
      is_correct: isCorrect,
    };

    setUserAnswers((data) => [...data, userAnswer]);
    setSelectedChoice('');

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((data) => data + 1);
    } else {
      handleQuizComplete([...userAnswers, userAnswer]);
    }
  };

  const handleQuizComplete = async (finalAnswers: UserAnswer[]) => {
    if (!quizData) return;

    setIsSubmitting(true);

    try {
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );
      const correctCount = finalAnswers.filter(
        (answer) => answer.is_correct
      ).length;
      const score = Math.round((correctCount / quizData.total_questions) * 100);
      const quizResult = {
        level,
        total_questions: quizData.total_questions,
        correct_answers: correctCount,
        score,
        duration,
        answers: finalAnswers,
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

      // 결과 페이지로 이동
      router.push(`/quiz/result/${result.quiz_id}`);
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
          <div className="text-red-500 text-xl mb-4">
            퀴즈를 불러올 수 없습니다
          </div>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / quizData.total_questions) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-gray-600">
          <Clock className="w-5 h-5 mr-2" />
          HSK {level}급 퀴즈
        </div>
      </div>
      {/* 진행 상황 */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            문제 {currentQuestionIndex + 1} / {quizData.total_questions}
          </span>
          <span>{Math.round(progress)}% 완료</span>
        </div>
        <Progress value={progress} />
      </div>
      {/* 문제 */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {currentQuestion.question}
          </h2>
          <p className="text-lg text-gray-600 mb-1">
            [{currentQuestion.pinyin}]
          </p>
        </div>
        <div className="space-y-3">
          {currentQuestion.choices.map((answer, index) => (
            <button
              key={answer.id}
              onClick={() => handleChoiceSelect(answer.id)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all cursor-pointer ${
                selectedChoice === answer.id
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
          disabled={!selectedChoice || isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium flex items-center ${
            selectedChoice && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <p>제출 중...</p>
          ) : currentQuestionIndex === quizData.total_questions - 1 ? (
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
