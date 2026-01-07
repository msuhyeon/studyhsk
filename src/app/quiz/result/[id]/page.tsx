import ClientQuizResult from '@/features/quiz/ClientQuizResult';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function QuizResultPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <ClientQuizResult quizId={id} />
    </div>
  );
}
