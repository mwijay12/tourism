import React from "react";
import { TransitionLink } from "@/components/creative/transition-provider";
import { Lock, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy (Tanzania PDPA 2022) | Kibo & Plains",
  description:
    "How Kibo & Plains Expeditions and Altraware Technology safeguard passport, medical, and safari booking data under Tanzania's Personal Data Protection Act (2022).",
};

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-24 bg-background text-foreground">
      <div className="mx-auto max-w-[900px] px-5 sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          <Lock className="h-3.5 w-3.5" />
          Tanzania Personal Data Protection Act (PDPA 2022)
        </div>
        <h1 className="mt-4 font-serif text-4xl sm:text-6xl font-semibold tracking-tight">
          Privacy &amp; Data Stewardship
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Engineered with privacy-by-design by <strong>Altraware Technology</strong> (Dar es Salaam). We collect only the information genuinely required to issue park permits, secure bush flights, and protect you on the mountain.
        </p>

        <div className="mt-10 space-y-6">
          {[
            {
              title: "01 · Information We Collect for Expeditions",
              body: "Passport full names, nationality, and date of birth are collected solely to register mandatory TANAPA, Ngorongoro Conservation Area, and domestic aviation manifests. For Mount Kilimanjaro ascents, optional emergency contacts, dietary needs, and altitude/medical history are shared strictly with your Lead Mountain Guide for safety.",
            },
            {
              title: "02 · Zero Third-Party Ad Tracking",
              body: "This site operates without third-party advertising trackers or behavioral retargeting cookies. Interactive WebGL shaders, theme settings, and expedition estimates run locally inside your browser.",
            },
            {
              title: "03 · Payment & Mobile Money Privacy",
              body: "Transactions settled via M-Pesa (Vodacom Daraja API), Tigo Pesa, Airtel Money, Halopesa, or card gateways are encrypted at transit and never stored as raw financial credentials on our booking servers.",
            },
            {
              title: "04 · Your Rights Under PDPA 2022",
              body: "You may request an export, correction, or complete deletion of your itinerary records at any time by emailing hello@kiboandplains.tz or reaching our engineering partner Altraware Technology at altrawaretechnology@gmail.com (+255 792 867 427).",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-border bg-card p-6 sm:p-7">
              <div className="flex items-center gap-2 text-primary font-serif text-2xl font-semibold">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <h2>{item.title}</h2>
              </div>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-5 text-sm">
          <TransitionLink href="/terms" label="TERMS & CONDITIONS" className="text-primary underline">
            Read Terms &amp; Conditions
          </TransitionLink>
          <TransitionLink href="/inquire" label="PLAN EXPEDITION" className="text-muted-foreground underline hover:text-foreground">
            Configure Safari
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
