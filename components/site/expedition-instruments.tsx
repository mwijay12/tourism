"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MOTION_LAB_ART_CSS,
  mountMotionLabDrawings,
  type MountedDrawingsHandle,
} from "@/components/creative/motion-lab-draw";
import {
  SafariSticker,
  ScribbleUnderline,
  STICKER_CSS,
  mountMotionLabStickers,
} from "@/components/creative/motion-lab-stickers";
import {
  KilimanjaroCompassSvg,
  MigrationArcSvg,
  OpticsBinocularsSvg,
  PulseOximeterSvg,
  SafariCruiserWheelSvg,
  ZanzibarDhowSvg,
} from "@/components/creative/safari-svgs";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, Radio, RotateCcw } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SKETCH_LAYOUT_CSS = `
.ml-sketch-card {
  scroll-snap-align: start;
}
.ml-sketch-stage {
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--foreground) 2.5%, var(--background));
}
.ml-key-dot::before {
  content: '';
  display: inline-block;
  width: 0.42rem;
  height: 0.42rem;
  margin-right: 0.55rem;
  border-radius: 50%;
  background: var(--accent);
  vertical-align: 0.08em;
}
@media (max-width: 639px) {
  .ml-sketches-rail {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 86%;
    gap: 1rem;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 1rem;
    margin-inline: -1rem;
    padding-inline: 1rem;
    padding-bottom: 0.5rem;
    scrollbar-width: none;
  }
  .ml-sketches-rail::-webkit-scrollbar {
    display: none;
  }
}
`;

const INSTRUMENTS = [
  {
    key: "A",
    code: "01 / ALTITUDE",
    title: "Uhuru Survey & Acclimatization",
    metric: "5,895 m Kibo",
    liveTelemetry: "Barafu Ridge · -6°C · Wind 18 kt",
    detail:
      "Barometric pacing on Lemosho & Northern Circuit with disciplined 'pole pole' daily elevation gain.",
    href: "/kilimanjaro",
    Svg: KilimanjaroCompassSvg,
  },
  {
    key: "B",
    code: "02 / FLEET",
    title: "Extended 4x4 Land Cruisers",
    metric: "Pop-Top · Dual Spare",
    liveTelemetry: "Arusha Garage Checked · 320L Fuel Range",
    detail:
      "Custom long-wheelbase Toyota Land Cruisers tuned for Serengeti corrugated tracks, with dual inverters.",
    href: "/parks",
    Svg: SafariCruiserWheelSvg,
  },
  {
    key: "C",
    code: "03 / ECOLOGY",
    title: "Great Migration Intercepts",
    metric: "1.5M+ Wildebeest",
    liveTelemetry: "Mara & Ndutu GPS Tracked Daily",
    detail:
      "Seasonal mobile tented camps positioned along exact Grumeti & Mara River crossing corridors.",
    href: "/#seasons",
    Svg: MigrationArcSvg,
  },
  {
    key: "D",
    code: "04 / MEDICAL",
    title: "SpO2 Oximetry & Gamow Safety",
    metric: "KPAP Verified Crew",
    liveTelemetry: "AM/PM Lake Louise Check · 100% O2 Ready",
    detail:
      "Twice-daily blood-oxygen checks, pressurized oxygen cylinders, and hyperbaric chambers on high routes.",
    href: "/kilimanjaro#kpap",
    Svg: PulseOximeterSvg,
  },
  {
    key: "E",
    code: "05 / OPTICS",
    title: "Master Naturalist Spotters",
    metric: "Swarovski Optics",
    liveTelemetry: "Big Five & 550+ Bird Species ID",
    detail:
      "TALA-licensed Tanzanian guides trained in feline tracking, nocturnal ecology & telephoto positioning.",
    href: "/parks",
    Svg: OpticsBinocularsSvg,
  },
  {
    key: "F",
    code: "06 / COAST",
    title: "Bush-to-Reef Zanzibar Dhows",
    metric: "Mnemba & Nungwi",
    liveTelemetry: "Direct Seronera Flight · 29°C Lagoon",
    detail:
      "Step off the Serengeti airstrip straight onto white coral sands and private lateen-sail sunsets.",
    href: "/parks?park=zanzibar",
    Svg: ZanzibarDhowSvg,
  },
];

