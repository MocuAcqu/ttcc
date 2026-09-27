'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const TransitionContext = createContext<{ navigate: (href: string) => void }>({ 
  navigate: () => {} 
});

export const useTransition = () => useContext(TransitionContext);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const navigate = (href: string) => {
    if (isAnimating) return; 

    setIsAnimating(true);

    setTimeout(() => {
      router.push(href);
    }, 600);

    setTimeout(() => {
      setIsAnimating(false);
    }, 8000);
  };

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      
      {isAnimating && (
        <div className="fixed inset-0 z-[9999] bg-brand flex flex-col items-center justify-center animate-tech-wipe overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-[20%] left-0 w-full h-1 bg-black animate-shoot-right"></div>
            <div className="absolute bottom-[30%] left-0 w-full h-[2px] bg-black animate-shoot-left delay-100"></div>
          </div>

          {/* 畫面中央：純黑化的 LOGO 與 LOADING 字樣 */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-[300px] md:w-[450px] h-auto brightness-0">
              <Image 
                src="/01_LOGO.png" 
                alt="技續 LOGO" 
                width={600} 
                height={200} 
                className="object-contain w-full h-auto"
                priority
              />
            </div>
            <div className="mt-8 flex flex-col items-center">
              <span className="text-black font-mono font-bold tracking-[0.4em] text-sm mb-2">
                SYSTEM LOADING...
              </span>
            </div>
          </div>
        </div>
      )}
    </TransitionContext.Provider>
  );
}