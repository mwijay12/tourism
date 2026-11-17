"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { PwaRegister } from "@/components/site/pwa-register";
import {
  applySiteThemeTokens,
  fetchSiteSettingsRemote,
  readSiteSettingsLocal,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAppWorkspace =
    pathname.startsWith("/admin") || pathname.startsWith("/portal");

  useEffect(() => {
    const syncTheme = (overrideSettings?: SiteControlSettings) => {
      const settings = overrideSettings || readSiteSettingsLocal();
      const isDark = document.documentElement.classList.contains("dark");
      applySiteThemeTokens(settings.siteTheme || "savanna", isDark);
    };

    syncTheme();
    fetchSiteSettingsRemote()
      .then((s) => syncTheme(s))
      .catch(() => undefined);

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      syncTheme(detail);
    };

    const classObserver = new MutationObserver(() => syncTheme());
    classObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("kp-site-settings-updated", onUpdate);
    window.addEventListener("storage", () => syncTheme());
    return () => {
      classObserver.disconnect();
      window.removeEventListener("kp-site-settings-updated", onUpdate);
    };
  }, []);

  if (isAppWorkspace) {
    return (
      <>
        <main className="flex-1 min-h-screen">{children}</main>
        <PwaRegister />
      </>
    );
  }

  return (
    <>
      <SiteNavbar />
      <main className="flex-1 w-full max-w-full overflow-x-clip">{children}</main>
      <SiteFooter />
      <PwaRegister />
    </>
  );
}
