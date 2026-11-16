"use client";

import React, { useMemo } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export const STICKER_CSS = `
.ml-sticker {
  --ml-size: clamp(4.75rem, 3.2rem + 4.4vw, 7.75rem);
  --ml-tilt: -8deg;
  position: absolute;
  z-index: 5;
  display: block;
  width: var(--ml-size);
  rotate: var(--ml-tilt);
  pointer-events: none;
  user-select: none;
}
.ml-sticker__drift,
.ml-sticker__body {
  display: block;
  will-change: transform;
}
.ml-doodle {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  filter: drop-shadow(0 0.5rem 0.85rem rgba(8, 16, 12, 0.18));
  will-change: transform;
}
.ml-doodle__back {
  fill: var(--sticker-back, #f4d774);
}
.ml-doodle__ink {
  fill: none;
  stroke: var(--sticker-ink, #102a1d);
  stroke-width: 3.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ml-doodle__dot {
  fill: var(--sticker-ink, #102a1d);
  stroke: none;
}
.ml-doodle--solid {
  filter: none;
}
.ml-doodle--solid .ml-doodle__ink {
  fill: var(--sticker-ink, #d8914f);
  stroke: none;
}
.ml-sticker--sun {
  --sticker-back: #f4d774;
  --sticker-ink: #0f291c;
}
.ml-sticker--sage {
  --sticker-back: #d2ebdc;
  --sticker-ink: #12472b;
}
.ml-sticker--night {
  --sticker-back: #11241a;
  --sticker-ink: #e5a853;
}
.dark .ml-sticker--night {
  --sticker-back: #f2eee4;
  --sticker-ink: #102419;
}
.ml-sticker--gold {
  --sticker-ink: #d8914f;
}
.ml-scribble {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ml-scribble * {
  vector-effect: non-scaling-stroke;
}
`;

// ---------- Deterministic Motion Lab Catmull-Rom + Polar Blob Generator ----------

type Pt = [number, number, 1?];

interface StrokeDef {
  kind: "line";
  points: Pt[];
  closed: boolean;
  steady?: boolean;
}

interface DotDef {
  kind: "dot";
  x: number;
  y: number;
  r: number;
}

type ShapeDef = StrokeDef | DotDef;

const line = (points: Pt[], opts: Partial<StrokeDef> = {}): StrokeDef => ({
  kind: "line",
  points,
  closed: false,
  ...opts,
});
const loop = (points: Pt[], opts: Partial<StrokeDef> = {}): StrokeDef => ({
  kind: "line",
  points,
  closed: true,
  ...opts,
});
const dot = (x: number, y: number, r: number): DotDef => ({
  kind: "dot",
  x,
  y,
  r,
});

function seeded(text: string) {
  let seed = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    seed = Math.imul(seed ^ text.charCodeAt(i), 3432918353);
    seed = (seed << 13) | (seed >>> 19);
  }
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = (v: number) => Math.round(v * 10) / 10;

function ring(x: number, y: number, rx: number, ry = rx, count = 8, start = 0.4): StrokeDef {
  const points: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const a = start + (i / count) * Math.PI * 2;
    points.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]);
  }
  return loop(points);
}

function star(x: number, y: number, r: number, waist = 0.3, tilt = 0): StrokeDef {
  const points: Pt[] = [];
  for (let i = 0; i < 8; i++) {
    const a = tilt - Math.PI / 2 + (i / 8) * Math.PI * 2;
    const reach = i % 2 === 0 ? r : r * waist;
    const pt: Pt = [x + Math.cos(a) * reach, y + Math.sin(a) * reach];
    if (i % 2 === 0) pt.push(1);
    points.push(pt);
  }
  return loop(points, { steady: true });
}

