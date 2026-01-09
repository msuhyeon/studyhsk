import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Dot } from 'lucide-react';

export default function PrimaryContentSection() {
  const contents = [
    {
      title: 'AI가 만든 예문·동의어로 맥락 학습',
      features: [
        '자연스러운 예문으로 단어 이해',
        '유의어·반의어·동의어 한눈에 파악',
        '맥락 속에서 실제 사용법 학습',
      ],
    },
    {
      title: 'AI 퀴즈로 바로 복습',
      features: [
        '다양한 유형의 퀴즈 자동 생성',
        '실제 시험처럼 반복 학습',
        '즉시 피드백으로 완벽 이해',
      ],
    },
    {
      title: '학습 결과를 한눈에',
      features: [
        '잘 외워지지 않는 단어 자동 체크',
        '퀴즈 결과와 오답 내역 확인',
        '마이페이지에서 한눈에 확인',
      ],
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-20 grid grid-cols-1 md:grid-cols-3 gap-10">
      {contents.map((content, index) => (
        <Card className="w-full min-h-[300px] py-10" key={`card-${index}`}>
          <CardHeader className="px-10">
            <CardTitle className="text-2xl font-bold text-left">
              <Badge
                variant="secondary"
                className="mr-3 bg-indigo-500 text-white text-base"
              >
                Step {index + 1}
              </Badge>
              <p className="mt-4">{content.title}</p>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left whitespace-pre-line px-10">
            <ul>
              {content.features.map((item, index) => (
                <li className="flex mb-1" key={index}>
                  <Dot />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
