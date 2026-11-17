"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, Compass, Pause, Play, Sparkles } from "lucide-react";
import {
  fetchSiteSettingsRemote,
  readSiteSettingsLocal,
  resolveSiteMedia,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

interface ReelChapter {
  index: string;
  code: string;
  title: string;
  swahili: string;
  location: string;
  elevation: number;
  coords: string;
  caption: string;
  image: string;
  href: string;
  curveX: number;
  curveY: number;
}

const REEL_CHAPTERS: ReelChapter[] = [
  {
    index: "01",
    code: "ARUSHA · TARANGIRE",
    title: "Golden Baobab Departure",
    swahili: "Safari Inaanza",
    location: "Northern Circuit Gateway",
    elevation: 1400,
    coords: "3°49′S · 36°00′E",
    caption:
      "Depart Arusha at first light into ancient baobab ridges and elephant-walked riverbeds.",
    image: "/images/tarangire-baobabs-sunset.jpg",
    href: "/parks?park=tarangire",
    curveX: 28,
    curveY: 60,
  },
  {
    index: "02",
    code: "SERENGETI · MARA RIVER",
    title: "Two Million Hooves in Motion",
    swahili: "Msafara wa Nyumbu",
    location: "Northern Serengeti",
    elevation: 1500,
    coords: "1°33′S · 34°52′E",
    caption:
      "Dust clouds and river spray as wildebeest herds plunge across sunlit Mara crossing banks.",
    image: "/images/serengeti-migration-river.jpg",
    href: "/parks?park=serengeti",
    curveX: 184,
    curveY: 36,
  },
  {
    index: "03",
    code: "NGORONGORO CALDERA",
    title: "Eden Inside the Crater Rim",
    swahili: "Bonde la Ngorongoro",
    location: "Highland Conservation Area",
    elevation: 2400,
    coords: "3°10′S · 35°35′E",
    caption:
      "Descend 600 meters through cloud forest into Africa’s densest year-round wildlife basin.",
    image: "/images/ngorongoro-crater.jpg",
    href: "/parks?park=ngorongoro",
    curveX: 340,
    curveY: 50,
  },
  {
    index: "04",
    code: "MOUNT KILIMANJARO",
    title: "Above Clouds at Uhuru Peak",
    swahili: "Kilele cha Uhuru",
    location: "Kibo Summit Crater",
    elevation: 5895,
    coords: "3°04′S · 37°21′E",
    caption:
      "Step along Kibo’s glacial crater rim at dawn — standing atop the Roof of Africa.",
    image: "/images/kilimanjaro-summit-dawn.jpg",
    href: "/kilimanjaro",
    curveX: 496,
    curveY: 16,
  },
  {
    index: "05",
    code: "ZANZIBAR ARCHIPELAGO",
    title: "Lateen Sails on Turquoise Reef",
    swahili: "Pwani ya Unguja",
    location: "Mnemba & Nungwi Lagoon",
    elevation: 0,
    coords: "5°49′S · 39°23′E",
    caption:
      "Touch down from Serengeti airstrips onto warm coral sands and private wooden dhows.",
    image: "/images/inst-zanzibar-dhow.jpg",
    href: "/parks?park=zanzibar",
    curveX: 652,
    curveY: 64,
  },
];

// Sweeping curved route linking all 5 coordinates organically
const FLIGHT_CURVE_PATH =
  "M 28 60 C 92 22, 130 22, 184 36 C 242 52, 286 64, 340 50 C 402 34, 444 8, 496 16 C 556 26, 600 74, 652 64";

interface DustMote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
}

