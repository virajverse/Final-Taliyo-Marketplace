'use client';

import { useEffect, useRef, useState } from 'react';

const DEFAULT_ORIGINS = [
  'https://taliyotechnologies.com',
  'https://www.taliyotechnologies.com',
];
const ENV_ORIGINS = (process.env.NEXT_PUBLIC_PARENT_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const PARENT_ORIGINS = ENV_ORIGINS.length
  ? ENV_ORIGINS
  : (process.env.NODE_ENV !== 'production'
      ? [...DEFAULT_ORIGINS, 'http://localhost:5173']
      : DEFAULT_ORIGINS);

export default function PWAInstallBridge() {
  const dpRef = useRef<any>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const parentOriginRef = useRef<string | null>(null);

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
        const sp = new URLSearchParams(window.location.search);
        if (isTopLevel && sp.get('install') === '1' && dpRef.current?.prompt) {
          dpRef.current.prompt();
        }
      } catch {}
    };
    const onInstalled = () => {
      const parentOrigin = parentOriginRef.current || '*';
      try { window.parent?.postMessage({ type: 'pwa-appinstalled' }, parentOrigin); } catch {}
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  // Handle messages from parent to trigger install (overlay-first)
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!PARENT_ORIGINS.includes(e.origin)) return;
      const data: any = e.data || {};
      if (data?.type !== 'taliyo-install') return;
      parentOriginRef.current = e.origin;

      // Always show overlay; if prompt unavailable, clicking Install will report 'unavailable'
      setShowOverlay(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const onConfirmInstall = async () => {
    const dp = dpRef.current;
    const parentOrigin = parentOriginRef.current || '*';
    setShowOverlay(false);
    if (!dp?.prompt) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('install', '1');
        window.parent?.postMessage({ type: 'taliyo-open-top-level', url: url.toString() }, parentOrigin);
      } catch {
        try { window.parent?.postMessage({ type: 'pwa-install-result', status: 'unavailable' }, parentOrigin); } catch {}
      }
      return;
    }
    try {
      dp.prompt();
      const choice = await dp.userChoice;
      const status = choice?.outcome === 'accepted' ? 'accepted' : (choice?.outcome === 'dismissed' ? 'dismissed' : 'unavailable');
      window.parent?.postMessage({ type: 'pwa-install-result', status }, parentOrigin);
    } catch {
      try { window.parent?.postMessage({ type: 'pwa-install-result', status: 'unavailable' }, parentOrigin); } catch {}
    } finally {
      dpRef.current = null;
    }
  };

  const onCancel = () => setShowOverlay(false);
  const onCancelWrapped = () => {
    const parentOrigin = parentOriginRef.current || '*';
    try { window.parent?.postMessage({ type: 'pwa-install-result', status: 'dismissed' }, parentOrigin); } catch {}
    setShowOverlay(false);
  };

  return showOverlay ? (
    <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(10,11,15,0.55)', backdropFilter: 'blur(2px)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
      <div style={{ width: 340, borderRadius: 16, padding: 16, background: 'rgba(17,24,39,0.96)', color: '#F9FAFB', border: '1px solid rgba(59,130,246,0.25)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <img src="/icons/icon-192.png" alt="App" width={36} height={36} style={{ width: 36, height: 36, borderRadius: 8 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.2 }}>Install Taliyo Marketplace</div>
            <div style={{ fontSize: 12.5, opacity: 0.8 }}>Add to your home screen for a full‑screen, faster experience.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancelWrapped} style={{ padding: '10px 14px', borderRadius: 10, background: '#374151', color: '#E5E7EB', border: 'none', fontWeight: 600 }}>Not now</button>
          <button onClick={onConfirmInstall} style={{ padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(90deg,#2563EB,#3B82F6)', color: 'white', border: 'none', fontWeight: 700, boxShadow: '0 8px 20px rgba(37,99,235,0.35)' }}>Install</button>
        </div>
      </div>
    </div>
  ) : null;
}
