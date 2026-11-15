"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

interface TransitionMeta {
  title: string;
  coords: string;
  swahili: string;
}

const ROUTE_META: Record<string, TransitionMeta> = {
  "/": {
    title: "Kibo & Plains",
    coords: "3°22′S · 36°41′E · ARUSHA",
    swahili: "Karibu Tanzania",
  },
  "/kilimanjaro": {
    title: "Mount Kilimanjaro",
    coords: "3°04′S · 37°21′E · 5,895 M",
    swahili: "Kilele cha Uhuru",
  },
  "/parks": {
    title: "National Parks Atlas",
    coords: "2°19′S · 34°50′E · SIRINGET",
    swahili: "Nyika na Wanyamapori",
  },
  "/inquire": {
    title: "Expedition Concierge",
    coords: "ARUSHA · MOSHI · ZANZIBAR",
    swahili: "Panga Safari Yako",
  },
  "/terms": {
    title: "Terms & Governance",
    coords: "TANAPA · KPAP · ALTRAWARE",
    swahili: "Masharti ya Safari",
  },
  "/privacy": {
    title: "Privacy Stewardship",
    coords: "TANZANIA PDPA 2022",
    swahili: "Faragha na Usalama",
  },
};

function resolveMeta(href: string, customLabel?: string): TransitionMeta {
  const clean = href.split("?")[0].split("#")[0] || "/";
  const base = ROUTE_META[clean] ?? {
    title: customLabel || "Kibo & Plains",
    coords: "3°04′S · 37°21′E · TANZANIA",
    swahili: "Karibu Tanzania",
  };
  if (customLabel && !ROUTE_META[clean]) {
    return { ...base, title: customLabel };
  }
  return base;
}

