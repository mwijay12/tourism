"use client";

import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

const SHAPES = "path, line, polyline, polygon, rect, circle, ellipse";
const clamp = gsap.utils.clamp;

export const MOTION_LAB_ART_CSS = `
.ml-art {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  color: color-mix(in srgb, var(--foreground) 78%, transparent);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.25;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ml-art * {
  vector-effect: non-scaling-stroke;
}
.ml-art .a {
  stroke: var(--accent);
}
.ml-art .p {
  stroke: var(--primary);
}
.ml-art .f {
  stroke: color-mix(in srgb, var(--foreground) 26%, transparent);
}
.ml-art .dot {
  fill: var(--accent);
  stroke: none;
}
.ml-art .dot-p {
  fill: var(--primary);
  stroke: none;
}
.ml-art .wash {
  fill: color-mix(in srgb, var(--accent) 16%, transparent);
  stroke: none;
}
.ml-art .wash-p {
  fill: color-mix(in srgb, var(--primary) 15%, transparent);
  stroke: none;
}
.ml-art text {
  fill: var(--muted-foreground);
  stroke: none;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
}
.ml-art text.ml-grade {
  fill: var(--accent);
  font-size: 11px;
  font-weight: 600;
}
.ml-art text.ml-figure {
  fill: var(--foreground);
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
}
@media (prefers-reduced-motion: reduce) {
  .ml-art *, .ml-art {
    visibility: visible !important;
    opacity: 1 !important;
  }
}
`;

interface BuiltDrawing {
  timeline: gsap.core.Timeline;
  loops: gsap.core.Tween[];
}

function buildDrawing(host: Element): BuiltDrawing {
  const el = host as HTMLElement;
  const step = Number(el.dataset.drawStep ?? 0.06);
  const delay = Number(el.dataset.drawDelay ?? 0);
  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: "power2.inOut" },
  });
  const loops: gsap.core.Tween[] = [];

  let started = false;
  const at = (part: HTMLElement) => {
    const position = part.dataset.at ?? (started ? `<${step}` : delay);
    started = true;
    return position;
  };

  const show = (part: HTMLElement) => {
    gsap.set(part, { autoAlpha: 0 });
    timeline.set(part, { autoAlpha: 1 }, at(part));
  };

  const targets = host.querySelectorAll<SVGElement>(
    `${SHAPES}, text, g[data-wander]`
  );

  for (const rawPart of targets) {
    if (rawPart.closest("defs, symbol, [data-still]")) continue;
    const part = rawPart as unknown as HTMLElement;

    if (part.hasAttribute("data-wander")) {
      const svgEl = rawPart as unknown as SVGGraphicsElement;
      const owner = svgEl.ownerSVGElement;
      const box = owner?.viewBox?.baseVal;
      const cx = part.dataset.wanderCx
        ? Number(part.dataset.wanderCx)
        : box
        ? box.x + box.width / 2
        : 180;
      const cy = part.dataset.wanderCy
        ? Number(part.dataset.wanderCy)
        : box
        ? box.y + box.height / 2
        : 130;
      const middle = `${cx} ${cy}`;
      const rest = Number(part.dataset.wander) || 0;
      gsap.set(rawPart, { rotation: rest - 145, svgOrigin: middle });
      timeline.to(
        rawPart,
        { rotation: rest, duration: 2.2, ease: "elastic.out(1, 0.48)" },
        at(part)
      );
      loops.push(
        gsap.to(rawPart, {
          rotation: rest + 6,
          duration: 2.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          paused: true,
        })
      );
    } else if (part.hasAttribute("data-travel")) {
      const pathSelector = part.dataset.travel;
      const pathEl = pathSelector
        ? host.querySelector<SVGPathElement>(pathSelector)
        : null;
      if (!pathEl) continue;
      const travelDelay = Number(part.dataset.travelDelay ?? 0);
      gsap.set(rawPart, { autoAlpha: 0 });
      timeline.to(rawPart, { autoAlpha: 1, duration: 0.3 }, at(part));
      loops.push(
        gsap.to(rawPart, {
          motionPath: { path: pathEl, align: pathEl, alignOrigin: [0.5, 0.5] },
          duration: Number(part.dataset.travelTime ?? 3.4),
          ease: "none",
          repeat: -1,
          delay: travelDelay,
          paused: true,
        })
      );
    } else if (part.hasAttribute("data-blink")) {
      show(part);
      timeline.from(rawPart, { drawSVG: "50% 50%", duration: 0.48 }, "<");
      loops.push(
        gsap.to(rawPart, {
          autoAlpha: 0.18,
          duration: 0.95,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          paused: true,
          delay: loops.length * 0.14,
        })
      );
    } else if (part.hasAttribute("data-pop")) {
      show(part);
      timeline.from(
        rawPart,
        {
          scale: 0,
          transformOrigin: "50% 50%",
          duration: 0.45,
          ease: "back.out(2.2)",
        },
        "<"
      );
    } else if (part.hasAttribute("data-fade") || rawPart.tagName === "text") {
      gsap.set(rawPart, { autoAlpha: 0 });
      timeline.to(
        rawPart,
        { autoAlpha: 1, duration: 0.42, ease: "power1.out" },
        at(part)
      );
    } else {
      const geom = rawPart as unknown as SVGGeometryElement;
      const length = typeof geom.getTotalLength === "function" ? geom.getTotalLength() : 120;
      const duration = Number(
        part.dataset.drawTime ?? clamp(0.26, 0.95, length / 420)
      );
      show(part);
      timeline.from(rawPart, { drawSVG: "0%", duration }, "<");
    }
  }

  return { timeline, loops };
}

