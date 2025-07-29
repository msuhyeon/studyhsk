// 단순한 UI이고 카드 아이템마다 삭제/상세보기 버튼에 대한 이벤트 필요한 상태
// hydration 비용이 크지 않을 듯 하여 client component로 생성함
'use client';

import { useState, useCallback } from 'react';
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
import { User } from '@supabase/supabase-js';

type BookmarkType = {
  word: string;
  part_of_speech: string;
  pinyin: string;
  meaning: string;
  level: string;
  id: string;
};

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const fetchAllBookmarks = useCallback(async () => {
    if (!user) return;

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
      .eq('bookmarks.user_id', user.id);

    if (error) {
      console.error('북마크 데이터 조회 실패: ', error.message);
      toast.error('전체 단어 조회 실패. 다시 시도해주세요.');
    } else {
      setBookmarks(data);
    }
  }, [user]);

  useEffect(() => {
    const initUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data.user);

      if (error) {
        toast.error('사용자 정보를 찾을 수 없습니다. 다시 로그인 해주세요.');
        console.error('사용자 정보 조회 실패: ', error.message);
      }
    };

    initUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllBookmarks();
    }
  }, [user, fetchAllBookmarks]);

  const handleDelete = async (wordId: string) => {
    const { id: userId } = user || {};

    if (userId) {
      deleteBookmarks(wordId, userId);
    }
  };

  const deleteBookmarks = async (wordId: string, userId: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .select();

    if (!error) {
      toast.success('북마크에서 삭제되었습니다.');
      fetchAllBookmarks();
    } else {
      toast.error('북마크에서 삭제되지 않았습니다. 다시 시도해주세요!');
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {bookmarks.map((item) => {
        return (
          <Card className="w-full max-w-sm h-sm" key={item.id}>
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
              <Button variant="outline" onClick={() => handleDelete(item.id)}>
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
