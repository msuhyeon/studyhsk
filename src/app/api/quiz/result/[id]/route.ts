import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;

  try {
    const supabase = await createClient();

    const { data: quizData, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('level, score, correct_answers')
      .eq('id', id)
      .single();

    if (quizError) {
      throw quizError;
    }

    return NextResponse.json({
      quiz: quizData,
    });
  } catch (error) {
    console.error('[ERROR] Quiz result API:', error);
    return NextResponse.json(
      { error: '결과를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
