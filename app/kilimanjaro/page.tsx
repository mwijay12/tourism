import React from "react";
import ParallaxHero from "@/components/ui/wilderness";
import { KilimanjaroRouteChart } from "@/components/creative/kilimanjaro-route-chart";
import { KILIMANJARO_ZONES } from "@/lib/tanzania-data";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, HeartHandshake, Mountain, ShieldCheck, Stethoscope } from "lucide-react";

export const metadata = {
  title: "Mount Kilimanjaro Expeditions | Kibo & Plains Tanzania",
  description:
    "Climb Mount Kilimanjaro (5,895 m Uhuru Peak) via Lemosho, Northern Circuit, Machame, Rongai, or Marangu routes with KPAP-certified Chagga mountain guides.",
};

export default function KilimanjaroPage() {
  return (
    <>
      <ParallaxHero
        eyebrow="UHURU PEAK · 5,895 METERS · UNESCO WORLD HERITAGE"
        title="KILIMANJARO"
        subtitle="Three volcanic cones—Kibo, Mawenzi, and Shira—rising into equatorial glaciers. Climb pole pole with Moshi's finest mountain crews."
        backdropSrc="/images/kilimanjaro-summit-dawn.jpg"
      >
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="#routes"
            className="inline-flex items-center gap-2 rounded-full bg-[#e5a853] px-6 py-3 text-sm font-semibold text-[#08100c] transition hover:bg-white"
          >
            Compare All 5 Routes
          </a>
          <TransitionLink
            href="/inquire?trip=summit-serengeti"
            label="BOOK KILIMANJARO EXPEDITION"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/35 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15"
          >
            Book Summit Dates
            <ArrowUpRight className="h-4 w-4" />
          </TransitionLink>
        </div>
      </ParallaxHero>

      {/* Route Telemetry & Comparison */}
      <section id="routes" className="w-full py-20 md:py-28 bg-background text-foreground">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="max-w-2xl mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              TANAPA Official Ascent Trails
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
              Choose your corridor to Uhuru Peak.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Acclimatization time is the single decisive factor between turning back at Stella Point and standing atop Africa. Select any route below to inspect daily camp altitudes.
            </p>
          </div>

          <KilimanjaroRouteChart />
        </div>
      </section>

      {/* Four Ecological Zones */}
      <section className="w-full py-20 md:py-24 bg-card/70 border-y border-border">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                Equator to Arctic
              </span>
              <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]">
                Four vertical worlds in eight days.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                Climbing Kilimanjaro compresses the botanical sweep from equatorial rainforest to polar icecap into a week of measured footsteps.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-2xl border border-border aspect-[4/3]">
                  <img
                    src="/images/kilimanjaro-panorama.jpg"
                    alt="Kilimanjaro massif rising above savannah acacia trees"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-border aspect-[4/3]">
                  <img
                    src="/images/kilimanjaro-mawenzi-ridge.jpg"
                    alt="Hikers traversing snowfields toward Mawenzi"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {KILIMANJARO_ZONES.map((item) => (
                <div
                  key={item.zone}
                  className="rounded-2xl border border-border bg-background p-5 sm:p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif text-2xl font-semibold text-foreground">
                      {item.zone}
                    </h3>
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-medium text-primary">
                      {item.altitude}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {item.climate}
                  </div>
                  <p className="mt-2.5 text-sm text-foreground/85 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KPAP & High-Altitude Safety Charter */}
      <section id="kpap" className="w-full py-20 md:py-28 bg-background text-foreground">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-border bg-card p-7">
              <HeartHandshake className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-2xl font-semibold">
                KPAP Ethical Porter Pledge
              </h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                Strict 20 kg load limits weighed daily at park gates, transparent fair-wage tipping protocols, warm four-season sleeping gear, and three hot meals a day for every crew member.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-7">
              <Stethoscope className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-2xl font-semibold">
                Twice-Daily Medical Checks
              </h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                Wilderness First Responder certified guides log blood oxygen saturation (SpO2), resting heart rate, and Lake Louise altitude scores every morning and evening.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-7">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-serif text-2xl font-semibold">
                Oxygen &amp; Mountain Evacuation
              </h3>
              <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">
                Emergency compressed oxygen bottles, pulse oximeters, portable hyperbaric Gamow chambers on 8+ day routes, and direct Kilimanjaro SAR helicopter coordination.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-border bg-primary text-primary-foreground p-8 sm:p-10">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.18em] opacity-80 flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                Ready for Uhuru Peak?
              </div>
              <h3 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold">
                Pair your summit with 4 days in the Serengeti.
              </h3>
            </div>
            <TransitionLink
              href="/inquire?trip=summit-serengeti"
              label="CONFIGURE KILIMANJARO CLIMB"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#e5a853] px-6 py-3 text-sm font-semibold text-[#08100c] transition hover:bg-white"
            >
              Start Climb Dossier
              <ArrowUpRight className="h-4 w-4" />
            </TransitionLink>
          </div>
        </div>
      </section>
    </>
  );
}
