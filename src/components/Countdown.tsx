'use client';

import React, { useState, useEffect } from 'react';

const TARGET_DATE = new Date('2026-12-13T23:59:59').getTime();

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const seconds = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="h-20 w-48 animate-pulse bg-white/5 rounded"></div>;
  }

  const DigitBox = ({ digit, isBrandColor = false }: { digit: string; isBrandColor?: boolean }) => (
    <div 
      className="w-10 h-14 bg-[#4a4a4a] flex items-center justify-center shadow-inner"
      style={{
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 20%, 100% 80%, 75% 100%, 25% 100%, 0% 80%, 0% 20%)'
      }}
    >
      <span className={`text-3xl font-black font-sans ${isBrandColor ? 'text-brand' : 'text-white'}`}>
        {digit}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <DigitBox digit={timeLeft.days[0]} />
          <DigitBox digit={timeLeft.days[1]} />
        </div>
        <span className="text-white text-2xl font-bold pb-1 mx-1">:</span>
        <div className="flex gap-1">
          <DigitBox digit={timeLeft.hours[0]} />
          <DigitBox digit={timeLeft.hours[1]} />
        </div>
        <span className="text-white text-3xl font-bold pb-1 mx-1">:</span>
        <div className="flex gap-1">
          <DigitBox digit={timeLeft.minutes[0]} isBrandColor />
          <DigitBox digit={timeLeft.minutes[1]} isBrandColor />
        </div>
        <span className="text-white text-3xl font-bold pb-1 mx-1">:</span>
        <div className="flex gap-1">
          <DigitBox digit={timeLeft.seconds[0]} isBrandColor />
          <DigitBox digit={timeLeft.seconds[1]} isBrandColor />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-white/60 font-serif tracking-[0.3em] uppercase text-sm">
          Vote Countdown
        </span>
      </div>
    </div>
  );
}