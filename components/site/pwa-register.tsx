"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => undefined);
    }

    const wasDismissed = window.localStorage.getItem("kp_pwa_dismissed") === "1";
    setDismissed(wasDismissed);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    try {
      await deferredPrompt.prompt();
      const res = await deferredPrompt.userChoice;
      if (res.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem("kp_pwa_dismissed", "1");
    } catch {
      // ignore storage failure
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[95] hidden sm:flex items-center gap-2.5 rounded-full border border-white/20 bg-[#08100c]/90 px-4 py-2 text-xs text-[#e2eee7] shadow-xl backdrop-blur-xl">
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex cursor-pointer items-center gap-2 font-mono text-[11px] font-medium text-white hover:text-[#e5a853]"
      >
        <Download className="h-3.5 w-3.5 text-[#e5a853]" />
        Install Kibo &amp; Plains App
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="cursor-pointer rounded-full p-0.5 text-white/60 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
