'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Loader2Icon,
  RotateCcw,
  XCircle,
  Volume2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import QuizTimer from './QuizTimer';

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
  type: string;
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
  const [quizData, setQuizData] = useState<QuizData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedChoice, setSelectedChoice] =
    useState<SelectedAnswerType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

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
  const [currentData, setCurrentData] = useState<QuizData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [draggedTokens, setDraggedTokens] = useState([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentData(quizData[currentQuestionIndex]);
  }, [quizData, currentQuestionIndex]);

  const handleDragStart = (e, id) => {};
  const handleDragOver = (e, index) => {};
  const handleDrop = (e, index) => {};
  const handleAnswerSelect = (option) => {};
  const clickNextButton = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const renderBasicQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {currentData?.question}
        </h2>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-6">
          <div className="text-6xl font-bold text-gray-800 mb-3">
            {currentData?.word_display}
          </div>
          <div className="flex items-center justify-center space-x-2 text-lg text-gray-600">
            <span>{currentData?.pinyin}</span>
            <button className="p-1 hover:bg-white rounded-full transition-colors">
              <Volume2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentData?.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`p-4 text-left rounded-lg border-2 transition-all duration-300 ${
              selectedAnswer === option
                ? option === currentData?.correct_answer
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-red-50 border-red-500 text-red-800'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
            disabled={showResult}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option}</span>
              {showResult && option === currentData?.correct_answer && (
                <CheckCircle className="text-green-600" size={20} />
              )}
              {showResult &&
                selectedAnswer === option &&
                option !== currentData?.correct_answer && (
                  <XCircle className="text-red-600" size={20} />
                )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSentenceQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {currentData?.question}
        </h2>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {currentData?.marked_sentence &&
              currentData?.marked_sentence
                .split(/(\[.*?\])/)
                .map((part, index) =>
                  part.startsWith('[') && part.endsWith(']') ? (
                    <span
                      key={index}
                      className="bg-yellow-300 px-2 py-1 rounded"
                    >
                      {part.slice(1, -1)}
                    </span>
                  ) : (
                    part
                  )
                )}
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <span>{currentData?.pinyin}</span>
            <button className="p-1 hover:bg-white rounded-full transition-colors">
              <Volume2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentData?.options &&
          currentData?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                selectedAnswer === option
                  ? option === currentData?.correct_answer
                    ? 'bg-green-50 border-green-500 text-green-800'
                    : 'bg-red-50 border-red-500 text-red-800'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              disabled={showResult}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option}</span>
                {showResult && option === currentData?.correct_answer && (
                  <CheckCircle className="text-green-600" size={20} />
                )}
                {showResult &&
                  selectedAnswer === option &&
                  option !== currentData?.correct_answer && (
                    <XCircle className="text-red-600" size={20} />
                  )}
              </div>
            </button>
          ))}
      </div>
    </div>
  );

  const renderConstructionQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {currentData?.question}
        </h2>
        <div className="text-gray-600 mb-6">
          단어를 드래그하여 올바른 문장을 만드세요
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 min-h-[120px]">
        <div className="flex flex-wrap gap-2 justify-center">
          {draggedTokens.map((token, index) => (
            <div
              key={token.id}
              draggable
              onDragStart={(e) => handleDragStart(e, token.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white border-2 rounded-lg p-3 cursor-move shadow-sm transition-all hover:shadow-md ${
                dragOverIndex === index ? 'border-blue-400' : 'border-gray-300'
              }`}
            >
              <span className="text-xl font-medium text-gray-800">
                {token.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            const isCorrect = checkOrderCorrect();
            setShowResult(true);
            setSelectedAnswer(isCorrect ? 'correct' : 'incorrect');
          }}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          정답 확인
        </button>
      </div>

      {showResult && (
        <div
          className={`text-center p-4 rounded-lg ${
            selectedAnswer === 'correct'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            {selectedAnswer === 'correct' ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <XCircle className="text-red-600" size={24} />
            )}
            <span className="font-bold">
              {selectedAnswer === 'correct' ? '정답입니다!' : '틀렸습니다!'}
            </span>
          </div>
          <div className="text-lg font-medium mb-1">
            {currentData?.correct_sentence}
          </div>
          <div className="text-sm">{currentData?.translation}</div>
        </div>
      )}
    </div>
  );

  const renderSituationQuiz = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {currentData?.question_text}
        </h2>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
          <div className="text-lg font-medium text-gray-800">
            {currentData?.situation}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentData?.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`p-4 text-left rounded-lg border-2 transition-all duration-300 ${
              selectedAnswer === option
                ? option === currentData?.correct_answer
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : 'bg-red-50 border-red-500 text-red-800'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
            disabled={showResult}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-lg">{option}</span>
              {showResult && option === currentData?.correct_answer && (
                <CheckCircle className="text-green-600" size={20} />
              )}
              {showResult &&
                selectedAnswer === option &&
                option !== currentData?.correct_answer && (
                  <XCircle className="text-red-600" size={20} />
                )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderQuiz = () => {
    switch (currentQuiz) {
      case 'basic':
        return renderBasicQuiz();
      case 'sentence':
        return renderSentenceQuiz();
      case 'construction':
        return renderConstructionQuiz();
      case 'situation':
        return renderSituationQuiz();
      default:
        return renderBasicQuiz();
    }
  };

  return (
    <div className="min-w-full lg:min-w-2xl max-w-2xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">HSK 퀴즈</h1>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Level 3
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* 퀴즈 내용 */}
        {quizData && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {renderQuiz()}
          </div>
        )}
        {/* <div className="flex items-center justify-between mb-6">
        <h1 className="title">HSK {level}급 퀴즈</h1>
        <QuizTimer startTime={startTime} />
      </div>
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            문제 {currentQuestionIndex + 1} / {quizData?.total_questions}
          </span>
          <span>{Math.ceil(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>
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
      </div> */}
      </div>
    </div>
  );
};

export default ClientQuizPage;
