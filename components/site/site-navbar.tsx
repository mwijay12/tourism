"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X, Compass } from "lucide-react";
import { TransitionLink } from "@/components/creative/transition-provider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", curtain: "KIBO & PLAINS · OVERVIEW" },
  { href: "/kilimanjaro", label: "Kilimanjaro", curtain: "UHURU PEAK · 5,895 M" },
  { href: "/parks", label: "National Parks", curtain: "TANZANIA PARKS · WILDLIFE" },
  { href: "/inquire", label: "Plan Expedition", curtain: "BESPOKE SAFARI · ARUSHA" },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [eatTime, setEatTime] = useState("15:40 EAT");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  return (
    <header className="fixed inset-x-0 top-0 z-[100] px-4 sm:px-6 pt-4 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-[1200px] items-center justify-between rounded-full border px-4 sm:px-6 py-2.5 transition-all duration-500",
          scrolled
            ? "border-border/80 bg-background/85 text-foreground shadow-lg backdrop-blur-xl"
            : "border-white/20 bg-black/35 text-white backdrop-blur-md"
        )}
      >
        {/* Brand */}
        <TransitionLink
          href="/"
          label="KIBO & PLAINS · TANZANIA"
          className="flex items-center gap-2.5 font-serif text-lg sm:text-xl font-semibold tracking-tight"
        >
          <svg
            viewBox="0 0 30 21"
            className="h-5 w-7 fill-current shrink-0"
            aria-hidden="true"
          >
            <path d="M0 21 L10.5 3 L16 12.2 L20.5 6.5 L30 21 Z" />
          </svg>
          <span>Kibo &amp; Plains</span>
        </TransitionLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <TransitionLink
                key={item.href}
                href={item.href}
                label={item.curtain}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-colors",
                  active
                    ? scrolled
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-[#08100c]"
                    : scrolled
                    ? "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </TransitionLink>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "hidden lg:flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10.5px] tracking-wider",
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
            aria-label="Toggle evergreen light or night theme"
            className={cn(
              "cursor-pointer grid h-8 w-8 place-items-center rounded-full border transition",
              scrolled
                ? "border-border bg-secondary/50 text-foreground hover:bg-secondary"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          <TransitionLink
            href="/inquire"
            label="BESPOKE EXPEDITION PLANNER"
            className={cn(
              "hidden sm:inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold transition",
              scrolled
                ? "bg-[#d8914f] text-[#08100c] hover:bg-[#e5a853]"
                : "bg-[#e5a853] text-[#08100c] hover:bg-white"
            )}
          >
            Book Safari
          </TransitionLink>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className={cn(
              "cursor-pointer md:hidden grid h-8 w-8 place-items-center rounded-full border transition",
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
        <div className="pointer-events-auto md:hidden mx-auto mt-2 max-w-[1200px] rounded-3xl border border-border bg-background/95 p-4 text-foreground shadow-2xl backdrop-blur-xl">
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
  );
}
