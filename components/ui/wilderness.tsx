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

export const defaultLayers: ParallaxLayer[] = [
  {
    src: "https://cdn.21st.dev/assets/mirror/bf/bfb8ca258f591d2b7388d05d79ac2332b695867281627c1bc8c7165ca6429a6d.png",
    alt: "background",
    speedX: 0.03,
    speedY: 0.038,
    speedZ: 0,
    rotation: 0,
    distance: -200,
    zIndex: 1,
    initialTop: "calc(50% - 50px)",
    initialLeft: "calc(50% + 0px)",
    width: "3200px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/c8/c878e14d1f8e481f6f70b31fb01de352338db5353f5b8852a241062bb251b558.png",
    alt: "fog-7",
    speedX: 0.27,
    speedY: 0.32,
    speedZ: 0,
    rotation: 0,
    distance: 850,
    zIndex: 2,
    initialTop: "calc(50% - 100px)",
    initialLeft: "calc(50% + 300px)",
    width: "1900px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/e9/e94a2247aa54feee12cd1580a7c3abf97d6f55bbe7e50006d8dda6e4dffbe921.png",
    alt: "mountain-10",
    speedX: 0.095,
    speedY: 0.005,
    speedZ: 0,
    rotation: 0,
    distance: 1110,
    zIndex: 3,
    initialTop: "calc(50% + 169px)",
    initialLeft: "calc(50% + 330px)",
    width: "1200px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/99/9955626de3f10d97d27b7b89f7be180c02e1700f288db28e0c6824142871523f.png",
    alt: "fog-6",
    speedX: 0.25,
    speedY: 0.28,
    speedZ: 0,
    rotation: 0,
    distance: 1400,
    zIndex: 4,
    initialTop: "calc(50% + 285px)",
    initialLeft: "calc(50%)",
    width: "2200px",
    className: "opacity-30",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/dd/dd999609be149c46fcb65fce4d267cad8d5651b0c31901b399054da5146cb46e.png",
    alt: "mountain-9",
    speedX: 0.125,
    speedY: 0.155,
    speedZ: 0.15,
    rotation: 0.02,
    distance: 1700,
    zIndex: 51,
    initialTop: "calc(50% + 313px)",
    initialLeft: "calc(50% - 557px)",
    width: "670px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/d5/d579e64ddeb3a32d04dff5391980b827eb4d6d4aafa2cc3231e2cbe02d66a7c7.png",
    alt: "fog-5",
    speedX: 0.16,
    speedY: 0.105,
    speedZ: 0,
    rotation: 0,
    distance: 1900,
    zIndex: 7,
    initialTop: "calc(50% + 360px)",
    initialLeft: "calc(50% + 40px)",
    width: "650px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/b7/b74be54427fd5b9568571ba97684bc8a4334d366a3f3b32c353d31fd1501c09b.png",
    alt: "mountain-7",
    speedX: 0.1,
    speedY: 0.1,
    speedZ: 0,
    rotation: 0.09,
    distance: 2000,
    zIndex: 19,
    initialTop: "calc(50% + 223px)",
    initialLeft: "calc(50% + 495px)",
    width: "738px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/ed/edf306a4225b6188283aa94ecec1553b2e0855038a3acaed402001f38c64af1d.png",
    alt: "mountain-6",
    speedX: 0.065,
    speedY: 0.05,
    speedZ: 0.05,
    rotation: 0.12,
    distance: 2300,
    zIndex: 18,
    initialTop: "calc(50% + 120px)",
    initialLeft: "calc(50% + 590px)",
    width: "408px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/8d/8d12582b7eac71f981eca3a8bb19157fb57fc4b05c14f9ef80fd029e5fecfab5.png",
    alt: "fog-4",
    speedX: 0.135,
    speedY: 0.1,
    speedZ: 0,
    rotation: 0,
    distance: 2400,
    zIndex: 11,
    initialTop: "calc(50% + 223px)",
    initialLeft: "calc(50% + 460px)",
    width: "590px",
    className: "opacity-50",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/9c/9c1a1b7f4b165011788c27d440d920e407d70f148cbc9a01eacfecb49126efcb.png",
    alt: "mountain-5",
    speedX: 0.08,
    speedY: 0.05,
    speedZ: 0.13,
    rotation: 0.1,
    distance: 2550,
    zIndex: 12,
    initialTop: "calc(50% + 320px)",
    initialLeft: "calc(50% + 230px)",
    width: "725px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/0e/0e7888cc6d1732222b5c1f38b925cf1ecdb7fec02fd1193dd1cfef280a453c5a.png",
    alt: "fog-3",
    speedX: 0.11,
    speedY: 0.018,
    speedZ: 0,
    rotation: 0,
    distance: 2800,
    zIndex: 13,
    initialTop: "calc(50% + 210px)",
    initialLeft: "calc(50% + 5px)",
    width: "1600px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/fa/fa0946f924ad025b207616cfe20ce022bcccd22ac9db4038a584ace23b7d9721.png",
    alt: "mountain-4",
    speedX: 0.059,
    speedY: 0.024,
    speedZ: 0.35,
    rotation: 0.14,
    distance: 3200,
    zIndex: 15,
    initialTop: "calc(50% + 196px)",
    initialLeft: "calc(50% - 698px)",
    width: "1100px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/90/90863919566208c1eb7a78136d1dd493dd402f4d5a5efe2fc890a288a6b07449.png",
    alt: "mountain-3",
    speedX: 0.04,
    speedY: 0.018,
    speedZ: 0.32,
    rotation: 0.05,
    distance: 3400,
    zIndex: 20,
    initialTop: "calc(50% - 20px)",
    initialLeft: "calc(50% + 750px)",
    width: "630px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/b2/b2d0ba5c7f17d038a04475b8f36563aea22cfee00983db3b5477f1ac4c9a5097.png",
    alt: "fog-2",
    speedX: 0.15,
    speedY: 0.0115,
    speedZ: 0,
    rotation: 0,
    distance: 3600,
    zIndex: 16,
    initialTop: "calc(50% - 20px)",
    initialLeft: "calc(50% + 698px)",
    width: "1100px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/c4/c4ae700b3a0070eae9f3c005a17572ae68fcb8373d322f279d28c5bf19cd501d.png",
    alt: "mountain-2",
    speedX: 0.0235,
    speedY: 0.013,
    speedZ: 0.42,
    rotation: 0.15,
    distance: 3800,
    zIndex: 17,
    initialTop: "calc(50% + 256px)",
    initialLeft: "calc(50% + 528px)",
    width: "800px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/41/414097ad4507410ac1dc884afcc92bb3f4f45763fd17b2986bf82dd43c31da97.png",
    alt: "mountain-1",
    speedX: 0.027,
    speedY: 0.018,
    speedZ: 0.53,
    rotation: 0.2,
    distance: 4000,
    zIndex: 18,
    initialTop: "calc(50% + 196px)",
    initialLeft: "calc(50% - 728px)",
    width: "1100px",
  },
  {
    src: "https://cdn.21st.dev/assets/mirror/aa/aa8ace86d9779fcccce3a1a28b8ac0cb86336b5980706659f2c8889c3daaf5a1.png",
    alt: "fog-1",
    speedX: 0.12,
    speedY: 0.01,
    speedZ: 0,
    rotation: 0,
    distance: 4200,
    zIndex: 21,
    initialTop: "calc(100% - 355px)",
    initialLeft: "calc(50% + 100px)",
    width: "1900px",
    className: "opacity-50",
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
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const updateLayers = (
      cursorPosition: number,
      xVal: number,
      yVal: number,
      rotateDeg: number
    ) => {
      layerRefs.current.forEach((el, index) => {
        if (!el) return;
        const layer = layers[index];
        if (!layer) return;
        const { speedX, speedY, speedZ, rotation } = layer;

        const computedLeft =
          parseFloat(getComputedStyle(el).left.replace("px", "")) ||
          window.innerWidth / 2;
        const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

        el.style.transform = `perspective(2300px) translateZ(${
          zValue * speedZ
        }px) rotateY(${rotateDeg * rotation}deg) translateX(calc(-50% + ${
          -xVal * speedX
        }px)) translateY(calc(-50% + ${yVal * speedY}px))`;
      });

      if (textRef.current && window.innerWidth >= 640) {
        const textSpeedX = 0.05;
        const textSpeedY = 0.03;
        const textSpeedZ = 0.06;
        const textRotation = 0.025;

        const computedLeft =
          parseFloat(getComputedStyle(textRef.current).left.replace("px", "")) ||
          window.innerWidth / 2;
        const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

        textRef.current.style.transform = `perspective(2300px) translateZ(${
          zValue * textSpeedZ
        }px) rotateY(${rotateDeg * textRotation}deg) translateX(calc(-50% + ${
          -xVal * textSpeedX
        }px)) translateY(calc(-50% + ${yVal * textSpeedY}px))`;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const newXValue = e.clientX - window.innerWidth / 2;
      const newYValue = e.clientY - window.innerHeight / 2;
      const newRotateDegree = (newXValue / (window.innerWidth / 2)) * 16;
      updateLayers(e.clientX, newXValue, newYValue, newRotateDegree);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [layers]);

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#060f0a] via-[#0c1e15] to-[#11281d] py-24 sm:py-28",
        className
      )}
    >
      {/* Authentic Tanzanian Kilimanjaro base atmosphere */}
      {backdropSrc && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-cover bg-center opacity-55 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url(${backdropSrc})` }}
        />
      )}

      {/* Atmospheric dawn horizon glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_38%,rgba(220,164,95,0.22)_0%,rgba(20,62,40,0.52)_46%,rgba(6,14,10,0.92)_100%)]"
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[40] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_52%,rgba(4,10,7,0.8))]"
      />

      {/* Bottom atmospheric blend into page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] h-32 sm:h-40 bg-gradient-to-t from-[#08100c] via-[#08100c]/60 to-transparent"
      />

      {/* Multi-plane parallax depth layers (trimmed lightly on very small phones for 60fps smoothness) */}
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
            loading={index < 4 ? "eager" : "lazy"}
            onError={() =>
              setHiddenIndices((prev) => ({
                ...prev,
                [index]: true,
              }))
            }
            className={cn(
              "absolute pointer-events-none transition-transform duration-[450ms] ease-out opacity-70 select-none",
              index > 8 ? "hidden md:block" : "",
              layer.className
            )}
            style={{
              width: layer.width,
              top: layer.initialTop,
              left: layer.initialLeft,
              zIndex: layer.zIndex,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* Central Typography & Editorial Slots (responsive relative on mobile, centered parallax on sm+) */}
      <div
        ref={textRef}
        className="relative sm:absolute z-[55] w-full max-w-6xl px-5 sm:px-6 text-white text-center pointer-events-auto transition-transform duration-[450ms] ease-out sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
      >
        {eyebrow && (
          <div className="mb-4 sm:mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3.5 sm:px-4 py-1.5 font-mono text-[9.5px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#d8eadf] backdrop-blur-md">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e5a853]" />
            <span className="truncate">{eyebrow}</span>
          </div>
        )}
        <h1 className="font-serif font-semibold tracking-[-0.03em] text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.65)] text-[clamp(2.75rem,12vw,8.4rem)] leading-[0.9] break-words">
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
