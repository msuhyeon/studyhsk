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
