import ClientQuizResult from '@/components/quiz/ClientQuizResult';

type Props = {
  params: {
    id: string;
  };
};

const QuizResultPage = async ({ params }: Props) => {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <ClientQuizResult quizId={id} />
    </div>
  );
};

export default QuizResultPage;
