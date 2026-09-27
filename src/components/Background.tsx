
'use client'; 

import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
  size: number;
}

interface BackgroundProps {
  direction?: 'right-to-left' | 'diagonal'; 
}

export default function Background({ direction = 'diagonal' }: BackgroundProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 17 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}vh`,
      left: direction === 'right-to-left' ? `${100 + Math.random() * 20}vw` : `${Math.random() * 100}vw`,
      delay: `${Math.random() * 5}s`,
      duration: `${8 + Math.random() * 12}s`,
      size: 15 + Math.random() * 20,
    }));
    setStars(generatedStars);
  }, [direction]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
      {/* 中間螢光綠光暈 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/5 rounded-full blur-[120px]"></div>

      {/* 渲染流星箭頭 */}
      {stars.map((star) => (
        <svg
          key={star.id}
          width={star.size}
          height={star.size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute text-white animate-shooting-arrow opacity-0"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        >
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      ))}
    </div>
  );
}