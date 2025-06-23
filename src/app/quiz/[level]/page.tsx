import ClientQuizPage from '@/components/quiz/ClientQuizPage';

type Props = {
  params: {
    level: string;
  };
};

const QuizLevelPage = ({ params }: Props) => {
  const { level } = params;

  return (
    <div className="min-h-screen">
      <ClientQuizPage level={level} />
    </div>
  );
};

export default QuizLevelPage;
