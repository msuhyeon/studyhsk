// 단순한 UI이고 카드 아이템마다 삭제/상세보기 버튼에 대한 이벤트 필요한 상태
// hydration 비용이 크지 않을 듯 하여 client component로 생성함
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useEffect } from 'react';

type BookmarkType = {
  word: string;
  part_of_speech: string;
  meaning: string;
  level: string;
  id: string;
};

const BookmarksPage = () => {
  const [allBookmakrs, setBookmarks] = useState<BookmarkType[]>([]);
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      return user;
    };

    const fetchAllBookmarks = async () => {
      const user = await getUser();

      const { data, error } = await supabase
        .from('words')
        .select(
          `
            id,
            word, 
            pinyin, 
            part_of_speech, 
            meaning, 
            level,
            bookmarks!inner(word_id)
        `
        )
        .eq('bookmarks.user_id', user?.id);

      if (error) {
        console.error('북마크 데이터 조회 실패: ', error);
        toast.error('전체 단어 조회 실패. 다시 시도해주세요.');
      } else {
        setBookmarks(data);
      }
    };

    fetchAllBookmarks();
  }, []);

  const handleDelete = () => {};

  return (
    <div className="grid grid-cols-3 gap-4">
      {allBookmakrs.map((item, index) => {
        return (
          <Card className="w-full max-w-sm h-sm" key={index}>
            <CardHeader>
              <CardTitle>{item.word}</CardTitle>
              <CardDescription className="text-xs text-blue-600/75">
                {item.level}급
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-lg font-semibold mr-5">{item.meaning}</span>
              <span className="text-zinc-400">{item.part_of_speech}</span>
            </CardContent>
            <CardFooter className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleDelete}>
                삭제
              </Button>
              <Button asChild>
                <Link href={`/word/detail/${item.id}`}>상세보기</Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default BookmarksPage;
