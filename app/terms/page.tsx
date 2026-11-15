import React from "react";
import { TransitionLink } from "@/components/creative/transition-provider";
import {
  ArrowUpRight,
  Code2,
  CreditCard,
  FileCheck2,
  HeartHandshake,
  Mountain,
  Scale,
  ShieldAlert,
} from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Kibo & Plains · Built by Altraware Technology",
  description:
    "Comprehensive booking terms, TANAPA park conservation fee rules, Kilimanjaro KPAP medical safety disclosures, cancellation schedule, and digital attribution to Altraware Technology (Dar es Salaam).",
};

const SECTIONS = [
  {
    id: "operator",
    num: "01",
    title: "Operator Licensing & Digital Platform Attribution",
    icon: FileCheck2,
    paragraphs: [
      "Kibo & Plains Expeditions Ltd (registered in Arusha & Moshi, United Republic of Tanzania) operates private Kilimanjaro mountain climbs and wildlife safaris in compliance with the Tanzania Tourist Board (TTB), Tanzania Licensing Authority (TALA), and Tanzania National Parks Authority (TANAPA).",
      "This digital booking experience, interactive elevation telemetry, and concierge platform is designed, engineered, and maintained by Altraware Technology (Dar es Salaam, Tanzania — https://altraware-tech.vercel.app/).",
    ],
  },
  {
    id: "payments",
    num: "02",
    title: "Deposits, Pricing & Payment Channels (M-Pesa & International)",
    icon: CreditCard,
    paragraphs: [
      "A booking is confirmed once a 30% expedition deposit is cleared and written confirmation is issued by our Arusha operations desk. Full final balance is due 45 calendar days prior to your arrival date at Kilimanjaro International Airport (JRO) or Julius Nyerere International Airport (DAR).",
      "For bookings made within 45 days of departure, 100% of the expedition total is payable upon confirmation. Accepted settlement channels include USD SWIFT wire transfer, Visa/Mastercard, and Tanzanian Mobile Money (Vodacom M-Pesa, Tigo Pesa, Airtel Money, and Halopesa) with instant reconciled digital receipts.",
    ],
  },
  {
    id: "statutory-fees",
    num: "03",
    title: "TANAPA, NCAA & Zanzibar Statutory Conservation Fees",
    icon: Mountain,
    paragraphs: [
      "All government park conservation fees, Ngorongoro Crater service charges, Kilimanjaro hut/camping permits, rescue fees, and Zanzibar marine reserve levies are regulated by Tanzanian law.",
      "Should TANAPA, NCAA, or the Ministry of Natural Resources & Tourism adjust statutory tariffs or VAT/levies prior to your entry date, Kibo & Plains reserves the right to pass through the exact audited government increment. Once issued, park permits and domestic bush-flight seats are strictly non-transferable and non-refundable.",
    ],
  },
  {
    id: "cancellations",
    num: "04",
    title: "Cancellations, Rescheduling & Force Majeure",
    icon: Scale,
    paragraphs: [
      "All cancellation or date-change requests must be submitted in writing via email to hello@kiboandplains.tz or verified WhatsApp dispatch. Refunds are calculated from the date written notice is acknowledged by our Arusha office:",
    ],
    table: [
      { window: "61+ days before departure", charge: "30% deposit retained (or 100% transferable credit valid 18 months)" },
      { window: "31 – 60 days before departure", charge: "50% of total expedition cost" },
      { window: "15 – 30 days before departure", charge: "75% of total expedition cost" },
      { window: "0 – 14 days / No-show", charge: "100% of total expedition cost (no refund)" },
    ],
  },
  {
    id: "kilimanjaro-medical",
    num: "05",
    title: "Kilimanjaro Altitude Safety, Medical Authority & KPAP Ethics",
    icon: HeartHandshake,
    paragraphs: [
      "Climbing Mount Kilimanjaro to 5,895 meters carries inherent risks including Acute Mountain Sickness (AMS), HAPE, HACE, sub-zero exposure, and rugged volcanic terrain. Guests must hold valid travel and high-altitude medical evacuation insurance covering trekking up to 6,000 meters.",
      "Our Lead Wilderness First Responder Guides perform twice-daily SpO2 pulse oximetry and symptom checks. If a guide determines that further ascent endangers a climber's life, their instruction to descend is final and binding; early descent does not entitle the climber to a refund of unused mountain days or hotels.",
      "Under our Kilimanjaro Porters Assistance Project (KPAP) pledge, each porter strictly carries a maximum of 20 kg of expedition gear, receives full fair-market daily wages, three hot meals daily, and proper four-season mountain attire.",
    ],
  },
  {
    id: "wildlife-flights",
    num: "06",
    title: "Wildlife Conduct, Off-Roading & Bush-Flight Baggage",
    icon: ShieldAlert,
    paragraphs: [
      "Domestic bush flights (Seronera, Kogatende, Kuro, Ruaha, Mahale, Zanzibar) enforce a strict 15 kg (33 lb) per-person baggage allowance in soft-sided duffels (no hard-shell suitcases). Excess luggage may be stored securely at our Arusha office.",
      "Drivers are legally bound by TANAPA regulations prohibiting off-road driving in Serengeti, Ngorongoro, and Tarangire to protect fragile savannah grasses and denning wildlife. Guests must remain inside 4x4 vehicles unless explicitly cleared at designated picnic sites or guided walking trails.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="pt-28 pb-24 bg-background text-foreground">
      <div className="mx-auto max-w-[980px] px-5 sm:px-8">
        {/* Header */}
        <div className="border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Legal &amp; Expedition Governance · United Republic of Tanzania
          </div>
          <h1 className="mt-4 font-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.03]">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Effective November 2026 · Governs all Mount Kilimanjaro ascents, private wildlife safaris, and Zanzibar extensions booked through Kibo &amp; Plains Expeditions Ltd.
          </p>
        </div>

        {/* Terms Clauses */}
        <div className="mt-12 space-y-10">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.id}
                id={sec.id}
                className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                      Clause {sec.num}
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold">
                      {sec.title}
                    </h2>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5 text-sm sm:text-base leading-relaxed text-foreground/85">
                  {sec.paragraphs.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {sec.table && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="border-b border-border bg-secondary/60 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Notice Window</th>
                          <th className="px-4 py-3">Applicable Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {sec.table.map((row) => (
                          <tr key={row.window}>
                            <td className="px-4 py-3 font-medium text-foreground">{row.window}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row.charge}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Made by Altraware Technology Studio Card */}
        <div className="mt-12 rounded-3xl border border-primary/25 bg-primary text-primary-foreground p-7 sm:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#e5a853]">
                <Code2 className="h-4 w-4" />
                Made by Altraware Technology · Dar es Salaam
              </div>
              <h3 className="mt-2 font-serif text-3xl font-semibold">
                Mizizi ya nyumbani. Ufundi wa kidunia.
              </h3>
              <p className="mt-2.5 max-w-xl text-sm opacity-90 leading-relaxed">
                This platform was built by <strong>Altraware Technology</strong> — crafting mobile-first Tanzanian web platforms, WebGL motion systems, offline-ready business software, and M-Pesa integrations in Kiswahili &amp; English.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs opacity-90">
                <span>altrawaretechnology@gmail.com</span>
                <span>·</span>
                <span>WhatsApp: +255 792 867 427</span>
                <span>·</span>
                <span>Mon–Sat · 08:00–18:00 EAT</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 shrink-0">
              <a
                href="https://altraware-tech.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e5a853] px-5 py-2.5 text-xs font-semibold text-[#08100c] transition hover:bg-white"
              >
                Visit Altraware Tech
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://altra-motion-lab.vercel.app/services/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-white/10"
              >
                Altra Motion Lab Services
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>Governing Jurisdiction: United Republic of Tanzania</span>
          <div className="flex gap-5">
            <TransitionLink href="/privacy" label="PRIVACY & PDPA 2022" className="underline hover:text-foreground">
              Privacy &amp; PDPA 2022 Policy
            </TransitionLink>
            <TransitionLink href="/inquire" label="EXPEDITION PLANNER" className="underline hover:text-foreground">
              Back to Expedition Planner
            </TransitionLink>
          </div>
        </div>
      </div>
    </div>
  );
}
