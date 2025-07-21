'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

type BookmarkProps = {
  id: string;
  isBookmarked?: boolean;
};

const Bookmark = ({ id, isBookmarked = false }: BookmarkProps) => {
  const [marked, setMarked] = useState(isBookmarked);

  const handleClickBookmark = async () => {
    setMarked(!marked);

    if (marked) {
      await fetch(`/api/bookmark`, {
        method: 'DELETE',
        body: JSON.stringify({
          wordId: id,
        }),
      });
    } else {
      await fetch(`/api/bookmark`, {
        method: 'POST',
        body: JSON.stringify({
          wordId: id,
        }),
      });
    }
  };

  return (
    <button
      className=" rounded-full p-2 transition duration-300 hover:bg-gray-100 hover:opacity-100 opacity-90"
      onClick={handleClickBookmark}
    >
      <Star
        fill={`${marked ? '#facc15' : 'none'}`}
        stroke={`${marked ? '#facc15' : 'currentColor'}`}
      />
    </button>
  );
};

export default Bookmark;
