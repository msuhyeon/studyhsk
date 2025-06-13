'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ErrorFallback from '@/components/ErrorFallback';

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

const ClientWordList = ({ level }: { level: number }) => {
  const [words, setWords] = useState<WordType[]>([]);

  useEffect(() => {
    const fetchWords = async () => {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('level', level)
        .range(28, 999);

      if (error) {
        console.error('단어 조회 실패:', error);
        <ErrorFallback />;
      } else {
        setWords(data || []);
      }
    };

    fetchWords();
  }, [level]);

  return (
    <>
      {words.map((word) => (
        <Link key={word.id} href={`/word/${level}/${word.id}`}>
          <Card className="hover:bg-sky-100">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl">{word.word}</CardTitle>
              <CardDescription className="text-xl">
                [{word.pinyin}]
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {word.meaning}
              <span className="text-blue-400">{word.part_of_speech}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  );
};

export default ClientWordList;
