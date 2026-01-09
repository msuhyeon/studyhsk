import ClientQuizPage from '@/features/quiz/ClientQuizPage';
import EmptyContent from '@/features/empty/EmptyContent';

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
      <EmptyContent
        title="퀴즈가 준비되지 않았어요."
        content={`${level}급 퀴즈를 준비 중이에요. 조금만 기다려주세요😅`}
      />
    );
  }

  return <ClientQuizPage level={level} />;
}
