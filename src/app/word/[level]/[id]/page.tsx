import ClientWordDetail from '@/features/word/ClientWordDetail';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { WordData } from '@/types/word';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WordDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: wordInfo, error } = await supabase
    .from('words')
    .select(
      `
      *,
      examples!word_id (
        sentence,
        meaning,
        pinyin,
        context
      ),
      word_relations!word_id (
        word,
        meaning,
        pinyin,
        relation_type
      ),
      bookmarks!word_id (
        id,
        user_id
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !wordInfo) {
    if (error) console.error('Error fetching word detail:', error);
    return notFound();
  }

  const isBookmarked = !!(
    wordInfo.bookmarks &&
    Array.isArray(wordInfo.bookmarks) &&
    wordInfo.bookmarks.length > 0
  );

  const initialData: WordData = {
    ...wordInfo,
    examples: wordInfo.examples || [],
    word_relations: wordInfo.word_relations || [],
    is_bookmarked: isBookmarked,
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto py-10 lg:py-15">
      <ClientWordDetail wordId={id} initialData={initialData} />
    </div>
  );
}
