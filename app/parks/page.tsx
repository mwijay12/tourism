"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NATIONAL_PARKS, type NationalPark } from "@/lib/tanzania-data";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettingsRemote,
  getEffectiveParks,
  readSiteSettingsLocal,
  resolveSiteMedia,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";
import { WebGLImagePlane } from "@/components/creative/webgl-image-plane";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, Binoculars, Calendar, Compass, MapPin, Mountain, Search, X } from "lucide-react";

function ParksAtlasContent() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("park");
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialSlug && NATIONAL_PARKS.some((p) => p.slug === initialSlug)
      ? initialSlug
      : NATIONAL_PARKS[0].slug
  );
  const [parkQuery, setParkQuery] = useState("");
  const [siteSettings, setSiteSettings] =
    useState<SiteControlSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSiteSettings(readSiteSettingsLocal());
    fetchSiteSettingsRemote().then(setSiteSettings).catch(() => undefined);
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      if (detail) setSiteSettings(detail);
    };
    window.addEventListener("kp-site-settings-updated", onUpdate);
    return () =>
      window.removeEventListener("kp-site-settings-updated", onUpdate);
  }, []);

  useEffect(() => {
    if (initialSlug && NATIONAL_PARKS.some((p) => p.slug === initialSlug)) {
      setSelectedSlug(initialSlug);
    }
  }, [initialSlug]);

  const effectiveParks = useMemo(
    () => getEffectiveParks(siteSettings),
    [siteSettings]
  );

  const filteredParks = useMemo(() => {
    const q = parkQuery.trim().toLowerCase();
    if (!q) return effectiveParks;
    return effectiveParks.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.wildlife.some((w) => w.toLowerCase().includes(q))
    );
  }, [effectiveParks, parkQuery]);

  const activePark: NationalPark =
    effectiveParks.find((p) => p.slug === selectedSlug) ?? effectiveParks[0];
  const activeParkImg = resolveSiteMedia(
    siteSettings,
    `park-${activePark.slug}`,
    activePark.image
  );

  return (
    <div className="pt-28 pb-20 bg-background text-foreground overflow-x-clip">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        {/* Intro */}
        <div className="max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Tanzania Wildlife &amp; Sanctuary Atlas
          </span>
          <h1 className="mt-3 font-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02]">
            Seven iconic ecosystems across one nation.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Over 38% of Tanzania’s land mass is conserved under national parks and wildlife reserves. Select any sanctuary to inspect wildlife checklists, elevation, and seasonal fly-in logistics.
          </p>
        </div>

        {/* Full-Width Spacious Park & Wildlife Search Bar */}
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-sm focus-within:border-primary">
          <Search className="h-5 w-5 shrink-0 text-primary" />
          <input
            type="search"
            value={parkQuery}
            onChange={(e) => setParkQuery(e.target.value)}
            placeholder="Search national parks, wildlife (e.g. lions, whale sharks, crater), or region..."
            className="h-10 w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
          />
          {parkQuery && (
            <button
              type="button"
              onClick={() => setParkQuery("")}
              className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px]"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Selector Pill Strip (horizontal scroll on mobile) */}
        <div className="mt-5 flex overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 gap-2 sm:gap-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filteredParks.map((park) => {
            const active = park.slug === activePark.slug;
            return (
              <button
                key={park.slug}
                type="button"
                onClick={() => setSelectedSlug(park.slug)}
                className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {park.name}
              </button>
            );
          })}
        </div>

        {/* Featured Active Park Dossier */}
        <div className="mt-10 grid gap-8 rounded-3xl border border-border bg-card p-6 sm:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-start shadow-md">
          <div className="space-y-4">
            <div className="group overflow-hidden rounded-2xl border border-border aspect-[16/10]">
              <WebGLImagePlane
                src={activeParkImg}
                alt={activePark.name}
                className="h-full w-full"
              />
            </div>
            {activePark.secondaryImage && (
              <div className="group overflow-hidden rounded-2xl border border-border aspect-[16/9]">
                <WebGLImagePlane
                  src={activePark.secondaryImage}
                  alt={`${activePark.name} secondary perspective`}
                  className="h-full w-full"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-primary/12 px-3 py-1 font-mono text-[11px] font-medium text-primary">
                  {activePark.region}
                </span>
                <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-[#d8914f]" />
                  {activePark.coordinates}
                </span>
              </div>

              <h2 className="mt-4 font-serif text-3xl sm:text-5xl font-semibold text-foreground">
                {activePark.name}
              </h2>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {activePark.swahiliName}
              </p>

              <p className="mt-5 text-base leading-relaxed text-foreground/90">
                {activePark.description}
              </p>

              <dl className="mt-7 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-background/70 p-4 text-xs">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> Area
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">{activePark.area}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-primary" /> Elevation
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">{activePark.elevation}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" /> Window
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">{activePark.bestWindow}</dd>
                </div>
              </dl>

              <div className="mt-7">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <Binoculars className="h-3.5 w-3.5 text-primary" />
                  Key Wildlife &amp; Habitat Signatures
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activePark.wildlife.map((sp) => (
                    <span
                      key={sp}
                      className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-6 flex flex-wrap gap-3">
              <TransitionLink
                href={`/inquire?park=${activePark.slug}`}
                label={`PLAN ${activePark.name.toUpperCase()}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Include {activePark.name} in Itinerary
                <ArrowUpRight className="h-4 w-4" />
              </TransitionLink>
            </div>
          </div>
        </div>

        {/* Full Gallery Grid of All 7 Parks */}
        <div className="mt-20">
          <h3 className="font-serif text-3xl font-semibold">All Tanzanian Sanctuaries</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredParks.map((park) => (
              <button
                key={park.slug}
                type="button"
                onClick={() => {
                  setSelectedSlug(park.slug);
                  window.scrollTo({ top: 120, behavior: "smooth" });
                }}
                className={`cursor-pointer group text-left overflow-hidden rounded-2xl border transition-all ${
                  park.slug === activePark.slug
                    ? "border-primary ring-2 ring-primary/25 bg-card"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={resolveSiteMedia(siteSettings, `park-${park.slug}`, park.image)}
                    alt={park.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    {park.region} · {park.bestWindow}
                  </div>
                  <div className="mt-1 font-serif text-xl font-semibold text-foreground">
                    {park.name}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {park.tagline}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-background font-mono text-xs text-muted-foreground">
          Loading Tanzania National Parks Atlas...
        </div>
      }
    >
      <ParksAtlasContent />
    </Suspense>
  );
}
