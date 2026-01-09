import Link from 'next/link';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Button } from '@/components/ui/button';

import { ArrowUpRightIcon } from 'lucide-react';
import { Hourglass } from 'lucide-react';

export default function EmptyContent({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Hourglass />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{content}</EmptyDescription>
      </EmptyHeader>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
        <Link href="/">
          홈으로 돌아가기 <ArrowUpRightIcon />
        </Link>
      </Button>
    </Empty>
  );
}
