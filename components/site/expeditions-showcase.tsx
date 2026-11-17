"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPEDITION_ITINERARIES } from "@/lib/tanzania-data";
import { TransitionLink } from "@/components/creative/transition-provider";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettingsRemote,
  readSiteSettingsLocal,
  resolveSiteMedia,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";
import { ArrowUpRight, Award, Compass, ShieldCheck, Users } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function ExpeditionsShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
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

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".exp-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 38, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.78,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".exp-grid",
            start: "top 84%",
            once: true,
          },
        }
      );

      // Scrubbed image drift inside expedition cards
      gsap.utils.toArray<HTMLElement>(".exp-parallax-img").forEach((img) => {
        const frame = img.parentElement;
        if (!frame) return;
        gsap.fromTo(
          img,
          { yPercent: -6, scale: 1.12 },
          {
            yPercent: 6,
            scale: 1.12,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      const creds = gsap.utils.toArray<HTMLElement>(".exp-cred-item");
      gsap.fromTo(
        creds,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".exp-creds",
            start: "top 88%",
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-20 md:py-28 bg-background text-foreground"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] text-primary">
              Curated Journeys · 2026 / 2027 Departures
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.03]">
              {siteSettings.expeditionsTitle}
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every itinerary is privately guided by Arusha-born naturalists and KPAP-verified Chagga summit leaders—tailored around your pace.
          </p>
        </div>

        {/* 4 Signature Cards */}
        <div className="exp-grid mt-10 sm:mt-12 grid gap-5 sm:gap-6 md:grid-cols-2">
          {EXPEDITION_ITINERARIES.map((trip) => (
            <article
              key={trip.id}
              className="exp-card group flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
                  <img
                    src={resolveSiteMedia(
                      siteSettings,
                      `exp-${trip.id}`,
                      trip.image
                    )}
                    alt={trip.title}
                    className="exp-parallax-img h-full w-full object-cover will-change-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-3.5 sm:bottom-4 left-4 sm:left-5 right-4 sm:right-5 flex items-end justify-between gap-2 text-white">
                    <span className="rounded-full border border-white/30 bg-black/45 px-3 py-1 font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] backdrop-blur-md">
                      {trip.tier} · {trip.days} Days
                    </span>
                    <span className="font-mono text-[11px] sm:text-xs text-[#e5a853] shrink-0">
                      From ${trip.startingFromUsd.toLocaleString()} pp
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {trip.routeSummary}
                  </div>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
                    {trip.title}
                  </h3>
                  <p className="mt-2.5 sm:mt-3 text-sm leading-relaxed text-muted-foreground">
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

              <div className="px-5 sm:px-7 pb-5 sm:pb-6 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] sm:text-[11px] text-muted-foreground">
                  Private 4x4 · Park fees included
                </span>
                <TransitionLink
                  href={`/inquire?trip=${trip.id}`}
                  label={trip.title.toUpperCase()}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline shrink-0"
                >
                  Customize
                  <ArrowUpRight className="h-4 w-4" />
                </TransitionLink>
              </div>
            </article>
          ))}
        </div>

        {/* Field Credentials Strip */}
        <div className="exp-creds mt-12 sm:mt-16 grid gap-5 sm:gap-4 rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-8 sm:grid-cols-2 lg:grid-cols-4">
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
            <div key={item.title} className="exp-cred-item flex flex-col gap-2">
              <item.icon className="h-5 w-5 text-primary" />
              <h4 className="font-serif text-lg sm:text-xl font-semibold">{item.title}</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