function smoothPath(points: Pt[], closed: boolean) {
  const count = points.length;
  const at = points.map(([x, y]) => [x, y]);
  const corner = points.map((p) => Boolean(p[2]));
  const samples: [number, number][] = [];
  let d = `M${rnd(at[0][0])} ${rnd(at[0][1])}`;

  const curve = (before: number[], from: number[], to: number[], after: number[]) => {
    const c1 = [from[0] + (to[0] - before[0]) / 6, from[1] + (to[1] - before[1]) / 6];
    const c2 = [to[0] - (after[0] - from[0]) / 6, to[1] - (after[1] - from[1]) / 6];
    d += `C${rnd(c1[0])} ${rnd(c1[1])} ${rnd(c2[0])} ${rnd(c2[1])} ${rnd(to[0])} ${rnd(to[1])}`;
    for (let s = 0; s <= 6; s++) {
      const t = s / 6;
      const u = 1 - t;
      samples.push([
        u * u * u * from[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * to[0],
        u * u * u * from[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * to[1],
      ]);
    }
  };

  const last = closed ? count : count - 1;
  for (let i = 0; i < last; i++) {
    const from = at[i];
    const next = (i + 1) % count;
    const to = at[next];
    const before = corner[i] || (!closed && i === 0) ? from : at[(i - 1 + count) % count];
    const after = corner[next] || (!closed && i + 2 > count - 1) ? to : at[(i + 2) % count];
    curve(before, from, to, after);
  }
  return { d: closed ? `${d}Z` : d, samples };
}

function buildBlobBacking(samples: [number, number][], random: () => number) {
  const MARGIN = 10.5;
  const xs = samples.map((p) => p[0]);
  const ys = samples.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;

  const COUNT = 48;
  const WINDOW = Math.PI / 10;
  const polar = samples.map(([x, y]) => [Math.atan2(y - cy, x - cx), Math.hypot(x - cx, y - cy)]);
  let reach = Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2 - Math.PI;
    let far = 0;
    for (const [theta, dist] of polar) {
      const apart = Math.abs(((theta - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (apart < WINDOW && dist > far) far = dist;
    }
    return far;
  });

  const sorted = [...reach].sort((a, b) => a - b);
  const floor = sorted[Math.floor(COUNT / 2)] * 0.62;
  reach = reach.map((v) => Math.max(v, floor));

  let soft = reach;
  for (let pass = 0; pass < 4; pass++) {
    soft = soft.map(
      (v, i) => (soft[(i - 1 + COUNT) % COUNT] + 2 * v + soft[(i + 1) % COUNT]) / 4
    );
  }

  const phase = [random() * 6.28, random() * 6.28];
  const outline: Pt[] = [];
  for (let i = 0; i < COUNT; i += 2) {
    const angle = (i / COUNT) * Math.PI * 2 - Math.PI;
    const lumps =
      1 + 0.035 * Math.sin(3 * angle + phase[0]) + 0.022 * Math.sin(5 * angle + phase[1]);
    const dist = (Math.max(soft[i], reach[i] - 1.5) + MARGIN) * lumps;
    outline.push([cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist]);
  }
  return smoothPath(outline, true);
}

// ---------- Hand-plotted Tanzanian Safari Stickers (0–100 grid) ----------

const SAFARI_STICKERS: Record<"summit" | "pin" | "compass", ShapeDef[]> = {
  // Kilimanjaro Tri-Peak + Expedition Flag + Single Sparkle
  summit: [
    line([[12, 78], [32, 46, 1], [44, 58, 1], [58, 28, 1], [76, 62, 1], [88, 78]]),
    line([[46, 52], [58, 48], [69, 53]]),
    line([[58, 28], [58, 12]]),
    loop([[58, 12, 1], [75, 17, 1], [58, 22, 1]]),
    line([[18, 86], [50, 84], [84, 86]]),
    star(22, 24, 9.5),
  ],
  // Serengeti Sanctuary GPS Pin + Horizon Ticks + Single Sparkle
  pin: [
    loop([[50, 86, 1], [38, 67], [29, 50], [31, 33], [42, 22], [58, 22], [69, 33], [71, 50], [62, 67]]),
    ring(50, 42, 8.5),
    line([[22, 82], [30, 89], [39, 90.5]]),
    line([[61, 90.5], [70, 89], [78, 82]]),
    star(82, 20, 9),
  ],
  // Field Azimuth Compass + Needle + Single Sparkle
  compass: [
    ring(50, 50, 32, 32, 10),
    line([[50, 22], [50, 29]]),
    line([[50, 71], [50, 78]]),
    line([[22, 50], [29, 50]]),
    line([[71, 50], [78, 50]]),
    loop([[50, 32, 1], [56, 50, 1], [50, 68, 1], [44, 50, 1]]),
    dot(50, 50, 3),
    star(84, 20, 8.5),
  ],
};

const SAFARI_SPARKS: ShapeDef[] = [
  star(32, 38, 24, 0.26),
  star(74, 22, 12, 0.28),
  star(70, 72, 16, 0.27),
];

function buildStickerModel(name: string, shapes: ShapeDef[], solid = false) {
  const SHAKE = 0.5;
  const random = seeded(name);
  const nudge = () => (random() - 0.5) * 2 * SHAKE;

  const paths: { d?: string; dot?: { x: number; y: number; r: number } }[] = [];
  let samples: [number, number][] = [];

  for (const s of shapes) {
    if (s.kind === "dot") {
      paths.push({ dot: { x: s.x, y: s.y, r: s.r } });
      for (let i = 0; i < 8; i++) {
        samples.push([s.x + Math.cos(i) * s.r, s.y + Math.sin(i) * s.r]);
      }
    } else {
      const factor = s.steady ? 0.35 : 1;
      const shakenPts: Pt[] = s.points.map(([x, y, c]) =>
        c
          ? [x + nudge() * factor, y + nudge() * factor, 1]
          : [x + nudge() * factor, y + nudge() * factor]
      );
      const made = smoothPath(shakenPts, s.closed);
      paths.push({ d: made.d });
      samples = samples.concat(made.samples);
    }
  }

  let backD: string | null = null;
  let boxSamples = samples;
  if (!solid) {
    const back = buildBlobBacking(samples, random);
    backD = back.d;
    boxSamples = back.samples;
  }

  const pad = solid ? 2 : 1.5;
  const xs = boxSamples.map((p) => p[0]);
  const ys = boxSamples.map((p) => p[1]);
  const left = Math.floor(Math.min(...xs) - pad);
  const top = Math.floor(Math.min(...ys) - pad);
  const width = Math.ceil(Math.max(...xs) + pad) - left;
  const height = Math.ceil(Math.max(...ys) + pad) - top;

  return {
    viewBox: `${left} ${top} ${width} ${height}`,
    backD,
    paths,
  };
}

export type SafariStickerName = "summit" | "pin" | "compass" | "spark";
export type SafariStickerTone = "sun" | "sage" | "night" | "gold";

interface SafariStickerProps {
  name: SafariStickerName;
  tone?: SafariStickerTone;
  depth?: number;
  turn?: number;
  className?: string;
}

/**
 * 4-layer Motion Lab sticker component:
 *   .ml-sticker        placement + resting tilt
 *   .ml-sticker__drift ScrollTrigger y + rotation parallax
 *   .ml-sticker__body  elastic.out(1, 0.6) pop + DrawSVG ink lines
 *   .ml-doodle         scroll velocity lean (±16deg) + pointer flinch
 */
export function SafariSticker({
  name,
  tone = "sun",
  depth = 0.22,
  turn = 10,
  className,
}: SafariStickerProps) {
  const model = useMemo(() => {
    if (name === "spark") {
      return { ...buildStickerModel("spark", SAFARI_SPARKS, true), solid: true };
    }
    return { ...buildStickerModel(name, SAFARI_STICKERS[name], false), solid: false };
  }, [name]);

  return (
    <span
      data-sticker
      data-depth={depth}
      data-turn={turn}
      aria-hidden="true"
      className={cn(`ml-sticker ml-sticker--${tone}`, className)}
    >
      <span className="ml-sticker__drift">
        <span className="ml-sticker__body">
          <svg
            viewBox={model.viewBox}
            className={cn("ml-doodle", model.solid && "ml-doodle--solid")}
            aria-hidden="true"
            focusable="false"
          >
            {model.backD && <path className="ml-doodle__back" d={model.backD} />}
            <g className="ml-doodle__ink">
              {model.paths.map((part, idx) =>
                part.dot ? (
                  <circle
                    key={idx}
                    className="ml-doodle__dot"
                    cx={part.dot.x}
                    cy={part.dot.y}
                    r={part.dot.r}
                  />
                ) : (
                  <path key={idx} d={part.d} />
                )
              )}
            </g>
          </svg>
        </span>
      </span>
    </span>
  );
}

/**
 * Hand-drawn Motion Lab scribble underline that draws smoothly on scroll (`data-draw="scrub"`).
 */
export function ScribbleUnderline({ className }: { className?: string }) {
  const paths = useMemo(() => {
    const r = seeded("scribble-underline");
    const n = () => (r() - 0.5) * 0.8;
    const p1 = smoothPath(
      [[3, 9 + n()], [32, 5 + n()], [66, 9 + n()], [104, 4.5 + n()], [144, 8 + n()]],
      false
    ).d;
    const p2 = smoothPath(
      [[132, 15 + n()], [92, 13 + n()], [48, 16.5 + n()]],
      false
    ).d;
    return [p1, p2];
  }, []);

  return (
    <svg
      viewBox="0 0 148 22"
      data-draw="scrub"
      data-draw-from="top 92%"
      data-draw-to="top 48%"
      aria-hidden="true"
      focusable="false"
      className={cn("ml-scribble", className)}
    >
      <path d={paths[0]} />
      <path d={paths[1]} data-at=">0.05" />
    </svg>
  );
}

/**
 * Mounts Motion Lab's 4-layer sticker engine (scroll drift, elastic pop + DrawSVG,
 * velocity lean, and fine-pointer brush flinch).
 */
export function mountMotionLabStickers(root: HTMLElement): () => void {
  const stickers = gsap.utils.toArray<HTMLElement>("[data-sticker]", root);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!stickers.length || reduced) return () => {};

  const LEAN = 16;
  const NARROW = 900;
  const TALLEST = 900;
  const FULL_SPEED = 2800;

  let gone = false;
  const triggers: ScrollTrigger[] = [];
  const leans: {
    sticker: HTMLElement;
    lean: gsap.QuickToFunc;
    seen: boolean;
    touched: boolean;
  }[] = [];
  const timelines: gsap.core.Timeline[] = [];

  for (const sticker of stickers) {
    const drift = sticker.querySelector<HTMLElement>(".ml-sticker__drift");
    const body = sticker.querySelector<HTMLElement>(".ml-sticker__body");
    const doodle = sticker.querySelector<SVGSVGElement>(".ml-doodle");
    if (!drift || !body || !doodle) continue;

    const depth = Number(sticker.dataset.depth || 0.22);
    const turn = Number(sticker.dataset.turn || 10);

    // Layer 3: Arrival pop + DrawSVG ink lines
    const arrive = gsap.timeline({ paused: true });
    arrive.fromTo(
      body,
      { scale: 0, rotation: -turn * 3 },
      { scale: 1, rotation: 0, duration: 1, ease: "elastic.out(1, 0.6)" }
    );

    if (!doodle.classList.contains("ml-doodle--solid")) {
      doodle.querySelectorAll<SVGPathElement>(".ml-doodle__ink path").forEach((path, idx) => {
        const at = 0.12 + idx * 0.06;
        gsap.set(path, { autoAlpha: 0 });
        arrive.set(path, { autoAlpha: 1 }, at);
        arrive.from(path, { drawSVG: "0%", duration: 0.48, ease: "power2.inOut" }, at);
      });
    }
    timelines.push(arrive);

    triggers.push(
      ScrollTrigger.create({
        trigger: sticker,
        start: "top 92%",
        onEnter: () => arrive.timeScale(1).play(),
        onLeaveBack: () => arrive.timeScale(2.1).reverse(),
      })
    );

    // Layer 2: Scrubbed scroll drift & rotation
    const reach = () =>
      depth *
      Math.min(window.innerHeight, TALLEST) *
      (window.innerWidth < NARROW ? 0.22 : 0.46);

    const driftTween = gsap.fromTo(
      drift,
      { y: () => reach(), rotation: () => -turn / 2 },
      {
        y: () => -reach(),
        rotation: () => turn / 2,
        ease: "none",
        scrollTrigger: {
          trigger: sticker,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      }
    );
    if (driftTween.scrollTrigger) triggers.push(driftTween.scrollTrigger);

    // Layer 4: Scroll velocity lean + fine-pointer brush flinch
    const leaner = {
      sticker,
      lean: gsap.quickTo(doodle, "rotation", { duration: 0.85, ease: "elastic.out(1, 0.35)" }),
      seen: false,
      touched: false,
    };
    leans.push(leaner);

    triggers.push(
      ScrollTrigger.create({
        trigger: sticker,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          leaner.seen = self.isActive;
          if (!self.isActive) leaner.lean(0);
        },
      })
    );
  }

  const tell = (deg: number) => leans.forEach((l) => l.seen && l.lean(deg));

  triggers.push(
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => tell(gsap.utils.clamp(-1, 1, self.getVelocity() / FULL_SPEED) * LEAN),
    })
  );

  const rest = () => tell(0);
  ScrollTrigger.addEventListener("scrollEnd", rest);

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const onPointerMove = (e: PointerEvent) => {
    for (const l of leans) {
      if (!l.seen) continue;
      const box = l.sticker.getBoundingClientRect();
      const inside =
        e.clientX > box.left &&
        e.clientX < box.right &&
        e.clientY > box.top &&
        e.clientY < box.bottom;
      if (inside && !l.touched) {
        const side = e.clientX < box.left + box.width / 2 ? 1 : -1;
        l.lean(side * LEAN);
        gsap.delayedCall(0.14, () => !gone && l.lean(0));
      }
      l.touched = inside;
    }
  };

  if (finePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  return () => {
    gone = true;
    ScrollTrigger.removeEventListener("scrollEnd", rest);
    if (finePointer) {
      window.removeEventListener("pointermove", onPointerMove);
    }
    triggers.forEach((t) => t.kill());
    timelines.forEach((tl) => tl.kill());
  };
}
