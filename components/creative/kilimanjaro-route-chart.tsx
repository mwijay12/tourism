"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { animate, svg, stagger } from "animejs";
import { KILIMANJARO_ROUTES } from "@/lib/tanzania-data";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettingsRemote,
  getEffectiveKilimanjaroRoutes,
  readSiteSettingsLocal,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";
import { ArrowUpRight, CheckCircle2, Compass, Mountain, ShieldCheck } from "lucide-react";
import { TransitionLink } from "@/components/creative/transition-provider";

export function KilimanjaroRouteChart() {
  const [selectedId, setSelectedId] = useState<string>(KILIMANJARO_ROUTES[0].id);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [siteSettings, setSiteSettings] =
    useState<SiteControlSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSiteSettings(readSiteSettingsLocal());
    fetchSiteSettingsRemote().then(setSiteSettings).catch(() => undefined);
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      if (detail) setSiteSettings(detail);
    };
    window.addEventListener("kp-site-settings-updated", onUpdate);
    return () =>
      window.removeEventListener("kp-site-settings-updated", onUpdate);
  }, []);

  const routes = useMemo(
    () => getEffectiveKilimanjaroRoutes(siteSettings),
    [siteSettings]
  );

  const route = useMemo(
    () => routes.find((r) => r.id === selectedId) ?? routes[0],
    [routes, selectedId]
  );

  const [displaySuccess, setDisplaySuccess] = useState(route.successRate);

  // Build smooth polyline & filled area paths from route elevation points
  const { linePath, areaPath } = useMemo(() => {
    const pts = route.elevationProfile;
    if (!pts.length) return { linePath: "", areaPath: "" };
    const line = pts
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
    const first = pts[0];
    const last = pts[pts.length - 1];
    const area = `${line} L ${last.x} 195 L ${first.x} 195 Z`;
    return { linePath: line, areaPath: area };
  }, [route]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplaySuccess(route.successRate);
      return;
    }

    // Anime.js v4 SVG Drawable path stroke reveal
    const pathNodes = el.querySelectorAll<SVGPathElement>(".kili-route-stroke");
    const drawables = svg.createDrawable(pathNodes);
    const strokeAnim = animate(drawables, {
      draw: ["0 0", "0 1"],
      ease: "outCubic",
      duration: 1100,
    });

    // Staggered camp marker dots pop-in
    const dotNodes = el.querySelectorAll(".kili-camp-node");
    const dotAnim = animate(dotNodes, {
      scale: [0, 1],
      opacity: [0, 1],
      delay: stagger(75, { start: 220 }),
      ease: "outBack(1.8)",
      duration: 500,
    });

    // Animated summit success counter
    const counterState = { val: 65 };
    const countAnim = animate(counterState, {
      val: route.successRate,
      duration: 900,
      ease: "outExpo",
      onUpdate: () => setDisplaySuccess(Math.round(counterState.val)),
    });

    return () => {
      strokeAnim.pause();
      dotAnim.pause();
      countAnim.pause();
    };
  }, [route]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start w-full max-w-full">
      {/* Left: Anime.js SVG Elevation Profile & Route Switcher */}
      <div className="min-w-0 w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <div className="min-w-0">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Anime.js v4 · SVG Route Telemetry
            </span>
            <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-foreground break-words">
              {route.name} — {route.days} Days
            </h3>
          </div>
          <div className="shrink-0 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 font-mono text-xs text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{displaySuccess}% Summit Rate</span>
          </div>
        </div>

        {/* Route Selector Tabs (clean multi-row wrap on mobile — zero horizontal overflow) */}
        <div className="mt-5 flex flex-wrap gap-2 w-full max-w-full">
          {routes.map((r) => {
            const active = r.id === route.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`cursor-pointer rounded-full px-3 sm:px-3.5 py-1.5 text-[11.5px] sm:text-xs font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.name} · {r.days}D · ${r.priceUsd.toLocaleString()}
              </button>
            );
          })}
        </div>

        {/* Interactive Elevation SVG */}
        <div className="mt-6 w-full max-w-full rounded-2xl border border-border bg-background/80 p-3 sm:p-5 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 600 220"
            className="w-full h-auto overflow-hidden"
            role="img"
            aria-label={`Elevation profile for ${route.name}`}
          >
            <defs>
              <linearGradient id="kiliAreaGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal altitude guides */}
            {[
              { y: 24, label: "5,895m Uhuru" },
              { y: 74, label: "4,630m Alpine" },
              { y: 120, label: "3,500m Moorland" },
              { y: 170, label: "1,800m Forest" },
            ].map((g) => (
              <g key={g.label}>
                <line
                  x1="20"
                  y1={g.y}
                  x2="585"
                  y2={g.y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="3 4"
                />
                <text
                  x="20"
                  y={g.y - 5}
                  className="fill-muted-foreground text-[9px] font-mono"
                >
                  {g.label}
                </text>
              </g>
            ))}

            {/* Shaded Mountain Slope Area */}
            <path d={areaPath} className="text-primary" fill="url(#kiliAreaGrad)" />

            {/* Anime.js Drawable Ridge Path */}
            <path
              key={route.id}
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="kili-route-stroke text-primary"
            />

            {/* Camp Waypoints */}
            {route.elevationProfile.map((pt) => {
              const isSummit = pt.altitudeM === 5895;
              return (
                <g
                  key={`${route.id}-${pt.day}`}
                  className="kili-camp-node"
                  style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSummit ? 6 : 4}
                    className={
                      isSummit
                        ? "fill-[#d8914f] stroke-background stroke-2"
                        : "fill-primary stroke-background stroke-2"
                    }
                  />
                  <text
                    x={pt.x}
                    y={208}
                    textAnchor="middle"
                    className="fill-muted-foreground font-mono text-[9.5px]"
                  >
                    {pt.day}
                  </text>
                  {isSummit && (
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      textAnchor="middle"
                      className="fill-[#b86f2d] dark:fill-[#e5a853] font-mono text-[9.5px] font-semibold"
                    >
                      5,895m
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Waypoint Cards Strip */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {route.elevationProfile.slice(0, 4).map((wp) => (
            <div
              key={wp.camp}
              className="min-w-0 rounded-xl border border-border/80 bg-background/70 px-3 py-2.5"
            >
              <div className="font-mono text-[10px] text-primary">{wp.day}</div>
              <div className="truncate text-xs font-semibold text-foreground">{wp.camp}</div>
              <div className="font-mono text-[11px] text-muted-foreground">
                {wp.altitudeM.toLocaleString()} m
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Route Dossier & Action */}
      <div className="min-w-0 w-full max-w-full overflow-hidden flex flex-col justify-between rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {route.nickname}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e5a853]/15 border border-[#e5a853]/40 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-[#b86f2d] dark:text-[#e5a853]">
                From ${route.priceUsd.toLocaleString()} pp
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[10px] font-medium text-foreground">
                {route.difficulty}
              </span>
            </div>
          </div>

          <p className="mt-4 text-base leading-relaxed text-foreground/90">{route.summary}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-background/70 p-4 text-sm">
            <div className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary shrink-0" /> Approach
              </dt>
              <dd className="mt-1 font-medium text-foreground break-words">{route.approach}</dd>
            </div>
            <div className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mountain className="h-3.5 w-3.5 text-primary shrink-0" /> Distance
              </dt>
              <dd className="mt-1 font-medium text-foreground break-words">{route.distanceKm} km round trip</dd>
            </div>
          </dl>

          <ul className="mt-6 space-y-3">
            {route.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/85">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <TransitionLink
            href="/kilimanjaro"
            label={`Kilimanjaro · ${route.name}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Explore Full Kilimanjaro Dossier
            <ArrowUpRight className="h-4 w-4" />
          </TransitionLink>
          <TransitionLink
            href={`/inquire?route=${route.id}`}
            label="Expedition Inquiry"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            Reserve Dates
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
