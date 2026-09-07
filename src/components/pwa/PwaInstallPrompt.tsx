"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      // Check if dismissed before
      const dismissed = localStorage.getItem("miwt_pwa_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    // Capture standard PWA install prompt (Chrome, Android, Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("miwt_pwa_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    localStorage.setItem("miwt_pwa_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Floating Bottom-Right Install Badge / Banner */}
      <aside aria-label="Install Application" className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white p-4 rounded-2xl shadow-glass-hover border border-emerald-700/80 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-500/40 flex items-center justify-center text-xl shadow-inner text-amber-300 shrink-0">
              🕌
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white leading-tight">
                Install MIWT Islamiyya App
              </h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Fast 1-tap access on your phone home screen with offline speed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900/60"
            aria-label="Dismiss app install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-2 text-xs font-semibold text-emerald-300 hover:text-white rounded-xl"
          >
            Later
          </button>
        </div>
      </aside>

      {/* iOS Step-by-step Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-slate-900">Install on iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Follow these simple steps in Safari to add the Islamiyya portal icon to your iPhone home screen:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span>Tap the <strong>Share</strong> button</span>
                  <Share className="w-4 h-4 text-emerald-700" />
                  <span>at the bottom of Safari.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span>Scroll down and select <strong>Add to Home Screen</strong></span>
                  <PlusSquare className="w-4 h-4 text-emerald-700" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <span className="text-slate-700">
                  Tap <strong>Add</strong> in the top right corner. Done!
                </span>
              </div>
            </div>

            <Button
              onClick={() => setShowIosGuide(false)}
              variant="primary"
              size="sm"
              className="w-full text-xs"
            >
              Got It
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
