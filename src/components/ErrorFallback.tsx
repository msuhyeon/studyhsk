'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // shadcn/ui 쓰는 걸로 가정

type Props = {
  message?: string;
};

export default function ErrorFallback({ message }: Props) {
  const router = useRouter();

  useEffect(() => {
    console.error('ErrorFallback:', message);
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <h1 className="text-3xl font-bold mb-4">문제가 발생했어요 😥</h1>
      <p className="text-muted-foreground mb-6">
        {message ||
          '예기치 못한 오류가 발생했습니다. 나중에 다시 시도해주세요.'}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => router.refresh()}>새로고침</Button>
        <Button variant="outline" onClick={() => router.push('/')}>
          홈으로 가기
        </Button>
      </div>
    </div>
  );
}
