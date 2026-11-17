"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Moon,
  Sun,
  X,
  Compass,
  ArrowUpRight,
  Search,
  Mountain,
  MapPin,
  Sparkles,
} from "lucide-react";
import { TransitionLink } from "@/components/creative/transition-provider";
import { cn } from "@/lib/utils";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettingsRemote,
  readSiteSettingsLocal,
  resolveSiteMedia,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";
import {
  EXPEDITION_ITINERARIES,
  KILIMANJARO_ROUTES,
  NATIONAL_PARKS,
} from "@/lib/tanzania-data";

const NAV_ITEMS = [
  { href: "/", label: "Overview", curtain: "KIBO & PLAINS · OVERVIEW" },
  { href: "/kilimanjaro", label: "Kilimanjaro", curtain: "UHURU PEAK · 5,895 M" },
  { href: "/parks", label: "National Parks", curtain: "TANZANIA PARKS · WILDLIFE" },
  { href: "/inquire", label: "Plan Expedition", curtain: "BESPOKE SAFARI · ARUSHA" },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [eatTime, setEatTime] = useState("15:40 EAT");
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
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const updateClock = () => {
      try {
        const fmt = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Africa/Dar_es_Salaam",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
        setEatTime(`${fmt} EAT`);
      } catch {
        setEatTime("EAT UTC+3");
      }
    };
    updateClock();
    const t = setInterval(updateClock, 30000);
    return () => clearInterval(t);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const parkHits = NATIONAL_PARKS.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.wildlife.some((w) => w.toLowerCase().includes(q))
    ).map((p) => ({
      id: `park-${p.slug}`,
      title: p.name,
      subtitle: `${p.region} · ${p.bestWindow} · ${p.wildlife.slice(0, 2).join(", ")}`,
      category: "Park",
      href: `/parks?park=${p.slug}`,
      image: resolveSiteMedia(siteSettings, `park-${p.slug}`, p.image),
    }));

    const routeHits = KILIMANJARO_ROUTES.filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.nickname.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q)
    ).map((r) => ({
      id: `kili-${r.id}`,
      title: r.name,
      subtitle: `${r.days} Days · ${r.successRate}% Summit Rate · ${r.nickname}`,
      category: "Kilimanjaro",
      href: `/kilimanjaro`,
      image: resolveSiteMedia(
        siteSettings,
        "kili-card-1",
        "/images/kilimanjaro-summit-dawn.jpg"
      ),
    }));

    const expHits = EXPEDITION_ITINERARIES.filter(
      (e) =>
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.routeSummary.toLowerCase().includes(q) ||
        e.highlight.toLowerCase().includes(q)
    ).map((e) => ({
      id: `exp-${e.id}`,
      title: e.title,
      subtitle: `${e.days} Days · From $${e.startingFromUsd.toLocaleString()} pp · ${e.routeSummary}`,
      category: "Expedition",
      href: `/inquire?trip=${e.id}`,
      image: resolveSiteMedia(siteSettings, `exp-${e.id}`, e.image),
    }));

    return [...parkHits, ...routeHits, ...expHits].slice(0, q ? 12 : 6);
  }, [searchQuery, siteSettings]);

  const navigateSearch = (href: string) => {
    setSearchOpen(false);
    setMobileOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] px-4 sm:px-6 pt-3 pointer-events-none flex flex-col items-center gap-2">
        {siteSettings.announcementEnabled && siteSettings.announcementText && (
          <TransitionLink
            href={siteSettings.announcementHref || "/inquire"}
            className="pointer-events-auto inline-flex max-w-full lg:max-w-[1160px] min-w-0 items-center gap-2 rounded-full border border-[#e5a853]/40 bg-[#08100c]/90 px-4 py-1 font-mono text-[10px] sm:text-[11px] text-white shadow-md backdrop-blur-md hover:border-[#e5a853]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5a853] animate-pulse shrink-0" />
            <span className="truncate">{siteSettings.announcementText}</span>
            <ArrowUpRight className="h-3 w-3 text-[#e5a853] shrink-0" />
          </TransitionLink>
        )}
        <div
          className={cn(
            "pointer-events-auto w-full mx-auto flex max-w-[1240px] items-center justify-between gap-2 rounded-full border px-4 sm:px-6 py-2.5 transition-all duration-500",
            scrolled
              ? "border-border/80 bg-background/85 text-foreground shadow-lg backdrop-blur-xl"
              : "border-white/20 bg-black/35 text-white backdrop-blur-md"
          )}
        >
          {/* Brand (Supports Uploaded Brand Logo + Name from Admin Site Controls) */}
          <TransitionLink
            href="/"
            label={`${siteSettings.brandName.toUpperCase()} · TANZANIA`}
            className="flex items-center gap-2.5 font-serif text-lg sm:text-xl font-semibold tracking-tight shrink-0"
          >
            {siteSettings.brandLogoUrl ? (
              <img
                src={siteSettings.brandLogoUrl}
                alt={siteSettings.brandName}
                className="h-7 w-7 rounded-lg object-contain bg-white/95 p-0.5 shrink-0"
              />
            ) : (
              <svg
                viewBox="0 0 30 21"
                className="h-5 w-7 fill-current shrink-0"
                aria-hidden="true"
              >
                <path d="M0 21 L10.5 3 L16 12.2 L20.5 6.5 L30 21 Z" />
              </svg>
            )}
            <span>{siteSettings.brandName}</span>
          </TransitionLink>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  label={item.curtain}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors",
                    active
                      ? scrolled
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-[#08100c]"
                      : scrolled
                      ? "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  )}
                >
                  {item.label}
                </TransitionLink>
              );
            })}
          </nav>

          {/* Right Controls + Spacious Search Trigger */}
          <div className="flex items-center gap-2">
            {/* Spacious Search Button (Never cramped or tiny) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search Tanzania safaris, parks, and Kilimanjaro routes"
              className={cn(
                "cursor-pointer inline-flex items-center gap-2.5 rounded-full border px-3.5 sm:px-4 h-9 text-xs transition",
                scrolled
                  ? "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary"
                  : "border-white/25 bg-white/10 text-white hover:bg-white/20"
              )}
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-[#e5a853]" />
              <span className="hidden sm:inline font-medium opacity-90">
                Search parks, climbs...
              </span>
              <span className="hidden xl:inline rounded-md border border-current/20 px-1.5 py-0.5 font-mono text-[10px] opacity-70">
                ⌘K
              </span>
            </button>

            <div
              className={cn(
                "hidden xl:flex items-center gap-1.5 rounded-full border px-3 h-9 font-mono text-[10.5px] tracking-wider",
                scrolled
                  ? "border-border text-muted-foreground"
                  : "border-white/20 text-white/80"
              )}
              title="Local time in Arusha & Dar es Salaam, Tanzania"
            >
              <Compass className="h-3 w-3 text-[#d8914f]" />
              <span>{eatTime}</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light or dark mode"
              className={cn(
                "cursor-pointer grid h-9 w-9 place-items-center rounded-full border transition",
                scrolled
                  ? "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <TransitionLink
              href="/inquire"
              label="BESPOKE EXPEDITION PLANNER"
              className={cn(
                "hidden sm:inline-flex items-center rounded-full px-4 h-9 text-xs font-semibold transition",
                scrolled
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "bg-[#e5a853] text-[#08100c] hover:bg-white"
              )}
            >
              {siteSettings.navCtaLabel || "Book Safari"}
            </TransitionLink>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className={cn(
                "cursor-pointer lg:hidden grid h-9 w-9 place-items-center rounded-full border transition",
                scrolled
                  ? "border-border text-foreground"
                  : "border-white/25 text-white"
              )}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="pointer-events-auto lg:hidden mx-auto mt-1 w-full max-w-[1240px] rounded-3xl border border-border bg-background/95 p-4 text-foreground shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
              className="mb-3 w-full cursor-pointer flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              <Search className="h-4 w-4 text-primary" />
              <span>Search Serengeti, Kilimanjaro, Zanzibar...</span>
            </button>

            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  label={item.curtain}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  )}
                >
                  {item.label}
                </TransitionLink>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 px-2 font-mono text-[11px] text-muted-foreground">
              <span>Arusha · Moshi · Tanzania</span>
              <span>{eatTime}</span>
            </div>
          </div>
        )}
      </header>

      {/* FULL-SIZE WEBSITE SEARCH SPOTLIGHT OVERLAY */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[220] flex items-start justify-center bg-black/70 p-4 pt-16 sm:pt-24 backdrop-blur-md"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large, Comfortable Search Input */}
            <div className="flex items-center gap-3 border-b border-border bg-background px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-primary" />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Serengeti, Lemosho, Ngorongoro, Zanzibar, Wildlife..."
                className="h-11 w-full bg-transparent text-base sm:text-lg font-medium text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="cursor-pointer rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search modal"
                className="cursor-pointer grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Instant Search Results List */}
            <div className="max-h-[62vh] overflow-y-auto p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between px-2 pb-1 font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                <span>
                  {searchQuery
                    ? `${searchResults.length} matching destinations & routes`
                    : "Popular Tanzania Destinations & Routes"}
                </span>
                <span>ESC to close</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No matching parks or expeditions found for &ldquo;{searchQuery}&rdquo;. Try{" "}
                  <button
                    type="button"
                    onClick={() => setSearchQuery("Serengeti")}
                    className="cursor-pointer font-semibold text-primary underline"
                  >
                    Serengeti
                  </button>{" "}
                  or{" "}
                  <button
                    type="button"
                    onClick={() => setSearchQuery("Lemosho")}
                    className="cursor-pointer font-semibold text-primary underline"
                  >
                    Lemosho
                  </button>
                  .
                </div>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {searchResults.map((hit) => (
                    <button
                      key={hit.id}
                      type="button"
                      onClick={() => navigateSearch(hit.href)}
                      className="cursor-pointer flex items-center gap-3.5 rounded-2xl border border-border bg-background/85 p-3 text-left transition hover:border-primary/60 hover:bg-secondary"
                    >
                      <img
                        src={hit.image}
                        alt={hit.title}
                        className="h-14 w-16 shrink-0 rounded-xl object-cover border border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                          {hit.category === "Kilimanjaro" ? (
                            <Mountain className="h-3 w-3" />
                          ) : hit.category === "Park" ? (
                            <MapPin className="h-3 w-3" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          <span>{hit.category}</span>
                        </div>
                        <div className="truncate font-serif text-lg font-semibold text-foreground">
                          {hit.title}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {hit.subtitle}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Direct Shortcuts */}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 px-1">
                <button
                  type="button"
                  onClick={() => navigateSearch("/inquire")}
                  className="cursor-pointer rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Custom Safari Planner →
                </button>
                <button
                  type="button"
                  onClick={() => navigateSearch("/portal")}
                  className="cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-secondary"
                >
                  Client Portal
                </button>
                <button
                  type="button"
                  onClick={() => navigateSearch("/parks")}
                  className="cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-secondary"
                >
                  All 7 National Parks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
