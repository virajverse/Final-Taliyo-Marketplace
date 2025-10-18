'use client';

import { useEffect, useRef, useState } from 'react';

export default function PWAInstallBridge() {
  const dpRef = useRef<any>(null);
  const [showBar, setShowBar] = useState(false);
  const [showIOSBar, setShowIOSBar] = useState(false);

  // Optional: register SW (kept lightweight)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      try { navigator.serviceWorker.register('/sw', { scope: '/' }); } catch {}
    }
  }, []);

  // Capture the beforeinstallprompt, do NOT auto-prompt
  useEffect(() => {
    const onBIP = (e: any) => {
      try { e.preventDefault(); } catch {}
      dpRef.current = e;
      // If opened top-level with ?install=1, attempt prompt immediately
      try {
        const isTopLevel = window.top === window.self;
        if (isTopLevel) { setShowBar(true); setShowIOSBar(false); }
        const sp = new URLSearchParams(window.location.search);
        if (isTopLevel && sp.get('install') === '1' && dpRef.current?.prompt) {
          dpRef.current.prompt();
        }
      } catch {}
    };
    const onInstalled = () => {
      try { setShowBar(false); } catch {}
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTop = window.top === window.self;
    const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone;
    if (isTop && isIOS && !isStandalone) {
      setShowIOSBar(true);
    }
  }, []);

  const installNow = async () => {
    const dp = dpRef.current;
    setShowBar(false);
    if (!dp?.prompt) return;
    try {
      dp.prompt();
      await dp.userChoice;
    } finally {
      dpRef.current = null;
    }
  };

  return (
    <>
      {showBar && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', padding: 8 }}>
          <div style={{ width: 'min(560px, 96%)', borderRadius: 14, padding: 12, background: 'rgba(17,24,39,0.96)', color: '#F9FAFB', border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/icons/icon-192.png" alt="App" width={32} height={32} style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Install Taliyo Marketplace</div>
              <div style={{ fontSize: 12.5, opacity: 0.8 }}>Add to your home screen for a full‑screen experience.</div>
            </div>
            <button onClick={() => setShowBar(false)} style={{ padding: '8px 12px', borderRadius: 10, background: '#374151', color: '#E5E7EB', border: 'none', fontWeight: 600, marginRight: 6 }}>Not now</button>
            <button onClick={installNow} style={{ padding: '8px 12px', borderRadius: 10, background: 'linear-gradient(90deg,#2563EB,#3B82F6)', color: 'white', border: 'none', fontWeight: 700, boxShadow: '0 8px 20px rgba(37,99,235,0.35)' }}>Install</button>
          </div>
        </div>
      )}

      {showIOSBar && !showBar && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9998, display: 'flex', justifyContent: 'center', padding: 8 }}>
          <div style={{ width: 'min(560px, 96%)', borderRadius: 14, padding: 12, background: 'rgba(17,24,39,0.96)', color: '#F9FAFB', border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/icons/icon-192.png" alt="App" width={32} height={32} style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Add to Home Screen</div>
              <div style={{ fontSize: 12.5, opacity: 0.8 }}>On iPhone/iPad: tap Share, then Add to Home Screen.</div>
            </div>
            <button onClick={() => setShowIOSBar(false)} style={{ padding: '8px 12px', borderRadius: 10, background: '#374151', color: '#E5E7EB', border: 'none', fontWeight: 600 }}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