export function ScrollExpeditionReel() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinStageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const curveActiveRef = useRef<SVGPathElement | null>(null);
  const gliderRef = useRef<SVGGElement | null>(null);
  const gaugeRingRef = useRef<SVGPathElement | null>(null);

  const progressRef = useRef(0);
  const curveTlRef = useRef<gsap.core.Timeline | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const isVisibleRef = useRef(false);
  const isPlayingRef = useRef(false);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const scrollBoostRef = useRef(0);

  const [activeIdx, setActiveIdx] = useState(0);
  const [liveAltitude, setLiveAltitude] = useState(REEL_CHAPTERS[0].elevation);
  const [reelProgressPct, setReelProgressPct] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const syncVisualProgress = (p: number) => {
    const clamped = Math.min(1, Math.max(0, p));
    progressRef.current = clamped;

    curveTlRef.current?.progress(clamped);

    const span = REEL_CHAPTERS.length - 1;
    const rawIndex = clamped * span;
    const idx = Math.min(span, Math.max(0, Math.round(rawIndex)));
    setActiveIdx((prev) => (prev === idx ? prev : idx));

    const lower = Math.min(span, Math.floor(rawIndex));
    const upper = Math.min(span, lower + 1);
    const localT = rawIndex - lower;
    const interpAlt = Math.round(
      REEL_CHAPTERS[lower].elevation * (1 - localT) +
        REEL_CHAPTERS[upper].elevation * localT
    );
    setLiveAltitude(interpAlt);
    setReelProgressPct(Math.round(clamped * 100));
  };

  useEffect(() => {
    isPlayingRef.current = autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = pinStageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Preload high-res scene frames into offscreen HTMLImageElements (honoring Admin imageOverrides)
    const loadFrameImages = (settings: SiteControlSettings) => {
      imagesRef.current = REEL_CHAPTERS.map((chap) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.src = resolveSiteMedia(settings, `reel-${chap.index}`, chap.image);
        return img;
      });
    };

    loadFrameImages(readSiteSettingsLocal());
    fetchSiteSettingsRemote().then(loadFrameImages).catch(() => undefined);
    const onSettingsUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      loadFrameImages(detail || readSiteSettingsLocal());
    };
    window.addEventListener("kp-site-settings-updated", onSettingsUpdate);

    // Build curved SVG flight + altitude gauge timeline
    const curveTl = gsap.timeline({ paused: true });
    const curvePath = curveActiveRef.current;
    const glider = gliderRef.current;
    const gauge = gaugeRingRef.current;

    if (curvePath) {
      curveTl.fromTo(
        curvePath,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", ease: "none", duration: 1 },
        0
      );
      if (glider && !reduced) {
        curveTl.to(
          glider,
          {
            motionPath: {
              path: curvePath,
              align: curvePath,
              alignOrigin: [0.5, 0.5],
              autoRotate: true,
            },
            ease: "none",
            duration: 1,
          },
          0
        );
      }
    }

    if (gauge) {
      curveTl.fromTo(
        gauge,
        { drawSVG: "0% 0%" },
        { drawSVG: "0% 100%", ease: "none", duration: 1 },
        0
      );
    }
    curveTlRef.current = curveTl;

    // GSAP ScrollTrigger scrub (pinned cinema on md+ desktop, smooth scrub on mobile)
    const mm = gsap.matchMedia();
    if (!reduced) {
      mm.add("(min-width: 768px)", () => {
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=2100",
          pin: stage,
          scrub: 0.75,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (!isPlayingRef.current) {
              syncVisualProgress(self.progress);
            }
            scrollBoostRef.current = Math.min(
              3.5,
              Math.abs(self.getVelocity()) / 900
            );
          },
        });
        triggerRef.current = st;
        return () => {
          st.kill();
          triggerRef.current = null;
        };
      });

      mm.add("(max-width: 767px)", () => {
        const st = ScrollTrigger.create({
          trigger: section,
          start: "top 75%",
          end: "bottom 25%",
          scrub: 0.75,
          onUpdate: (self) => {
            if (!isPlayingRef.current) {
              syncVisualProgress(self.progress);
            }
            scrollBoostRef.current = Math.min(
              2.5,
              Math.abs(self.getVelocity()) / 900
            );
          },
        });
        triggerRef.current = st;
        return () => {
          st.kill();
          triggerRef.current = null;
        };
      });
    }

    // Real-time 60fps Canvas cinema frame renderer (pauses completely when offscreen)
    const ctx = canvas.getContext("2d", { alpha: false });
    const motes: DustMote[] = Array.from({ length: 34 }, (_, i) => ({
      x: ((i * 73) % 100) / 100,
      y: ((i * 41) % 100) / 100,
      r: 0.9 + (i % 4) * 0.65,
      vx: 0.00018 + (i % 5) * 0.00005,
      vy: -0.00012 - (i % 3) * 0.00004,
      a: 0.14 + (i % 5) * 0.07,
    }));

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(2, Math.floor(rect.width * dpr));
      canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let rafId = 0;
    let lastTime = performance.now();

    const drawCoverImage = (
      img: HTMLImageElement,
      alpha: number,
      zoom: number,
      panX: number,
      panY: number
    ) => {
      if (!ctx || !img.complete || img.naturalWidth === 0) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const baseScale = Math.max(cw / iw, ch / ih) * zoom;
      const dw = iw * baseScale;
      const dh = ih * baseScale;
      const dx = (cw - dw) * 0.5 + panX * (dw - cw) * 0.35;
      const dy = (ch - dh) * 0.5 + panY * (dh - ch) * 0.35;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!isVisibleRef.current) {
        rafId = 0;
        return;
      }

      // Optional auto-play continuous cinema film loop
      if (isPlayingRef.current && !reduced) {
        const nextP = (progressRef.current + dt * 0.058) % 1;
        syncVisualProgress(nextP);
      }

      scrollBoostRef.current = Math.max(0, scrollBoostRef.current - dt * 3.5);

      if (ctx) {
        const cw = canvas.width;
        const ch = canvas.height;
        ctx.fillStyle = "#08100c";
        ctx.fillRect(0, 0, cw, ch);

        const p = progressRef.current;
        const span = REEL_CHAPTERS.length - 1;
        const scaled = p * span;
        const i0 = Math.min(span, Math.floor(scaled));
        const i1 = Math.min(span, i0 + 1);
        const blend = scaled - i0;
        const smoothBlend = blend * blend * (3 - 2 * blend);

        const timeDrift = reduced ? 0 : now * 0.00025;
        const zoom0 = 1.07 + blend * 0.09 + Math.sin(timeDrift) * 0.012;
        const zoom1 = 1.04 + (1 - blend) * 0.05 + Math.cos(timeDrift) * 0.01;
        const panX0 = Math.sin(timeDrift * 0.9 + i0) * 0.45;
        const panY0 = Math.cos(timeDrift * 0.7 + i0) * 0.32;
        const panX1 = Math.sin(timeDrift * 0.8 + i1 + 1.2) * 0.45;
        const panY1 = Math.cos(timeDrift * 0.6 + i1 + 1.2) * 0.32;

        const img0 = imagesRef.current[i0];
        const img1 = imagesRef.current[i1];

        if (img0) {
          drawCoverImage(img0, 1, zoom0, panX0, panY0);
        }
        if (img1 && i1 !== i0 && smoothBlend > 0.01) {
          drawCoverImage(img1, smoothBlend, zoom1, panX1, panY1);
        }

        // Subtle atmospheric golden sunlight beam sweeping diagonally across the lens
        if (!reduced) {
          const beamX = cw * (0.28 + Math.sin(timeDrift * 1.1 + p * 4) * 0.22);
          const beam = ctx.createRadialGradient(
            beamX,
            ch * 0.18,
            cw * 0.02,
            beamX,
            ch * 0.28,
            cw * 0.56
          );
          beam.addColorStop(0, "rgba(229, 168, 83, 0.14)");
          beam.addColorStop(0.55, "rgba(46, 124, 82, 0.05)");
          beam.addColorStop(1, "rgba(8, 16, 12, 0)");
          ctx.fillStyle = beam;
          ctx.fillRect(0, 0, cw, ch);

          // Floating atmospheric dust / high-altitude ice motes reacting to scroll velocity
          const boost = 1 + scrollBoostRef.current * 2.4;
          for (const m of motes) {
            m.x = (m.x + m.vx * boost + 1) % 1;
            m.y = (m.y + m.vy * boost + 1) % 1;
            ctx.beginPath();
            ctx.arc(m.x * cw, m.y * ch, m.r * (cw / 960), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 232, 185, ${m.a})`;
            ctx.fill();
          }
        }
      }

      rafId = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false;
        isVisibleRef.current = visible;
        if (visible && !rafId) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(render);
        } else if (!visible && rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      window.removeEventListener("kp-site-settings-updated", onSettingsUpdate);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
      mm.revert();
      curveTl.kill();
    };
  }, []);

  const jumpToChapter = (idx: number) => {
    const targetP = idx / (REEL_CHAPTERS.length - 1);
    setAutoPlay(false);

    const st = triggerRef.current;
    if (st && window.innerWidth >= 768 && st.end > st.start) {
      const targetScrollY = st.start + targetP * (st.end - st.start);
      window.scrollTo({ top: targetScrollY, behavior: "smooth" });
      return;
    }

    const obj = { p: progressRef.current };
    gsap.to(obj, {
      p: targetP,
      duration: 0.72,
      ease: "power3.out",
      onUpdate: () => syncVisualProgress(obj.p),
    });
  };

  const current = REEL_CHAPTERS[activeIdx] ?? REEL_CHAPTERS[0];

  return (
    <section
      ref={sectionRef}
      aria-label="Scroll-animated aerial Tanzania expedition sequence"
      className="relative w-full bg-[#060c09] text-[#e2eee7] border-y border-white/10"
    >
      <div
        ref={pinStageRef}
        className="relative mx-auto flex min-h-[82vh] md:min-h-screen max-w-[1440px] flex-col justify-between px-4 py-10 sm:px-8 sm:py-12"
      >
        {/* Top Editorial Telemetry Bar */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#62b388]/35 bg-[#62b388]/10 px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#a6dec0]">
              <Sparkles className="h-3.5 w-3.5 text-[#e5a853]" />
              Scroll-Driven Aerial Reel · Coast to 5,895 m
            </span>
            <h2 className="mt-2.5 font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              One continuous crossing across Tanzania.
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAutoPlay((v) => !v)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-mono text-[11px] font-medium text-white backdrop-blur-md transition hover:border-[#e5a853] hover:bg-[#e5a853] hover:text-[#08100c]"
            >
              {autoPlay ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  Pause Film
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Auto-Play Reel
                </>
              )}
            </button>

            <TransitionLink
              href={current.href}
              label={current.title}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#e5a853] px-4 py-2 font-mono text-[11px] font-semibold text-[#08100c] transition hover:bg-white"
            >
              Visit {current.index}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </TransitionLink>
          </div>
        </div>

        {/* Center Widescreen Cinema Frame */}
        <div className="relative my-5 sm:my-6 flex-1 min-h-[340px] sm:min-h-[430px] overflow-hidden rounded-3xl border border-white/15 bg-[#08100c] shadow-2xl">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full block"
          />

          {/* Cinematic vignette gradients (clear center imagery) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060c09] via-[#060c09]/25 to-[#060c09]/40" />

          {/* Top-left coordinate & live curved radial altitude gauge */}
          <div className="pointer-events-none absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-start justify-between gap-4">
            <div className="rounded-2xl border border-white/15 bg-black/50 px-3.5 py-2 backdrop-blur-md">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#e5a853]">
                <Compass className="h-3.5 w-3.5" />
                {current.code} · {current.coords}
              </div>
              <div className="mt-0.5 font-serif text-lg sm:text-xl italic text-white/90">
                {current.swahili}
              </div>
            </div>

            {/* Curved Radial Elevation Arc Gauge */}
            <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-white/15 bg-black/55 backdrop-blur-md">
              <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full" fill="none">
                <circle
                  cx="40"
                  cy="40"
                  r="33"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="2.5"
                />
                <path
                  ref={gaugeRingRef}
                  d="M 40 7 A 33 33 0 1 1 39.99 7"
                  stroke="#e5a853"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center leading-none">
                <div className="font-mono text-xs sm:text-sm font-bold text-white">
                  {liveAltitude.toLocaleString()}
                </div>
                <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-widest text-[#e5a853]">
                  meters
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Narrative + Sweeping Curved SVG Route Progress */}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#a6dec0]">
                  Chapter {current.index} / 05 · {current.location}
                </div>
                <h3 className="mt-1.5 font-serif text-2xl sm:text-4xl font-semibold text-white leading-tight">
                  {current.title}
                </h3>
                <p className="mt-2 max-w-xl text-xs sm:text-sm text-white/80 leading-relaxed">
                  {current.caption}
                </p>
              </div>

              {/* Curved Winding SVG Expedition Flight Arc (DrawSVG + MotionPath) */}
              <div className="rounded-2xl border border-white/15 bg-black/55 px-4 py-3 backdrop-blur-md">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/70">
                  <span>Curved Route Progress</span>
                  <span className="text-[#e5a853]">{reelProgressPct}%</span>
                </div>

                <svg
                  viewBox="0 0 680 82"
                  className="w-full h-14 sm:h-16 overflow-visible"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="reelCurveGrad" x1="28" y1="0" x2="652" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#62b388" />
                      <stop offset="65%" stopColor="#e5a853" />
                      <stop offset="100%" stopColor="#7ad1d9" />
                    </linearGradient>
                  </defs>

                  {/* Dotted guide curve */}
                  <path
                    d={FLIGHT_CURVE_PATH}
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="2"
                    strokeDasharray="5 6"
                    strokeLinecap="round"
                  />

                  {/* Active DrawSVG curved line */}
                  <path
                    ref={curveActiveRef}
                    d={FLIGHT_CURVE_PATH}
                    stroke="url(#reelCurveGrad)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* 5 Interactive Chapter Nodes along the curve */}
                  {REEL_CHAPTERS.map((chap, i) => {
                    const visited = i <= activeIdx;
                    return (
                      <g
                        key={chap.index}
                        onClick={() => jumpToChapter(i)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={chap.curveX}
                          cy={chap.curveY}
                          r={i === activeIdx ? 6.5 : 4.2}
                          fill={visited ? "#e5a853" : "#182920"}
                          stroke="#fff"
                          strokeWidth={i === activeIdx ? "1.8" : "1"}
                        />
                        <text
                          x={chap.curveX}
                          y={chap.curveY + 18}
                          textAnchor="middle"
                          fill={i === activeIdx ? "#ffe7ad" : "rgba(255,255,255,0.68)"}
                          fontSize="10"
                          fontFamily="ui-monospace, monospace"
                        >
                          {chap.index}
                        </text>
                      </g>
                    );
                  })}

                  {/* MotionPath animated flight glider arrow moving along curves */}
                  <g ref={gliderRef}>
                    <circle r="10" fill="#e5a853" fillOpacity="0.22" />
                    <path
                      d="M -6 -4 L 7 0 L -6 4 L -3 0 Z"
                      fill="#ffe7ad"
                      stroke="#08100c"
                      strokeWidth="0.9"
                    />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Chapter Selector Strip */}
        <div className="relative z-20 flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {REEL_CHAPTERS.map((chap, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={chap.index}
                type="button"
                onClick={() => jumpToChapter(i)}
                className={`shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 font-mono text-[10.5px] transition ${
                  active
                    ? "bg-[#e5a853] font-semibold text-[#08100c] shadow"
                    : "border border-white/15 bg-white/5 text-white/75 hover:border-white/35 hover:text-white"
                }`}
              >
                {chap.index} · {chap.code.split(" · ")[0]}
              </button>
            );
          })}
          <span className="ml-auto hidden lg:inline font-mono text-[10.5px] text-white/55">
            Scroll down to scrub the expedition reel · or tap Play
          </span>
        </div>
      </div>
    </section>
  );
}
