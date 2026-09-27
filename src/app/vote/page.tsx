'use client';

import React, { useState } from 'react';
import Countdown from '@/components/Countdown';
import Image from 'next/image';
import { projectsData } from '@/data/projects';

export default function VotePage() {
  const [popularVote, setPopularVote] = useState<number | ''>('');
  const [innovationVote, setInnovationVote] = useState<number | ''>('');
  const [impactVote, setImpactVote] = useState<number | ''>('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (popularVote === '' || innovationVote === '' || impactVote === '') {
      setErrorMessage('請完成三個獎項的組別選擇！');
      return;
    }

    const votes = [popularVote, innovationVote, impactVote];
    const uniqueVotes = new Set(votes);
    if (uniqueVotes.size !== 3) {
      setErrorMessage('三個獎項必須投給「不同」的組別！');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          reason,
          popularVote,
          innovationVote,
          impactVote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || '投票失敗');
      }

      setSubmitted(true); 
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-brand text-black rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-[0_0_20px_rgba(185,234,78,0.5)]">
          ✓
        </div>
        <h1 className="text-3xl font-bold tracking-widest mb-4">投票成功</h1>
        <p className="text-white/70 mb-8 leading-relaxed">感謝您的參與！您已成功完成神聖的一票，並自動獲得抽獎資格，祝您中獎！</p>
        <div className="mt-6">
          <Countdown />
        </div>
      </div>
    );
  }

  const renderSelect = (
    label: string, 
    value: number | '', 
    setValue: (val: number | '') => void, 
    otherVote1: number | '', 
    otherVote2: number | ''
  ) => (
    <div className="mt-4">
      <select 
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full bg-black border border-brand/50 text-white rounded-lg p-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none"
      >
        <option value="" disabled>請選擇您要投給哪一組...</option>
        {projectsData.map((p) => {
          const isDisabled = p.id === otherVote1 || p.id === otherVote2;
          return (
            <option key={p.id} value={p.id} disabled={isDisabled}>
              {p.num} {p.title} {isDisabled ? '(已選)' : ''}
            </option>
          );
        })}
      </select>
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
      
      <header className="text-center mb-5 flex flex-col items-center">
        <div className="mb-1 w-120 h-auto">
          <Image 
            src="/04_LOGO.png"  
            alt="技續 Logo" 
            width={500}    
            height={300}         
            priority               
            className="object-contain"
          />
        </div>
        <p className="mt-4 text-xl text-brand tracking-widest uppercase font-bold">【專題大賞 投票活動】</p>
        <p className="mt-1 text-sm text-white/60 tracking-widest uppercase mb-6">以技為始，續寫未來。</p>
      </header>

      <section className="mb-8">
        <p className="text-white/40 text-xs mb-3 tracking-widest text-center">─ 專題總覽 (左右滑動查看) ─</p>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 pb-2">
          {projectsData.map((project) => (
            <div 
              key={project.id} 
              className="snap-center w-[85%] max-w-[280px] flex-shrink-0 rounded-xl overflow-hidden border border-white/15 bg-[#111] flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="h-36 bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center relative overflow-hidden">
                   {project.image ? (
                     <Image src={project.image} alt={project.title} fill className="object-cover" />
                   ) : (
                     <span className="text-white/30 tracking-widest text-xs">PROJECT IMAGE</span>
                   )}
                </div>
                
                <div className="p-4 whitespace-normal">
                  <div className="text-xs font-bold text-white/40 mb-1">{project.num}</div>
                  <h3 className="text-base font-bold text-brand mb-2 leading-snug break-words">
                    {project.title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-4 leading-relaxed mb-3">
                    {project.desc}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-black/40 whitespace-normal">
                <p className="text-[11px] text-white/60 truncate">成員：{project.members}</p>
                <p className="text-[11px] text-white/40 mt-0.5">指導：{project.professor}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded text-sm text-center sticky top-4 z-50 backdrop-blur-md">
            {errorMessage}
          </div>
        )}

        
        <div className="text-center mb-2">
          <p className="text-sm font-bold text-white tracking-widest bg-white/10 py-2 rounded">
            ⚠️ 注意：三個獎項必須投給不同組別
          </p>
        </div>

        <div className="bg-[#151515] border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-brand tracking-widest">最佳人氣獎</h2>
          </div>
          <p className="text-xs text-white/50 font-mono mb-3">Most Popular Award</p>
          <div className="text-xs text-white/80 space-y-2 leading-relaxed bg-black/50 p-3 rounded">
            <p><span className="text-brand font-bold">核心：</span>綜合魅力與整體喜好度最高。</p>
            <ul className="list-disc pl-4 text-white/60 space-y-1">
              <li>展演與互動體驗流暢生動</li>
              <li>視覺與整體呈現在吸睛且完整度高</li>
              <li>整體體驗後，印象最深刻、最想推薦</li>
            </ul>
          </div>
          {renderSelect("最佳人氣獎", popularVote, setPopularVote, innovationVote, impactVote)}
        </div>

        <div className="bg-[#151515] border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-[#FFD700] tracking-widest">最佳創新獎</h2>
          </div>
          <p className="text-xs text-white/50 font-mono mb-3">Best Innovation Award</p>
          <div className="text-xs text-white/80 space-y-2 leading-relaxed bg-black/50 p-3 rounded">
            <p><span className="text-[#FFD700] font-bold">核心：</span>具備突破性思維、跳脫傳統框架。</p>
            <ul className="list-disc pl-4 text-white/60 space-y-1">
              <li>選題原創性，非市場常見題材</li>
              <li>解決手法具巧思，有別於現有常規</li>
              <li>技術、原型或互動模式有亮眼突破</li>
            </ul>
          </div>
          {renderSelect("最佳創新獎", innovationVote, setInnovationVote, popularVote, impactVote)}
        </div>

        <div className="bg-[#151515] border border-white/10 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-[#4DEEEA] tracking-widest">最具社會影響力獎</h2>
          </div>
          <p className="text-xs text-white/50 font-mono mb-3">Social Impact Award</p>
          <div className="text-xs text-white/80 space-y-2 leading-relaxed bg-black/50 p-3 rounded">
            <p><span className="text-[#4DEEEA] font-bold">核心：</span>對社會、特定族群或環境帶來實質正向改變。</p>
            <ul className="list-disc pl-4 text-white/60 space-y-1">
              <li>精準鎖定社會痛點與真實需求</li>
              <li>具落地可行性，能帶來正面效益</li>
              <li>具備延續發展與推廣潛力</li>
            </ul>
          </div>
          {renderSelect("最具社會影響力獎", impactVote, setImpactVote, popularVote, innovationVote)}
        </div>

        <div className="mt-4 space-y-6 border-t border-white/20 pt-8">
          <h3 className="text-center text-brand text-sm tracking-widest">─ 您的基本資料 (抽獎憑證) ─</h3>
          
          <div className="relative">
            <input type="text" placeholder="姓名 NAME" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-transparent border-b border-white/30 pb-2 text-white placeholder-white/30 focus:outline-none focus:border-brand transition-colors" />
          </div>

          <div className="relative">
            <input type="tel" placeholder="電話 PHONE" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full bg-transparent border-b border-white/30 pb-2 text-white placeholder-white/30 focus:outline-none focus:border-brand transition-colors" />
          </div>

          <div className="relative">
            <input type="text" placeholder="理由 REASON" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-transparent border-b border-white/30 pb-2 text-white placeholder-white/30 focus:outline-none focus:border-brand transition-colors" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className={`mt-6 w-full font-bold py-4 text-lg transition-all rounded-lg ${
            submitting
              ? 'bg-white/10 text-white/30 cursor-not-allowed' 
              : 'bg-brand text-black hover:bg-[#a6d840] active:scale-[0.98] shadow-[0_0_15px_rgba(185,234,78,0.4)]'
          }`}
        >
          {submitting ? '送出選票中...' : '確認送出神聖的三票'}
        </button>
      </form>

      <div className="mt-12 flex justify-center items-center">
        <Countdown />
      </div>

      <div className="flex justify-center items-center gap-6">
        <div className="mb-1 w-50 h-20">
          <Image 
            src="/arrow-5.png"  
            alt="技續 Logo" 
            width={300}    
            height={100}         
            priority               
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}