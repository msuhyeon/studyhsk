import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PrimaryContentSection() {
  const contents = [
    {
      title: 'AI가 만든 예문·동의어로 맥락 학습',
      subtitle: `AI가 단어의 의미를 분석해
        자연스러운 예문과 함께
        유의어·반의어·동의어까지
        한 번에 이해할 수 있도록 제공합니다.`,
    },
    {
      title: 'AI 퀴즈로 바로 복습',
      subtitle: `AI가 다양한 유형의
        10가지 퀴즈를 자동 생성해
        실제 시험처럼 반복 학습할 수 있습니다.`,
    },
    {
      title: '학습 결과를 한눈에',
      subtitle: `잘 외워지지 않는 단어는
        북마크로 저장하고,
        퀴즈 결과와 오답 내역은
        마이페이지에서 한눈에 확인하세요.`,
    },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto py-20 grid grid-cols-1 md:grid-cols-3 gap-10">
      {contents.map((content, index) => (
        <Card className="w-full min-h-[300px] py-10" key={`card-${index}`}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-left">
              <Badge variant="secondary" className="mr-3">
                Step {index + 1}
              </Badge>
              {content.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left">{content.subtitle}</CardContent>
        </Card>
      ))}
    </div>
  );
}
