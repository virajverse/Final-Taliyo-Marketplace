'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PWAInstallBridge() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');

  const ensureDeviceId = () => {
    try {
      let id: string = localStorage.getItem('pwa_device_id') || '';
      if (!id) {
        try {
          id =
            (crypto as any)?.randomUUID?.() ||
            `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        } catch {
          id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }
        localStorage.setItem('pwa_device_id', id);
      }
      setDeviceId(id);
      return id;
    } catch {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setDeviceId(id);
      return id;
    }
  };

  const getUserMeta = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      return { user_id: u?.id || null, user_email: u?.email || null };
    } catch {
      return { user_id: null, user_email: null };
    }
  };

  const postEvent = async (payload: Record<string, any>) => {
    try {
      const id = deviceId || ensureDeviceId();
      const user = await getUserMeta();
      const body = {
        device_id: id,
        ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        lang: typeof navigator !== 'undefined' ? navigator.language : '',
        platform: (navigator as any)?.platform || '',
        ref: typeof document !== 'undefined' ? document.referrer : '',
        ...user,
        ...payload,
      };
      await fetch('/api/pwa-installs/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'omit',
      });
    } catch {}
  };

  useEffect(() => {
    const ua = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    const iOS = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const standalone =
      (navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(iOS && isSafari);
    ensureDeviceId();

    // If currently running in standalone, mark installed and return early
    if (standalone) {
      setVisible(false);
      setInstalled(true);
      try {
        const id = ensureDeviceId();
        const key = `first_open_sent_${id}`;
        const sent = localStorage.getItem(key);
        if (!sent) {
          localStorage.setItem('pwaInstalled', '1');
          localStorage.setItem('pwaInstalledAt', String(Date.now()));
          localStorage.setItem(key, '1');
          postEvent({ event: 'first_open' });
        }
      } catch {}
      return;
    }

    // Not in standalone: verify uninstall and clear stale install flags if necessary
    (async () => {
      try {
        const anyNav: any = navigator as any;
        if (typeof anyNav.getInstalledRelatedApps === 'function') {
          const apps = await anyNav.getInstalledRelatedApps();
          const hasWebApp = Array.isArray(apps) && apps.some((a: any) => a.platform === 'webapp');
          if (!hasWebApp) {
            localStorage.removeItem('pwaInstalled');
            localStorage.removeItem('pwaInstalledAt');
          }
        } else {
          const ts = Number(localStorage.getItem('pwaInstalledAt') || '0');
          if (
            localStorage.getItem('pwaInstalled') === '1' &&
            ts &&
            Date.now() - ts > 7 * 24 * 60 * 60 * 1000
          ) {
            localStorage.removeItem('pwaInstalled');
            localStorage.removeItem('pwaInstalledAt');
          }
        }
      } catch {}
    })();

    // Adopt any previously captured beforeinstallprompt event
    try {
      const existing = (window as any).__bip;
      if (existing) {
        setDeferredPrompt(existing);
        setVisible(true);
      }
    } catch {}

    // Fallback: if not installed and no BIP yet, still show the bar so user can see how to install
    if (!iOS && !standalone) {
      setVisible(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
      (window as any).__bip = e;
      // Impression of install affordance on non-iOS
      if (!isIOS) postEvent({ type: 'bar_impression' });
    };

    const handleAppInstalled = () => {
      localStorage.setItem('pwaInstalled', '1');
      localStorage.setItem('pwaInstalledAt', String(Date.now()));
      setInstalled(true);
      setTimeout(() => setVisible(false), 1200);
      setDeferredPrompt(null);
      postEvent({ event: 'appinstalled' });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    const handleBipReady = () => {
      try {
        const e = (window as any).__bip;
        if (e) {
          setDeferredPrompt(e);
          setVisible(true);
        }
      } catch {}
    };
    window.addEventListener('bipready', handleBipReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (iOS && !standalone) {
      setVisible(true);
      // iOS hint impression (no native BIP)
      postEvent({ type: 'ios_hint_impression' });
    }

    const mm = window.matchMedia('(display-mode: standalone)');
    const onChange = () => {
      if (mm.matches) {
        localStorage.setItem('pwaInstalled', '1');
        localStorage.setItem('pwaInstalledAt', String(Date.now()));
        setInstalled(true);
        setTimeout(() => setVisible(false), 1200);
        // First open inside PWA (once)
        try {
          const id = deviceId || ensureDeviceId();
          const key = `first_open_sent_${id}`;
          const sent = localStorage.getItem(key);
          if (!sent) {
            localStorage.setItem(key, '1');
            postEvent({ event: 'first_open' });
          }
        } catch {}
      }
    };
    mm.addEventListener('change', onChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('bipready', handleBipReady);
      mm.removeEventListener('change', onChange);
    };
  }, []);

  if (!visible) return null;

  const onClick = async () => {
    if (isIOS) {
      setShowIOSHelp(true);
      return;
    }
    if (deferredPrompt) {
      // User prompted
      postEvent({ type: 'prompted' });
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice && choice.outcome === 'accepted') {
        localStorage.setItem('pwaInstalled', '1');
        setInstalled(true);
        setTimeout(() => setVisible(false), 1200);
      }
      return;
    }
    // No BIP available: show help overlay for Android/Desktop
    setShowIOSHelp(true);
  };

  return (
    <>
      <button
        onClick={onClick}
        disabled={installed}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          installed
            ? 'bg-green-600 text-white cursor-default opacity-100'
            : !isIOS && !deferredPrompt
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {installed ? '✅ Installed' : isIOS ? 'Install on iOS' : 'Install App'}
      </button>

      {showIOSHelp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full mx-4 text-sm shadow-lg">
            <div className="text-base font-semibold mb-2">
              {isIOS ? 'Install on iPhone' : 'Install on Android/Desktop'}
            </div>
            {isIOS ? (
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Tap the Share button in Safari.</li>
                <li>Choose Add to Home Screen.</li>
                <li>Tap Add.</li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Open the browser menu (⋮ or ⋯).</li>
                <li>Select Install App or Add to Home screen.</li>
                <li>Confirm to add the app to your device.</li>
              </ol>
            )}
            <button
              onClick={() => setShowIOSHelp(false)}
              className="mt-3 w-full bg-gray-900 text-white rounded-lg py-2 hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
