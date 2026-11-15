import React from "react";
import ParallaxHero from "@/components/ui/wilderness";
import { WebGLTerrainShader } from "@/components/creative/webgl-terrain-shader";
import { KilimanjaroRouteChart } from "@/components/creative/kilimanjaro-route-chart";
import { ParksShowcase } from "@/components/site/parks-showcase";
import { MigrationTimeline } from "@/components/site/migration-timeline";
import { ExpeditionsShowcase } from "@/components/site/expeditions-showcase";
import { ExpeditionInstruments } from "@/components/site/expedition-instruments";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, Compass, Mountain } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* 1. Integrated ParallaxHero (components/ui/wilderness.tsx) */}
      <ParallaxHero
        eyebrow="ARUSHA · MOSHI · TANZANIA · 5,895 M"
        title="TANZANIA"
        subtitle="Ascend the glacial crown of Mount Kilimanjaro, trace two million hooves across the Serengeti, and drift onto Zanzibar's coral reefs."
        backdropSrc="/images/kilimanjaro-panorama.jpg"
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
        <div className="mx-auto mt-10 hidden sm:inline-flex items-center gap-6 rounded-full border border-white/15 bg-black/45 px-6 py-2.5 font-mono text-[11px] tracking-wider text-white/85 backdrop-blur-md">
          <span>01 · UHURU PEAK 5,895M</span>
          <span className="h-3 w-px bg-white/20" />
          <span>02 · SERENGETI 14,763 KM²</span>
          <span className="h-3 w-px bg-white/20" />
          <span>03 · NGORONGORO CALDERA</span>
          <span className="h-3 w-px bg-white/20" />
          <span className="text-[#e5a853]">KPAP ETHICAL CREWS</span>
        </div>
      </ParallaxHero>

      {/* 2. Live WebGL GLSL Topographic Shader + Tween.js Elevation Morph */}
      <WebGLTerrainShader />

      {/* 3. Mount Kilimanjaro Showcase + Anime.js Interactive Elevation Chart */}
      <section className="relative w-full py-20 md:py-28 bg-background text-foreground">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center mb-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                <Compass className="h-3.5 w-3.5" />
                Kilima Njaro · The Roof of Africa
              </div>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                Five ecosystems in a single footstep journey.
              </h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground">
                Rising 5,895 meters directly above northern Tanzania’s acacia plains, Mount Kilimanjaro is Earth’s highest free-standing peak. Our Chagga-led expeditions prioritize slow acclimatization—<em>pole pole</em>—along the scenic Lemosho and 360° Northern Circuit trails.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-3xl border border-border aspect-[4/5] shadow-md">
                <img
                  src="/images/kilimanjaro-summit-dawn.jpg"
                  alt="Mountaineers approaching Uhuru Peak glacier ridge at dawn"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-3xl border border-border aspect-[4/5] translate-y-6 shadow-md">
                <img
                  src="/images/kilimanjaro-mawenzi-ridge.jpg"
                  alt="Climbers on Kibo crater ridge looking across clouds to Mawenzi Peak"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <KilimanjaroRouteChart />
        </div>
      </section>

      {/* 4. Animated Field Instruments & Expedition SVGs */}
      <ExpeditionInstruments />

      {/* 5. Tanzania National Parks & Wildlife Atlas (WebGL Hover + GSAP) */}
      <ParksShowcase />

      {/* 6. GSAP ScrollTrigger Migration & Season Calendar */}
      <MigrationTimeline />

      {/* 7. Curated Signature Expeditions */}
      <ExpeditionsShowcase />
    </>
  );
}
