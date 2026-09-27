'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Background from '@/components/Background';
import { useRouter } from 'next/navigation';
import AdminMenu from '@/components/AdminMenu';
import { useTransition } from '@/context/TransitionContext';

interface ActiveMessage {
  uniqueKey: number;
  id: string;
  text: string;
  time: string;
  track: number; 
  speedDuration: number; 
}

export default function LiveMessageWallPage() {
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState('');
  const [dbMessages, setDbMessages] = useState<any[]>([]);
  const [activeMessages, setActiveMessages] = useState<ActiveMessage[]>([]);
  const { navigate } = useTransition();

  const dbMessagesRef = useRef<any[]>([]);

  useEffect(() => {
    dbMessagesRef.current = dbMessages;
  }, [dbMessages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(`${window.location.origin}`);
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          const formatted = json.data.map((m: any) => ({
            id: m._id,
            text: m.text,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setDbMessages(formatted);
        }
      } catch (err) {
        console.error('抓取留言牆資料失敗', err);
      }
    };

    fetchMessages();
    const pollInterval = setInterval(fetchMessages, 5000);

    let nextTrack = 0;

    const interval = setInterval(() => {
      const currentDbMsgs = dbMessagesRef.current;
      
      if (currentDbMsgs.length === 0) return;

      const randomMsg = currentDbMsgs[Math.floor(Math.random() * currentDbMsgs.length)];
      
      const targetTrack = nextTrack;
      nextTrack = (nextTrack + 1) % 3; 

      const speedDuration = 8 + Math.random() * 1; 

      const newActiveMsg: ActiveMessage = {
        uniqueKey: Date.now() + Math.random(), 
        id: randomMsg.id,
        text: randomMsg.text,
        time: randomMsg.time,
        track: targetTrack,
        speedDuration: speedDuration,
      };

      setActiveMessages((prev) => [...prev, newActiveMsg]);

      setTimeout(() => {
        setActiveMessages((prev) => prev.filter((m) => m.uniqueKey !== newActiveMsg.uniqueKey));
      }, speedDuration * 1000 + 500);

    }, 1500); 

    const redirectTimer = setTimeout(() => {
      const autoRotateSetting = localStorage.getItem('auto_rotate');
      if (autoRotateSetting !== 'false') {
        navigate('/promo');
      }
    }, 25000);


    return () => {
      clearInterval(interval);
      clearInterval(pollInterval);
      clearTimeout(redirectTimer);
    };

  }, [navigate]);

  const track0Messages = activeMessages.filter((m) => m.track === 0);
  const track1Messages = activeMessages.filter((m) => m.track === 1);
  const track2Messages = activeMessages.filter((m) => m.track === 2);

  const latestDbIds = dbMessages.slice(-3).map((m) => m.id);
  
  const renderFloatingCard = (msg: ActiveMessage) => {
    const isLatest = latestDbIds.includes(msg.id);

    return (
      <div
        key={msg.uniqueKey}
        className={`absolute right-0 p-5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 w-80 bg-[#151515]/95 hover:scale-105 cursor-pointer animate-float-rtl group/card ${
          isLatest
            ? 'border-brand shadow-[0_0_20px_rgba(185,234,78,0.3)]'
            : 'border-white/15'
        }`}
        style={{
          animationDuration: `${msg.speedDuration}s`,
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
        onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <p className="text-white text-base font-medium leading-relaxed break-words overflow-hidden">{msg.text}</p>
          <span
            className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
              isLatest ? 'bg-brand animate-pulse shadow-[0_0_8px_#b9ea4e]' : 'bg-white/40'
            }`}
          ></span>
        </div>
        <span className="text-xs text-white/40 font-mono">{msg.time}</span>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white relative select-none flex flex-col justify-between p-8">
      
      <Background direction="right-to-left" />

      <header className="flex items-center justify-between z-30 border-b border-white/10 pb-4 relative">
        
        <AdminMenu />

        <div className="flex items-center gap-3" style={{ marginLeft: '6rem' }}>
          <span className="w-3 h-3 rounded-full bg-brand animate-ping"></span>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em]">
            <span className="text-brand font-bold mr-2">LIVE</span> MESSAGE
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-brand tracking-widest block font-bold">即時留言</span>
            <span className="text-[10px] text-white/50">掃碼發布</span>
          </div>
          <div className="bg-white p-1.5 rounded shadow-lg">
            {currentUrl ? (
              <QRCodeSVG value={`${currentUrl}/messages/submit`} size={75} level="M" />
            ) : (
              <div className="text-black text-xs">載入中...</div>
            )}
          </div>
        </div>

      </header>

      {/* 中間：三軌道平均發射區 */}
      <div className="relative flex-1 w-full my-4 overflow-hidden flex flex-col justify-between">
        
        <div className="relative w-full h-1/3 overflow-hidden">
          {track0Messages.map(renderFloatingCard)}
        </div>

        <div className="relative w-full h-1/3 overflow-hidden">
          {track1Messages.map(renderFloatingCard)}
        </div>

        <div className="relative w-full h-1/3 overflow-hidden">
          {track2Messages.map(renderFloatingCard)}
        </div>

      </div>

      <footer className="z-20 border-t border-white/10 pt-4 pb-4 overflow-hidden whitespace-nowrap text-white/50 tracking-[0.3em] text-sm uppercase">
        <div className="animate-marquee w-max">
          <span className="pr-4">
            {"以技為始，續寫未來 • TECH TO BE CONTINUED • ".repeat(8)}
          </span>
          <span className="pr-4">
            {"以技為始，續寫未來 • TECH TO BE CONTINUED • ".repeat(8)}
          </span>
        </div>
      </footer>

    </div>
  );
}