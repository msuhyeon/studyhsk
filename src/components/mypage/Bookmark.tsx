'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  const { bookmarks, count } = await response.json();

  if (!response.ok) {
    throw new Error(bookmarks?.error || '북마크를 불러오는데 실패했습니다.');
  }

  return { bookmarks, count } as { bookmarks: BookmarkType[]; count: number };
}

const Bookmark = ({ limit = 3 }: { limit?: number } = {}) => {
  // TypeScript 타입 추론과 displayName (디버깅 시 이름) 때문에 공식 예제들이 대부분 async function으로 작성 돼 있음
  // const로 선언 시 스택트레이스에서 함수 이름이 익명으로 보이거나 최적화가 덜 되는 경우가 있었음
  const { data, isLoading, isError } = useQuery({
    queryKey: ['bookmarks', limit],
    queryFn: () => fetchBookmarks(limit),
    staleTime: 1000 * 60, // 1분 간 캐시 유효 (1분 안에 재렌더링되면 API 호출안함)
    gcTime: 1000 * 60 * 5, // 5분간 캐시 메모리에 유지
    retry: 2,
  });

  const { bookmarks = [], count = 0 } = data || {};

  return (
    <Card className="h-[450px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star fill="#facc15" stroke="#facc15" />
          <span>북마크한 단어</span>
        </CardTitle>
        <CardDescription>저장한 단어들을 복습하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">
                북마크를 불러오는데 실패했습니다.
              </div>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">북마크된 단어가 없습니다.</div>
            </div>
          ) : (
            <div className="space-y-3 h-full overflow-y-auto">
              {bookmarks.map((item, index) => (
                <div
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  key={index}
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {item.words.word}
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        {item.words.pinyin}
                      </span>
                      {/* TODO: 어떻게 표현할지 고민 */}
                      {/* <span className="text-sm text-gray-600 ml-2">
                            {item.words.part_of_speech}
                          </span> 
                      */}
                    </div>
                  </div>
                  <div className="textdkrktbansfklskdffjslksdjffflslskdfjflf-sm text-gray-600">
                    {item.words.meaning}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">총 {count}개 단어</span>
            {count > 3 && (
              <Button variant="outline" className="w-27">
                <Link href="/mypage/bookmarks" className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>전체 보기</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Bookmark;
