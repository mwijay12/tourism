# Kibo & Plains — Luxury Tanzania Safari & Mount Kilimanjaro Expeditions

A Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui Progressive Web App (PWA) for a luxury Tanzanian expedition agency featuring Mount Kilimanjaro, Serengeti National Park, Ngorongoro Crater, Tarangire, Ruaha, Mahale Mountains, and Zanzibar.

## Experience & Motion Stack

- `components/ui/wilderness.tsx` — 3D perspective `ParallaxHero` with Kilimanjaro backdrop, Flexbox-safe centering, and hardware-smooth pointer tracking.
- `components/creative/webgl-terrain-shader.tsx` — Custom raw WebGL + GLSL topographic contour & savannah mist shader with `@tweenjs/tween.js` uniform interpolation across elevation zones.
- `components/creative/scroll-expedition-reel.tsx` — Scroll-scrubbed & auto-playable 60fps aerial Tanzania canvas film sequence (`Arusha → Serengeti → Ngorongoro → Uhuru Peak 5,895 m → Zanzibar`) paired with curved `DrawSVGPlugin` + `MotionPathPlugin` flight arc and radial altimeter ring.
- `components/creative/curved-scroll-progress.tsx` — Flowing curved mountain-skyline SVG ridge ribbon and floating S-trail altitude navigator (replaces straight scroll bars across the viewport).
- `components/creative/motion-lab-stickers.tsx` & `components/creative/motion-lab-draw.tsx` — Motion Lab 4-layer Catmull-Rom safari stickers and scrub-drawn `ScribbleUnderline` paired with realistic Tanzania field photography in `components/site/expedition-instruments.tsx`.
- `components/creative/kilimanjaro-route-chart.tsx` — Interactive Mount Kilimanjaro ascent elevation chart powered by `animejs` v4.
- `components/ui/ridgeline-dither-footer.tsx` — Procedural ordered-dither mountain range footer with interactive lantern reveal and altimeter readout.

## PWA, Admin Panel & Backend Integrations

- **PWA (`/manifest.webmanifest`, `/sw.js`, `app/icon.svg`, `app/apple-icon.png`, `public/icons/*`):** Installable standalone mobile/desktop web app with offline page & media caching (`components/site/pwa-register.tsx`).
- **Admin Portal (`/admin`):** Protected by **Firebase Google Sign-In** (`NEXT_PUBLIC_ADMIN_EMAILS` allowlist) with an interactive Sandbox preview before keys are pasted:
  - **Firestore Manager (`expeditions` & `inquiries`):** Create, publish/hide, delete, and sync packages + manage traveler inquiries.
  - **Cloudinary Media Studio (`/api/cloudinary/upload`, `/api/cloudinary/sign`):** Upload & list optimized `f_auto,q_auto` photography under `kibo-plains/*`.
  - **Nodemailer Dispatcher (`/api/inquiries`, `/api/admin/send-email`):** Sends automatic HTML dossier confirmations on inquiry submission plus custom quotes from the Admin Console.

## Setup (`.env.example`)

Copy `.env.example` to `.env.local` (or add variables in Vercel Project Settings):

```bash
cp .env.example .env.local
```

Fill in your **Firebase** (`NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_ADMIN_EMAILS`), **Cloudinary** (`CLOUDINARY_*`), and **Nodemailer SMTP** (`SMTP_*`) credentials.

## Routes

- `/` — Flagship Tanzania Landing Page + Scroll-Animated Expedition Reel
- `/kilimanjaro` — Mount Kilimanjaro Expeditions (5 official TANAPA routes, 4 ecological zones, KPAP ethics)
- `/parks` — Tanzania National Parks & Wildlife Atlas (7 protected ecosystems)
- `/inquire` — Bespoke Safari & Climb Configurator (with Nodemailer + Firestore + WhatsApp dispatch)
- `/admin` — Firebase Google Auth Admin Panel (Expeditions, Inquiries, Cloudinary Media, Nodemailer & Env Checklist)
- `/terms` & `/privacy` — Tanzanian Expedition Terms & PDPA 2022 Privacy Stewardship

## Development

```bash
npm install
npm run typecheck
npm run dev
```

## Production Build

```bash
npm run build
npm run start
```
