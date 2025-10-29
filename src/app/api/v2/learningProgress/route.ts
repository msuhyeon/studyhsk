import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: userInfo, error: userError } = await supabase.auth.getUser();

    if (userError || !userInfo) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('learning_progress')
      .select(
        `
        level,
        started_at,
        completed_at
      `
      )
      .eq('learning_status', 'studying')
      .single();

    if (error) {
      console.error(`[ERROR]: GET learning progress ${error.message}`);
      throw error;
    }

    return NextResponse.json({
      success: true,
      learningProgress: data,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error: '학습 진행 상황 조회에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
