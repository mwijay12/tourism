"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

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
 * 1) Lenis smooth scroll synced with GSAP ticker + ScrollTrigger (darkroom.engineering pattern)
 * 2) Barba.js-inspired GSAP full-screen curtain page transitions inside Next.js App Router
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sync Lenis + GSAP ScrollTrigger
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reveal curtain whenever route finishes changing
  useEffect(() => {
    ScrollTrigger.refresh();
    lenisRef.current?.scrollTo(0, { immediate: true });

    const curtain = curtainRef.current;
    if (!curtain) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        gsap.set(curtain, { display: "none" });
      },
    });

    tl.to(curtain, {
      yPercent: -100,
      duration: 0.65,
      ease: "power4.inOut",
      delay: 0.08,
    });
  }, [pathname]);

  const navigate = useCallback(
    (href: string, label?: string) => {
      if (href === pathname || href.startsWith("#")) {
        if (href.startsWith("#")) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !curtainRef.current) {
        router.push(href);
        return;
      }

      setIsTransitioning(true);
      const curtain = curtainRef.current;
      if (labelRef.current) {
        labelRef.current.textContent = label || "KIBO & PLAINS · TANZANIA";
      }

      gsap.killTweensOf(curtain);
      gsap.set(curtain, { display: "flex", yPercent: 100 });
      gsap.to(curtain, {
        yPercent: 0,
        duration: 0.52,
        ease: "power4.inOut",
        onComplete: () => {
          router.push(href);
        },
      });
    },
    [pathname, router]
  );

  return (
    <TransitionContext.Provider value={{ navigate, isTransitioning }}>
      {children}
      {/* Barba-style GSAP Route Transition Curtain */}
      <div
        ref={curtainRef}
        aria-hidden="true"
        style={{ display: "none" }}
        className="fixed inset-0 z-[200] flex-col items-center justify-center bg-[#08100c] text-[#e2eee7] pointer-events-none select-none"
      >
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <span className="h-px w-12 bg-[#69b38a]/70" />
          <span
            ref={labelRef}
            className="font-mono text-xs uppercase tracking-[0.28em] text-[#a5d7bb]"
          >
            KIBO &amp; PLAINS · TANZANIA
          </span>
          <span className="font-serif text-3xl sm:text-4xl italic text-white">
            Karibu Tanzania
          </span>
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