interface TransitionContextValue {
  navigate: (href: string, label?: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextValue>({
  navigate: () => {},
  isTransitioning: false,
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

/**
 * Orchestrates:
 * 1) Lenis smooth scroll synced with GSAP ticker + ScrollTrigger
 * 2) Dual-layer Barba/Codrops-style SVG Ridgeline Curtain page transition
 * 3) Incoming stage reveal + subtle top scroll-altitude indicator
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const stageRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const accentLayerRef = useRef<HTMLDivElement | null>(null);
  const primaryLayerRef = useRef<HTMLDivElement | null>(null);
  const ridgePathRef = useRef<SVGPathElement | null>(null);
  const barFillRef = useRef<HTMLDivElement | null>(null);
  const scrollRailRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const hasNavigatedRef = useRef(false);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [meta, setMeta] = useState<TransitionMeta>(() => resolveMeta("/"));

  // Sync Lenis + GSAP ScrollTrigger + Global Altitude Scroll Rail
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateRail = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.min(1, Math.max(0, window.scrollY / max));
      if (scrollRailRef.current) {
        scrollRailRef.current.style.transform = `scaleX(${pct})`;
      }
    };

    window.addEventListener("scroll", updateRail, { passive: true });
    updateRail();

    if (reduced) {
      return () => window.removeEventListener("scroll", updateRail);
    }

    const lenis = new Lenis({
      duration: 0.72,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.25,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", () => {
      ScrollTrigger.update();
      updateRail();
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("scroll", updateRail);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reveal curtain & animate incoming stage when pathname resolves
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    const refreshId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 180);

    if (!hasNavigatedRef.current) {
      return () => clearTimeout(refreshId);
    }

    const overlay = overlayRef.current;
    const primary = primaryLayerRef.current;
    const accent = accentLayerRef.current;
    const stage = stageRef.current;

    if (!overlay || !primary || !accent) {
      return () => clearTimeout(refreshId);
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        gsap.set(overlay, { display: "none" });
        if (stage) gsap.set(stage, { clearProps: "transform,opacity" });
      },
    });

    // Fade incoming page smoothly without transforming fixed navbar ancestors
    if (stage) {
      gsap.fromTo(
        stage,
        { opacity: 0.2 },
        { opacity: 1, duration: 0.65, ease: "power2.out", delay: 0.14 }
      );
    }

    tl.to(
      primary,
      {
        yPercent: -125,
        duration: 0.72,
        ease: "expo.inOut",
      },
      0.08
    ).to(
      accent,
      {
        yPercent: -125,
        duration: 0.72,
        ease: "expo.inOut",
      },
      0.16
    );

    // Attach lightweight global GSAP ScrollTrigger reveals & scrubbed image parallax
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = !reduced
      ? gsap.context(() => {
          gsap.utils.toArray<HTMLElement>("[data-scroll-reveal]").forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 28 },
              {
                opacity: 1,
                y: 0,
                duration: 0.78,
                ease: "power3.out",
                clearProps: "transform",
                scrollTrigger: {
                  trigger: el,
                  start: "top 86%",
                  once: true,
                },
              }
            );
          });

          gsap.utils.toArray<HTMLElement>("[data-scroll-parallax]").forEach((img) => {
            const parent = img.parentElement;
            if (!parent) return;
            gsap.fromTo(
              img,
              { yPercent: -7, scale: 1.15 },
              {
                yPercent: 7,
                scale: 1.15,
                ease: "none",
                scrollTrigger: {
                  trigger: parent,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          });
        })
      : null;

    return () => {
      clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [pathname]);

  const navigate = useCallback(
    (href: string, label?: string) => {
      if (href.startsWith("#")) {
        const target = document.querySelector(href);
        target?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      const cleanTarget = href.split("#")[0];
      if (cleanTarget === pathname) {
        const hash = href.split("#")[1];
        if (hash) {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
        } else {
          lenisRef.current?.scrollTo(0);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const overlay = overlayRef.current;
      const primary = primaryLayerRef.current;
      const accent = accentLayerRef.current;
      const ridge = ridgePathRef.current;
      const bar = barFillRef.current;

      if (reduced || !overlay || !primary || !accent) {
        router.push(href);
        return;
      }

      hasNavigatedRef.current = true;
      setMeta(resolveMeta(href, label));
      setIsTransitioning(true);

      gsap.killTweensOf([primary, accent, ridge, bar]);
      gsap.set(overlay, { display: "block" });
      gsap.set(accent, { yPercent: 125 });
      gsap.set(primary, { yPercent: 125 });

      if (bar) gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
      if (ridge) {
        const len = ridge.getTotalLength();
        gsap.set(ridge, { strokeDasharray: len, strokeDashoffset: len });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          router.push(href);
        },
      });

      tl.to(accent, {
        yPercent: 0,
        duration: 0.48,
        ease: "expo.inOut",
      })
        .to(
          primary,
          {
            yPercent: 0,
            duration: 0.52,
            ease: "expo.inOut",
          },
          0.07
        )
        .to(
          ridge,
          {
            strokeDashoffset: 0,
            duration: 0.44,
            ease: "power2.out",
          },
          0.18
        )
        .to(
          bar,
          {
            scaleX: 1,
            duration: 0.42,
            ease: "power2.inOut",
          },
          0.16
        );
    },
    [pathname, router]
  );

  return (
    <TransitionContext.Provider value={{ navigate, isTransitioning }}>
      {/* Top Scroll Progress Bar */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[120] h-[2px] pointer-events-none bg-transparent"
      >
        <div
          ref={scrollRailRef}
          style={{ transform: "scaleX(0)", transformOrigin: "left center" }}
          className="h-full w-full bg-gradient-to-r from-[#2e7c52] via-[#e5a853] to-[#62b388]"
        />
      </div>

      <div ref={stageRef} className="flex flex-1 flex-col">
        {children}
      </div>

      {/* Multi-Layered Barba-Style Ridgeline Page Transition Curtain */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{ display: "none" }}
        className="fixed inset-0 z-[220] pointer-events-none overflow-hidden select-none"
      >
        {/* Amber savannah under-curtain with sweeping top & bottom ridges */}
        <div
          ref={accentLayerRef}
          className="absolute inset-0 bg-[#c97e38]"
        >
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="absolute -top-[78px] inset-x-0 h-20 w-full fill-[#c97e38]"
          >
            <path d="M0,80 L0,44 L310,14 L580,46 L760,6 L1040,42 L1260,16 L1440,44 L1440,80 Z" />
          </svg>
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="absolute -bottom-[78px] inset-x-0 h-20 w-full fill-[#c97e38]"
          >
            <path d="M0,0 L0,36 L260,64 L560,24 L820,70 L1100,28 L1310,58 L1440,26 L1440,0 Z" />
          </svg>
        </div>

        {/* Primary obsidian mountain curtain with top & bottom SVG crest edges */}
        <div
          ref={primaryLayerRef}
          className="absolute inset-0 flex flex-col items-center justify-center bg-[#08100c] text-[#e2eee7] px-6"
        >
          {/* Decorative top ridge curve */}
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="absolute -top-[78px] inset-x-0 h-20 w-full fill-[#08100c]"
          >
            <path d="M0,80 L0,52 L280,22 L540,48 L720,8 L960,44 L1180,18 L1440,46 L1440,80 Z" />
          </svg>
          {/* Decorative trailing bottom ridge curve */}
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="absolute -bottom-[78px] inset-x-0 h-20 w-full fill-[#08100c]"
          >
            <path d="M0,0 L0,30 L280,66 L540,28 L720,72 L980,30 L1210,62 L1440,32 L1440,0 Z" />
          </svg>

          <div className="relative flex w-full max-w-md flex-col items-center text-center">
            {/* Animated Kilimanjaro Skyline SVG */}
            <svg
              viewBox="0 0 260 64"
              fill="none"
              className="mb-5 h-14 w-56 text-[#69b38a]"
            >
              <path
                ref={ridgePathRef}
                d="M8 56 L58 34 L82 42 L130 12 L166 36 L196 22 L252 56"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="130" cy="12" r="3" fill="#e5a853" />
            </svg>

            <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[#a5d7bb]">
              {meta.coords}
            </span>

            <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              {meta.title}
            </h2>

            <span className="mt-2 font-serif text-lg italic text-[#e5a853]">
              {meta.swahili}
            </span>

            {/* Sweep progress track */}
            <div className="mt-7 h-[2px] w-44 overflow-hidden rounded-full bg-white/10">
              <div ref={barFillRef} className="h-full w-full bg-[#e5a853]" />
            </div>
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  label?: string;
}

export function TransitionLink({
  href,
  label,
  onClick,
  children,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) onClick(e);
        if (
          e.defaultPrevented ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          href.startsWith("http")
        ) {
          return;
        }
        e.preventDefault();
        navigate(href, label);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
