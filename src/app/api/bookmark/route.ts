import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { wordId } = await request.json();

  try {
    const { data: userInfo, error: userError } = await supabase.auth.getUser();

    if (userError || !userInfo) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { error } = await supabase.from('bookmarks').insert({
      user_id: userInfo.user.id,
      word_id: wordId,
    });

    if (error) {
      console.error(`[ERROR]: INSERT bookmarks ${error.message}`);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '북마크에 추가되었습니다.',
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: '북마크 저장에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { wordId } = await request.json();

  try {
    const { data: userInfo, error: userError } = await supabase.auth.getUser();

    if (userError || !userInfo) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('word_id', wordId)
      .eq('user_id', userInfo.user.id);
   
    if (error) {
      console.error(`[ERROR]: DELETE bookmarks ${error.message}`);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: '북마크가 삭제되었습니다.',
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: '북마크 삭제에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
