import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

type Props = {
  params: Promise<{
    level: string;
  }>;
};

type QuestionType = 'basic' | 'sentence' | 'ordering' | 'situation';

interface WordRecord {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
}

interface OrderingToken {
  id: string;
  text: string;
}

interface OrderingQuestion {
  word_id: string;
  type: 'ordering' | 'ordering';
  question: string;
  tokens: OrderingToken[];
  initial_order: string[];
  correct_order: string[];
  correct_sentence?: string;
  translation?: string;
}

interface ChoiceQuestion {
  word_id: string;
  type: 'basic' | 'sentence' | 'situation';
  question: string;
  options?: string[];
  correct_answer?: string;
  pinyin?: string;
  sentence?: string;
  marked_sentence?: string;
  situation?: string;
  word_display?: string;
}

type GeneratedQuestion = OrderingQuestion | ChoiceQuestion;

interface OpenAIResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
}

interface ParsedContent {
  question_text?: string;
  question?: string;
  // ordering 용
  type?: string;
  tokens?: OrderingToken[];
  initial_order?: string[];
  correct_order?: string[];
  correct_sentence?: string;
  translation?: string;
  // choice 용
  options?: string[];
  correct_answer?: string;
  // sentence/situation 용
  pinyin?: string;
  sentence?: string;
  sentence_raw?: string;
  marked_sentence?: string;
  situation?: string;
  word_display?: string;
}

function getQuestionType(index: number): QuestionType {
  if (index <= 2) return 'basic';
  if (index <= 6) return 'sentence';
  if (index <= 8) return 'ordering';
  return 'situation';
}

function buildPrompt(
  type: QuestionType,
  word: string,
  pinyin: string,
  meaning: string
): string {
  const templates = {
    basic: `단어: ${word}, 병음: ${pinyin}, 의미: ${meaning}
          한자를 보고 뜻을 맞히는 기초 문제를 JSON 형식으로 만들어주세요:
          - 정답: 주어진 단어의 의미
          - 오답 3개: 비슷한 품사이지만 다른 의미의 한국어 단어들
          **중요**: options 배열에서 정답의 위치를 랜덤하게 배치해주세요.

          응답 형식:
          {
            "question_text": "다음 한자의 의미는?",
            "word_display": "${word}",
            "pinyin": "${pinyin}",
            "options": ["정답", "오답1", "오답2", "오답3"],
            "correct_answer": "정답"
          }`,
    sentence: `단어: ${word}, 병음: ${pinyin}, 의미: ${meaning}
              문장 속에서 단어의 의미를 파악하는 문제를 JSON 형식으로 만들어주세요:
              - 주어진 단어가 정확히 1회 포함된 자연스러운 중국어 문장 작성 (10-15자)
              - 일상생활 상황의 문장
              - 정답: 주어진 단어의 의미
              - 오답 3개: 문맥상 헷갈릴 수 있는 비슷한 의미의 단어들
              - 하이라이트 표기는 문자열 내에 대괄호로 감싼 형태로 고정합니다: [${word}]
              - "sentence_raw": 하이라이트 없이 원문 문장
              - "marked_sentence": 타겟 단어만 정확히 한 번 [${word}]로 감싼 문장 (기타 마크업 금지)
              **중요**: options 배열에서 정답의 위치를 랜덤하게 배치해주세요.

              응답 형식:
              {
                "question_text": "다음 문장에서 하이라이트된 단어의 의미는?",
                "sentence_raw": "중국어 문장에 ${word} 포함",
                "marked_sentence": "중국어 문장에 [${word}] 포함",
                "pinyin": "문장 병음(선택)",
                "options": ["정답", "오답1", "오답2", "오답3"],
                "correct_answer": "정답"
              }`,
    ordering: `단어: ${word}, 병음: ${pinyin}, 의미: ${meaning}
              단어 순서 배열(드래그앤드롭) 문제를 JSON 형식으로 만들어주세요.
              반드시 아래 요구사항과 응답 스키마를 정확히 지키세요:
              - 주어진 단어 "${word}"가 반드시 포함된 자연스러운 중국어 문장을 만드세요 (4~6 토큰 권장)
              - 각 토큰은 고유한 id를 가진 객체 형태로 제공합니다. 예: { "id": "t1", "text": "他" }
              - 정답 순서를 correct_order(토큰 id 배열)로 제공합니다. 예: ["t1","t2","t3","t4"]
              - initial_order에는 같은 토큰 id들을 무작위로 섞어 제공합니다(클라이언트 초기 배치용)
              - correct_sentence(정답 문장)와 translation(한국어 번역)을 함께 제공합니다
              - 응답에는 options, correct_answer 필드를 포함하지 마세요

              응답 형식(JSON 객체, 키 고정):
              {
                "type": "ordering",
                "question_text": "다음 단어들을 올바른 순서로 배열하세요:",
                "tokens": [ { "id": "t1", "text": "단어1" }, { "id": "t2", "text": "단어2" }, { "id": "t3", "text": "단어3" }, { "id": "t4", "text": "단어4" } ],
                "initial_order": ["t3", "t1", "t4", "t2"],
                "correct_order": ["t1", "t2", "t3", "t4"],
                "correct_sentence": "올바른 문장",
                "translation": "한국어 번역"
              }`,
    situation: `단어: ${word}, 병음: ${pinyin}, 의미: ${meaning}
                상황별 표현 선택 문제를 JSON 형식으로 만들어주세요:
                - 구체적인 상황 설명 (일상생활, 학교, 직장 등)
                - 주어진 단어가 포함된 자연스러운 표현을 정답으로 설정
                - 오답 3개: 문법적으로 가능하지만 상황에 부자연스러운 표현들
                **중요**: options 배열에서 정답의 위치를 랜덤하게 배치해주세요.

                응답 형식:
                {
                  "question_text": "다음 상황에서 가장 자연스러운 표현은?",
                  "situation": "구체적인 상황 설명",
                  "options": ["정답 표현", "오답1", "오답2", "오답3"],
                  "correct_answer": "정답 표현"
                }`,
  } as const;

  return templates[type];
}

