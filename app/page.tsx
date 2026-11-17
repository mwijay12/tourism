import React from "react";
import { WebGLTerrainShader } from "@/components/creative/webgl-terrain-shader";
import { ParksShowcase } from "@/components/site/parks-showcase";
import { MigrationTimeline } from "@/components/site/migration-timeline";
import { ExpeditionsShowcase } from "@/components/site/expeditions-showcase";
import {
  ControlledHomeHero,
  ControlledInstrumentsSection,
  ControlledKilimanjaroSection,
  ControlledScrollReelSection,
} from "@/components/site/home-controlled";

export default function HomePage() {
  return (
    <>
      {/* 1. Admin-Controllable ParallaxHero */}
      <ControlledHomeHero />

      {/* 2. Live WebGL GLSL Topographic Shader + Tween.js Elevation Morph */}
      <WebGLTerrainShader />

      {/* 3. Admin-Controllable Mount Kilimanjaro Showcase + Anime.js Route Chart */}
      <ControlledKilimanjaroSection />

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
