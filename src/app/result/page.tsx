'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminMenu from '@/components/AdminMenu';

// 完整的專題對照表
const projectsData = [
  { id: 0, num: "第一組", title: "超時空 VR 眼鏡", members: "陳小明 王小美 李大仁", professor: "謝大強" },
  { id: 1, num: "第二組", title: "智慧農業監測系統", members: "林智勝 吳柏毅", professor: "王教授" },
  { id: 2, num: "第三組", title: "AI 履歷分析助手", members: "張三 李四", professor: "陳教授" },
  ...Array.from({ length: 11 }).map((_, i) => ({
    id: i + 3, num: `第${['四','五','六','七','八','九','十','十一','十二','十三','十四'][i]}組`, title: `創新專題 ${i+4}`, members: "劉恩恩 莫丘丘 李思思", professor: "王明明"
  }))
];

export default function ResultPage() {
  const [viewState, setViewState] = useState<'chart' | 'winner'>('chart');
  const [votesData, setVotesData] = useState<{ id: number; count: number }[]>([]);
  const [maxVotes, setMaxVotes] = useState(100);
  const [topProject, setTopProject] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success && json.data.votesPerProject) {
          const rawVotes = json.data.votesPerProject; // [{ _id: 0, count: 50 }, ...]
          
          // 補齊 14 組（避免沒人投的組別不見）
          const fullData = projectsData.map(p => {
            const found = rawVotes.find((v: any) => v._id === p.id);
            return { id: p.id, count: found ? found.count : 0 };
          });

          setVotesData(fullData);

          // 找出最高票數與最高票組別
          const highestCount = Math.max(...fullData.map(v => v.count));
          setMaxVotes(highestCount < 10 ? 10 : highestCount + (10 - highestCount % 10)); // 讓 X 軸刻度好看一點
          
          const topId = fullData.reduce((prev, current) => (prev.count > current.count) ? prev : current).id;
          setTopProject(projectsData.find(p => p.id === topId));
        }
      } catch (err) {
        console.error("獲取結算數據失敗", err);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative select-none flex flex-col pt-8 overflow-hidden">
      
      {/* 頂部 Header */}
      <header className="px-12 flex items-center justify-between z-30 relative">
        <AdminMenu />
        <div className="flex items-center gap-3" style={{ marginLeft: '3rem', marginTop: '1rem' }}>
          <span className="w-3 h-3 rounded-full bg-brand animate-ping"></span>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em]">
            <span className="text-brand font-bold mr-2">VOTE</span> RESULT
          </h1>
        </div>
      </header>

      {/* ================= 狀態 1：長條圖結算 ================= */}
      {viewState === 'chart' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto mt-4 animate-fadeIn">
          
          {/* 長條圖區塊 */}
          <div className="w-full flex flex-col gap-1.5 px-8">
            {votesData.map((item, index) => {
              const project = projectsData.find(p => p.id === item.id);
              const percentage = (item.count / maxVotes) * 100;
              
              return (
                <div key={item.id} className="flex items-center w-full">
                  <div className="w-20 text-right pr-4 text-white/80 text-sm font-medium">{project?.num}</div>
                  <div className="flex-1 h-4 bg-white/5 rounded-r overflow-hidden relative">
                    {/* 動態長度長條 */}
                    <div 
                      className="h-full bg-brand transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* X 軸刻度 */}
            <div className="flex items-center w-full mt-2">
              <div className="w-20 pr-4"></div>
              <div className="flex-1 flex justify-between text-white/40 text-xs font-mono border-t border-white/20 pt-2">
                <span>0</span>
                <span>{Math.floor(maxVotes * 0.25)}</span>
                <span>{Math.floor(maxVotes * 0.5)}</span>
                <span>{Math.floor(maxVotes * 0.75)}</span>
                <span>{maxVotes}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <h2 className="text-2xl font-bold tracking-widest text-white mb-6">
              目前最高票為 <span className="text-brand ml-2">{topProject?.num} {topProject?.title}</span>
            </h2>
            <button 
              onClick={() => setViewState('winner')}
              className="bg-brand text-black font-bold px-12 py-3 text-lg hover:bg-[#a6d840] transition-colors shadow-[0_0_15px_rgba(185,234,78,0.3)]"
            >
              結算畫面
            </button>
          </div>
        </div>
      )}

      {viewState === 'winner' && topProject && (
        <div className="flex-1 flex flex-col items-center justify-center relative animate-fadeIn">
          
          {/* 桂冠與文字的組合容器 (設定為相對定位，做為文字絕對定位的基準點) */}
          <div className="relative flex items-center justify-center w-[400px] h-[450px] md:w-[500px] md:h-[550px] animate-[scale-up-fade_1.5s_ease-out_forwards]">
            
            {/* 背景：精美的金色桂冠圖片 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-90 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] pointer-events-none z-0">
              <Image 
                src="/wreath.png" 
                alt="Laurel Wreath" 
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* 前景：使用絕對定位精準放置文字，確保不被圖片比例綁架 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full pointer-events-none">
              
              {/* 最佳人氣獎 (位置稍微偏上) */}
              <h1 className="text-4xl md:text-[45px] font-bold tracking-[0.15em] bg-gradient-to-b from-[#FFF2CD] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -mt-24 md:-mt-20">
                最佳人氣獎
              </h1>
              
              {/* THE CROWD FAVORITE (緊貼在標題下方) */}
              <p className="text-[#D4AF37] text-xs md:text-sm tracking-[0.4em] mb-0 uppercase opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-2">
                THE CROWD FAVORITE
              </p>
              
              {/* 冠軍組別與名稱 (位置偏下，允許超過桂冠邊界，不限制寬度) */}
              <h2 className="text-2xl md:text-xl font-bold bg-gradient-to-b from-[#FFF2CD] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent tracking-widest drop-shadow-[0_0_15px_rgba(185,234,78,0.6)] mt-12 md:mt-3 whitespace-nowrap">
                {topProject.num} {topProject.title}
              </h2>

              <p className="text-sm md:text-base text-white/60 tracking-widest drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] mt-5">
                指導教授 {topProject.professor}
              </p>

            </div>
          </div>

          {/* 桂冠下方的成員與教授資訊 (與上方容器脫離，避免重疊) */}
          <div className="text-center z-10 mt-4 md:mt-1 animate-[fade-in-up_2s_ease-out_forwards] opacity-0">
            <p className="text-lg md:text-xl text-white/90 tracking-[0.2em] mb-15">
              {topProject.members}
            </p>
          </div>

          {/* 返回圖表按鈕 */}
          <button 
            onClick={() => setViewState('chart')}
            className="absolute top-8 right-12 text-white/20 hover:text-white/60 text-xs border border-white/10 px-3 py-1 rounded transition-colors z-50"
          >
            返回圖表
          </button>
        </div>
      )}

    </div>
  );
}