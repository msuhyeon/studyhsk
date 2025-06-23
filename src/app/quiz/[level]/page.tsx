import ClientQuizPage from '@/components/quiz/ClientQuizPage';

type Props = {
  params: {
    level: string;
  };
};

const QuizLevelPage = ({ params }: Props) => {
  const { level } = params;

  return <ClientQuizPage level={level} />;
};

export default QuizLevelPage;
