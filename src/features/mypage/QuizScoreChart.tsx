import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';
import { QuizType } from '@/types/quiz';

export default function QuizScoreChart({
  quizHistory,
}: {
  quizHistory: QuizType[];
}) {
  // 차트 데이터 변환: 날짜순 정렬 및 점수 계산
  const chartData = [...quizHistory]
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .map((quiz) => ({
      name: new Date(quiz.created_at).toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
      }),
      score: Math.round((quiz.correct_count / quiz.total_questions) * 100),
      level: quiz.level,
    }));

  return (
    <div className="w-full max-w-[700px] h-[70vh] max-h-[500px] flex flex-col gap-4">
      <span className="text-lg font-bold">퀴즈 성적 분석</span>
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(
                value: number,
                name: string,
                props: { payload: { level: number } }
              ) => [`${value}점`, `${props.payload.level}급`]}
              labelStyle={{ color: '#333' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              name="점수"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <RechartsDevtools />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
