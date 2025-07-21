'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
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

const Bookmark = ({ limit = 3 }: { limit?: number } = {}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    // TypeScript 타입 추론과 displayName (디버깅 시 이름) 때문에 공식 예제들이 대부분 async function으로 작성 돼 있음
    // const로 선언 시 스택트레이스에서 함수 이름이 익명으로 보이거나 최적화가 덜 되는 경우가 있었음
    async function getBookmarks() {
      const response = await fetch(`/api/bookmark?limit=${limit}`, {
        cache: 'no-cache',
        method: 'GET',
      });
      const { bookmarks, count } = await response.json();

      if (!response.ok) {
        throw new Error(bookmarks.error || '북마크를 불러오는데 실패했습니다.');
      }

      setBookmarks(bookmarks);
      setTotalWords(count);
    }

    getBookmarks();
  }, [limit]);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star fill="#facc15" stroke="#facc15" />
          <span>북마크한 단어</span>
        </CardTitle>
        <CardDescription>저장한 단어들을 복습하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* 단어 미리보기 */}
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
                  </span> */}
                </div>
              </div>
              <div className="textdkrktbansfklskdffjslksdjffflslskdfjflf-sm text-gray-600">
                {item.words.meaning}
              </div>
            </div>
          ))}
          {/* <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-semibold text-gray-900">学习</div>
              <div className="text-sm text-gray-600">xué xí</div>
            </div>
            <div className="text-sm text-gray-600">학습하다</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-semibold text-gray-900">朋友</div>
              <div className="text-sm text-gray-600">péng yǒu</div>
            </div>
            <div className="text-sm text-gray-600">친구</div>
          </div> */}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              총 {totalWords}개 단어
            </span>
            {totalWords > 3 && (
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
