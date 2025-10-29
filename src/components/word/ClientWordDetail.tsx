'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Link, Copy, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
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
  is_bookmarked?: boolean;
};

type WordDetailProps = {
  wordId: string;
};

// 클라이언트 컴포넌트: 데이터 페칭 및 UI 렌더링
const ClientWordDetail = ({ wordId }: WordDetailProps) => {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);
  const hasGeneratedData = useRef(false);

  const partOfSpeechMap: { [key: string]: string } = {
    명: '명사 (Noun)',
    동: '동사 (Verb)',
    형: '형용사 (Adjective)',
    부: '부사 (Adverb)',
    대: '대명사 (Pronoun)',
    수: '수사 (Numeral)',
    양: '양사 (Measure word)',
    개: '개사 (Preposition)',
    조: '조사 (Particle)',
    연: '연결어 (Conjunction)',
  };

  useEffect(() => {
    hasGeneratedData.current = false;
    setHasAttemptedGeneration(false);
    setIsGeneratingExamples(false);

    const getPinyinAudio = async (wordInfo: WordData) => {
      try {
        const response = await fetch(
          `https://pinyin-word-api.vercel.app/api/${wordInfo.word}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const audioRes = await response.json();
        setAudioUrl(audioRes.url);
      } catch (error) {
        console.error('API 호출 에러:', error);
        // TODO: audio file이 404 일 경우엔 openAI tts 서비스를 이용해서 생성 할 수 있도록 수정 예정.(pinyin을 넘겨줘야함)
        // toast.info('현재 발음을 들을 수 없어요. 잠시 후 다시 시도해주세요.🙇');
      }
    };

    const fetchWordData = async () => {
      try {
        // 1. 기본 단어 데이터 가져오기 (북마크 정보 포함)
        const {
          data: { user },
        } = await supabase.auth.getUser();

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
          .eq('id', wordId)
          .single();

        if (error || !wordInfo) {
          throw new Error('단어를 찾을 수 없습니다.');
        }

        const isBookmarked = !!(user && wordInfo.bookmarks);

        // 2. 오디오 URL 가져오기
        getPinyinAudio(wordInfo);

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
          !hasGeneratedData.current &&
          (examples.length === 0 ||
            synonyms.length === 0 ||
            antonyms.length === 0)
        ) {
          hasGeneratedData.current = true;
          setIsGeneratingData(true);
          const generatedData = await generateAIData(wordInfo.word);

          if (examples.length === 0) {
            setIsGeneratingExamples(true);
            await insertExamples(generatedData.examples, wordId);
            examples = generatedData.examples;
            setIsGeneratingExamples(false);
          }

          if (synonyms.length === 0 && antonyms.length === 0) {
            await insertWordRelations(
              generatedData.synonyms,
              generatedData.antonyms,
              wordId
            );
            synonyms = generatedData.synonyms.map((s) => ({
              ...s,
              relation_type: 'synonym' as const,
            }));
            antonyms = generatedData.antonyms.map((a) => ({
              ...a,
              relation_type: 'antonym' as const,
            }));
          }
          setIsGeneratingData(false);
          setHasAttemptedGeneration(true);
        }

        setWordData({
          ...wordInfo,
          examples,
          word_relations: [...synonyms, ...antonyms],
          is_bookmarked: isBookmarked,
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
    const res = await fetch(`/api/v1/word/${word}`);
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
        <div className="text-xl text-gray-700 mb-4 flex justify-center items-center gap-2">
          {wordData.meaning} ({wordData.part_of_speech})
          <Tooltip>
            <TooltipTrigger className="text-sm font-medium text-gray-600">
              <Info width={18} />
            </TooltipTrigger>
            <TooltipContent>
              {partOfSpeechMap[wordData.part_of_speech]}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          <Bookmark id={wordId} isBookmarked={wordData.is_bookmarked} />
          {audioUrl && <PlayAudioButton audioUrl={audioUrl} />}
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
            <BookOpen className="w-4 h-3 md:h-4 inline mr-2" />
            예문 활용
          </TabsTrigger>
          <TabsTrigger value="related">
            <Link className="w-4 h-3 md:h-4 inline mr-2" />
            연관 단어
          </TabsTrigger>
        </TabsList>
        <TabsContent value="examples">
          <div className="p-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
              예문으로 학습하기
            </h3>
            {/* TODO: 예문의 병음을 알 수 있는 기능을 추가 고민 */}
            {isGeneratingExamples ? (
              // 예문 생성 중 스켈레톤 UI
              <>
                {[1, 2].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-6 mb-5 animate-pulse"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
                        <div className="h-5 bg-gray-200 rounded w-4/5"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-32"></div>
                  </div>
                ))}
                <div className="text-center text-sm text-gray-500 mt-4">
                  AI가 예문을 생성하고 있어요...
                </div>
              </>
            ) : wordData.examples && wordData.examples.length > 0 ? (
              // 예문이 있을 때
              wordData.examples.map((example, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors mb-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="md:text-lg font-medium text-gray-900 mb-2">
                        {example.sentence}
                      </div>
                      <div className="text-sm md:text-md text-gray-600 mb-2">
                        {example.pinyin}
                      </div>
                      <div className="text-sm md:text-md text-gray-800">
                        {example.meaning}
                      </div>
                    </div>
                    {/* TODO: 예문 발음 듣기 시 TTS 필요*/}
                    {/* <PlayAudioButton audioUrl={audioUrl} /> */}
                  </div>
                  <div className="text-xs md:text-sm text-blue-600 bg-blue-50 px-2 py-1 md:px-3 md:py-1 rounded-full inline-block">
                    💡 {example.context}
                  </div>
                </div>
              ))
            ) : (
              // 예문이 없을 때
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-2">📚</div>
                <p className="text-gray-600">예문이 준비되지 않았어요</p>
                <p className="text-sm text-gray-500 mt-1">
                  곧 AI가 예문을 생성할 예정이에요
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="related">
          <div className="p-4">
            {isGeneratingData ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  AI가 관련 단어를 생성하고 있어요...
                </p>
              </div>
            ) : (
              <>
                {/* 동의어/유의어 */}
                <div className="mb-8">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
                    동의어/유의어
                  </h3>
                  {synonyms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {synonyms.map((word, index) => (
                        <div
                          key={index}
                          className="bg-sky-50 rounded-lg p-4 hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-gray-800">
                              {word.word}
                            </span>
                            <span className="text-sm text-gray-500">
                              [{word.pinyin}]
                            </span>
                          </div>
                          <div className="mt-1 text-base font-medium text-gray-800">
                            {word.meaning}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : hasAttemptedGeneration ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-gray-400 mb-2">🤷‍♂️</div>
                      <p className="text-gray-600">
                        이 단어에는 동의어가 없어요
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        일부 단어는 동의어를 찾기 어려울 수 있어요
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-gray-400 mb-2">📝</div>
                      <p className="text-gray-600">
                        동의어가 준비되지 않았어요
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        곧 AI가 관련 단어를 생성할 예정이에요
                      </p>
                    </div>
                  )}
                </div>
                {/* 반의어 */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    반의어
                  </h3>
                  {antonyms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {antonyms.map((word, index) => (
                        <div
                          key={index}
                          className="bg-amber-50 rounded-lg p-4 hover:bg-amber-100 transition-colors cursor-pointer"
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
                  ) : hasAttemptedGeneration ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-600">
                        이 단어에는 반의어가 없어요🤔
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        숫자나 고유명사 등은 반의어가 없을 수 있어요
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <div className="text-gray-400 mb-2">🔄</div>
                      <p className="text-gray-600">
                        반의어가 준비되지 않았어요
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        곧 AI가 관련 단어를 생성할 예정이에요
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ClientWordDetail;
