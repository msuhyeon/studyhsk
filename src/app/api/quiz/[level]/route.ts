import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

type Props = {
  params: {
    level: string;
  };
};

export async function GET(request: NextRequest, { params }: Props) {
  const { level } = params;
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '10');

  try {
    // words 테이블에서 level의 단어를 랜덤하게 가져옴
    const { data: words, error } = await supabase
      .from('words')
      .select('id, word, meaning, pinyin')
      .eq('level', level)
      .limit(count * 4);

    if (error) {
      throw error;
    }

    if (!words) {
      return NextResponse.json(
        { error: '퀴즈로 출제할 단어가 없습니다.' },
        { status: 400 }
      );
    }

    const shuffledWords = words.sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords.slice(0, count);

    // 각 문제에 대해 선택지 생성
    const questions = selectedWords.map((word) => {
      // 정답을 제외한 나머지 단어들에서 3개 선택 (오답 선택지)
      const otherWords = shuffledWords.filter((w) => w.id !== word.id);
      const wrongAnswers = otherWords
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // 선택지 생성 (정답 + 오답 3개)
      const choices = [word, ...wrongAnswers]
        .sort(() => Math.random() - 0.5)
        .map((w) => ({
          id: w.id,
          text: w.meaning,
        }));

      return {
        id: word.id,
        question: word.word,
        pinyin: word.pinyin,
        choices,
        correct_answer: word.id,
      };
    });

    return NextResponse.json({
      level,
      total_questions: count,
      questions,
    });
  } catch (error) {
    console.error('[ERROR] Quiz API:', error);
    return NextResponse.json(
      { error: '퀴즈를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
