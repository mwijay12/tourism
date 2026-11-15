# Kibo & Plains — Luxury Tanzania Safari & Mount Kilimanjaro Expeditions

A Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui website for a luxury Tanzanian tourism & trekking agency featuring Mount Kilimanjaro, Serengeti National Park, Ngorongoro Crater, Tarangire, Ruaha, Mahale Mountains, and Zanzibar.

## Project Structure & Integrated `/components/ui` Components

- `components/ui/ridgeline-dither-footer.tsx` — Integrated procedural ordered-dither mountain range footer with interactive pointer lantern clearing, parallax tilt, altimeter crest readout, and click-triggered wind gusts.
- `components/ui/wilderness.tsx` — Integrated 3D perspective `ParallaxHero` & `ParallaxHeroDemo` component enhanced with Kilimanjaro atmospheric backdrop support and safe viewport bounds.
- `components/ui/button.tsx` & `components/ui/badge.tsx` — Core shadcn-compatible UI primitives.
- `components/creative/webgl-terrain-shader.tsx` — Custom raw WebGL + GLSL topographic contour & savannah mist shader with `@tweenjs/tween.js` uniform interpolation across elevation zones.
- `components/creative/webgl-image-plane.tsx` — WebGL GLSL hover ripple & chromatic dispersion plane for national park photography.
- `components/creative/kilimanjaro-route-chart.tsx` — Interactive Mount Kilimanjaro ascent elevation chart powered by `animejs` v4 (`svg.createDrawable`, staggered waypoints, and animated counters).
- `components/creative/transition-provider.tsx` — `Lenis` smooth scrolling synced to `gsap.ticker` + `ScrollTrigger`, plus a Barba.js-style GSAP curtain page transition between Next.js routes.

## Routes

- `/` — Flagship Tanzania Agency Landing Page
- `/kilimanjaro` — Mount Kilimanjaro Expeditions (5 official TANAPA routes, 4 ecological zones, KPAP ethics)
- `/parks` — Tanzania National Parks & Wildlife Atlas (7 protected ecosystems)
- `/inquire` — Bespoke Safari & Climb Configurator

## Development

```bash
npm install
npm run typecheck
npm run dev
```

## Production Build & Vercel

```bash
npm run build
npm run start
```
