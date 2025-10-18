'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PWAInstallBridge() {
  const dpRef = useRef<any>(null);
  const [showBar, setShowBar] = useState(false);
  const [showIOSBar, setShowIOSBar] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isIPhoneDevice, setIsIPhoneDevice] = useState(false);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);

  const getDeviceId = () => {
    try {
      const existing = localStorage.getItem('device_id');
      if (existing && typeof existing === 'string') return existing;
      const anyCrypto: any = (globalThis as any).crypto;
      const generated: string = anyCrypto && anyCrypto.randomUUID ? anyCrypto.randomUUID() : Math.random().toString(36).slice(2);
      try { localStorage.setItem('device_id', generated); } catch {}
      return generated;
    } catch {
      return 'unknown';
    }
  };

  const logInstall = async (source: string, event: string) => {
    try {
      const device_id = getDeviceId();
      const ua = navigator.userAgent;
      const platform = (navigator as any).platform || '';
      const lang = navigator.language || '';
      await supabase.from('pwa_installs').insert({ device_id, source, event, ua, platform, lang });
    } catch {}
  };

  const logEvent = async (type: string) => {
    try {
      const device_id = getDeviceId();
      const ua = navigator.userAgent;
      const platform = (navigator as any).platform || '';
      const lang = navigator.language || '';
      const sp = new URLSearchParams(window.location.search || '');
      const utm_source = sp.get('utm_source') || null;
      const utm_medium = sp.get('utm_medium') || null;
      const utm_campaign = sp.get('utm_campaign') || null;
      const ref = document.referrer || null;
      await supabase.from('pwa_install_events').insert({ device_id, type, ua, platform, lang, utm_source, utm_medium, utm_campaign, ref });
    } catch {}
  };

  // Optional: register SW (kept lightweight)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      try { navigator.serviceWorker.register('/sw', { scope: '/' }); } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsCompact(window.innerWidth <= 380);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Show the bar by default on top-level non-iPhone when not standalone, even if BIP hasn't fired yet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTop = window.top === window.self;
    const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
    const isIPhoneUA = /iphone/.test(ua);
    const isIPhonePlat = /iPhone/.test((navigator as any).platform || '');
    const isIPhone = isIPhoneUA || isIPhonePlat;
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone;
    if (isTop && !isStandalone && !isIPhone) {
      setShowBar(true);
      try { logEvent('bar_impression'); } catch {}
      setTimeout(() => {
        try {
          if (!dpRef.current && window.top === window.self) setShowBar(true);
        } catch {}
      }, 1200);
    }
  }, []);

  // Capture the beforeinstallprompt, do NOT auto-prompt
  useEffect(() => {
    const onBIP = (e: any) => {
      try { e.preventDefault(); } catch {}
      dpRef.current = e;
      setCanInstall(true);
      // If opened top-level with ?install=1, attempt prompt immediately
      try {
        const isTopLevel = window.top === window.self;
        if (isTopLevel) { setShowBar(true); setShowIOSBar(false); logEvent('bar_impression'); }
        const sp = new URLSearchParams(window.location.search);
        if (isTopLevel && sp.get('install') === '1' && dpRef.current?.prompt) {
          dpRef.current.prompt();
        }
      } catch {}
    };
    const onInstalled = () => {
      try { setShowBar(false); setCanInstall(false); } catch {}
      logInstall('bip', 'appinstalled');
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
    const isIPhoneUA = /iphone/.test(ua);
    const isIPhonePlat = /iPhone/.test((navigator as any).platform || '');
    // iPadOS 13+ sometimes reports as Macintosh + touch points; we intentionally EXCLUDE iPad here (iPhone only)
    const isIPhone = isIPhoneUA || isIPhonePlat;
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone;
    if (isTop && isIPhone && !isStandalone) {
      setShowIOSBar(true);
      logEvent('ios_hint_impression');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone;
    if (isStandalone) {
      try {
        if (localStorage.getItem('install_logged') !== '1') {
          localStorage.setItem('install_logged', '1');
          logInstall('standalone', 'first_open');
        }
        logEvent('open');
      } catch {}
    }
  }, []);

  const installNow = async () => {
    const dp = dpRef.current;
    if (!dp?.prompt) {
      // Fallback: show instructions when prompt isn't available yet
      try { await logEvent('install_click_no_bip'); } catch {}
      alert('Install not available yet. In Chrome, tap the menu (⋮) and choose "Add to Home screen".');
      return;
    }
    try {
      logEvent('prompted');
      dp.prompt();
      const choice = await dp.userChoice;
      if (choice && choice.outcome === 'dismissed') {
        logEvent('dismissed');
      }
    } finally {
      dpRef.current = null;
      setCanInstall(false);
    }
  };

  return (
    <>
      {showBar && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', padding: 8, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}>
          <div style={{ width: 'min(560px, 96%)', borderRadius: 14, padding: 12, background: 'rgba(17,24,39,0.96)', color: '#F9FAFB', border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <img src="/icons/icon-192.png" alt="App" width={32} height={32} style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div style={{ flex: '1 1 100%', minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.15 }}>Install Taliyo Marketplace</div>
              <div style={{ fontSize: 12.5, opacity: 0.8, marginTop: 4 }}>Add to your home screen for a full‑screen experience.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 100%', justifyContent: 'center', marginTop: 8 }}>
              {!isCompact && (
                <button onClick={() => setShowBar(false)} style={{ padding: '8px 12px', borderRadius: 10, background: '#374151', color: '#E5E7EB', border: 'none', fontWeight: 600 }}>Not now</button>
              )}
              <button aria-label="Install app" onClick={installNow} style={{ padding: '8px 16px', borderRadius: 9999, background: canInstall ? '#2563EB' : '#6B7280', color: 'white', border: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: canInstall ? '0 8px 20px rgba(37,99,235,0.35)' : 'none', opacity: canInstall ? 1 : 0.85 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                  <path d="M12 5v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Install
              </button>
            </div>
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

      {!isStandaloneMode && !showIOSBar && (
        <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: showBar ? 148 : 96, zIndex: 100000, paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }}>
          <button aria-label="Install app" onClick={installNow} style={{ padding: '10px 18px', borderRadius: 9999, background: '#2563EB', color: 'white', border: 'none', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 24px rgba(37,99,235,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <path d="M12 5v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Install
          </button>
        </div>
      )}
    </>
  );
}
