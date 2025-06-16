'use client';
import { useEffect } from 'react';
import HanziWriterLib from 'hanzi-writer';

const HanziWriter = ({ characters }: { characters: string[] }) => {
  useEffect(() => {
    const run = async () => {
      // 모든 한자 writer를 생성하는데
      const writers = [];

      for (let i = 0; i < characters.length; i++) {
        const targetId = `character-target-${i}`;
        const writer = HanziWriterLib.create(targetId, characters[i], {
          width: 200,
          height: 200,
          padding: 5,
          showCharacter: false, // 우선은 숨겨두고
          delayBetweenLoops: 3000,
        });

        writers.push(writer);
      }

      // 순차적으로 애니메이션 실행
      for (let i = 0; i < writers.length; i++) {
        await writers[i].animateCharacter();
      }
    };

    run();

    // cleanup
    return () => {
      for (let i = 0; i < characters.length; i++) {
        const targetId = `character-target-${i}`;
        const el = document.getElementById(targetId);
        if (el) {
          el.innerHTML = '';
        }
      }
    };
  }, [characters]);

  return (
    <div className="flex justify-center gap-4">
      {characters.map((_, i) => (
        <div key={i} id={`character-target-${i}`} />
      ))}
    </div>
  );
};

export default HanziWriter;