export interface MountedDrawingsHandle {
  replayAll: () => void;
  replayHost: (host: Element) => void;
  destroy: () => void;
}

/**
 * Mounts Motion Lab's GSAP DrawSVG + MotionPath + ScrollTrigger blueprint engine.
 * Single library per element, pauses offscreen loops automatically, and leaves
 * complete crisp artwork intact when prefers-reduced-motion is enabled.
 */
export function mountMotionLabDrawings(root: HTMLElement): MountedDrawingsHandle {
  const hosts = gsap.utils.toArray<HTMLElement>("[data-draw]", root);
  for (const host of hosts) {
    for (const shape of host.querySelectorAll(SHAPES)) {
      shape.setAttribute("vector-effect", "non-scaling-stroke");
    }
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !hosts.length) {
    return {
      replayAll: () => {},
      replayHost: () => {},
      destroy: () => {},
    };
  }

  const triggers: ScrollTrigger[] = [];
  const entries = new Map<Element, BuiltDrawing>();

  for (const host of hosts) {
    const built = buildDrawing(host);
    entries.set(host, built);

    let finished = false;
    let onScreen = false;

    const syncLoops = () => {
      built.loops.forEach((loop) => (finished && onScreen ? loop.play() : loop.pause()));
    };

    built.timeline.eventCallback("onComplete", () => {
      finished = true;
      syncLoops();
    });

    if (host.dataset.draw === "scrub") {
      triggers.push(
        ScrollTrigger.create({
          trigger: host,
          start: host.dataset.drawFrom ?? "top 88%",
          end: host.dataset.drawTo ?? "bottom 58%",
          scrub: 0.6,
          animation: built.timeline,
        })
      );
    } else {
      triggers.push(
        ScrollTrigger.create({
          trigger: host,
          start: "top 88%",
          once: true,
          onEnter: () => built.timeline.play(),
        })
      );
    }

    triggers.push(
      ScrollTrigger.create({
        trigger: host,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          onScreen = self.isActive;
          syncLoops();
        },
      })
    );
  }

  return {
    replayAll: () => {
      entries.forEach(({ timeline, loops }, host) => {
        if ((host as HTMLElement).dataset.draw === "scrub") return;
        loops.forEach((l) => l.pause());
        timeline.restart();
      });
    },
    replayHost: (host: Element) => {
      const entry = entries.get(host);
      if (!entry) return;
      entry.loops.forEach((l) => l.pause());
      entry.timeline.restart();
    },
    destroy: () => {
      triggers.forEach((t) => t.kill());
      entries.forEach(({ timeline, loops }) => {
        timeline.kill();
        loops.forEach((l) => l.kill());
      });
      entries.clear();
    },
  };
}
