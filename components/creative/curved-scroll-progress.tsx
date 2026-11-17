"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ArrowUp } from "lucide-react";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

interface CurvedScrollProgressProps {
  onScrollTop: () => void;
}

export function CurvedScrollProgress({ onScrollTop }: CurvedScrollProgressProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Top wave refs
  const topActiveRef = useRef<SVGPathElement | null>(null);
  const topBeaconRef = useRef<SVGGElement | null>(null);

  // Desktop vertical S-curve trail refs
  const sideActiveRef = useRef<SVGPathElement | null>(null);
  const sideBeaconRef = useRef<SVGGElement | null>(null);

  // Mobile circular curved progress refs
  const ringActiveRef = useRef<SVGPathElement | null>(null);
  const ringBeaconRef = useRef<SVGCircleElement | null>(null);

  const [pct, setPct] = useState(0);
  const [visiblePill, setVisiblePill] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline({ paused: true });

    const topPath = topActiveRef.current;
    const topBeacon = topBeaconRef.current;
    const sidePath = sideActiveRef.current;
    const sideBeacon = sideBeaconRef.current;
    const ringPath = ringActiveRef.current;
    const ringBeacon = ringBeaconRef.current;

    if (topPath) {
      tl.fromTo(
        topPath,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", ease: "none", duration: 1 },
        0
      );
      if (topBeacon && !reduced) {
        tl.to(
          topBeacon,
          {
            motionPath: {
              path: topPath,
              align: topPath,
              alignOrigin: [0.5, 0.5],
            },
            ease: "none",
            duration: 1,
          },
          0
        );
      }
    }

    if (sidePath) {
      tl.fromTo(
        sidePath,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", ease: "none", duration: 1 },
        0
      );
      if (sideBeacon && !reduced) {
        tl.to(
          sideBeacon,
          {
            motionPath: {
              path: sidePath,
              align: sidePath,
              alignOrigin: [0.5, 0.5],
            },
            ease: "none",
            duration: 1,
          },
          0
        );
      }
    }

    if (ringPath) {
      tl.fromTo(
        ringPath,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", ease: "none", duration: 1 },
        0
      );
      if (ringBeacon && !reduced) {
        tl.to(
          ringBeacon,
          {
            motionPath: {
              path: ringPath,
              align: ringPath,
              alignOrigin: [0.5, 0.5],
            },
            ease: "none",
            duration: 1,
          },
          0
        );
      }
    }

    const syncScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / max));
      tl.progress(ratio);
      setPct(Math.round(ratio * 100));
      setVisiblePill(window.scrollY > 240);
    };

    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", syncScroll, { passive: true });
    syncScroll();

    return () => {
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", syncScroll);
      tl.kill();
    };
  }, []);

  // Elevation readout mapped playfully from Dar Coast (0m) to Uhuru Summit (5,895m)
  const altitudeMeters = Math.round((pct / 100) * 5895);

  return (
    <div ref={rootRef}>
      {/* 1. Organic Flowing Curved SVG Skyline Progress Wave (replaces straight top bar) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[18px] overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 20"
          preserveAspectRatio="none"
          className="h-full w-full overflow-hidden"
        >
          <defs>
            <linearGradient id="mlCurveGrad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2e7c52" />
              <stop offset="50%" stopColor="#e5a853" />
              <stop offset="100%" stopColor="#62b388" />
            </linearGradient>
            <filter id="mlGlow" x="-20%" y="-80%" width="140%" height="260%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle curved background contour */}
          <path
            d="M 0,10 C 140,17 260,3 410,10 C 560,17 650,2 720,4 C 790,2 880,17 1030,10 C 1180,3 1300,17 1440,10"
            fill="none"
            stroke="rgba(98, 179, 136, 0.16)"
            strokeWidth="1.4"
          />

          {/* Dynamic curved SVG progress stroke */}
          <path
            ref={topActiveRef}
            d="M 0,10 C 140,17 260,3 410,10 C 560,17 650,2 720,4 C 790,2 880,17 1030,10 C 1180,3 1300,17 1440,10"
            fill="none"
            stroke="url(#mlCurveGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            filter="url(#mlGlow)"
          />

          {/* Luminous golden summit beacon traveling along the curves */}
          <g ref={topBeaconRef} opacity={pct > 0 && pct < 100 ? 1 : 0}>
            <circle r="5" fill="#e5a853" fillOpacity="0.32" />
            <circle r="2.6" fill="#ffe7ad" />
          </g>
        </svg>
      </div>

      {/* 2. Floating Desktop Curved S-Trail Altitude Widget */}
      <button
        type="button"
        onClick={onScrollTop}
        aria-label="Scroll progress along Tanzania altitude trail. Click to return to top."
        className={`hidden md:flex fixed bottom-6 right-5 z-[110] cursor-pointer flex-col items-center gap-1.5 rounded-3xl border border-white/15 bg-[#08100c]/86 px-3 py-3 text-[#e2eee7] shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-[#e5a853]/60 hover:bg-[#0b1812] ${
          visiblePill
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <span className="font-mono text-[9.5px] font-semibold tracking-wider text-[#e5a853]">
          {altitudeMeters.toLocaleString()}M
        </span>

        <svg
          viewBox="0 0 52 118"
          className="h-[104px] w-[46px] overflow-hidden"
          fill="none"
        >
          {/* Dashed background curved switchback path */}
          <path
            d="M 26,108 C 46,92 6,76 28,58 C 48,40 8,24 26,8"
            stroke="rgba(226, 238, 231, 0.2)"
            strokeWidth="1.6"
            strokeDasharray="3 4"
            strokeLinecap="round"
          />

          {/* Trailhead landmarks along the S-curve */}
          <circle cx="26" cy="108" r="2.2" fill="#62b388" fillOpacity="0.6" />
          <circle cx="28" cy="58" r="2.2" fill="#e5a853" fillOpacity="0.65" />
          <circle cx="26" cy="8" r="2.6" fill="#fff0c1" fillOpacity="0.85" />

          {/* Active DrawSVG curved route */}
          <path
            ref={sideActiveRef}
            d="M 26,108 C 46,92 6,76 28,58 C 48,40 8,24 26,8"
            stroke="#62b388"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Orbiting hiker / waypoint dot along the switchbacks */}
          <g ref={sideBeaconRef}>
            <circle r="5.5" fill="#e5a853" fillOpacity="0.3" />
            <circle r="3" fill="#e5a853" stroke="#08100c" strokeWidth="1" />
          </g>
        </svg>

        <span className="inline-flex items-center gap-1 font-mono text-[9.5px] text-white/75">
          {pct}% <ArrowUp className="h-2.5 w-2.5 text-[#e5a853]" />
        </span>
      </button>

      {/* 3. Mobile Compact Circular Curved Progress Ring */}
      <button
        type="button"
        onClick={onScrollTop}
        aria-label="Scroll progress. Tap to return to top."
        className={`flex md:hidden fixed bottom-4 right-4 z-[110] cursor-pointer items-center justify-center h-12 w-12 rounded-full border border-white/15 bg-[#08100c]/88 text-[#e2eee7] shadow-xl backdrop-blur-xl transition-all duration-300 ${
          visiblePill
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-75 opacity-0"
        }`}
      >
        <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full overflow-hidden" fill="none">
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke="rgba(226,238,231,0.16)"
            strokeWidth="2"
          />
          <path
            ref={ringActiveRef}
            d="M 24 5 A 19 19 0 1 1 23.99 5"
            stroke="#e5a853"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle ref={ringBeaconRef} r="2.8" fill="#ffe7ad" />
        </svg>
        <span className="font-mono text-[9.5px] font-semibold text-white">
          {pct}%
        </span>
      </button>
    </div>
  );
}
