import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Link } from 'lucide-react';

export default function WordDetailSkeleton() {
  return (
    <>
      <div className="text-center mb-8">
        {/* Hanziwirter */}
        <div className="mb-6">
          <div className="h-48 bg-gray-200 animate-pulse rounded-lg mx-auto w-full max-w-md"></div>
        </div>
        {/* 발음 */}
        <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mx-auto mb-2"></div>
        {/* 의미 */}
        <div className="h-6 bg-gray-200 animate-pulse rounded w-64 mx-auto mb-4"></div>
        {/* 버튼 */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
          <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
          <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full"></div>
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
          <div className="p-4">
            <div className="h-6 bg-gray-200 animate-pulse rounded w-40 mb-4"></div>
            {/* 예문 */}
            {[1, 2].map((index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 mb-5">
                <div className="mb-3">
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3"></div>
                </div>
                <div className="h-6 bg-blue-100 animate-pulse rounded-full w-32"></div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="related">
          <div className="p-4">
            {/* 동의어 */}
            <div className="mb-5">
              <div className="h-6 bg-gray-200 animate-pulse rounded w-32 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-4">
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
            {/* 반의어 */}
            <div>
              <div className="h-6 bg-gray-200 animate-pulse rounded w-36 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1].map((index) => (
                  <div key={index} className="bg-red-50 rounded-lg p-4">
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
