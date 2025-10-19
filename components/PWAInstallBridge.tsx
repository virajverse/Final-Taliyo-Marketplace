"use client";

import { useEffect, useState } from "react";

export default function PWAInstallBridge() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    const ua = typeof window !== "undefined" ? window.navigator.userAgent : "";
    const iOS = /iphone|ipad|ipod/i.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const standalone = (navigator as any).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    setIsIOS(iOS && isSafari);

    if (standalone || localStorage.getItem("pwaInstalled") === "1") {
      setVisible(false);
      setInstalled(true);
      return;
    }

    // Adopt any previously captured beforeinstallprompt event
    try {
      const existing = (window as any).__bip;
      if (existing) {
        setDeferredPrompt(existing);
        setVisible(true);
      }
    } catch {}

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
      (window as any).__bip = e;
    };

    const handleAppInstalled = () => {
      localStorage.setItem("pwaInstalled", "1");
      setInstalled(true);
      setTimeout(() => setVisible(false), 1200);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
    const handleBipReady = () => {
      try {
        const e = (window as any).__bip;
        if (e) {
          setDeferredPrompt(e);
          setVisible(true);
        }
      } catch {}
    };
    window.addEventListener("bipready", handleBipReady);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (iOS && !standalone) setVisible(true);

    const mm = window.matchMedia("(display-mode: standalone)");
    const onChange = () => {
      if (mm.matches) {
        localStorage.setItem("pwaInstalled", "1");
        setInstalled(true);
        setTimeout(() => setVisible(false), 1200);
      }
    };
    mm.addEventListener("change", onChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt as any);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("bipready", handleBipReady);
      mm.removeEventListener("change", onChange);
    };
  }, []);

  if (!visible) return null;

  const onClick = async () => {
    if (isIOS) {
      setShowIOSHelp(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice && choice.outcome === "accepted") {
        localStorage.setItem("pwaInstalled", "1");
        setInstalled(true);
        setTimeout(() => setVisible(false), 1200);
      }
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        disabled={installed || (!isIOS && !deferredPrompt)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          installed ? "bg-green-600 text-white cursor-default opacity-100" : (!isIOS && !deferredPrompt ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700")
        }`}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {installed ? "✅ Installed" : isIOS ? "Install on iOS" : "Install App"}
      </button>

      {showIOSHelp && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full mx-4 text-sm shadow-lg">
            <div className="text-base font-semibold mb-2">Install on iPhone</div>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Tap the Share button in Safari.</li>
              <li>Choose Add to Home Screen.</li>
              <li>Tap Add.</li>
            </ol>
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
