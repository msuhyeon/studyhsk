import ClientQuizPage from '@/components/quiz/ClientQuizPage';

type Props = {
  params: {
    level: string;
  };
};

const QuizLevelPage = async ({ params }: Props) => {
  const { level } = await params;

  return <ClientQuizPage level={level} />;
};

export default QuizLevelPage;
