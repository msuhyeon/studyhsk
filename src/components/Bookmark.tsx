'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useModal } from '@/hooks/useMoal';

type BookmarkProps = {
  id: string;
  isBookmarked?: boolean;
};

const Bookmark = ({ id, isBookmarked = false }: BookmarkProps) => {
  const [marked, setMarked] = useState(isBookmarked);
  const { data: user } = useUser();
  const { openLoginModal } = useModal();

  const handleClickBookmark = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    const nextState = !marked;
    setMarked(nextState);

    await fetch(`/api/v1/bookmark`, {
      method: nextState ? 'POST' : 'DELETE',
      body: JSON.stringify({ wordId: id }),
    });
  };

  return (
    <button
      className="rounded-full p-2 transition duration-300 hover:bg-gray-100 hover:opacity-100 opacity-90"
      onClick={handleClickBookmark}
    >
      <Star
        fill={marked ? '#facc15' : 'none'}
        stroke={marked ? '#facc15' : 'currentColor'}
      />
    </button>
  );
};

export default Bookmark;
