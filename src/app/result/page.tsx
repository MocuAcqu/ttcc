'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminMenu from '@/components/AdminMenu';

const projectsData = [
  { id: 1, num: "第一組", title: "AffecCare：基於行為回饋之隱私保護型 EAP 智能推薦引擎", members: "洪明凱、高郁城、蔡廷軒、柯亮宇", professor: "林坤誼、蔡芸琤" },
  { id: 2, num: "第二組", title: "SEL互動式情緒遊戲盒", members: "羅萲、邱妍心、李介文、吳念庭、吳冠志", professor: "簡佑宏" },
  { id: 3, num: "第三組", title: "看不見的磨合可視化", members: "蔡柏元、歐乃逸、潘苡晴、陳生好", professor: "陳怡靜" },
  { id: 4, num: "第四組", title: "寶島地標回憶錄", members: "羅立茵、蔡詠筑、唐湘婷、張菀宸、廖盈琤", professor: "簡佑宏" },
  { id: 5, num: "第五組", title: "音擬而起 OnomaRise", members: "邱鈺婷、李孟潔、盧姵帆、李佳璇、呂雨璇", professor: "蔡芸琤、林坤誼" },
  { id: 6, num: "第六組", title: "STEM學習ip設計與推廣", members: "楊佳珣、尤騰毅", professor: "蔡其瑞" },
  { id: 7, num: "第七組", title: "3D列印之電動船體設計與製作", members: "吳堉安、黃柏彰", professor: "張玉山" },
  { id: 8, num: "第八組", title: "AI職員情緒分析與HR智慧決策平台", members: "陳楷荃、林宸安", professor: "嚴萬軒" },
  { id: 9, num: "第九組", title: "AI科技與倫理桌游", members: "林吟貞、周鈺軒、李宛諭、路述恩", professor: "許庭嘉" },
  { id: 10, num: "第十組", title: "守把手-BFRB 行為覺察與壓力調節整合裝置", members: "白振廷、林渝桓、王玟晽、陳芷彤", professor: "林坤誼" },
  { id: 11, num: "第十一組", title: "基於 SLII® 理論之管理模擬桌遊開發", members: "謝博全、李東璟", professor: "陳淑媛" },
  { id: 12, num: "第十二組", title: "啟新驅動所", members: "林世軒、張語宸、黃宇晟、劉得誼、劉文傑", professor: "林坤誼" },
  { id: 13, num: "第十三組", title: "UNITY × MediaPipe 互動系統整合實作", members: "游靜靜、樓冠佑、陳宥均", professor: "丁玉良" },
  { id: 14, num: "第十四組", title: "數位轉譯角色空間互動系統", members: "巫冠儀、周庭伊、廖振廷、劉澤文、康恩瑋", professor: "林坤誼" },
];

type AwardType = 'popular' | 'innovation' | 'impact';

const awardConfig = {
  popular: { title: "最佳人氣獎", subtitle: "THE CROWD FAVORITE", color: "text-brand" },
  innovation: { title: "最佳創新獎", subtitle: "BEST INNOVATION AWARD", color: "text-[#FFD700]" },
  impact: { title: "最具社會影響力獎", subtitle: "SOCIAL IMPACT AWARD", color: "text-[#4DEEEA]" },
};

