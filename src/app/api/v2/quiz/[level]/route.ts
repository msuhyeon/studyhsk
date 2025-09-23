import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

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
  // TODO: 마지막 문제는 hanzi-writer 라이브러리 이용 예정, 3번 이상 틀릴 시 틀린 문제로 처리
  // if (index <= 9) return 'writing'
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
      "question_text": "다음 문장에서 대괄호로 표시된 단어의 의미는?",
      "sentence_raw": "중국어 문장에 ${word} 포함",
      "marked_sentence": "중국어 문장에 [${word}] 포함",
      "pinyin": "문장 병음(선택)",
      "options": ["정답", "오답1", "오답2", "오답3"],
      "correct_answer": "정답"
    }`,
    construction: `단어: ${word}, 병음: ${pinyin}, 의미: ${meaning}

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
    writing: `단어: ${word}, 병음: ${pinyin}, 의미: ${meaning}
    `,
  };

  return templates[type as keyof typeof templates];
}
export async function GET(request: NextRequest, { params }: Props) {
  const { level } = await params;
  // const { searchParams } = new URL(request.url);

  const { data: allWords, error } = await supabase.rpc('get_random_words', {
    level: level,
    count: 10,
  });

  if (error) {
    console.error(`[ERROR] SELECT Quiz: ${error}`);
    throw error;
  }

  if (!allWords || allWords.length < 1) {
    return NextResponse.json(
      { error: '퀴즈로 출제할 단어가 없습니다.' },
      { status: 400 }
    );
  }

  // db에서 단어 정보 가져와서 openai api 호출 시 사용
  // level, word, pinyin, meaning, index
  try {
    const systemPrompt = `당신은 전문적인 HSK 중국어 학습 문제 출제자입니다.\n학습자의 수준에 맞는 효과적인 문제를 제작하며, 항상 JSON 형식으로만 응답합니다.`;

    async function generateOne(word: any, index: number) {
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
          'Accept-Encoding': 'identity',
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

      const result = await res.json();
      const content = result?.choices?.[0]?.message?.content;
      if (!content) throw new Error('모델 응답 없음');
      const parsedContent = JSON.parse(content);

      if (questionType === 'construction') {
        return {
          word_id: word.id,
          type: parsedContent.type ?? 'ordering',
          question: parsedContent.question_text,
          tokens: parsedContent.tokens,
          initial_order: parsedContent.initial_order,
          correct_order: parsedContent.correct_order,
          correct_sentence: parsedContent.correct_sentence,
          translation: parsedContent.translation,
        };
      }

      return {
        word_id: word.id,
        type: questionType,
        question: parsedContent.question_text,
        options: parsedContent.options,
        correct_answer: parsedContent.correct_answer,
        pinyin: parsedContent.pinyin,
        sentence: parsedContent.sentence ?? parsedContent.sentence_raw,
        marked_sentence: parsedContent.marked_sentence,
        situation: parsedContent.situation,
        word_display: parsedContent.word_display,
      };
    }

    const results = await Promise
      .allSettled
      // allWords.map((word: any, idx: number) => generateOne(word, idx))
      ();

    // const questions = results
    //   .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    //   .map((r) => r.value);

    // if (questions.length === 0) {
    //   return NextResponse.json({ error: '문제 생성 실패' }, { status: 500 });
    // }

    // return NextResponse.json(questions);

    // 위에 주석 처리된게 진짜 코드!
    return NextResponse.json([
      {
        word_id: 'a47c63b0-aef6-4a63-ba63-289e04f27524',
        type: 'basic',
        question: '다음 한자의 의미는?',
        options: ['기실 사실', '사실상', '진실', '사실적인'],
        correct_answer: '기실 사실',
        pinyin: 'qíshí',
        sentence: undefined,
        marked_sentence: undefined,
        situation: undefined,
        word_display: '其实',
      },
      {
        word_id: 'ac0091e2-fa75-415e-99aa-addcbc99074d',
        type: 'basic',
        question: '다음 한자의 의미는?',
        options: ['이모', '어머니', '아주머니', '할머니'],
        correct_answer: '아주머니',
        pinyin: 'āyí',
        sentence: undefined,
        marked_sentence: undefined,
        situation: undefined,
        word_display: '阿姨',
      },
      {
        word_id: '0a8ed132-53b2-41b9-98f8-52450dcdb511',
        type: 'basic',
        question: '다음 한자의 의미는?',
        options: ['비행하다', '도착하다', '이륙하다', '착륙하다'],
        correct_answer: '이륙하다',
        pinyin: 'qǐfēi',
        sentence: undefined,
        marked_sentence: undefined,
        situation: undefined,
        word_display: '起飞',
      },
      {
        word_id: '81b87119-c154-491d-a49f-010bfa2484c0',
        type: 'sentence',
        question: '다음 문장에서 대괄호로 표시된 단어의 의미는?',
        options: ['나무 수목', '꽃', '草', '灌木'],
        correct_answer: '나무 수목',
        pinyin: 'gōngyuán lǐ yǒu hěnduō gāodà de shù.',
        sentence: '公园里有很多高大的树。',
        marked_sentence: '公园里有很多高大的 [树]。',
        situation: undefined,
        word_display: undefined,
      },
      {
        word_id: 'c4461165-a6f5-49d1-8823-d5e8417b8e8d',
        type: 'sentence',
        question: '다음 문장에서 대괄호로 표시된 단어의 의미는?',
        options: ['늘 언제나', '자주', '가끔', '때때로'],
        correct_answer: '늘 언제나',
        pinyin: 'Wǒ [zǒngshì] zài túshūguǎn xuéxí zhōngwén.',
        sentence: '我[总是]在图书馆学习中文。',
        marked_sentence: '我[总是]在图书馆学习中文。',
        situation: undefined,
        word_display: undefined,
      },
      {
        word_id: '8cdad292-d3ab-4b92-943a-76d05ba92fe9',
        type: 'sentence',
        question: '다음 문장에서 대괄호로 표시된 단어의 의미는?',
        options: ['케이크', '과자', '빵', '쿠키'],
        correct_answer: '케이크',
        pinyin: 'jīntiān shì wǒ de shēngrì, wǒ xiǎng yào yīgè [dàngāo]。',
        sentence: '今天是我的生日，我想要一个[蛋糕]。',
        marked_sentence: '今天是我的生日，我想要一个[蛋糕]。',
        situation: undefined,
        word_display: undefined,
      },
      {
        word_id: 'd95bfb82-75fe-4bd7-947c-7359aa716ba9',
        type: 'sentence',
        question: '다음 문장에서 대괄호로 표시된 단어의 의미는?',
        options: ['아마', '확실히', '반드시', '절대로'],
        correct_answer: '아마',
        pinyin: 'Míngtiān [kěnéng] huì xià yǔ.',
        sentence: '明天[可能]会下雨。',
        marked_sentence: '明天[可能]会下雨。',
        situation: undefined,
        word_display: undefined,
      },
      {
        word_id: '349d6f80-201f-44ff-b7a0-45b7e4488956',
        type: 'ordering',
        question: '다음 단어들을 올바른 순서로 배열하세요:',
        tokens: [[Object], [Object], [Object], [Object]],
        initial_order: ['t2', 't4', 't1', 't3'],
        correct_order: ['t1', 't2', 't3', 't4'],
        correct_sentence: '我决定去旅行',
        translation: '나는 여행을 가기로 결정했다',
      },
      {
        word_id: 'e1fe7dc6-5ece-4661-af1e-9f00d8819315',
        type: 'ordering',
        question: '다음 단어들을 올바른 순서로 배열하세요:',
        tokens: [[Object], [Object], [Object], [Object]],
        initial_order: ['t3', 't1', 't4', 't2'],
        correct_order: ['t1', 't2', 't3', 't4'],
        correct_sentence: '我喜欢玩游戏。',
        translation: '나는 게임을 하는 것을 좋아한다.',
      },
      {
        word_id: 'f86562a7-1e29-4724-ab6f-06676d242ab9',
        type: 'situation',
        question: '다음 상황에서 가장 자연스러운 표현은?',
        options: [
          '学生们进教室了。',
          '我进了教室的门。',
          '老师进教室的时候。',
          '他们进教室很快。',
        ],
        correct_answer: '学生们进教室了。',
        pinyin: undefined,
        sentence: undefined,
        marked_sentence: undefined,
        situation:
          '학교에서 수업이 시작되기 전에 학생들이 교실 안으로 들어오고 있습니다.',
        word_display: undefined,
      },
    ]);
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
