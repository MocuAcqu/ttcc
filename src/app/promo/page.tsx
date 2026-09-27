'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Background from '@/components/Background';
import { useRouter } from 'next/navigation';
import AdminMenu from '@/components/AdminMenu';
import { useTransition } from '@/context/TransitionContext';
import { projectsData } from '@/data/projects'; 
import Image from 'next/image';

export default function PromoPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const { navigate } = useTransition();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }

    const autoSlide = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projectsData.length);
    }, 5000);

    const redirectTimer = setTimeout(() => {
      const autoRotateSetting = localStorage.getItem('auto_rotate');
      if (autoRotateSetting !== 'false') {
        navigate('/');
      }
    }, 30000); 

    return () => {
      clearInterval(autoSlide);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const currentProject = projectsData[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? projectsData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % projectsData.length);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white relative select-none flex flex-col justify-between p-8">
      
      <Background direction="diagonal" />

      <header className="flex items-center justify-between z-30 border-b border-white/10 relative" >
        <AdminMenu />

        <div className="flex items-center gap-3" style={{ marginLeft: '6rem', marginTop: '0.5rem'  }}>
          <span className="w-3 h-3 rounded-full bg-brand animate-ping"></span>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em]">
            <span className="text-brand font-bold mr-2">PROJECT</span> PROMOTION
          </h1>
        </div>

      </header>

      {/* ==================== 中間：主卡片輪播區 ==================== */}
      <div className="flex-1 flex items-center justify-between px-12 relative my-4">
        <button onClick={handlePrev} className="z-20 text-white/50 hover:text-brand transition-colors text-6xl font-light p-4 focus:outline-none">&#10094;</button>

        <div className="w-[85%] max-w-6xl h-[65vh] bg-[#111]/90 border border-white/20 rounded-2xl p-8 flex flex-col md:flex-row gap-8 shadow-2xl backdrop-blur-md relative z-10 overflow-hidden">
          
          {/* 左側圖片區 */}
          <div className="w-full md:w-[60%] h-full bg-gradient-to-br from-white/10 to-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative shrink-0">
             {currentProject.image ? (
               <Image src={currentProject.image} alt={currentProject.title} fill className="object-cover" />
             ) : (
               <span className="text-white/30 tracking-widest text-sm">PROJECT IMAGE</span>
             )}
          </div>

          <div className="w-full md:w-[55%] flex flex-col justify-start h-full overflow-y-auto pr-4 custom-scrollbar">
            <h2 className="text-3xl md:text-3xl font-bold text-brand mb-6">{currentProject.title}</h2>
            <p className="font-semibold text-white/60 mb-6 tracking-widest">{currentProject.num}</p>

            <div className="border-b border-white/10 pb-4 mb-6 text-xs text-white/50 tracking-widest shrink-0">
              <p className="mb-1">團隊成員：{currentProject.members}</p>
              <p>指導教授：{currentProject.professor}</p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-brand font-bold mb-1 tracking-widest text-sm">【專題介紹】</h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed text-justify">{currentProject.desc}</p>
              </div>

              <div>
                <h3 className="text-brand font-bold mb-1 tracking-widest text-sm">【製作心路歷程】</h3>
                <p className="text-white/70 text-sm md:text-[15px] leading-relaxed text-justify">{currentProject.journey}</p>
              </div>

              <div>
                <h3 className="text-[#D4AF37] font-bold mb-1 tracking-widest text-sm">【給指導老師的話】</h3>
                <p className="text-white/60 text-sm leading-relaxed text-justify bg-white/5 p-3 rounded border-l-2 border-[#D4AF37]">{currentProject.messageToProf}</p>
              </div>
            </div>

            
          </div>

        </div>

        <button onClick={handleNext} className="z-20 text-white/50 hover:text-brand transition-colors text-6xl font-light p-4 focus:outline-none">&#10095;</button>
      </div>

      {/* ==================== 下方：分頁圓點與 QR Code 宣傳區 ==================== */}
      <div className="flex flex-col items-center gap-4 z-20">
        
        {/* 分頁圓點指示器 (模擬截圖中的一排小圓點，當前組別變綠燈) */}
        <div className="flex items-center gap-2">
          {projectsData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === idx 
                  ? 'w-6 h-2 bg-brand shadow-[0_0_8px_#b9ea4e]' 
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* 左下角 QR Code 與投票引導文字 */}
        <div className="w-full flex items-center justify-between px-6 pt-2 border-t border-white/10">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg shadow-lg">
               {currentUrl ? (
                  <QRCodeSVG value={`${currentUrl}/vote`} size={75} level="M" />
                ) : (
                  <div className="text-black text-xs">載入中...</div>
                )}
            </div>
            <div>
              <span className="text-xs text-brand tracking-widest block font-bold">投票連結</span>
              <span className="text-[12px] text-white/50">一人一票 投票抽獎</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-white tracking-wide">投下你神聖的一票吧 ~</p>
            <p className="text-md text-white/60">來看看誰是你心目中的 <span className="text-brand font-bold">「最佳人氣王」</span></p>
          </div>
        </div>

      </div>

    </div>
  );
}