import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Link } from 'lucide-react';
import Bookmark from '@/components/Bookmark';
import PlayAudioButton from '@/components/word/PlayAudioButton';
import HanziWriter from '@/components/word/HanziWriter';

// 클라이언트 컴포넌트: 상태관리 및 인터랙션
const WordDetailClient = ({
  audioUrl,
  data,
  aiGenerated,
}: {
  audioUrl: string;
  data: string[];
  aiGenerated: object;
}) => {
  return (
    <>
      <div className="text-center mb-8">
        <HanziWriter characters={data[0].word} />
        <div className="text-2xl text-gray-600 mb-2">[{data[0].pinyin}]</div>
        <div className="text-xl text-gray-700 mb-4">
          {data[0].meaning} <span>{data[0].part_of_speech}</span>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          <Bookmark />
          <PlayAudioButton audioUrl={audioUrl.url} />
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
          {aiGenerated.examples && (
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                예문으로 학습하기
              </h3>
              {aiGenerated.examples.map((example) => (
                <div
                  key={example}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors mb-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-lg font-medium text-gray-900 mb-2">
                        {example.chinese}
                      </div>
                      <div className="text-gray-600 mb-2">{example.pinyin}</div>
                      <div className="text-gray-800 font-medium">
                        {example.korean}
                      </div>
                    </div>
                    {/* TODO: 예문 발음 듣기 시 TTS 필요*/}
                    {/* <PlayAudioButton audioUrl={audioUrl.url} /> */}
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
            {/* 같은 한자 단어 */}
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                같은 한자가 들어간 단어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* {relatedWords.sameCharacter.map((word, index) => (
                  <div
                    key={index}
                    className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {word.hanzi}
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
                ))} */}
              </div>
            </div>
            {/* 유사한 뜻 단어 */}
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                비슷한 뜻의 단어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* {relatedWords.similar.map((word, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {word.hanzi}
                        </div>
                        <div className="text-gray-600 text-sm">
                          [{word.pinyin}]
                        </div>
                        <div className="text-gray-800 font-medium">
                          {word.meaning}
                        </div>
                      </div>
                      {/* <ArrowRight className="w-5 h-5 text-gray-400" /> */}
                    </div>
                  </div>
                ))} */}
              </div>
            </div>
            {/* 반대/대조 단어 */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                반대/대조 단어
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedWords.opposite.map((word, index) => (
                  <div
                    key={index}
                    className="bg-red-50 rounded-lg p-4 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {word.hanzi}
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
