'use client';
import { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';

const PlayAudioButton = ({ audioUrl }: { audioUrl: string }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleClick = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener('ended', () => setPlaying(false));
    }
    audioRef.current.play();
    setPlaying(true);
  };

  return (
    <button
      className="cursor-pointer rounded-full p-2 transition duration-300 hover:bg-gray-100"
      onClick={handleClick}
    >
      <Volume2
        fill={`${playing ? '#facc15' : 'none'}`}
        stroke={`${playing ? '#facc15' : 'currentColor'}`}
      />
    </button>
  );
};

export default PlayAudioButton;
