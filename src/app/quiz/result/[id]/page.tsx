import ClientQuizResult from '@/components/quiz/ClientQuizResult';

type Props = {
  params: {
    id: string;
  };
};

const QuizResultPage = ({ params }: Props) => {
  const { id } = params;

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientQuizResult quizId={id} />
    </div>
  );
};

export default QuizResultPage;