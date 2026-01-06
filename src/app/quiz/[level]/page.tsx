import ClientQuizPage from '@/features/quiz/ClientQuizPage';
import Link from 'next/link';

type Props = {
  params: Promise<{
    level: string;
  }>;
};

export default async function QuizLevelPage({ params }: Props) {
  const { level } = await params;

  // 4급, 5급, 6급은 아직 데이터가 없음
  if (['4', '5', '6'].includes(level)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <div className="text-xl text-center">
          {level}급 퀴즈를 준비 중이에요. 조금만 기다려주세요😅
        </div>
        <div className="text-gray-600 text-center">
          현재 1급, 2급, 3급 퀴즈만 이용 가능합니다.
        </div>
        <Link
          href="/"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return <ClientQuizPage level={level} />;
}
