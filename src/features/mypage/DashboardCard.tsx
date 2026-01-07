'use client';

import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export interface DashboardCardItem {
  id?: string;
  [key: string]: unknown;
}

export interface DashboardCardProps<T extends DashboardCardItem> {
  title: string;
  description: string;
  titleIcon: ReactNode;
  data: T[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  renderItem: (item: T, index: number) => ReactNode;
  emptyState: {
    icon: ReactNode;
    message: string;
  };
  viewAllLink?: {
    href: string;
    label: string;
  };
  countLabel: string;
  displayLimit?: number;
}

export default function DashboardCard<T extends DashboardCardItem>({
  title,
  description,
  titleIcon,
  data,
  isLoading,
  error,
  totalCount,
  renderItem,
  emptyState,
  viewAllLink,
  countLabel,
  displayLimit = 3,
}: DashboardCardProps<T>) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <CardContent className="relative">
          <div className="space-y-3 h-64">
            {Array.from({ length: displayLimit }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg h-[72px]"
              >
                <div>
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              {viewAllLink && (
                <Button variant="outline" className="w-27">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>{viewAllLink.label}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      );
    }

    if (error) {
      return (
        <CardContent className="relative h-64">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-2xl mb-2">⚠️</span>
            <p className="text-gray-700 whitespace-pre-line text-sm">{error}</p>
          </div>
        </CardContent>
      );
    }

    if (data.length === 0) {
      return (
        <CardContent className="relative h-64">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {emptyState.icon}
            </div>
            <p className="text-gray-500 text-sm whitespace-pre-line">
              {emptyState.message}
            </p>
          </div>
        </CardContent>
      );
    }

    return (
      <CardContent className="relative">
        <div className="space-y-3 h-64 overflow-y-auto">
          {data.map((item, index) => renderItem(item, index))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{countLabel}</span>
            {viewAllLink && totalCount > displayLimit && (
              <Button variant="outline" className="w-27">
                <Link href={viewAllLink.href} className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>{viewAllLink.label}</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    );
  };

  return (
    <Card className="h-[450px]">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {titleIcon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {renderContent()}
    </Card>
  );
}
