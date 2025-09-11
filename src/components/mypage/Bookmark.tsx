'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import DashboardCard from './DashboardCard';

type WordsType = {
  word: string;
  pinyin: string;
  part_of_speech: string;
  meaning: string;
};

type BookmarkType = {
  words: WordsType;
  count: number;
};

// API 호출 함수 (React Query에서 사용할 fetcher)
async function fetchBookmarks(limit: number) {
  const response = await fetch(`/api/bookmark?limit=${limit}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(
      errorResponse?.error || '북마크를 불러오는데 실패했습니다.'
    );
  }

  const { bookmarks, count } = await response.json();

  return { bookmarks, count } as { bookmarks: BookmarkType[]; count: number };
}

const Bookmark = ({ limit = 3 }: { limit?: number } = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookmarks', limit],
    queryFn: () => fetchBookmarks(limit),
    staleTime: 1000 * 60, // 1분 간 캐시 유효 (1분 안에 재렌더링되면 API 호출안함)
    gcTime: 1000 * 60 * 5, // 5분간 캐시 메모리에 유지
    retry: 2,
  });

  const { bookmarks = [], count = 0 } = data || {};

  const renderBookmarkItem = (item: BookmarkType, index: number) => (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg h-[72px]"
      key={index}
    >
      <div>
        <div className="font-semibold text-gray-900">{item.words.word}</div>
        <div>
          <span className="text-sm text-gray-600">{item.words.pinyin}</span>
        </div>
      </div>
      <div className="text-sm text-gray-600 max-w-32 truncate">
        {item.words.meaning}
      </div>
    </div>
  );

  return (
    <DashboardCard
      title="북마크한 단어"
      description="저장한 단어들을 복습하세요"
      titleIcon={<Star fill="#facc15" stroke="#facc15" className="w-5 h-5" />}
      data={bookmarks}
      isLoading={isLoading}
      error={error?.message || null}
      totalCount={count}
      renderItem={renderBookmarkItem}
      emptyState={{
        icon: <Star className="w-6 h-6 text-gray-400" />,
        message: '북마크된 단어가 없습니다.\n단어를 북마크해보세요! 🔖',
      }}
      viewAllLink={{
        href: '/mypage/bookmarks',
        label: '전체 보기',
      }}
      countLabel={`총 ${count}개 단어`}
      displayLimit={limit}
    />
  );
};

export default Bookmark;
