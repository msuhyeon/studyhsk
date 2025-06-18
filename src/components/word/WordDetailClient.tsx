'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Link, Copy } from 'lucide-react';
import { toast } from 'sonner';
import Bookmark from '@/components/Bookmark';
import PlayAudioButton from '@/components/word/PlayAudioButton';
import HanziWriter from '@/components/word/HanziWriter';
import WordDetailSkeleton from './WordDetailSkeleton';

type ExampleType = {
  sentence: string;
  meaning: string;
  pinyin: string;
  context: string;
};

type AIGeneratedType = {
  examples: ExampleType[];
  synonyms: RelationWordType[];
  antonyms: RelationWordType[];
};

type RelationWordType = {
  word: string;
  meaning: string;
  pinyin: string;
  relation_type?: RelationType;
};

type RelationType = 'synonym' | 'antonym';

type WordData = {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  part_of_speech: string;
  examples: ExampleType[];
  word_relations: RelationWordType[];
};

type WordDetailProps = {
  wordId: string;
};

// 클라이언트 컴포넌트: 데이터 페칭 및 UI 렌더링
const WordDetailClient = ({ wordId }: WordDetailProps) => {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWordData = async () => {
      try {
        // 1. 기본 단어 데이터 가져오기
        const { data, error } = await supabase
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
            )
          `
          )
          .eq('id', wordId);

        if (error || !data || data.length === 0) {
          throw new Error('단어를 찾을 수 없습니다.');
        }

        const wordInfo = data[0];

        // 2. 오디오 URL 가져오기
        const audioRes = await fetch(
          `https://pinyin-word-api.vercel.app/api/${wordInfo.word}`
        );
        const audioData = await audioRes.json();
        setAudioUrl(audioData.url);

        let examples = wordInfo.examples || [];
        let synonyms =
          wordInfo.word_relations?.filter(
            (rel: RelationWordType) => rel.relation_type === 'synonym'
          ) || [];
        let antonyms =
          wordInfo.word_relations?.filter(
            (rel: RelationWordType) => rel.relation_type === 'antonym'
          ) || [];

        // 3. DB에 없을 경우 AI로 데이터 생성
        if (
          examples.length === 0 ||
          synonyms.length === 0 ||
          antonyms.length === 0
        ) {
          const generatedData = await generateAIData(wordInfo.word);

          if (examples.length === 0) {
            await insertExamples(generatedData.examples, wordId);
            examples = generatedData.examples;
          }

          if (synonyms.length === 0 || antonyms.length === 0) {
            await insertWordRelations(
              generatedData.synonyms,
              generatedData.antonyms,
              wordId
            );
            synonyms = generatedData.synonyms;
            antonyms = generatedData.antonyms;
          }
        }

        setWordData({
          ...wordInfo,
          examples,
          word_relations: [...synonyms, ...antonyms],
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '데이터를 불러올 수 없습니다.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWordData();
  }, [wordId]);

  const generateAIData = async (word: string): Promise<AIGeneratedType> => {
    const res = await fetch(`/api/word/${word}`);
    const aiGenerated = await res.json();
    return aiGenerated;
  };

  const insertExamples = async (examples: ExampleType[], wordId: string) => {
    const exampleRows = examples.map((ex: ExampleType) => ({
      word_id: wordId,
      sentence: ex.sentence,
      meaning: ex.meaning,
      pinyin: ex.pinyin,
      context: ex.context,
    }));

    const { error } = await supabase.from('examples').insert(exampleRows);
    if (error) {
      console.error('[ERROR] INSERT examples:', error);
    }
  };

  const insertWordRelations = async (
    synonyms: RelationWordType[],
    antonyms: RelationWordType[],
    wordId: string
  ) => {
    const synonymRows = synonyms.map((value) => ({
      word_id: wordId,
      word: value.word,
      meaning: value.meaning,
      pinyin: value.pinyin,
      relation_type: 'synonym' as const,
    }));

    const antonymRows = antonyms.map((value) => ({
      word_id: wordId,
      word: value.word,
      meaning: value.meaning,
      pinyin: value.pinyin,
      relation_type: 'antonym' as const,
    }));

    const { error } = await supabase
      .from('word_relations')
      .insert([...synonymRows, ...antonymRows]);

    if (error) {
      console.error('[ERROR] INSERT word_relations:', error);
    }
  };

  if (loading) {
    return <WordDetailSkeleton />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!wordData) {
    return <div className="text-center">데이터를 찾을 수 없습니다.</div>;
  }

  const synonyms =
    wordData.word_relations?.filter((rel) => rel.relation_type === 'synonym') ||
    [];

  const antonyms =
    wordData.word_relations?.filter((rel) => rel.relation_type === 'antonym') ||
    [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wordData.word);
      toast.success('단어를 복사했어요. 다른 곳에 붙여넣어 보세요!');
    } catch (err) {
      console.error('[ERROR] Failed copy:', err);
      toast.error('복사에 실패했어요. 다시 시도해 주세요.');
    }
  };
  return (
    <>
      <div className="text-center mb-8">
        <HanziWriter characters={wordData.word.split('')} />
        <div className="text-2xl text-gray-600 mb-2">[{wordData.pinyin}]</div>
        <div className="text-xl text-gray-700 mb-4">
          {wordData.meaning} <span>{wordData.part_of_speech}</span>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          <Bookmark />
          <PlayAudioButton audioUrl={audioUrl} />
          <button
            className=" rounded-full p-2 transition duration-300 hover:bg-gray-100 hover:opacity-100 opacity-90"
            onClick={handleCopy}
          >
            <Copy />
          </button>
        </div>
      </div>
      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="w-full h-15">
          <TabsTrigger value="examples">
            <BookOpen className="w-4 h-4 inline mr-2" />
            예문 활용
          </TabsTrigger>
          <TabsTrigger value="related">
            <Link className="w-4 h-4 inline mr-2" />
            연관 단어
          </TabsTrigger>
        </TabsList>
        <TabsContent value="examples">
          {wordData.examples && wordData.examples.length > 0 && (
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                예문으로 학습하기
              </h3>
              {wordData.examples.map((example, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors mb-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {example.sentence}
                      </div>
                      <div className="text-gray-600 mb-2">{example.pinyin}</div>
                      <div className="text-gray-800 font-medium">
                        {example.meaning}
                      </div>
                    </div>
                    {/* TODO: 예문 발음 듣기 시 TTS 필요*/}
                    {/* <PlayAudioButton audioUrl={audioUrl} /> */}
                  </div>
                  <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                    💡 {example.context}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="related">
          <div className="p-4">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                동의어/유의어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {synonyms.map((word, index) => (
                  <div
                    key={index}
                    className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {word.word}
                        </div>
                        <div className="text-gray-600 text-sm">
                          [{word.pinyin}]
                        </div>
                        <div className="text-gray-800 font-medium">
                          {word.meaning}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 반대/대조 단어 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                반대/대조 단어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {antonyms.map((word, index) => (
                  <div
                    key={index}
                    className="bg-red-50 rounded-lg p-4 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {word.word}
                        </div>
                        <div className="text-gray-600 text-sm">
                          [{word.pinyin}]
                        </div>
                        <div className="text-gray-800 font-medium">
                          {word.meaning}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default WordDetailClient;
