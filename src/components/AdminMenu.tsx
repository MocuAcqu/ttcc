'use client';

import { useState, useEffect } from 'react';
import { useTransition } from '@/context/TransitionContext';

export default function AdminMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const { navigate } = useTransition();

  useEffect(() => {
    const saved = localStorage.getItem('auto_rotate');
    if (saved !== null) {
      setIsAutoRotate(saved === 'true');
    }
  }, []);

  const handleToggleRotate = () => {
    const nextState = !isAutoRotate;
    setIsAutoRotate(nextState);
    localStorage.setItem('auto_rotate', String(nextState));
    window.dispatchEvent(new Event('rotate_setting_changed'));
  };

  const handleNav = (path: string) => {
    setIsOpen(false); 
    navigate(path);
  }

  return (
    <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col justify-between w-7 h-5 p-0.5 focus:outline-none group cursor-pointer"
        title="管理員選單"
      >
        <span className="w-full h-0.5 bg-white rounded-full group-hover:bg-brand transition-colors"></span>
        <span className="w-full h-0.5 bg-white rounded-full group-hover:bg-brand transition-colors"></span>
        <span className="w-full h-0.5 bg-white rounded-full group-hover:bg-brand transition-colors"></span>
      </button>

      {isOpen && (
        <div className="absolute top-10 left-0 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-2xl flex flex-col overflow-hidden z-50 animate-fadeIn min-w-[180px]">
          <button onClick={() => handleNav("/")} className="px-4 py-3 text-sm text-white hover:bg-brand hover:text-black transition-colors border-b border-white/10 whitespace-nowrap text-left">主頁 (閒置介面)</button>
          <button onClick={() => handleNav("/vote")} className="px-4 py-3 text-sm text-white hover:bg-brand hover:text-black transition-colors border-b border-white/10 whitespace-nowrap text-left">投票頁面</button>
          <button onClick={() => handleNav("/messages")} className="px-4 py-3 text-sm text-white hover:bg-brand hover:text-black transition-colors border-b border-white/10 whitespace-nowrap text-left">即時留言牆</button>
          <button onClick={() => handleNav("/promo")} className="px-4 py-3 text-sm text-white hover:bg-brand hover:text-black transition-colors border-b border-white/10 whitespace-nowrap text-left">專題宣傳頁</button>
          <button onClick={() => handleNav("/lottery")} className="px-4 py-3 text-sm text-white hover:bg-brand hover:text-black transition-colors border-b border-white/10 whitespace-nowrap text-left">抽獎環節</button>
          <button onClick={() => handleNav("/result")} className="px-4 py-3 text-sm text-white hover:bg-brand hover:text-black transition-colors border-b border-white/10 whitespace-nowrap text-left">投票結果</button>
          
          {/* 輪播開關按鈕 */}
          <button 
            onClick={handleToggleRotate}
            className="px-4 py-3 text-sm flex items-center justify-between text-white hover:bg-white/10 transition-colors w-full text-left bg-black/40"
          >
            <span>自動輪播切換</span>
            <span className={`w-3 h-3 rounded-full ${isAutoRotate ? 'bg-brand shadow-[0_0_8px_#b9ea4e]' : 'bg-red-500'}`}></span>
          </button>
        </div>
      )}
    </div>
  );
}