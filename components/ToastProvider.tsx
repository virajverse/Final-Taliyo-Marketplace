"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  duration?: number;
};

type ToastContextType = {
  show: (message: string, variant?: ToastVariant, durationMs?: number) => void;
  success: (message: string, durationMs?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const api = useMemo<ToastContextType>(() => ({
    show: (message, variant = "info", durationMs = 2500) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const item: ToastItem = { id, message, variant, duration: durationMs };
      setToasts((arr) => [...arr.slice(-2), item]);
      window.setTimeout(() => {
        setToasts((arr) => arr.filter((t) => t.id !== id));
      }, durationMs);
    },
    success: (m, d) => api.show(m, "success", d),
    error: (m, d) => api.show(m, "error", d),
    info: (m, d) => api.show(m, "info", d),
    warning: (m, d) => api.show(m, "warning", d),
  }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-50 pointer-events-none">
        <div className="mx-auto w-full max-w-md px-4 space-y-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={
                `pointer-events-auto text-white px-4 py-3 rounded-lg shadow-md text-sm ` +
                (t.variant === "success" ? "bg-green-600" :
                 t.variant === "error" ? "bg-red-600" :
                 t.variant === "warning" ? "bg-yellow-600" : "bg-blue-600")
              }
            >
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
