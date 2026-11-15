"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, svg, stagger } from "animejs";
import {
  KilimanjaroCompassSvg,
  MigrationArcSvg,
  OpticsBinocularsSvg,
  PulseOximeterSvg,
  SafariCruiserWheelSvg,
  ZanzibarDhowSvg,
} from "@/components/creative/safari-svgs";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, Radio } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const INSTRUMENT_CSS = `
.inst-card {
  --svg-speed: 14s;
}
.inst-card:hover,
.inst-card[data-active="true"] {
  --svg-speed: 3.2s;
}
.svg-spin-slow {
  animation: svg-rotate var(--svg-speed, 14s) linear infinite;
}
.svg-wheel {
  animation: svg-rotate calc(var(--svg-speed, 14s) * 0.52) linear infinite;
}
.svg-optic-ring {
  animation: svg-rotate calc(var(--svg-speed, 14s) * 0.75) linear infinite;
}
.svg-optic-ring-rev {
  animation: svg-rotate calc(var(--svg-speed, 14s) * 0.75) linear infinite reverse;
}
.svg-needle {
  animation: svg-sway 4.2s ease-in-out infinite;
}
.svg-rock {
  animation: svg-tilt 4.6s ease-in-out infinite;
}
@keyframes svg-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes svg-sway {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(10deg); }
}
@keyframes svg-tilt {
  0%, 100% { transform: rotate(-2.5deg) translateY(0px); }
  50% { transform: rotate(2.5deg) translateY(-2.5px); }
}
@media (prefers-reduced-motion: reduce) {
  .svg-spin-slow, .svg-wheel, .svg-optic-ring, .svg-optic-ring-rev, .svg-needle, .svg-rock {
    animation: none !important;
  }
}
`;

const INSTRUMENTS = [
  {
    code: "01 / ALTITUDE",
    title: "Uhuru Survey & Acclimatization",
    metric: "5,895 m Kibo",
    liveTelemetry: "Barafu Ridge · -6°C · Wind 18 kt",
    detail: "Barometric pacing on Lemosho & Northern Circuit with disciplined 'pole pole' daily elevation gain.",
    href: "/kilimanjaro",
    Svg: KilimanjaroCompassSvg,
  },
  {
    code: "02 / FLEET",
    title: "Extended 4x4 Land Cruisers",
    metric: "Pop-Top · Dual Spare",
    liveTelemetry: "Arusha Garage Checked · 320L Fuel Range",
    detail: "Custom long-wheelbase Toyota Land Cruisers tuned for Serengeti corrugated tracks, with dual inverters.",
    href: "/parks",
    Svg: SafariCruiserWheelSvg,
  },
  {
    code: "03 / ECOLOGY",
    title: "Great Migration Intercepts",
    metric: "1.5M+ Wildebeest",
    liveTelemetry: "Mara & Ndutu GPS Tracked Daily",
    detail: "Seasonal mobile tented camps positioned along exact Grumeti & Mara River crossing corridors.",
    href: "/#seasons",
    Svg: MigrationArcSvg,
  },
  {
    code: "04 / MEDICAL",
    title: "SpO2 Oximetry & Gamow Safety",
    metric: "KPAP Verified Crew",
    liveTelemetry: "AM/PM Lake Louise Check · 100% O2 Ready",
    detail: "Twice-daily blood-oxygen checks, pressurized oxygen cylinders, and hyperbaric chambers on high routes.",
    href: "/kilimanjaro#kpap",
    Svg: PulseOximeterSvg,
  },
  {
    code: "05 / OPTICS",
    title: "Master Naturalist Spotters",
    metric: "Swarovski Optics",
    liveTelemetry: "Big Five & 550+ Bird Species ID",
    detail: "TALA-licensed Tanzanian guides trained in feline tracking, nocturnal ecology & telephoto positioning.",
    href: "/parks",
    Svg: OpticsBinocularsSvg,
  },
  {
    code: "06 / COAST",
    title: "Bush-to-Reef Zanzibar Dhows",
    metric: "Mnemba & Nungwi",
    liveTelemetry: "Direct Seronera Flight · 29°C Lagoon",
    detail: "Step off the Serengeti airstrip straight onto white coral sands and private lateen-sail sunsets.",
    href: "/parks?park=zanzibar",
    Svg: ZanzibarDhowSvg,
  },
];

export function ExpeditionInstruments() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeCode, setActiveCode] = useState<string>(INSTRUMENTS[0].code);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".inst-card");
      gsap.fromTo(
        cards,
        { y: 36, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.72,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
            onEnter: () => {
              const strokePaths = section.querySelectorAll<SVGPathElement>(".svg-draw-path");
              if (strokePaths.length) {
                const drawables = svg.createDrawable(strokePaths);
                animate(drawables, {
                  draw: ["0 0", "0 1"],
                  delay: stagger(90, { start: 120 }),
                  duration: 1050,
                  ease: "outCubic",
                });
              }
            },
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const currentInstrument =
    INSTRUMENTS.find((i) => i.code === activeCode) ?? INSTRUMENTS[0];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-20 md:py-28 bg-background text-foreground border-t border-border overflow-hidden"
    >
      <style>{INSTRUMENT_CSS}</style>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] text-primary">
              Ufundi wa Nyikani · Interactive Field Instruments
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.04]">
              Built for mountain cold &amp; savannah dust.
            </h2>
          </div>

          {/* Live active telemetry ticker */}
          <div className="flex items-center gap-3 self-start lg:self-auto rounded-2xl border border-border bg-card px-4 py-2.5 text-xs shadow-sm">
            <Radio className="h-4 w-4 text-[#d8914f] shrink-0 animate-pulse" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Active Instrument · {currentInstrument.code}
              </div>
              <div className="font-medium text-foreground">{currentInstrument.liveTelemetry}</div>
            </div>
          </div>
        </div>

        {/* Responsive Grid: smooth horizontal snap strip on small mobile optional? No, crisp 1-col / 2-col / 3-col cards + tap-to-spool */}
        <div className="mt-10 sm:mt-12 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INSTRUMENTS.map((item) => {
            const IconSvg = item.Svg;
            const isActive = item.code === activeCode;
            return (
              <div
                key={item.code}
                data-active={isActive ? "true" : "false"}
                onMouseEnter={() => setActiveCode(item.code)}
                onClick={() => setActiveCode(item.code)}
                className={`inst-card group relative flex flex-col justify-between rounded-3xl border p-5 sm:p-6 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-primary/50 bg-card shadow-lg -translate-y-0.5"
                    : "border-border bg-card/80 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.code}
                    </span>
                    <span className="rounded-full bg-primary/12 px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary">
                      {item.metric}
                    </span>
                  </div>

                  {/* Animated SVG Stage */}
                  <div className="relative my-5 flex items-center justify-center rounded-2xl border border-border/70 bg-background/85 py-4 sm:py-5 overflow-hidden">
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(46,124,82,0.12),transparent_70%)] ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                    <IconSvg className="relative h-24 w-24 sm:h-28 sm:w-28 transition-transform duration-500 group-hover:scale-105" />
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-3.5">
                  <span className="font-mono text-[10px] text-muted-foreground truncate pr-2">
                    {item.liveTelemetry}
                  </span>
                  <TransitionLink
                    href={item.href}
                    label={item.title.toUpperCase()}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary hover:underline"
                  >
                    Open
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </TransitionLink>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
