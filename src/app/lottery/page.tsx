'use client';

import React, { useState, useEffect, useRef } from 'react';
import Background from '@/components/Background';
import confetti from 'canvas-confetti';
import AdminMenu from '@/components/AdminMenu';

interface Prize {
  id: string;
  name: string;
  title: string;
  totalCount: number; // 總名額
  remainingCount: number; // 剩餘名額
}

interface WinnerRecord {
  prizeName: string;
  prizeTitle: string;
  name: string;
  phone: string;
  time: string;
}

export default function LotteryPage() {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false); // 歷史紀錄面板

  // 獎項設定狀態
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: '第一獎', title: '夏威夷雙人國際機票', totalCount: 1, remainingCount: 1 },
    { id: '2', name: '第二獎', title: 'Apple AirPods Pro', totalCount: 3, remainingCount: 3 },
    { id: '3', name: '第三獎', title: '超時空 VR 眼鏡', totalCount: 5, remainingCount: 5 },
    { id: '4', name: '第四獎', title: '精美紀念禮盒', totalCount: 10, remainingCount: 10 },
    { id: '5', name: '第五獎', title: '神祕大禮包', totalCount: 20, remainingCount: 20 },
  ]);

  const [selectedPrizeId, setSelectedPrizeId] = useState('1');
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<{ name: string; phone: string } | null>(null);
  const [history, setHistory] = useState<WinnerRecord[]>([]);
  const [voters, setVoters] = useState<{name: string, phone: string}[]>([]);

  const currentPrize = prizes.find((p) => p.id === selectedPrizeId) || prizes[0];

  // 3D 網格球體 Canvas 動畫邏輯
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await fetch('/api/lottery');
        const json = await res.json();
        if (json.success) setVoters(json.data);
      } catch (err) {
        console.error("無法取得抽獎名單", err);
      }
    };
    fetchVoters();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const radius = 120;
    const dotsCount = 120;
    const dots: { lat: number; lon: number }[] = [];

    for (let i = 0; i < dotsCount; i++) {
      const lat = Math.acos(1 - (2 * (i + 0.5)) / dotsCount) - Math.PI / 2;
      const lon = Math.sqrt(dotsCount * Math.PI) * lat;
      dots.push({ lat, lon });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const speed = isSpinning ? 0.08 : 0.01;
      angle += speed;

      ctx.fillStyle = '#b9ea4e';
      ctx.strokeStyle = 'rgba(185, 234, 78, 0.15)';
      ctx.lineWidth = 1;

      const projectedPoints: { x: number; y: number; z: number }[] = [];

      dots.forEach((dot) => {
        const currentLon = dot.lon + angle;
        const x = radius * Math.cos(dot.lat) * Math.cos(currentLon);
        const y = radius * Math.sin(dot.lat);
        const z = radius * Math.cos(dot.lat) * Math.sin(currentLon) + radius;

        const scale = 300 / (300 + z);
        const px = centerX + x * scale;
        const py = centerY + y * scale;

        projectedPoints.push({ x: px, y: py, z });

        ctx.beginPath();
        ctx.arc(px, py, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const dx = projectedPoints[i].x - projectedPoints[j].x;
          const dy = projectedPoints[i].y - projectedPoints[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 35) {
            ctx.beginPath();
            ctx.moveTo(projectedPoints[i].x, projectedPoints[i].y);
            ctx.lineTo(projectedPoints[j].x, projectedPoints[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpinning]);

  const fireFireworks = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#b9ea4e', '#ffffff', '#a6d840']
    });
  };

  const handleToggleLottery = () => {
    if (currentPrize.remainingCount <= 0) return;

    if (isSpinning) {
      setIsSpinning(false);
      
      // 1. 過濾掉已經中獎過的人 (保證一人不中兩次)
      const wonPhones = history.map(h => h.phone.replace(/\*/g, '')); // 簡單還原比對，實務上可存完整 phone
      // 為了展示方便，這裡我們直接用 filter 排除已在 history 的人
      const eligibleVoters = voters.filter(v => !history.some(h => h.name === v.name));

      if (eligibleVoters.length === 0) {
        alert("目前沒有符合資格的投票者可以抽獎了！");
        return;
      }

      // 2. 密碼學安全亂數 (Cryptographically Secure Pseudo-Random Number Generator)
      // 產生一個 32 位元的無號整數陣列
      const randomBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuffer);
      
      // 3. 統計學處理：利用取得的絕對亂數對剩餘人數取餘數，得到絕對公平的 Index
      const randomIndex = randomBuffer[0] % eligibleVoters.length;
      const luckyWinner = eligibleVoters[randomIndex];

      // 4. 電話號碼隱碼處理 (例如 0912345678 -> 0912***678)
      const maskedPhone = luckyWinner.phone.length >= 10 
        ? `${luckyWinner.phone.substring(0, 4)}***${luckyWinner.phone.substring(7)}`
        : luckyWinner.phone;

      const winnerData = { name: luckyWinner.name, phone: maskedPhone };
      setCurrentWinner(winnerData);

      setPrizes((prev) => prev.map((p) => p.id === currentPrize.id ? { ...p, remainingCount: p.remainingCount - 1 } : p));

      const nowTime = new Date().toLocaleTimeString();
      setHistory((prev) => [
        { prizeName: currentPrize.name, prizeTitle: currentPrize.title, name: winnerData.name, phone: winnerData.phone, time: nowTime },
        ...prev,
      ]);

      fireFireworks();
    } else {
      setCurrentWinner(null);
      setIsSpinning(true);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white relative select-none flex flex-col justify-between p-8">
      
      <Background direction="diagonal" />

      {/* ==================== 頂部導覽列 ==================== */}
      <header className="flex items-center justify-between z-30 border-b border-white/10 pb-4 relative">
        
        <AdminMenu />

        {/* 右上角按鈕 (歷史紀錄與獎項設定) */}
        <div className="flex items-center gap-3" style={{ marginLeft: '85%' , marginTop: '1rem'}}>
          <button 
            onClick={() => setShowHistory(true)}
            className="text-md border border-white/20 px-3 py-1.5 rounded hover:border-brand hover:text-brand transition-colors"
          >
            中獎紀錄 ({history.length})
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-md border border-white/20 px-3 py-1.5 rounded hover:border-brand hover:text-brand transition-colors"
          >
            獎項設定
          </button>
        </div>

      </header>

      {/* ==================== 中間：3D 幾何球體與中獎顯示區 ==================== */}
      <div className="flex-1 flex flex-col items-center justify-center relative my-2" style={{ marginTop: '-2rem'}}>
        
        {/* 修正 Bug：無論有無中獎者，Canvas 容器始終在 DOM 中渲染，僅透過透明度與隱藏切換，避免 WebGL Context 遺失 */}
        <div className="relative flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={300} 
            className={`drop-shadow-[0_0_20px_rgba(185,234,78,0.2)] transition-opacity duration-300 ${
              currentWinner ? 'absolute opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />

          {/* 中獎者揭曉畫面 */}
          {currentWinner && (
            <div className="flex flex-col items-center animate-fadeIn z-10">
              <p className="text-brand text-sm tracking-[0.3em] uppercase mb-2">🎉 恭喜中獎 🎉</p>
              <div className="border-2 border-brand p-8 rounded-2xl bg-[#111]/90 shadow-[0_0_30px_rgba(185,234,78,0.4)] text-center min-w-[320px]">
                <h2 className="text-4xl font-bold text-white mb-2">{currentWinner.name}</h2>
                <p className="text-xl font-mono text-brand tracking-widest">{currentWinner.phone}</p>
              </div>
            </div>
          )}
        </div>

        {/* 當前獎品顯示 */}
        <div className="text-center mt-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider">
            <span className="text-brand mr-3">{currentPrize.name}</span>
            <span>{currentPrize.title}</span>
            <span className="text-xs text-white/50 ml-3 font-mono">
              (剩餘 {currentPrize.remainingCount} / {currentPrize.totalCount} 名)
            </span>
          </h2>
        </div>

      </div>

      {/* ==================== 下方：獎項切換與控制面板 ==================== */}
      <div className="flex flex-col items-center gap-10 z-20 pb-10" >
        
        {/* 獎項選擇分頁按鈕 */}
        <div className="flex flex-wrap justify-center gap-3">
          {prizes.map((prize) => (
            <button
              key={prize.id}
              onClick={() => { 
                setSelectedPrizeId(prize.id); 
                setCurrentWinner(null); // 切換獎項時清空上一筆得主
                setIsSpinning(false);
              }}
              className={`px-5 py-2 text-sm font-medium rounded border transition-all ${
                selectedPrizeId === prize.id
                  ? 'border-brand bg-brand text-black font-bold shadow-[0_0_10px_rgba(185,234,78,0.4)]'
                  : 'border-white/20 bg-black text-white hover:border-white/50'
              }`}
            >
              {prize.name} ({prize.remainingCount})
            </button>
          ))}
        </div>

        {/* 開始/停止抽獎大按鈕 */}
        <button
          onClick={handleToggleLottery}
          disabled={currentPrize.remainingCount <= 0 && !isSpinning}
          className={`w-full max-w-md py-4 text-lg font-bold tracking-widest rounded transition-all shadow-lg ${
            currentPrize.remainingCount <= 0 && !isSpinning
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : isSpinning 
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                : 'bg-brand text-black hover:bg-[#a6d840] shadow-[0_0_20px_rgba(185,234,78,0.4)]'
          }`}
        >
          {currentPrize.remainingCount <= 0 && !isSpinning ? '此獎項已抽完' : isSpinning ? '停止抽獎 (揭曉)' : '開始抽獎'}
        </button>

      </div>

      {/* ==================== 獎項設定彈跳視窗 ==================== */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-brand">獎項與數量設定</h3>
              <button onClick={() => setShowSettings(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>

            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {prizes.map((prize, idx) => (
                <div key={prize.id} className="flex items-center gap-3 bg-black p-3 rounded-lg border border-white/10">
                  <span className="text-sm font-bold text-brand w-16">{prize.name}</span>
                  <input 
                    type="text" 
                    value={prize.title}
                    onChange={(e) => {
                      const updated = [...prizes];
                      updated[idx].title = e.target.value;
                      setPrizes(updated);
                    }}
                    placeholder="獎品名稱"
                    className="flex-1 bg-transparent border-b border-white/30 px-2 py-1 text-sm text-white focus:outline-none focus:border-brand"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/50">總名額:</span>
                    <input 
                      type="number" 
                      value={prize.totalCount}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        const updated = [...prizes];
                        const diff = val - updated[idx].totalCount;
                        updated[idx].totalCount = val;
                        updated[idx].remainingCount = Math.max(0, updated[idx].remainingCount + diff);
                        setPrizes(updated);
                      }}
                      className="w-16 bg-transparent border-b border-white/30 px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="bg-brand text-black font-bold px-6 py-2.5 rounded hover:bg-[#a6d840] transition-colors"
              >
                儲存設定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 中獎歷史紀錄彈跳視窗 ==================== */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-white/20 rounded-2xl p-6 w-full max-w-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-brand">中獎歷史紀錄 ({history.length})</h3>
              <button onClick={() => setShowHistory(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {history.length === 0 ? (
                <p className="text-center text-white/40 py-8">目前尚無中獎紀錄</p>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black p-3.5 rounded-lg border border-white/10">
                    <div>
                      <span className="text-xs text-brand font-mono mr-2">[{item.time}]</span>
                      <span className="text-sm font-bold text-white">{item.prizeName} - {item.prizeTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-brand mr-3">{item.name}</span>
                      <span className="text-xs font-mono text-white/60">{item.phone}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button 
                onClick={() => { if(confirm('確定要清空所有中獎紀錄嗎？')) setHistory([]); }}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded"
              >
                清空紀錄
              </button>
              <button 
                onClick={() => setShowHistory(false)}
                className="bg-brand text-black font-bold px-6 py-2.5 rounded hover:bg-[#a6d840] transition-colors"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}