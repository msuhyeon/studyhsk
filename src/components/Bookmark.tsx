'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

const Bookmark = () => {
  const [marked, setMarked] = useState(false);

  return (
    <button
      className=" rounded-full p-2 transition duration-300 hover:bg-gray-100 hover:opacity-100 opacity-90"
      onClick={() => setMarked(!marked)}
    >
      <Star
        fill={`${marked ? '#facc15' : 'none'}`}
        stroke={`${marked ? '#facc15' : 'currentColor'}`}
      />
    </button>
  );
};

export default Bookmark;
