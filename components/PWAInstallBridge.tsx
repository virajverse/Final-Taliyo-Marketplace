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
    };
    window.addEventListener('beforeinstallprompt', onBIP);
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
      try { window.parent?.postMessage({ type: 'pwa-install-result', status: 'unavailable' }, parentOrigin); } catch {}
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
    <div style={{ position: 'fixed', inset: 0 as any, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', zIndex: 9999 }}>
      <div style={{ width: 320, borderRadius: 12, padding: 16, background: '#111827', color: '#F9FAFB', border: '1px solid #1F2937', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Install app</h3>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85, marginBottom: 14 }}>Add Taliyo Marketplace to your home screen for a full-screen experience.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancelWrapped} style={{ padding: '8px 12px', borderRadius: 8, background: '#374151', color: '#E5E7EB', border: 'none' }}>Cancel</button>
          <button onClick={onConfirmInstall} style={{ padding: '8px 12px', borderRadius: 8, background: '#2563EB', color: 'white', border: 'none' }}>Install</button>
        </div>
      </div>
    </div>
  ) : null;
}
