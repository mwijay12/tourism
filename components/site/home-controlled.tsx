"use client";

import React, { useEffect, useState } from "react";
import ParallaxHero from "@/components/ui/wilderness";
import { ScrollExpeditionReel } from "@/components/creative/scroll-expedition-reel";
import { ExpeditionInstruments } from "@/components/site/expedition-instruments";
import { TransitionLink } from "@/components/creative/transition-provider";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettingsRemote,
  readSiteSettingsLocal,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";
import { ArrowUpRight, Mountain } from "lucide-react";

export function ControlledHomeHero() {
  const [settings, setSettings] =
    useState<SiteControlSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(readSiteSettingsLocal());
    fetchSiteSettingsRemote().then(setSettings).catch(() => undefined);

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      if (detail) setSettings(detail);
    };
    window.addEventListener("kp-site-settings-updated", onUpdate);
    return () =>
      window.removeEventListener("kp-site-settings-updated", onUpdate);
  }, []);

  return (
    <ParallaxHero
      eyebrow={settings.heroEyebrow}
      title={settings.heroTitle}
      subtitle={settings.heroSubtitle}
      backdropSrc={settings.heroBackdrop}
    >
      <div className="flex flex-wrap items-center justify-center gap-3.5">
        <TransitionLink
          href="/kilimanjaro"
          label="MOUNT KILIMANJARO EXPEDITIONS"
          className="inline-flex items-center gap-2 rounded-full bg-[#e5a853] px-6 py-3 text-sm font-semibold text-[#08100c] shadow-lg transition hover:bg-white"
        >
          <Mountain className="h-4 w-4" />
          Climb Kilimanjaro
        </TransitionLink>
        <TransitionLink
          href="/parks"
          label="TANZANIA NATIONAL PARKS"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15"
        >
          Explore Parks &amp; Wildlife
          <ArrowUpRight className="h-4 w-4" />
        </TransitionLink>
      </div>

      {/* Expedition telemetry pill bar */}
      <div className="mx-auto mt-8 sm:mt-10 grid grid-cols-2 gap-x-4 gap-y-2 sm:inline-flex sm:items-center sm:gap-6 rounded-2xl sm:rounded-full border border-white/15 bg-black/45 px-5 sm:px-6 py-3 sm:py-2.5 font-mono text-[10px] sm:text-[11px] tracking-wider text-white/85 backdrop-blur-md">
        <span>01 · UHURU PEAK 5,895M</span>
        <span className="hidden sm:inline h-3 w-px bg-white/20" />
        <span>02 · SERENGETI 14,763 KM²</span>
        <span className="hidden sm:inline h-3 w-px bg-white/20" />
        <span>03 · NGORONGORO CALDERA</span>
        <span className="hidden sm:inline h-3 w-px bg-white/20" />
        <span className="text-[#e5a853]">KPAP ETHICAL CREWS</span>
      </div>
    </ParallaxHero>
  );
}

export function ControlledScrollReelSection() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(readSiteSettingsLocal().showExpeditionReel);
    fetchSiteSettingsRemote()
      .then((s) => setEnabled(s.showExpeditionReel))
      .catch(() => undefined);

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      if (detail) setEnabled(detail.showExpeditionReel);
    };
    window.addEventListener("kp-site-settings-updated", onUpdate);
    return () =>
      window.removeEventListener("kp-site-settings-updated", onUpdate);
  }, []);

  if (!enabled) return null;
  return <ScrollExpeditionReel />;
}

export function ControlledInstrumentsSection() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(readSiteSettingsLocal().showInstrumentsSection);
    fetchSiteSettingsRemote()
      .then((s) => setEnabled(s.showInstrumentsSection))
      .catch(() => undefined);

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      if (detail) setEnabled(detail.showInstrumentsSection);
    };
    window.addEventListener("kp-site-settings-updated", onUpdate);
    return () =>
      window.removeEventListener("kp-site-settings-updated", onUpdate);
  }, []);

  if (!enabled) return null;
  return <ExpeditionInstruments />;
}
