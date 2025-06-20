import ClientWordDetail from '@/components/word/ClientWordDetail';

type Props = {
  params: {
    id: string;
  };
};

// 서버 컴포넌트: 파라미터만 전달
const WordDetailPage = async ({ params }: Props) => {
  const { id } = await params;

  return (
    <section className="w-full p-6 bg-white">
      <ClientWordDetail wordId={id} />
    </section>
  );
};

export default WordDetailPage;
