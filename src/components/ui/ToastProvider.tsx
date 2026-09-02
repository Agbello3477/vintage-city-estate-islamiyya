"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: "glass-panel text-slate-800 border-emerald-200 shadow-glass",
        duration: 3500,
      }}
    />
  );
}
