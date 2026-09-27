'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import AdminMenu from '@/components/AdminMenu';
import { useTransition } from '@/context/TransitionContext';

interface Message {
  id: string;
  text: string;
  time: string;
}

export default function IdleHomePage() {
  const router = useRouter();
  const { navigate } = useTransition();
  const [currentUrl, setCurrentUrl] = useState('');

  const [stats, setStats] = useState({
    totalProjects: 14,
    totalVotes: 0,
    totalMessages: 0,
    messages: [], 
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('抓取統計數據失敗', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);

    const checkAndRotate = () => {
      const autoRotateSetting = localStorage.getItem('auto_rotate');
      if (autoRotateSetting === 'false') {
        return;
      }
      navigate('/messages');
    };

    const rotationTimer = setTimeout(checkAndRotate, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(rotationTimer);
    };
  }, [navigate]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white flex justify-between p-6 md:p-12 select-none relative box-border">
      <AdminMenu />

      <div className="flex-1 flex flex-col justify-between pr-4 md:pr-12 pt-8 z-10">
        <div>


          <div className="w-[352px] md:w-[528px] h-auto my-1">
            <Image 
              src="/04_LOGO.png"
              alt="技續 LOGO"
              width={600}
              height={300}
              priority
              className="object-contain w-full h-auto drop-shadow-[0_0_15px_rgba(185,234,78,0.2)] main_LOGO"
            />
          </div>

          <div className="overflow-hidden whitespace-nowrap mt-2 text-white/70 tracking-widest text-xs md:text-sm uppercase w-130">
            <div className="animate-marquee">
              <span className="pr-4">
                {"以技為始，續寫未來 • TECH TO BE CONTINUED • ".repeat(4)}
              </span>
              <span className="pr-4">
                {"以技為始，續寫未來 • TECH TO BE CONTINUED • ".repeat(4)}
              </span>
            </div>
          </div>

          <h2 className="text-sm md:text-3xl font-light tracking-[0.25em] mt-4 text-white/90">
            以技為始，續寫未來。
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between pb-8 gap-6">
          
          <div className="flex items-center gap-4 md:gap-8">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-brand tracking-tight">{stats.totalProjects}</span>
                <span className="text-white/85 text-sm md:text-lg">組專題</span>
              </div>
            </div>
            <div className="w-[1px] h-10 md:h-12 bg-white/20"></div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-white/60 text-xs md:text-sm">目前</span>
                <span className="text-4xl md:text-5xl font-black text-brand tracking-tight">{stats.totalVotes}</span>
                <span className="text-white/85 text-sm md:text-lg">票</span>
              </div>
            </div>
            <div className="w-[1px] h-10 md:h-12 bg-white/20"></div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-brand tracking-tight">{stats.totalMessages}</span>
                <span className="text-white/85 text-sm md:text-lg">則留言</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-white p-2.5 rounded-lg shadow-lg min-w-[75px] min-h-[75px] flex items-center justify-center">
                {/* 確保 currentUrl 已經有值才渲染 QR Code */}
                {currentUrl ? (
                  <QRCodeSVG value={`${currentUrl}/vote`} size={75} level="M" />
                ) : (
                  <div className="text-black text-xs">載入中...</div>
                )}
              </div>
              <span className="text-xs text-white/80 mt-1.5 tracking-widest font-medium">投票連結</span>
            </div>

            {/* 即時留言 QR Code */}
            <div className="flex flex-col items-center">
              <div className="bg-white p-2.5 rounded-lg shadow-lg min-w-[75px] min-h-[75px] flex items-center justify-center">
                {currentUrl ? (
                  <QRCodeSVG value={`${currentUrl}/messages/submit`} size={75} level="M" />
                ) : (
                  <div className="text-black text-xs">載入中...</div>
                )}
              </div>
              <span className="text-xs text-white/80 mt-1.5 tracking-widest font-medium">即時留言</span>
            </div>
          </div>

        </div>

      </div>

      {/* ==================== 右側：即時留言牆 (最新在下方，前三則亮綠邊框與閃爍) ==================== */}
      <div className="hidden lg:flex w-[420px] bg-[#0d0d0d]/90 border border-white/10 rounded-2xl p-6 flex-col h-full shadow-2xl backdrop-blur-md z-10">
        
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <h3 className="text-brand font-bold tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping"></span>
            LIVE MESSAGE
          </h3>
          <span className="text-xs text-white/40">即時互動</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col-reverse gap-4 no-scrollbar">
          {stats.messages.map((msg: any, index: number) => {
            const isTopThree = index < 3;

            return (
              <div 
                key={msg.id}
                className={`p-4 rounded-xl border bg-black transition-all duration-300 ${
                  isTopThree 
                    ? 'border-brand shadow-[0_0_15px_rgba(185,234,78,0.25)]' 
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white text-sm md:text-base font-medium leading-snug break-words overflow-hidden">{msg.text}</p>
                  
                  {/* 右上角圓點：前三則閃爍綠光，其餘為一般灰點 */}
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    isTopThree ? 'bg-brand animate-pulse shadow-[0_0_8px_#b9ea4e]' : 'bg-white/30'
                  }`}></span>
                </div>
                <span className="text-xs text-white/40 font-mono">{msg.time}</span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}