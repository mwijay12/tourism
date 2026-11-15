"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MOTION_LAB_ART_CSS,
  mountMotionLabDrawings,
} from "@/components/creative/motion-lab-draw";
import {
  SafariSticker,
  ScribbleUnderline,
  STICKER_CSS,
  mountMotionLabStickers,
} from "@/components/creative/motion-lab-stickers";
import { WebGLImagePlane } from "@/components/creative/webgl-image-plane";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, Compass, Radio } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const FIELD_MEDIA_CSS = `
.ml-field-card {
  scroll-snap-align: start;
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
  .ml-field-rail {
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
  .ml-field-rail::-webkit-scrollbar {
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
    coords: "3°04′S · 37°21′E",
    liveTelemetry: "Barafu Ridge · -6°C · Wind 18 kt",
    detail:
      "Barometric pacing on Lemosho & Northern Circuit with disciplined 'pole pole' daily elevation gain.",
    href: "/kilimanjaro",
    image: "/images/kilimanjaro-summit-dawn.jpg",
    alt: "Mountaineers ascending Kilimanjaro summit ridge above equatorial cloud deck at dawn",
  },
  {
    key: "B",
    code: "02 / FLEET",
    title: "Extended 4x4 Land Cruisers",
    metric: "Pop-Top · Dual Spare",
    coords: "ARUSHA · SERENGETI",
    liveTelemetry: "Arusha Garage Checked · 320L Fuel Range",
    detail:
      "Custom long-wheelbase Toyota Land Cruisers tuned for Serengeti corrugated tracks, with dual inverters.",
    href: "/parks",
    image: "/images/inst-land-cruiser.jpg",
    alt: "Extended 4x4 safari Toyota Land Cruiser with open pop-up roof and dual spare tires on Serengeti plains",
  },
  {
    key: "C",
    code: "03 / ECOLOGY",
    title: "Great Migration Intercepts",
    metric: "1.5M+ Wildebeest",
    coords: "2°19′S · MARA RIVER",
    liveTelemetry: "Mara & Ndutu GPS Tracked Daily",
    detail:
      "Seasonal mobile tented camps positioned along exact Grumeti & Mara River crossing corridors.",
    href: "/#seasons",
    image: "/images/serengeti-migration-river.jpg",
    alt: "Great Migration wildebeest herds crossing sunlit river in Serengeti National Park",
  },
  {
    key: "D",
    code: "04 / MEDICAL",
    title: "SpO2 Oximetry & Gamow Safety",
    metric: "KPAP Verified Crew",
    coords: "BARAFU · 4,673 M",
    liveTelemetry: "AM/PM Lake Louise Check · 100% O2 Ready",
    detail:
      "Twice-daily blood-oxygen checks, pressurized oxygen cylinders, and hyperbaric chambers on high routes.",
    href: "/kilimanjaro#kpap",
    image: "/images/inst-kpap-medical.jpg",
    alt: "Tanzanian mountain guide reading a pulse oximeter at Barafu Camp beneath Mount Kilimanjaro",
  },
  {
    key: "E",
    code: "05 / OPTICS",
    title: "Master Naturalist Spotters",
    metric: "Swarovski Optics",
    coords: "10×42 · TALA GUIDED",
    liveTelemetry: "Big Five & 550+ Bird Species ID",
    detail:
      "TALA-licensed Tanzanian guides trained in feline tracking, nocturnal ecology & telephoto positioning.",
    href: "/parks",
    image: "/images/inst-naturalist-optics.jpg",
    alt: "Tanzanian safari naturalist guide scanning savannah plains through roof-prism binoculars beside telephoto lens",
  },
  {
    key: "F",
    code: "06 / COAST",
    title: "Bush-to-Reef Zanzibar Dhows",
    metric: "Mnemba & Nungwi",
    coords: "5°49′S · 39°23′E",
    liveTelemetry: "Direct Seronera Flight · 29°C Lagoon",
    detail:
      "Step off the Serengeti airstrip straight onto white coral sands and private lateen-sail sunsets.",
    href: "/parks?park=zanzibar",
    image: "/images/inst-zanzibar-dhow.jpg",
    alt: "Traditional handcrafted Zanzibar wooden dhow sailing over turquoise Indian Ocean coral shallows",
  },
];

export function ExpeditionInstruments() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeCode, setActiveCode] = useState<string>(INSTRUMENTS[0].code);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drawHandle = mountMotionLabDrawings(section);
    const destroyStickers = mountMotionLabStickers(section);

    let ctx: gsap.Context | null = null;
    if (!reduced) {
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".ml-field-card");
        gsap.fromTo(
          cards,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.68,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              once: true,
            },
          }
        );

        gsap.utils.toArray<HTMLElement>(".ml-field-parallax").forEach((frame) => {
          const inner = frame.querySelector<HTMLElement>(".ml-field-parallax-inner");
          if (!inner) return;
          gsap.fromTo(
            inner,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      }, section);
    }

    return () => {
      drawHandle.destroy();
      destroyStickers();
      ctx?.revert();
    };
  }, []);

  const currentInstrument =
    INSTRUMENTS.find((i) => i.code === activeCode) ?? INSTRUMENTS[0];

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
      <style>{MOTION_LAB_ART_CSS + STICKER_CSS + FIELD_MEDIA_CSS}</style>

      {/* Motion Lab 4-Layer Safari Doodle Stickers (strictly clear of text & captions) */}
      <SafariSticker
        name="summit"
        tone="sun"
        depth={0.22}
        turn={10}
        className="hidden lg:block top-8 right-[4%] [--ml-tilt:9deg] [--ml-size:6.5rem]"
      />
      <SafariSticker
        name="spark"
        tone="gold"
        depth={0.14}
        turn={-12}
        className="hidden lg:block top-3 right-[12%] [--ml-tilt:0deg] [--ml-size:3.25rem]"
      />
      <SafariSticker
        name="pin"
        tone="sage"
        depth={-0.16}
        turn={-9}
        className="hidden xl:block bottom-10 left-[2%] [--ml-tilt:-10deg] [--ml-size:5.75rem]"
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-8">
        {/* Header Row */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] text-primary">
              Ufundi wa Nyikani · Field Craft &amp; Expedition Gear
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

          {/* Live Active Instrument Telemetry Ticker */}
          <div className="flex items-center gap-3 self-start lg:self-auto rounded-2xl border border-border bg-card px-4 py-2.5 text-xs shadow-sm">
            <Radio className="h-4 w-4 text-[#d8914f] shrink-0" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Active Instrument · {currentInstrument.code}
              </div>
              <div className="font-medium text-foreground">
                {currentInstrument.liveTelemetry}
              </div>
            </div>
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

        {/* Realistic Photography Cards Grid (horizontal snap on mobile, 2/3-col grid on sm+/lg+) */}
        <div
          ref={railRef}
          className="ml-field-rail mt-4 sm:mt-12 sm:grid sm:gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {INSTRUMENTS.map((item, idx) => {
            const isActive = item.code === activeCode;
            return (
              <figure
                key={item.code}
                onMouseEnter={() => setActiveCode(item.code)}
                onClick={() => setActiveCode(item.code)}
                className={`ml-field-card group relative flex flex-col justify-between overflow-visible rounded-3xl border p-3.5 sm:p-4 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-primary/55 bg-card shadow-lg sm:-translate-y-0.5"
                    : "border-border bg-card/80 hover:border-primary/40 hover:bg-card hover:shadow-md"
                }`}
              >
                {/* Signature Motion Lab Sticker perched cleanly on top-right corner of featured 3rd card */}
                {idx === 2 && (
                  <SafariSticker
                    name="compass"
                    tone="night"
                    depth={0.18}
                    turn={-10}
                    className="hidden lg:block -top-8 -right-6 [--ml-tilt:11deg] [--ml-size:5.25rem]"
                  />
                )}

                <div>
                  {/* Realistic Photographic Frame with Lazy WebGL Hover & GSAP Scrubbed Parallax */}
                  <div className="ml-field-parallax relative aspect-[3/2] overflow-hidden rounded-2xl border border-border/80 bg-muted">
                    <div className="ml-field-parallax-inner absolute inset-x-0 -top-[6%] h-[112%] will-change-transform">
                      <WebGLImagePlane
                        src={item.image}
                        alt={item.alt}
                        className="h-full w-full"
                      />
                    </div>
                    {/* Crisp Top Telemetry Overlay */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/65 via-black/25 to-transparent p-3 text-white">
                      <span className="rounded-full border border-white/25 bg-black/45 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur-md">
                        <span className="ml-key-dot font-semibold text-white">
                          {item.key}
                        </span>
                        {item.code.split(" / ")[1]}
                      </span>
                      <span className="rounded-full bg-[#e5a853] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#08100c]">
                        {item.metric}
                      </span>
                    </div>

                    {/* Crisp Bottom Coordinate Strip */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 pb-2.5 pt-6 text-white/90">
                      <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider">
                        <Compass className="h-3 w-3 text-[#e5a853]" />
                        {item.coords}
                      </span>
                    </div>
                  </div>

                  {/* Narrative */}
                  <figcaption className="px-1.5 pt-4">
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.detail}
                    </p>
                  </figcaption>
                </div>

                {/* Footer Strip */}
                <div className="mt-4 flex items-center justify-between border-t border-border/70 px-1.5 pt-3">
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
