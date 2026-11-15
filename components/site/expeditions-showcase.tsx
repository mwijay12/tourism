"use client";

import React from "react";
import { EXPEDITION_ITINERARIES } from "@/lib/tanzania-data";
import { TransitionLink } from "@/components/creative/transition-provider";
import { ArrowUpRight, Award, Compass, ShieldCheck, Users } from "lucide-react";

export function ExpeditionsShowcase() {
  return (
    <section className="relative w-full py-20 md:py-28 bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              Curated Journeys · 2026 / 2027 Departures
            </span>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.03]">
              Signature Tanzania expeditions.
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every itinerary is privately guided by Arusha-born naturalists and KPAP-verified Chagga summit leaders—tailored around your pace.
          </p>
        </div>

        {/* 4 Signature Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {EXPEDITION_ITINERARIES.map((trip) => (
            <article
              key={trip.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
                    <span className="rounded-full border border-white/30 bg-black/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur-md">
                      {trip.tier} · {trip.days} Days
                    </span>
                    <span className="font-mono text-xs text-[#e5a853]">
                      From ${trip.startingFromUsd.toLocaleString()} pp
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {trip.routeSummary}
                  </div>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
                    {trip.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {trip.highlight}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {trip.parks.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-border bg-background/80 px-2.5 py-0.5 text-[11px] font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-7 pb-6 pt-3 border-t border-border/70 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Private 4x4 · Park fees included
                </span>
                <TransitionLink
                  href={`/inquire?trip=${trip.id}`}
                  label={trip.title.toUpperCase()}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Customize Journey
                  <ArrowUpRight className="h-4 w-4" />
                </TransitionLink>
              </div>
            </article>
          ))}
        </div>

        {/* Field Credentials Strip */}
        <div className="mt-16 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:p-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "KPAP Certified Crews",
              desc: "Fair porter wages, summit oxygen, pulse oximetry & Gamow safety gear on every climb.",
            },
            {
              icon: Compass,
              title: "TANAPA & TALA Licensed",
              desc: "Direct Arusha & Moshi ground operations—zero middleman markups.",
            },
            {
              icon: Users,
              title: "100% Private Vehicles",
              desc: "Extended pop-roof Land Cruisers with fridge, inverter & Swarovski binoculars.",
            },
            {
              icon: Award,
              title: "Conservation First",
              desc: "2% of every booking funds Kili reforestation & Serengeti anti-poaching scouts.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-2">
              <item.icon className="h-5 w-5 text-primary" />
              <h4 className="font-serif text-xl font-semibold">{item.title}</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
