"use client";

import React, { useEffect, useState } from "react";
import RidgelineDitherFooter, {
  type RidgelinePreset,
} from "@/components/ui/ridgeline-dither-footer";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettingsRemote,
  readSiteSettingsLocal,
  type SiteControlSettings,
  type SiteThemeId,
} from "@/lib/firebase/site-settings";

const THEME_TO_FOOTER_PRESET: Record<SiteThemeId, RidgelinePreset> = {
  savanna: "auto",
  obsidian: "night",
  serengeti: "sepia",
  zanzibar: "glacier",
};

export function SiteFooter() {
  const [settings, setSettings] =
    useState<SiteControlSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(readSiteSettingsLocal());
    fetchSiteSettingsRemote().then(setSettings).catch(() => undefined);

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      if (detail) setSettings(detail);
      else setSettings(readSiteSettingsLocal());
    };
    window.addEventListener("kp-site-settings-updated", onUpdate);
    return () =>
      window.removeEventListener("kp-site-settings-updated", onUpdate);
  }, []);

  const waHref = `https://wa.me/${
    settings.whatsappNumber.replace(/[^0-9]/g, "") || "255792867427"
  }`;

  return (
    <RidgelineDitherFooter
      preset={THEME_TO_FOOTER_PRESET[settings.siteTheme] || "auto"}
      seed={19}
      ridges={6}
      pixel={3}
      mist={0.78}
      drift={1}
      altimeter={true}
      name={settings.brandName || "Kibo & Plains"}
      logo={
        settings.brandLogoUrl ? (
          <img
            src={settings.brandLogoUrl}
            alt={settings.brandName}
            className="h-7 w-7 rounded-md object-contain"
          />
        ) : undefined
      }
      brandHref="/"
      tagline={settings.brandTagline}
      columns={[
        {
          title: "Expeditions",
          links: [
            { label: "Mount Kilimanjaro", href: "/kilimanjaro", badge: "5,895m" },
            { label: "Serengeti Migration", href: "/parks?park=serengeti" },
            { label: "Ngorongoro Crater", href: "/parks?park=ngorongoro" },
            { label: "Tarangire & Ruaha", href: "/parks?park=tarangire" },
            { label: "Mahale & Zanzibar", href: "/parks?park=zanzibar" },
          ],
        },
        {
          title: "Planning & Ethics",
          links: [
            { label: "Plan Custom Safari", href: "/inquire", badge: "2026–27" },
            { label: "KPAP Porter Charter", href: "/kilimanjaro#kpap" },
            { label: "Migration Calendar", href: "/#seasons" },
            { label: "WhatsApp Concierge", href: waHref },
          ],
        },
        {
          title: "Legal & Studio",
          links: [
            { label: "Admin Console", href: "/admin", badge: "Auth" },
            { label: "Client Portal", href: "/portal", badge: "Trips" },
            { label: "Terms & Conditions", href: "/terms" },
            { label: "Privacy & PDPA 2022", href: "/privacy" },
            { label: "Altraware Technology", href: "https://altraware-tech.vercel.app/" },
            { label: "Altra Motion Lab", href: "https://altra-motion-lab.vercel.app/services/" },
          ],
        },
      ]}
      socials={[
        { icon: "instagram", href: "https://instagram.com", label: "Instagram" },
        { icon: "youtube", href: "https://youtube.com", label: "Expedition Films" },
        { icon: "linkedin", href: "https://linkedin.com", label: "LinkedIn" },
        { icon: "github", href: "https://github.com/mwijay12/tourism", label: "GitHub" },
      ]}
      copyright={`© ${new Date().getFullYear()} ${
        settings.brandName || "Kibo & Plains"
      } Expeditions Ltd · Arusha & Moshi, Tanzania.`}
      credit={{ label: "Altraware Technology", href: "https://altraware-tech.vercel.app/" }}
    />
  );
}
