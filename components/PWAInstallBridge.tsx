'use client';

import { useEffect, useRef } from 'react';

const PARENT_ORIGINS = [
  'https://taliyotechnologies.com',
  'https://www.taliyotechnologies.com',
];

// Update to your deployed app origin
const TOP_LEVEL_INSTALL_URL = 'https://app.taliyotechnologies.com/?install=1';

export default function PWAInstallBridge() {
  const deferredRef = useRef<any>(null);

  // Optional: register SW (kept lightweight)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      try { navigator.serviceWorker.register('/sw', { scope: '/' }); } catch {}
    }
  }, []);

  // Capture the beforeinstallprompt
  useEffect(() => {
    const onBIP = (e: any) => {
      try { e.preventDefault(); } catch {}
      deferredRef.current = e;
      // If opened top-level with ?install=1, attempt prompt immediately
      try {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get('install') === '1' && deferredRef.current?.prompt) {
          deferredRef.current.prompt();
        }
      } catch {}
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  // Handle messages from parent to trigger install
  useEffect(() => {
    const onMessage = async (e: MessageEvent) => {
      if (!PARENT_ORIGINS.includes(e.origin)) return;
      const data: any = e.data || {};
      if (data?.type !== 'taliyo-install') return;

      const parentOrigin = e.origin;

      // If native prompt is available, use it
      if (deferredRef.current?.prompt) {
        try {
          deferredRef.current.prompt();
          const choice = await deferredRef.current.userChoice;
          const status = choice?.outcome === 'accepted' ? 'accepted' : (choice?.outcome === 'dismissed' ? 'dismissed' : 'unavailable');
          window.parent?.postMessage({ type: 'pwa-install-result', status }, parentOrigin);
          deferredRef.current = null;
          return;
        } catch {
          // Fall through to top-level flow
        }
      }

      // Fallback: ask parent to open a top-level tab so prompt can show
      window.parent?.postMessage({ type: 'taliyo-open-top-level', url: TOP_LEVEL_INSTALL_URL }, parentOrigin);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return null;
}
