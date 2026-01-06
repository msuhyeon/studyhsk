import ClientWordDetail from '@/features/word/ClientWordDetail';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// 서버 컴포넌트: 파라미터만 전달
export default async function WordDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <section className="w-full p-0 md:p-6 bg-white">
      <ClientWordDetail wordId={id} />
    </section>
  );
}
