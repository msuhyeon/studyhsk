// 단순한 UI이고 카드 아이템마다 삭제/상세보기 버튼에 대한 이벤트 필요한 상태
// hydration 비용이 크지 않을 듯 하여 client component로 생성함
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

type Props = {
  params: {
    level: string;
    id: string;
  };
};

const BookmarksPage = ({ params }: Props) => {
  const { level, id } = params;
  const handleDelete = () => {};

  return (
    <div>
      <Card className="w-full max-w-sm h-sm">
        <CardHeader>
          <CardTitle>한자</CardTitle>
          <CardDescription>명사</CardDescription>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleDelete}>
            삭제
          </Button>
          <Button asChild>
            <Link href={`word/${level}/${id}`}>상세보기</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookmarksPage;
