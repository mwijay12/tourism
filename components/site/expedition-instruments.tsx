"use client";

import React from "react";
import {
  KilimanjaroCompassSvg,
  MigrationArcSvg,
  OpticsBinocularsSvg,
  PulseOximeterSvg,
  SafariCruiserWheelSvg,
  ZanzibarDhowSvg,
} from "@/components/creative/safari-svgs";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight } from "lucide-react";

const INSTRUMENT_CSS = `
.inst-card {
  --svg-speed: 14s;
}
.inst-card:hover {
  --svg-speed: 3.5s;
}
.svg-spin-slow {
  animation: svg-rotate var(--svg-speed, 14s) linear infinite;
}
.svg-wheel {
  animation: svg-rotate calc(var(--svg-speed, 14s) * 0.55) linear infinite;
}
.svg-optic-ring {
  animation: svg-rotate calc(var(--svg-speed, 14s) * 0.8) linear infinite;
}
.svg-optic-ring-rev {
  animation: svg-rotate calc(var(--svg-speed, 14s) * 0.8) linear infinite reverse;
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
  0%, 100% { transform: rotate(-7deg); }
  50% { transform: rotate(9deg); }
}
@keyframes svg-tilt {
  0%, 100% { transform: rotate(-2.5deg) translateY(0px); }
  50% { transform: rotate(2.5deg) translateY(-2px); }
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
    metric: "5,895 m Kibo Crest",
    detail: "Barometric pacing on Lemosho & Northern Circuit with slow 'pole pole' daily ascent rules.",
    href: "/kilimanjaro",
    Svg: KilimanjaroCompassSvg,
  },
  {
    code: "02 / FLEET",
    title: "Custom Extended 4x4 Cruisers",
    metric: "Pop-Top · Dual Spare",
    detail: "Toyota Land Cruisers tuned for Serengeti washboard roads, with inverters & beanbags.",
    href: "/parks",
    Svg: SafariCruiserWheelSvg,
  },
  {
    code: "03 / ECOLOGY",
    title: "Great Migration Intercepts",
    metric: "1.5M+ Wildebeest",
    detail: "Seasonal mobile camps tracking crossings from Ndutu calving plains to Mara River.",
    href: "/#seasons",
    Svg: MigrationArcSvg,
  },
  {
    code: "04 / MEDICAL",
    title: "Twice-Daily SpO2 & Gamow Safety",
    metric: "KPAP Verified Crew",
    detail: "Oxygen cylinders, pulse oximetry logs twice daily, and direct AMREF evacuation cover.",
    href: "/kilimanjaro#kpap",
    Svg: PulseOximeterSvg,
  },
  {
    code: "05 / OPTICS",
    title: "Master Naturalist Spotters",
    metric: "Swarovski Optics",
    detail: "TALA-licensed Tanzanian guides trained in predator tracking, raptor ID & photography.",
    href: "/parks",
    Svg: OpticsBinocularsSvg,
  },
  {
    code: "06 / COAST",
    title: "Bush-to-Reef Zanzibar Extensions",
    metric: "Mnemba & Nungwi",
    detail: "Direct Seronera bush flights into Stone Town spice heritage and private dhow charters.",
    href: "/parks?park=zanzibar",
    Svg: ZanzibarDhowSvg,
  },
];

export function ExpeditionInstruments() {
  return (
    <section className="relative w-full py-20 md:py-24 bg-background text-foreground border-t border-border">
      <style>{INSTRUMENT_CSS}</style>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Ufundi wa Nyikani · Animated Field Instruments
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.03]">
              Built for mountain cold &amp; savannah dust.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Hover any expedition instrument to inspect how our Moshi mountain crews and Arusha safari fleet operate in the field.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INSTRUMENTS.map((item) => {
            const IconSvg = item.Svg;
            return (
              <TransitionLink
                key={item.code}
                href={item.href}
                label={item.title.toUpperCase()}
                className="inst-card group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.code}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-primary">
                      {item.metric}
                    </span>
                  </div>

                  <div className="my-6 flex items-center justify-center rounded-2xl border border-border/70 bg-background/70 py-5">
                    <IconSvg className="h-24 w-24 transition-transform duration-500 group-hover:scale-105" />
                  </div>

                  <h3 className="font-serif text-2xl font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 font-mono text-[11px] font-medium text-primary">
                  <span>Inspect standard</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