export function ExpeditionInstruments() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const drawHandleRef = useRef<MountedDrawingsHandle | null>(null);
  const [activeCode, setActiveCode] = useState<string>(INSTRUMENTS[0].code);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const drawHandle = mountMotionLabDrawings(section);
    drawHandleRef.current = drawHandle;
    const destroyStickers = mountMotionLabStickers(section);

    let ctx: gsap.Context | null = null;
    if (!reduced) {
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".ml-sketch-card");
        gsap.fromTo(
          cards,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              once: true,
            },
          }
        );
      }, section);
    }

    return () => {
      drawHandle.destroy();
      drawHandleRef.current = null;
      destroyStickers();
      ctx?.revert();
    };
  }, []);

  const currentInstrument =
    INSTRUMENTS.find((i) => i.code === activeCode) ?? INSTRUMENTS[0];

  const handleSelectCard = (code: string, cardEl: HTMLElement | null) => {
    setActiveCode(code);
    if (cardEl) {
      const svgHost = cardEl.querySelector("[data-draw]");
      if (svgHost) drawHandleRef.current?.replayHost(svgHost);
    }
  };

  const handleJumpMobile = (code: string, index: number) => {
    setActiveCode(code);
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-22 md:py-28 bg-background text-foreground border-t border-border overflow-x-clip"
    >
      <style>{MOTION_LAB_ART_CSS + STICKER_CSS + SKETCH_LAYOUT_CSS}</style>

      {/* Motion Lab 4-Layer Safari Doodle Stickers (strictly clear of readable text) */}
      <SafariSticker
        name="summit"
        tone="sun"
        depth={0.22}
        turn={10}
        className="hidden lg:block top-8 right-[4%] [--ml-tilt:9deg] [--ml-size:6.75rem]"
      />
      <SafariSticker
        name="spark"
        tone="gold"
        depth={0.14}
        turn={-12}
        className="hidden lg:block top-3 right-[12%] [--ml-tilt:0deg] [--ml-size:3.5rem]"
      />
      <SafariSticker
        name="pin"
        tone="sage"
        depth={-0.16}
        turn={-9}
        className="hidden xl:block bottom-10 left-[2%] [--ml-tilt:-10deg] [--ml-size:6rem]"
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-8">
        {/* Header Row */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] text-primary">
              Ufundi wa Nyikani · DrawSVG &amp; MotionPath Field Dossiers
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.06]">
              Built for mountain cold &amp;{" "}
              <span className="relative inline-block whitespace-nowrap">
                savannah dust.
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 -bottom-2.5 w-full"
                >
                  <ScribbleUnderline />
                </span>
              </span>
            </h2>
          </div>

          {/* Telemetry Ticker + Replay Blueprints */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs shadow-sm">
              <Radio className="h-4 w-4 text-[#d8914f] shrink-0" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Active Blueprint · {currentInstrument.code}
                </div>
                <div className="font-medium text-foreground">
                  {currentInstrument.liveTelemetry}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => drawHandleRef.current?.replayAll()}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2.5 font-mono text-[11px] font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
              title="Replay all GSAP DrawSVG blueprint animations"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Replay Sketches
            </button>
          </div>
        </div>

        {/* Mobile Quick Jump Strip (01..06) */}
        <div className="mt-7 flex sm:hidden items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {INSTRUMENTS.map((inst, idx) => {
              const active = inst.code === activeCode;
              return (
                <button
                  key={inst.key}
                  type="button"
                  onClick={() => handleJumpMobile(inst.code, idx)}
                  className={`shrink-0 cursor-pointer rounded-full px-3 py-1 font-mono text-[10.5px] font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground"
                  }`}
                >
                  {inst.key} · 0{idx + 1}
                </button>
              );
            })}
          </div>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Swipe →
          </span>
        </div>

        {/* Architectural Blueprint Grid (horizontal snap on mobile, 2/3-col grid on sm+/lg+) */}
        <div
          ref={railRef}
          className="ml-sketches-rail mt-4 sm:mt-12 sm:grid sm:gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {INSTRUMENTS.map((item) => {
            const BlueprintSvg = item.Svg;
            const isActive = item.code === activeCode;
            return (
              <figure
                key={item.code}
                onMouseEnter={() => setActiveCode(item.code)}
                onClick={(e) => handleSelectCard(item.code, e.currentTarget)}
                className={`ml-sketch-card group relative flex flex-col justify-between rounded-3xl border p-4 sm:p-5 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-primary/55 bg-card shadow-lg sm:-translate-y-0.5"
                    : "border-border bg-card/75 hover:border-primary/40 hover:bg-card hover:shadow-md"
                }`}
              >
                <div>
                  {/* Top Metadata Row */}
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      <span className="ml-key-dot font-semibold text-foreground">
                        {item.key}
                      </span>
                      — {item.code.split(" / ")[1]}
                    </span>
                    <span className="rounded-full bg-primary/12 px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary">
                      {item.metric}
                    </span>
                  </div>

                  {/* Motion Lab 360×260 Blueprint Canvas */}
                  <div className="ml-sketch-stage my-3.5 overflow-hidden rounded-2xl p-2 sm:p-2.5 transition-colors group-hover:border-primary/35">
                    <BlueprintSvg className="w-full h-auto" />
                  </div>

                  {/* Narrative */}
                  <figcaption className="px-1">
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  </figcaption>
                </div>

                {/* Footer Strip */}
                <div className="mt-4 flex items-center justify-between border-t border-border/70 px-1 pt-3">
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
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
