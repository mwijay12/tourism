"use client";

import React, { useEffect, useState } from "react";
import ParallaxHero from "@/components/ui/wilderness";
import { ScrollExpeditionReel } from "@/components/creative/scroll-expedition-reel";
import { ExpeditionInstruments } from "@/components/site/expedition-instruments";
import { KilimanjaroRouteChart } from "@/components/creative/kilimanjaro-route-chart";
import { TransitionLink } from "@/components/creative/transition-provider";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettingsRemote,
  readSiteSettingsLocal,
  resolveSiteMedia,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";
import { ArrowUpRight, Compass, Mountain } from "lucide-react";

function useLiveSiteSettings() {
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

  return settings;
}

export function ControlledHomeHero() {
  const settings = useLiveSiteSettings();
  const backdrop = resolveSiteMedia(
    settings,
    "hero-backdrop",
    settings.heroBackdrop
  );

  return (
    <ParallaxHero
      eyebrow={settings.heroEyebrow}
      title={settings.heroTitle}
      subtitle={settings.heroSubtitle}
      backdropSrc={backdrop}
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

export function ControlledKilimanjaroSection() {
  const settings = useLiveSiteSettings();
  const card1 = resolveSiteMedia(
    settings,
    "kili-card-1",
    "/images/kilimanjaro-summit-dawn.jpg"
  );
  const card2 = resolveSiteMedia(
    settings,
    "kili-card-2",
    "/images/kilimanjaro-mawenzi-ridge.jpg"
  );

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-28 bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center mb-12 sm:mb-14">
          <div data-scroll-reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.18em] text-primary">
              <Compass className="h-3.5 w-3.5" />
              Kilima Njaro · The Roof of Africa
            </div>
            <h2 className="mt-4 font-serif text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.03]">
              {settings.kilimanjaroTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-lg leading-relaxed text-muted-foreground">
              {settings.kilimanjaroBody}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border aspect-[4/5] shadow-md">
              <img
                src={card1}
                alt="Mountaineers approaching Uhuru Peak glacier ridge at dawn"
                data-scroll-parallax
                className="h-full w-full object-cover will-change-transform"
              />
            </div>
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border aspect-[4/5] sm:translate-y-6 shadow-md">
              <img
                src={card2}
                alt="Climbers on Kibo crater ridge looking across clouds to Mawenzi Peak"
                data-scroll-parallax
                className="h-full w-full object-cover will-change-transform"
              />
            </div>
          </div>
        </div>

        <div data-scroll-reveal>
          <KilimanjaroRouteChart />
        </div>
      </div>
    </section>
  );
}

export function ControlledScrollReelSection() {
  const settings = useLiveSiteSettings();
  if (!settings.showExpeditionReel) return null;
  return <ScrollExpeditionReel />;
}

export function ControlledInstrumentsSection() {
  const settings = useLiveSiteSettings();
  if (!settings.showInstrumentsSection) return null;
  return <ExpeditionInstruments />;
}
