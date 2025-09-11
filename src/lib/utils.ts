import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const formattedSeconds = seconds % 60;

  return `${minutes}:${formattedSeconds.toString().padStart(2, '0')}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  // 잘못된 입력에 대한 예외처리
  if (isNaN(d.getDate())) {
    console.error('Invalid date format: ', date);
    return 'Invalid Date';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}
