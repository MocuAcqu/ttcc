'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function SubmitMessagePage() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  const MAX_LENGTH = 60;

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (text.length > MAX_LENGTH) {
      setError(`留言長度不能超過 ${MAX_LENGTH} 個字！`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${currentUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || '發布失敗');

      setSuccess(true);
      setText('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 max-w-md mx-auto">
      
      <header className="text-center pt-8">
        <div className="mb-2 w-50 h-auto">
          <Image 
            src="/02_LOGO.png"  
            alt="技續 Logo" 
            width={240}    
            height={240}         
            priority               
            className="object-contain mes_img"
          />
        </div>
        <p className="text-xs text-brand tracking-[0.2em]">LIVE MESSAGE 投屏互動</p>
      </header>

      <div className="my-auto">
        {success ? (
          <div className="text-center py-10 animate-fadeIn">
            <div className="w-14 h-14 bg-brand text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-[0_0_15px_rgba(185,234,78,0.5)]">
              ✓
            </div>
            <h2 className="text-2xl font-bold mb-2">發布成功！</h2>
            <p className="text-white/60 text-sm mb-6">您的留言已成功投遞到現場大螢幕，快抬頭看看吧！</p>
            <button 
              onClick={() => setSuccess(false)}
              className="bg-white/10 text-white px-6 py-2 rounded text-sm hover:bg-white/20 transition-colors"
            >
              再次留言
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="text-center mb-2">
              <p className="text-sm text-white/80">留下你想說的話，即時投影在大螢幕上：</p>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <textarea 
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="輸入您的祝福或彈幕留言..."
              maxLength={MAX_LENGTH}
              required
              className="w-full bg-[#151515] border border-white/20 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-brand transition-colors resize-none"
            />

            <div className="absolute bottom-3 right-3 text-xs text-white/40 font-mono">
              {text.length} / {MAX_LENGTH}
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-brand text-black font-bold py-4 text-lg rounded-xl hover:bg-[#a6d840] active:scale-[0.98] transition-all shadow-lg"
            >
              {submitting ? '發布中...' : '立即投屏'}
            </button>
          </form>
        )}
      </div>

      <footer className="text-center pb-4 text-xs text-white/40">
        科技應用與人力資源學系 專題展覽 ⋅ 2026
      </footer>

    </div>
  );
}