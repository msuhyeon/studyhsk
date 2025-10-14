import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getTotalQuizCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error counting quiz sessions:', error);
    return 0;
  }

  return count || 0;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { data: quizHistoryData, error: quizHistoryError } = await supabase
      .from('user_quiz_sessions')
      .select(
        `
            id,
            level,
            total_questions,
            correct_count,
            duration,
            created_at,
            user_quiz_answers!inner (
                session_id
            )
        `
      )
      .eq('user_id', user.id)
      .limit(limit);

    if (quizHistoryError) {
      throw quizHistoryError;
    }

    const totalCount = await getTotalQuizCount(await supabase, user.id);

    return NextResponse.json({
      quizHistory: quizHistoryData,
      totalCount,
    });
  } catch (error) {
    console.error('[ERROR] Quiz History API:', error);
    return NextResponse.json(
      { error: '결과를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
