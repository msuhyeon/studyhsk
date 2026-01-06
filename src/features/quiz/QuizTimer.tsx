'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

type Props = {
  startTime: number | null;
};

export default function QuizTimer({ startTime }: Props) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  return (
    <div className="flex items-center text-gray-600">
      <Clock className="w-4 h-4 mr-1" />
      {/* ES8: .padStart() 첫번째 인자에서 받은 length만큼 문자열 채움 */}
      {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}