export async function GET(request: NextRequest, { params }: Props) {
  // Next.js 15부터 params가 Promise로 변경됨!!
  const { level } = await params;
  const { data: rawWords, error: wordsError } = await supabase.rpc(
    'get_random_words',
    { level, count: 10 }
  );
  if (wordsError) {
    console.error(`[ERROR] SELECT Quiz: ${wordsError}`);
    throw wordsError;
  }

  const allWords = (rawWords ?? []) as WordRecord[];
  if (allWords.length < 1) {
    return NextResponse.json(
      { error: '퀴즈로 출제할 단어가 없습니다.' },
      { status: 400 }
    );
  }

  try {
    const systemPrompt =
      '당신은 전문적인 HSK 중국어 학습 문제 출제자입니다.\n' +
      '학습자의 수준에 맞는 효과적인 문제를 제작하며, 항상 JSON 형식으로만 응답합니다.';

    async function generateOne(
      word: WordRecord,
      index: number
    ): Promise<GeneratedQuestion> {
      const questionType = getQuestionType(index);
      const userPrompt = buildPrompt(
        questionType,
        word.word,
        word.pinyin,
        word.meaning
      );

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`OpenAI API error: ${res.status} ${text}`);
      }

      const result = (await res.json()) as OpenAIResponse;
      const content = result?.choices?.[0]?.message?.content;
      if (!content) throw new Error('모델 응답 없음');

      let parsed: ParsedContent;
      try {
        parsed = JSON.parse(content) as ParsedContent;
      } catch {
        throw new Error('모델 JSON 파싱 실패');
      }

      const questionText =
        (typeof parsed.question_text === 'string' && parsed.question_text) ||
        (typeof parsed.question === 'string' && parsed.question) ||
        '';

      if (questionType === 'ordering') {
        return {
          word_id: word.id,
          type: 'ordering',
          question: questionText,
          tokens: parsed.tokens ?? [],
          initial_order: parsed.initial_order ?? [],
          correct_order: parsed.correct_order ?? [],
          correct_sentence: parsed.correct_sentence,
          translation: parsed.translation,
        };
      }

      // choice
      return {
        word_id: word.id,
        type: questionType,
        question: questionText,
        options: parsed.options ?? [],
        correct_answer: parsed.correct_answer ?? undefined,
        pinyin: parsed.pinyin ?? undefined,
        sentence: parsed.sentence ?? parsed.sentence_raw ?? undefined,
        marked_sentence: parsed.marked_sentence ?? undefined,
        situation: parsed.situation ?? undefined,
        word_display: parsed.word_display ?? undefined,
      };
    }

    const results = await Promise.allSettled(
      allWords.map((w, idx) => generateOne(w, idx))
    );

    const questions = results
      .filter(
        (r): r is PromiseFulfilledResult<GeneratedQuestion> =>
          r.status === 'fulfilled'
      )
      .map((r) => r.value);

    if (questions.length === 0) {
      return NextResponse.json({ error: '문제 생성 실패' }, { status: 500 });
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('[ERROR] Quiz generate:', error);
    return NextResponse.json({ error: '문제 생성 실패' }, { status: 500 });
  }
}
