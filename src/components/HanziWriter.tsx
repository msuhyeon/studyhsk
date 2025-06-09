// TODO: 두글자를 한꺼번에 렌더링 한 뒤 한글자씩 순차적으로 애니메이션이 실행되도록 개선 필요
'use client';
import { useEffect } from 'react';
import HanziWriterLib from 'hanzi-writer';

const HanziWriter = ({ character }: { character: string }) => {
  useEffect(() => {
    const writer = HanziWriterLib.create('character-target', character, {
      width: 200,
      height: 200,
      padding: 5,
    });

    writer.animateCharacter();
  }, [character]);

  return <div className="flex justify-center" id="character-target"></div>;
};

export default HanziWriter;
