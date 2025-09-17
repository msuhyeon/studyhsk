import { NextRequest, NextResponse } from 'next/server';

type Props = {
  params: Promise<{
    level: string;
    word: string;
    pinyin: string;
    meaning: string;
    index: number;
  }>;
};

function getQuestionType(index: number) {
  if (index <= 2) return 'basic';
  if (index <= 6) return 'sentence';
  if (index <= 8) return 'construction';
  return 'situation';
}

function buildPrompt(
  type: string,
  word: string,
  pinyin: string,
  meaning: string
) {
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
    - 주어진 단어가 포함된 자연스러운 중국어 문장 작성 (10-15자)
    - 일상생활 상황의 문장
    - 정답: 주어진 단어의 의미
    - 오답 3개: 문맥상 헷갈릴 수 있는 비슷한 의미의 단어들
    **중요**: options 배열에서 정답의 위치를 랜덤하게 배치해주세요.

    응답 형식:
    {
      "question_text": "다음 문장에서 밑줄 친 단어의 의미는?",
      "sentence": "중국어 문장 (밑줄 친 단어는 **${word}**로 표시)",
      "options": ["정답", "오답1", "오답2", "오답3"],
      "correct_answer": "정답"
    }`,
    construction: `단어: ${word}, 병음: ${pinyin}, 의미: ${meaning}

    단어 배열 문제를 JSON 형식으로 만들어주세요:
    - 주어진 단어를 포함한 4-6개 단어로 자연스러운 중국어 문장 구성
    - 일상적이면서 문법적으로 올바른 구조
    - 배열할 단어들과 정답 문장 제시
    **중요**: options 배열에서 정답의 위치를 랜덤하게 배치해주세요.

    응답 형식:
    {
      "question_text": "다음 단어들을 올바른 순서로 배열하세요:",
      "scrambled_words": ["단어1", "단어2", "단어3", "단어4"],
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
  };

  return templates[type as keyof typeof templates];
}
export async function GET(request: NextRequest, { params }: Props) {
  const { level } = await params;

  // db에서 단어 정보 가져와서 openai api 호출 시 사용
  // level, word, pinyin, meaning, index

  const questionType = getQuestionType(index);
  const userPrompt = buildPrompt(questionType, word, pinyin, meaning);

  const systemPrompt = `당신은 전문적인 HSK 중국어 학습 문제 출제자입니다. 
    학습자의 수준에 맞는 효과적인 문제를 제작하며, 항상 JSON 형식으로 응답합니다.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    const result = await res.json();
    const content = result?.choices[0]?.message?.content;

    const parsedContent = JSON.parse(content);
    return NextResponse.json(parsedContent);
  } catch (error) {
    return NextResponse.json({ error: '문제 생성 실패' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Props) {
  const { level } = await params;

  // TODO: 퀴즈 생성 요청 처리 로직 구현
  return NextResponse.json({
    message: `Level ${level} quiz creation - to be implemented`,
  });
}
