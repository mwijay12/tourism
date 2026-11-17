"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { MIGRATION_SEASONS } from "@/lib/tanzania-data";
import { Calendar, Mountain, Binoculars } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

const RIVER_CURVE_PATH =
  "M 18 10 C 34 80, 2 160, 20 240 C 36 320, 4 400, 18 480 C 34 560, 2 640, 20 720 C 34 770, 12 810, 18 850";

export function MigrationTimeline() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const riverActiveRef = useRef<SVGPathElement | null>(null);
  const herdBeaconRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const river = riverActiveRef.current;
      const beacon = herdBeaconRef.current;

      if (river) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 62%",
            end: "bottom 78%",
            scrub: 0.6,
          },
        });

        tl.fromTo(
          river,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", ease: "none", duration: 1 },
          0
        );

        if (beacon) {
          tl.to(
            beacon,
            {
              motionPath: {
                path: river,
                align: river,
                alignOrigin: [0.5, 0.5],
              },
              ease: "none",
              duration: 1,
            },
            0
          );
        }
      }

      gsap.utils.toArray<HTMLElement>(".season-row").forEach((row) => {
        gsap.fromTo(
          row,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: row,
              start: "top 86%",
              once: true,
            },
          }
        );

        const img = row.querySelector<HTMLElement>(".season-parallax-img");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -8, scale: 1.16 },
            {
              yPercent: 8,
              scale: 1.16,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="seasons"
      ref={sectionRef}
      className="relative w-full py-16 sm:py-20 md:py-28 bg-card/60 border-y border-border overflow-x-clip"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.16em] text-primary">
            <Calendar className="h-3.5 w-3.5" />
            Curved River Telemetry · Annual Ecological Pulse
          </div>
          <h2 className="mt-4 font-serif text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.04]">
            When the herds move, every camp follows.
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
            Tanzania is a twelve-month biosphere. Coordinate your Kilimanjaro summit window with the winding migration corridor across Ndutu, Grumeti, and the Mara River.
          </p>
        </div>

        {/* Scrubbed curved S-river migration path */}
        <div className="relative mt-10 sm:mt-14 pl-7 sm:pl-12">
          <svg
            aria-hidden="true"
            viewBox="0 0 36 860"
            preserveAspectRatio="none"
            className="pointer-events-none absolute left-0 top-2 bottom-2 h-[calc(100%-16px)] w-6 sm:w-8 overflow-hidden"
            fill="none"
          >
            {/* Dashed Serengeti migration guide curve */}
            <path
              d={RIVER_CURVE_PATH}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1.6"
              strokeDasharray="4 6"
              strokeLinecap="round"
            />
            {/* Scrub-drawn active curved river trail */}
            <path
              ref={riverActiveRef}
              d={RIVER_CURVE_PATH}
              stroke="currentColor"
              className="text-primary"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            {/* Moving amber herd waypoint beacon gliding around curves */}
            <g ref={herdBeaconRef}>
              <circle r="7.5" fill="#e5a853" fillOpacity="0.28" />
              <circle r="4" fill="#e5a853" stroke="#08100c" strokeWidth="1.2" />
            </g>
          </svg>

          <div className="space-y-6 sm:space-y-10">
            {MIGRATION_SEASONS.map((season) => (
              <div
                key={season.months}
                className="season-row relative grid gap-5 sm:gap-6 rounded-2xl sm:rounded-3xl border border-border bg-background p-4 sm:p-7 lg:grid-cols-[1fr_300px] lg:items-center shadow-sm"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="rounded-full bg-primary/12 px-3 py-1 font-mono text-[11px] sm:text-xs font-semibold text-primary">
                      {season.months}
                    </span>
                    <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Binoculars className="h-3.5 w-3.5 text-[#b86f2d] dark:text-[#e5a853]" />
                      {season.zone}
                    </span>
                  </div>

                  <h3 className="mt-3 font-serif text-xl sm:text-3xl font-semibold text-foreground">
                    {season.phase}
                  </h3>

                  <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {season.narrative}
                  </p>

                  <div className="mt-4 inline-flex items-start sm:items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground">
                    <Mountain className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5 sm:mt-0" />
                    <span>
                      <strong>Kilimanjaro Weather:</strong> {season.kilimanjaroCondition}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-border aspect-[16/10] lg:aspect-[4/3]">
                  <img
                    src={season.image}
                    alt={`${season.phase} in ${season.zone}`}
                    className="season-parallax-img h-full w-full object-cover will-change-transform"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
