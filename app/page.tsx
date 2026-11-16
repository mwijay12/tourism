import React from "react";
import { WebGLTerrainShader } from "@/components/creative/webgl-terrain-shader";
import { KilimanjaroRouteChart } from "@/components/creative/kilimanjaro-route-chart";
import { ParksShowcase } from "@/components/site/parks-showcase";
import { MigrationTimeline } from "@/components/site/migration-timeline";
import { ExpeditionsShowcase } from "@/components/site/expeditions-showcase";
import {
  ControlledHomeHero,
  ControlledInstrumentsSection,
  ControlledScrollReelSection,
} from "@/components/site/home-controlled";
import { Compass } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* 1. Admin-Controllable ParallaxHero */}
      <ControlledHomeHero />

      {/* 2. Live WebGL GLSL Topographic Shader + Tween.js Elevation Morph */}
      <WebGLTerrainShader />

      {/* 3. Mount Kilimanjaro Showcase + Anime.js Interactive Elevation Chart */}
      <section className="relative w-full py-16 sm:py-20 md:py-28 bg-background text-foreground">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center mb-12 sm:mb-14">
            <div data-scroll-reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.18em] text-primary">
                <Compass className="h-3.5 w-3.5" />
                Kilima Njaro · The Roof of Africa
              </div>
              <h2 className="mt-4 font-serif text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.03]">
                Five ecosystems in a single footstep journey.
              </h2>
              <p className="mt-4 text-sm sm:text-lg leading-relaxed text-muted-foreground">
                Rising 5,895 meters directly above northern Tanzania’s acacia plains, Mount Kilimanjaro is Earth’s highest free-standing peak. Our Chagga-led expeditions prioritize slow acclimatization—<em>pole pole</em>—along the scenic Lemosho and 360° Northern Circuit trails.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border aspect-[4/5] shadow-md">
                <img
                  src="/images/kilimanjaro-summit-dawn.jpg"
                  alt="Mountaineers approaching Uhuru Peak glacier ridge at dawn"
                  data-scroll-parallax
                  className="h-full w-full object-cover will-change-transform"
                />
              </div>
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border aspect-[4/5] sm:translate-y-6 shadow-md">
                <img
                  src="/images/kilimanjaro-mawenzi-ridge.jpg"
                  alt="Climbers on Kibo crater ridge looking across clouds to Mawenzi Peak"
                  data-scroll-parallax
                  className="h-full w-full object-cover will-change-transform"
                />
              </div>
            </div>
          </div>

          <div data-scroll-reveal>
            <KilimanjaroRouteChart />
          </div>
        </div>
      </section>

      {/* 4. Scroll-Animated Cinematic Aerial Expedition Reel & Curved SVG Flight Arc */}
      <ControlledScrollReelSection />

      {/* 5. Animated Field Instruments & Realistic Expedition Photography */}
      <ControlledInstrumentsSection />

      {/* 6. Tanzania National Parks & Wildlife Atlas (WebGL Hover + GSAP) */}
      <ParksShowcase />

      {/* 7. GSAP ScrollTrigger Migration & Season Calendar */}
      <MigrationTimeline />

      {/* 8. Curated Signature Expeditions */}
      <ExpeditionsShowcase />
    </>
  );
}
