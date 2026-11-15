"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NATIONAL_PARKS, type NationalPark } from "@/lib/tanzania-data";
import { WebGLImagePlane } from "@/components/creative/webgl-image-plane";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, Compass, MapPin, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const REGIONS = [
  "All Ecosystems",
  "Northern Circuit",
  "Alpine Frontier",
  "Southern Wild",
  "Western Frontier",
  "Indian Ocean",
] as const;

export function ParksShowcase() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All Ecosystems");
  const gridRef = useRef<HTMLDivElement | null>(null);

  const visibleParks: NationalPark[] =
    region === "All Ecosystems"
      ? NATIONAL_PARKS
      : NATIONAL_PARKS.filter((p) => p.region === region);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".park-webgl-card");
      gsap.fromTo(
        cards,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.78,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: grid,
            start: "top 82%",
            once: true,
          },
        }
      );
    }, grid);

    return () => ctx.revert();
  }, [region]);

  return (
    <section className="relative w-full py-20 md:py-28 bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              TANAPA Protected Sanctuaries · WebGL GLSL Hover Planes
            </div>
            <h2 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
              From volcanic craters to coral reefs.
            </h2>
          </div>

          <TransitionLink
            href="/parks"
            label="NATIONAL PARKS ATLAS"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            Open Complete Park Atlas
            <ArrowUpRight className="h-4 w-4" />
          </TransitionLink>
        </div>

        {/* Region Filter Tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          {REGIONS.map((item) => {
            const active = region === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setRegion(item)}
                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Parks Cards Grid */}
        <div
          ref={gridRef}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibleParks.map((park, index) => (
            <article
              key={park.slug}
              className={`park-webgl-card group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-shadow duration-500 hover:shadow-xl ${
                index === 0 && region === "All Ecosystems" ? "lg:col-span-2" : ""
              }`}
            >
              <div
                className={`relative w-full overflow-hidden ${
                  index === 0 && region === "All Ecosystems"
                    ? "aspect-[16/9]"
                    : "aspect-[4/3]"
                }`}
              >
                <WebGLImagePlane
                  src={park.image}
                  alt={`${park.name} — ${park.tagline}`}
                  className="h-full w-full"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/55 to-transparent text-white">
                  <span className="rounded-full border border-white/25 bg-black/35 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur-md">
                    {park.region}
                  </span>
                  <span className="font-mono text-[10.5px] text-white/85 flex items-center gap-1">
                    <Compass className="h-3 w-3 text-[#e5a853]" />
                    {park.coordinates}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-primary">
                      {park.swahiliName}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {park.area}
                    </span>
                  </div>

                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                    {park.name}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {park.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {park.wildlife.map((species) => (
                      <span
                        key={species}
                        className="rounded-full border border-border bg-background/80 px-2.5 py-0.5 text-[11px] text-foreground/85"
                      >
                        {species}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Best: {park.bestWindow}
                  </span>
                  <TransitionLink
                    href={`/parks?park=${park.slug}`}
                    label={park.name.toUpperCase()}
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Dossier <ArrowUpRight className="h-3.5 w-3.5" />
                  </TransitionLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
