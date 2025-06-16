import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { hanzi: string } }
) {
  console.log('안와?ㅆ다는거자나??');

  const hanzi = params.hanzi;
  const systemPrompt =
    '너는 중국어 교육 플랫폼의 콘텐츠 생성 도우미야. 입력된 한자 단어를 바탕으로 예문과 한국어로 해석된 문장을 만들어줘.';
  const userPrompt = `
    단어: ${hanzi}
    요구사항:
    1. 단어를 활용한 예문 2가지 작성 (예문에는 해당 단어가 반드시 포함되어야 함)
    2. 각 예문에 대한 자연스러운 한국어 해석
    3. 해당 단어의 비슷한 뜻을 가진 단어들(유의어) 2개 제시
    4. 해당 단어의 반대/대조되는 뜻의 단어들(반의어) 1~2개 제시
    5. 유의어, 반의어 단어의 한국어 해석도 같이 제시
    6. 예시 output format 
    
    examples: [  
      {
        sentence: '我没有时间去购物。',
        pinyin: 'Wǒ méiyǒu shíjiān qù gòuwù.',
        translation: '나는 쇼핑 갈 시간이 없다.'
      },
    ]

  문장은 HSK 단어 범위 내에서 최대한 구성하며, 일상적인 상황을 반영한 예문이면 더욱 좋아. 번역은 직역보다는 자연스러운 의역을 우선해줘.
  출력은 반드시 코드블럭(\`\`\`json 등) 없이, JSON 문자열 형태만 출력해줘.
  `;

  // const res = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-3.5-turbo',
  //     messages: [
  //       { role: 'system', content: systemPrompt },
  //       { role: 'user', content: userPrompt },
  //     ],
  //     temperature: 0.7,
  //   }),
  // });

  const res = {
    id: 'chatcmpl-BiyMwxWcTbHBxhrLLoxDRba0wGSgk',
    object: 'chat.completion',
    created: 1750058190,
    model: 'gpt-3.5-turbo-0125',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: {
            word: '喝',
            examples: [
              {
                sentence: '他喜欢喝茶，每天都要喝几杯。',
                translation: '그는 차를 좋아해서 매일 몇 잔씩 마셔요.',
              },
              {
                sentence: '晚上喝牛奶有助于睡眠。',
                translation: '저녁에 우유를 마시면 잠을 잘 수 있어요.',
              },
            ],
            synonyms: ['饮', '饮用'],
            antonyms: ['吐'],
          },
          refusal: null,
          annotations: [],
        },
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
    service_tier: 'default',
    system_fingerprint: null,
  };

  const content = res.choices[0].message.content;

  try {
    return NextResponse.json(content);
  } catch (error) {
    console.error(`JSON 파싱 실패: ${error}`);
  }
}
