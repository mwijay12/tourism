"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ParallaxLayer {
  src: string;
  alt: string;
  speedX: number;
  speedY: number;
  speedZ: number;
  rotation: number;
  distance: number;
  className?: string;
  zIndex: number;
  initialTop: string;
  initialLeft: string;
  width: string;
}

export interface ParallaxHeroProps {
  layers?: ParallaxLayer[];
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  backdropSrc?: string;
  children?: React.ReactNode;
  className?: string;
}

const makeRidgeDataUrl = (fill: string, path: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320" preserveAspectRatio="none"><path fill="${fill}" d="${path}"/></svg>`
  )}`;

const makeMistDataUrl = (opacity: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 260"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#d8eadf" stop-opacity="${opacity}"/><stop offset="100%" stop-color="#d8eadf" stop-opacity="0"/></radialGradient></defs><ellipse cx="500" cy="130" rx="480" ry="110" fill="url(#g)"/></svg>`
  )}`;

/**
 * Lightweight zero-network parallax depth layers (inline vector ridges + mist)
 * so the hero loads instantaneously at 60fps with zero external CDN bottlenecks.
 */
export const defaultLayers: ParallaxLayer[] = [
  {
    src: makeRidgeDataUrl(
      "rgba(10, 26, 18, 0.52)",
      "M0,320 L0,210 L180,145 L340,185 L520,105 L710,170 L890,118 L1060,172 L1200,130 L1200,320 Z"
    ),
    alt: "distant-kilimanjaro-ridge",
    speedX: 0.024,
    speedY: 0.015,
    speedZ: 0.03,
    rotation: 0.01,
    distance: 1400,
    zIndex: 12,
    initialTop: "76%",
    initialLeft: "50%",
    width: "125vw",
  },
  {
    src: makeMistDataUrl(0.24),
    alt: "savannah-valley-mist",
    speedX: 0.055,
    speedY: 0.025,
    speedZ: 0,
    rotation: 0,
    distance: 1900,
    zIndex: 15,
    initialTop: "72%",
    initialLeft: "48%",
    width: "90vw",
  },
  {
    src: makeRidgeDataUrl(
      "rgba(6, 16, 11, 0.72)",
      "M0,320 L0,235 L210,175 L410,230 L640,185 L880,245 L1080,192 L1200,220 L1200,320 Z"
    ),
    alt: "foreground-acacia-crest",
    speedX: 0.042,
    speedY: 0.022,
    speedZ: 0.05,
    rotation: 0.02,
    distance: 2600,
    zIndex: 20,
    initialTop: "85%",
    initialLeft: "50%",
    width: "125vw",
  },
];

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  layers = defaultLayers,
  title = "HERO",
  subtitle,
  eyebrow,
  backdropSrc = "/images/kilimanjaro-panorama.jpg",
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);
  const [hiddenIndices, setHiddenIndices] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced || !finePointer) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let isRunning = false;

    const tick = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      layerRefs.current.forEach((el, index) => {
        if (!el) return;
        const layer = layers[index];
        if (!layer) return;
        const dx = -currentX * layer.speedX;
        const dy = currentY * layer.speedY;
        el.style.transform = `translate3d(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px), 0)`;
      });

      if (textRef.current) {
        // Pure flex-centered offset — zero -50% double-translation off-canvas bug
        const tx = (-currentX * 0.018).toFixed(1);
        const ty = (-currentY * 0.012).toFixed(1);
        textRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }

      if (Math.abs(targetX - currentX) > 0.3 || Math.abs(targetY - currentY) > 0.3) {
        rafId = requestAnimationFrame(tick);
      } else {
        isRunning = false;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX - window.innerWidth / 2;
      targetY = e.clientY - window.innerHeight / 2;
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    };

    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("pointermove", handlePointerMove);
    };
  }, [layers]);

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#060f0a] via-[#0c1e15] to-[#11281d] pt-24 pb-16 sm:pt-28 sm:pb-20",
        className
      )}
    >
      {/* Authentic Tanzanian Kilimanjaro base atmosphere */}
      {backdropSrc && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60 scale-105"
          style={{ backgroundImage: `url(${backdropSrc})` }}
        />
      )}

      {/* Atmospheric dawn horizon glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_38%,rgba(220,164,95,0.22)_0%,rgba(20,62,40,0.56)_46%,rgba(6,14,10,0.92)_100%)]"
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[40] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_52%,rgba(4,10,7,0.8))]"
      />

      {/* Bottom atmospheric blend into page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] h-28 sm:h-36 bg-gradient-to-t from-[#08100c] via-[#08100c]/60 to-transparent"
      />

      {/* Lightweight foreground depth layers (desktop/tablet) */}
      {layers.map((layer, index) => {
        if (hiddenIndices[index]) return null;
        return (
          <img
            key={`${layer.alt}-${index}`}
            ref={(el) => {
              layerRefs.current[index] = el;
            }}
            src={layer.src}
            alt={layer.alt}
            loading="eager"
            decoding="async"
            onError={() =>
              setHiddenIndices((prev) => ({
                ...prev,
                [index]: true,
              }))
            }
            className={cn(
              "hidden sm:block absolute pointer-events-none select-none will-change-transform",
              layer.className
            )}
            style={{
              width: layer.width,
              top: layer.initialTop,
              left: layer.initialLeft,
              zIndex: layer.zIndex,
              transform: "translate3d(-50%, -50%, 0)",
            }}
          />
        );
      })}

      {/* Centered Typography & Editorial Slots (pure flexbox centered — guaranteed inside viewport) */}
      <div
        ref={textRef}
        className="relative z-[55] mx-auto w-full max-w-5xl px-5 sm:px-8 text-white text-center pointer-events-auto will-change-transform"
      >
        {eyebrow && (
          <div className="mb-4 sm:mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 sm:px-4 py-1.5 font-mono text-[9.5px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#d8eadf] backdrop-blur-md">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5a853]" />
            <span className="truncate">{eyebrow}</span>
          </div>
        )}
        <h1 className="font-serif font-semibold tracking-[-0.03em] text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.65)] text-[clamp(2.35rem,9.5vw,7.2rem)] leading-[0.94]">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg leading-relaxed text-[#d7e5dc]/90">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-7 sm:mt-8">{children}</div>}
      </div>
    </section>
  );
};

export function ParallaxHeroDemo() {
  return (
    <ParallaxHero
      eyebrow="3°04′S 37°21′E · 5,895 M UHURU PEAK"
      title="KILIMANJARO"
      subtitle="From glacial volcanic summits above the clouds to the timeless plains of the Serengeti."
    />
  );
}

export default ParallaxHero;
