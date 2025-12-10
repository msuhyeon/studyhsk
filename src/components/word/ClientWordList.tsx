'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
// import ErrorFallback from '@/components/ErrorFallback';

interface WordType {
  id: string;
  word: string;
  pinyin: string;
  part_of_speech: string;
  meaning: string;
  level: number;
  examples: null;
  synonyms: null;
  antonyms: null;
}

const ClientWordList = ({
  wordList,
  level,
}: {
  wordList: WordType[];
  level: number;
}) => {
  const [allWords, setAllWords] = useState<WordType[]>([...wordList]);
  // const [newWords, setNewWords] = useState<WordType[]>([]);
  // const [showNewOnly, setShowNewOnly] = useState(false);
  // const [hasLoadedNewWords, setHasLoadedNewWords] = useState(false);

  // 누적된 급수의 단어 로드
  useEffect(() => {
    const fetchAllWords = async () => {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('level', level)
        .range(28, 999);

      if (error) {
        console.error('전체 단어 조회 실패:', error);
        toast.error('전체 단어 조회 실패. 다시 시도해주세요.');
      } else {
        setAllWords((prevWords) => [...prevWords, ...data]);
      }
    };

    fetchAllWords();
  }, [level]);

  // TODO: 다른 방법 찾아보기
  // 신규 단어만 로드 (eq) - Switch ON 시에만
  // useEffect(() => {
  //   if (showNewOnly && !hasLoadedNewWords) {
  //     const fetchNewWords = async () => {
  //       const { data, error } = await supabase
  //         .from('words')
  //         .select('*')
  //         .eq('level', level)
  //         .range(0, 999);

  //       if (error) {
  //         console.error('신규 단어 조회 실패:', error);
  //         toast.error('신규 단어 조회 실패. 다시 시도해주세요.');
  //       } else {
  //         setNewWords(data || []);
  //         setHasLoadedNewWords(true);
  //       }
  //     };

  //     fetchNewWords();
  //   }
  // }, [showNewOnly, level, hasLoadedNewWords]);

  return (
    <>
      {/* 데이터 핸들링이 힘들어서 삭제 필요 */}
      {/* <div className="flex items-center space-x-2 mb-5">
        <Switch
          id="new-word-mode"
          checked={showNewOnly}
          onCheckedChange={setShowNewOnly}
        />
        <Label className="text-lg" htmlFor="new-word-mode">
          {level}급 신규 단어만 보기
          {showNewOnly && `(${newWords.length}개)`}
        </Label>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* {(showNewOnly ? newWords : allWords).map((word, index) => ( */}
        {allWords.map((word, index) => (
          <Link key={`${word.id}${index}`} href={`/word/${level}/${word.id}`}>
            <Card className="hover:bg-sky-100">
              <CardHeader className="text-center px-0">
                <CardTitle className="text-3xl md:text-4xl">
                  {word.word}
                </CardTitle>
                <CardDescription className="text-xl">
                  [{word.pinyin}]
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm font-semibold">
                {word.meaning}
                <span className="text-blue-400 ml-1">
                  ({word.part_of_speech})
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
};

export default ClientWordList;