export default function ResultPage() {
  const [viewState, setViewState] = useState<'chart' | 'winner'>('chart');
  const [activeAward, setActiveAward] = useState<AwardType>('popular'); 
  const [awardsData, setAwardsData] = useState<any>({ popular: [], innovation: [], impact: [] });
  const [maxVotes, setMaxVotes] = useState(10);

  const [selectedWinners, setSelectedWinners] = useState<{ popular: number[], innovation: number[], impact: number[] }>({
    popular: [1], 
    innovation: [2],
    impact: [3]     
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false); 

  // 多組得獎時的當前輪播索引
  const [winnerSlideIndex, setWinnerSlideIndex] = useState(0);

  useEffect(() => {
    const savedWinners = localStorage.getItem('manual_winners');
    if (savedWinners) {
      try { setSelectedWinners(JSON.parse(savedWinners)); } catch(e){}
    }

    const fetchResults = async () => {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success && json.data.awards) {
          const rawAwards = json.data.awards; 
          const processed: any = {};
          let globalMax = 20;

          ['popular', 'innovation', 'impact'].forEach((key) => {
            const rawList = rawAwards[key] || [];
            const fullData = projectsData.map(p => {
              const found = rawList.find((v: any) => v._id === p.id);
              return { id: p.id, num: p.num, title: p.title, count: found ? found.count : 0 };
            });
            fullData.sort((a, b) => b.count - a.count);
            processed[key] = fullData;

            const maxInList = Math.max(...fullData.map(v => v.count));
            if (maxInList > globalMax) globalMax = maxInList;
          });

          setAwardsData(processed);
          setMaxVotes(globalMax + (5 - globalMax % 5));
        }
      } catch (err) { console.error("獲取結算數據失敗", err); }
    };
    fetchResults();
  }, []);

  // 儲存手動得獎設定到 localStorage
  const handleSaveWinners = (newWinners: typeof selectedWinners) => {
    setSelectedWinners(newWinners);
    localStorage.setItem('manual_winners', JSON.stringify(newWinners));
    setShowSettingsModal(false);
    setWinnerSlideIndex(0);
  };

  const currentVotesList = awardsData[activeAward] || [];
  
  // 取得目前獎項手動設定的得獎專題物件陣列
  const currentWinnerIds = selectedWinners[activeAward] || [];
  const currentWinningProjects = projectsData.filter(p => currentWinnerIds.includes(p.id));
  const activeWinnerProject = currentWinningProjects[winnerSlideIndex] || currentWinningProjects[0];

  return (
    <div className="min-h-screen bg-black text-white relative select-none flex flex-col pt-8 overflow-hidden">
      
      {/* 頂部 Header */}
      <header className="px-12 flex items-center justify-between z-30 relative">
        <AdminMenu />

        <div className="flex items-center gap-3" style={{ marginLeft: '3rem', marginTop: '0.5rem'  }}>
          <span className="w-3 h-3 rounded-full bg-brand animate-ping"></span>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em]">
            <span className="text-brand font-bold mr-2">VOTE</span> VOTE
          </h1>          
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="bg-white/10 hover:bg-brand hover:text-black text-xs px-3 py-1.5 rounded transition-colors cursor-pointer border border-white/20"
          >
            設定本獎項得主
          </button>
        </div>

        {/* 獎項切換按鈕群 */}
        <div className="flex gap-2 bg-[#151515] p-1.5 rounded-lg border border-white/10">
          <button onClick={() => { setActiveAward('popular'); setWinnerSlideIndex(0); }} className={`px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${activeAward === 'popular' ? 'bg-brand text-black shadow' : 'text-white/60 hover:text-white'}`}>最佳人氣獎</button>
          <button onClick={() => { setActiveAward('innovation'); setWinnerSlideIndex(0); }} className={`px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${activeAward === 'innovation' ? 'bg-[#FFD700] text-black shadow' : 'text-white/60 hover:text-white'}`}>最佳創新獎</button>
          <button onClick={() => { setActiveAward('impact'); setWinnerSlideIndex(0); }} className={`px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${activeAward === 'impact' ? 'bg-[#4DEEEA] text-black shadow' : 'text-white/60 hover:text-white'}`}>社會影響力獎</button>
        </div>
      </header>

      {/* ================= 狀態 1：長條圖統計 ================= */}
      {viewState === 'chart' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto mt-2 animate-fadeIn px-6">
          <div className="text-center mb-4">
            <h3 className={`text-xl font-bold tracking-widest ${awardConfig[activeAward].color}`}>
              【 {awardConfig[activeAward].title} 】得票統計
            </h3>
          </div>

          <div className="w-full flex flex-col gap-1.5">
            {currentVotesList.map((item: any) => {
              const percentage = maxVotes === 0 ? 0 : (item.count / maxVotes) * 100;
              return (
                <div key={item.id} className="flex items-center w-full">
                  <div className="w-24 text-right pr-4 text-white/80 text-xs font-medium">{item.num}</div>
                  <div className="flex-1 h-3.5 bg-white/5 rounded-r overflow-hidden relative flex items-center">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${activeAward === 'popular' ? 'bg-brand' : activeAward === 'innovation' ? 'bg-[#FFD700]' : 'bg-[#4DEEEA]'}`}
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute right-3 text-[10px] font-mono text-white/70">{item.count} 票</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setViewState('winner'); setWinnerSlideIndex(0); }}
              className="bg-brand text-black font-bold px-10 py-2.5 text-base hover:bg-[#a6d840] transition-colors shadow-lg rounded cursor-pointer"
            >
              進入 {awardConfig[activeAward].title} 結算頒獎畫面
            </button>
          </div>
        </div>
      )}

      {/* ================= 狀態 2：最終頒獎桂冠 (支援多組換頁) ================= */}
      {viewState === 'winner' && activeWinnerProject && (
        <div className="flex-1 flex flex-col items-center justify-center relative animate-fadeIn">
          
          <div className="relative flex items-center justify-center w-[400px] h-[450px] md:w-[500px] md:h-[550px] animate-[scale-up-fade_1.5s_ease-out_forwards]">
            
            <div className="absolute inset-0 flex items-center justify-center opacity-90 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] pointer-events-none z-0">
              <Image src="/wreath.png" alt="Laurel Wreath" fill className="object-contain" priority />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full pointer-events-none px-6">
              <h1 className="text-3xl md:text-[32px] font-bold tracking-[0.15em] bg-gradient-to-b from-[#FFF2CD] via-[#D4AF37] to-[#AA771C] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -mt-16">
                {awardConfig[activeAward].title}
              </h1>
              
              <p className="text-[#D4AF37] text-xs md:text-sm tracking-[0.4em] mb-0 uppercase opacity-90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-2">
                {awardConfig[activeAward].subtitle} {currentWinningProjects.length > 1 && `(${winnerSlideIndex + 1}/${currentWinningProjects.length})`}
              </p>
              
              <h2 className={`text-md md:text-md font-bold ${awardConfig[activeAward].color} tracking-widest drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] mt-10 md:mt-5 text-center leading-snug w-72`}>
                {activeWinnerProject.num} {activeWinnerProject.title}
              </h2>
            </div>
          </div>

          <div className="text-center z-10 mt-2 animate-[fade-in-up_2s_ease-out_forwards] opacity-0 max-w-2xl px-6">
            <p className="text-base md:text-lg text-white/90 tracking-[0.2em] mb-2">
              成員：{activeWinnerProject.members}
            </p>
            <p className="text-sm md:text-base text-white/60 tracking-widest">
              指導教授 {activeWinnerProject.professor}
            </p>
          </div>

          {/* 如果該獎項有兩組以上得獎，顯示換頁按鈕 */}
          {currentWinningProjects.length > 1 && (
            <div className="flex gap-4 mt-6 z-20">
              <button 
                onClick={() => setWinnerSlideIndex(prev => (prev === 0 ? currentWinningProjects.length - 1 : prev - 1))}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm cursor-pointer"
              >
                上一組得主
              </button>
              <button 
                onClick={() => setWinnerSlideIndex(prev => (prev + 1) % currentWinningProjects.length)}
                className="bg-brand text-black font-bold px-4 py-2 rounded text-sm cursor-pointer"
              >
                下一組得主 
              </button>
            </div>
          )}

          <button 
            onClick={() => setViewState('chart')}
            className="absolute top-8 right-12 text-white/20 hover:text-white/60 text-xs border border-white/10 px-3 py-1 rounded transition-colors z-50 cursor-pointer"
          >
            返回圖表
          </button>
        </div>
      )}

      {/* ================= 活動方設定得獎組別彈跳視窗 (Modal) ================= */}
      {showSettingsModal && (
        <SettingsModal 
          currentWinners={selectedWinners} 
          onClose={() => setShowSettingsModal(false)} 
          onSave={handleSaveWinners} 
        />
      )}

      <footer className="z-20 border-t border-white/10 pt-4 pb-4 overflow-hidden whitespace-nowrap text-white/50 tracking-[0.3em] text-sm uppercase">
        <div className="animate-marquee w-max">
          <span className="pr-4">{"以技為始，續寫未來 • TECH TO BE CONTINUED • ".repeat(8)}</span>
          <span className="pr-4">{"以技為始，續寫未來 • TECH TO BE CONTINUED • ".repeat(8)}</span>
        </div>
      </footer>
    </div>
  );
}

function SettingsModal({ currentWinners, onClose, onSave }: { currentWinners: any, onClose: () => void, onSave: (w: any) => void }) {
  const [tempWinners, setTempWinners] = useState(currentWinners);

  const toggleSelect = (award: 'popular' | 'innovation' | 'impact', id: number) => {
    const list = [...tempWinners[award]];
    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(id); 
    }
    setTempWinners({ ...tempWinners, [award]: list });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#151515] border border-white/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
          <h3 className="text-xl font-bold text-brand">設定各獎項得獎組別 (可複選)</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl cursor-pointer">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {(['popular', 'innovation', 'impact'] as AwardType[]).map((awardKey) => {
            const titleMap = { popular: '最佳人氣獎', innovation: '最佳創新獎', impact: '社會影響力獎' };
            return (
              <div key={awardKey} className="bg-black p-4 rounded-xl border border-white/10">
                <h4 className="text-brand font-bold mb-2">{titleMap[awardKey]}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {projectsData.map((p) => {
                    const isChecked = tempWinners[awardKey].includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleSelect(awardKey, p.id)}
                        className={`p-2 text-xs rounded border text-left transition-all cursor-pointer ${
                          isChecked ? 'bg-brand text-black font-bold border-brand' : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30'
                        }`}
                      >
                        {p.num} {p.title.length > 10 ? p.title.substring(0, 10) + '...' : p.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
          <button onClick={onClose} className="bg-white/10 text-white px-4 py-2 rounded text-sm cursor-pointer">取消</button>
          <button onClick={() => onSave(tempWinners)} className="bg-brand text-black font-bold px-6 py-2 rounded text-sm cursor-pointer">確認儲存並更新畫面</button>
        </div>
      </div>
    </div>
  );
}