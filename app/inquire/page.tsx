"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KILIMANJARO_ROUTES, NATIONAL_PARKS } from "@/lib/tanzania-data";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase/client";
import { addDoc, collection } from "firebase/firestore";
import { Check, Compass, Loader2, MessageCircle, Mountain, Send, ShieldCheck } from "lucide-react";
import { TransitionLink } from "@/components/creative/transition-provider";

const MONTHS = [
  "January",
  "February",
  "March",
  "June",
  "July",
  "August",
  "September",
  "October",
  "December",
];

function InquireConfigurator() {
  const params = useSearchParams();
  const initialRoute = params.get("route") ?? "lemosho";
  const initialPark = params.get("park");

  const [focus, setFocus] = useState<"combo" | "kilimanjaro" | "safari">("combo");
  const [selectedParks, setSelectedParks] = useState<string[]>(() => {
    const base = ["serengeti", "ngorongoro", "tarangire"];
    if (initialPark && !base.includes(initialPark)) {
      return [...base, initialPark];
    }
    return base;
  });
  const [kiliRoute, setKiliRoute] = useState<string>(
    KILIMANJARO_ROUTES.some((r) => r.id === initialRoute) ? initialRoute : "lemosho"
  );
  const [travelers, setTravelers] = useState(2);
  const [month, setMonth] = useState("July");
  const [tier, setTier] = useState<"Signature Tented" | "Ultra-Luxury Fly-In">("Signature Tented");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<{
    mailSent: boolean;
    savedCloud: boolean;
  } | null>(null);

  const togglePark = (slug: string) => {
    setSelectedParks((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const estimate = useMemo(() => {
    const kiliDays = focus === "safari" ? 0 : KILIMANJARO_ROUTES.find((r) => r.id === kiliRoute)?.days ?? 8;
    const safariDays = focus === "kilimanjaro" ? 0 : Math.max(4, selectedParks.length * 2);
    const totalDays = kiliDays + safariDays;
    const dailyRate = tier === "Ultra-Luxury Fly-In" ? 960 : 590;
    const kiliBase = kiliDays * 410;
    const perPerson = Math.round(kiliBase + safariDays * dailyRate);
    return { totalDays, perPerson };
  }, [focus, kiliRoute, selectedParks.length, tier]);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let mailSent = false;
    let savedCloud = false;

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          guestEmail,
          focus,
          kiliRoute,
          selectedParks,
          travelers,
          month,
          tier,
          totalDays: estimate.totalDays,
          estimatePerPerson: estimate.perPerson,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        mailSent = Boolean(json.mailSent);
      }
    } catch {
      // ignore network error; fallback handled cleanly below
    }

    if (isFirebaseConfigured) {
      try {
        const fb = getFirebaseServices();
        if (fb) {
          await addDoc(collection(fb.db, "inquiries"), {
            guestName,
            guestEmail,
            focus,
            kiliRoute,
            selectedParks,
            travelers,
            month,
            tier,
            totalDays: estimate.totalDays,
            estimatePerPerson: estimate.perPerson,
            status: "new",
            mailSent,
            createdAt: new Date().toISOString(),
          });
          savedCloud = true;
        }
      } catch {
        // Firestore rule or unconfigured fallback
      }
    }

    setDispatchStatus({ mailSent, savedCloud });
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="pt-28 pb-24 bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="max-w-3xl">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            Arusha &amp; Moshi Private Concierge
          </span>
          <h1 className="mt-3 font-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02]">
            Craft your Tanzania expedition.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Configure your Kilimanjaro trail, national parks, and lodge caliber below. Our Arusha expedition planners respond within 12 hours with real camp availability and bush-flight schedules.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Form Left */}
          <form
            onSubmit={handleSubmitInquiry}
            className="space-y-8 rounded-3xl border border-border bg-card p-6 sm:p-9 shadow-sm"
          >
            {/* 1. Journey Focus */}
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                01 · Expedition Style
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  { id: "combo", label: "Kilimanjaro + Safari" },
                  { id: "kilimanjaro", label: "Summit Only" },
                  { id: "safari", label: "Wildlife & Zanzibar" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFocus(opt.id as typeof focus)}
                    className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      focus === opt.id
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Kilimanjaro Route */}
            {focus !== "safari" && (
              <div>
                <label className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  02 · Preferred Kilimanjaro Route
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {KILIMANJARO_ROUTES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setKiliRoute(r.id)}
                      className={`cursor-pointer rounded-full px-4 py-2 text-xs font-medium transition ${
                        kiliRoute === r.id
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      {r.name} ({r.days}D · {r.successRate}%)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. National Parks Selection */}
            {focus !== "kilimanjaro" && (
              <div>
                <label className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  03 · National Parks &amp; Coastlines
                </label>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {NATIONAL_PARKS.filter((p) => p.slug !== "kilimanjaro").map((park) => {
                    const checked = selectedParks.includes(park.slug);
                    return (
                      <button
                        key={park.slug}
                        type="button"
                        onClick={() => togglePark(park.slug)}
                        className={`cursor-pointer flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          checked
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-foreground">{park.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {park.region}
                          </div>
                        </div>
                        <span
                          className={`grid h-5 w-5 place-items-center rounded-full border ${
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Group & Timing */}
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Travelers
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setTravelers((v) => Math.max(1, v - 1))}
                    className="cursor-pointer h-7 w-7 rounded-full border border-border text-sm font-semibold hover:bg-secondary"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono text-sm font-semibold">
                    {travelers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelers((v) => Math.min(14, v + 1))}
                    className="cursor-pointer h-7 w-7 rounded-full border border-border text-sm font-semibold hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="month-select"
                  className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Target Month
                </label>
                <select
                  id="month-select"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m} 2027
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Camp Caliber
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as typeof tier)}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Signature Tented">Signature Tented</option>
                  <option value="Ultra-Luxury Fly-In">Ultra-Luxury Fly-In</option>
                </select>
              </div>
            </div>

            {/* 5. Contact */}
            <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-6">
              <div>
                <label
                  htmlFor="guest-name"
                  className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Full Name
                </label>
                <input
                  id="guest-name"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Amina Msuya"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="guest-email"
                  className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Email Address
                </label>
                <input
                  id="guest-email"
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="amina@example.com"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Dispatching Dossier...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Request Arusha Dossier
                  </>
                )}
              </button>
              <a
                href={`https://wa.me/255792867427?text=${encodeURIComponent(
                  `Habari Kibo & Plains / Altraware! I'm planning a ${estimate.totalDays}-day Tanzania expedition (${focus}) for ${travelers} guests in ${month} 2027 (${tier}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                WhatsApp Dispatch
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              Accepts M-Pesa, Tigo Pesa, Airtel Money, Visa/Mastercard &amp; SWIFT Wire. By submitting you agree to our{" "}
              <TransitionLink href="/terms" label="TERMS & CONDITIONS" className="underline text-foreground">
                Terms &amp; Conditions
              </TransitionLink>{" "}
              and{" "}
              <TransitionLink href="/privacy" label="PRIVACY POLICY" className="underline text-foreground">
                PDPA 2022 Privacy Policy
              </TransitionLink>
              .
            </p>

            {submitted && (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 text-sm text-foreground space-y-1.5">
                <div>
                  <strong>Asante sana, {guestName || "Explorer"}!</strong> Your {estimate.totalDays}-day Tanzania dossier draft for{" "}
                  <strong>{month} 2027</strong> ({travelers} travelers) has been prepared. Our Arusha &amp; Moshi specialists will follow up at{" "}
                  <strong>{guestEmail}</strong>.
                </div>
                {dispatchStatus && (
                  <div className="font-mono text-[11px] text-primary">
                    {dispatchStatus.mailSent
                      ? "✓ Confirmation dossier emailed via Nodemailer SMTP."
                      : "• Instant dossier ready (add SMTP keys in .env.local to auto-email)."}
                    {dispatchStatus.savedCloud ? " · ✓ Saved to Firebase Firestore." : ""}
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Summary Card Right */}
          <aside className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                Live Dossier Estimate
              </span>
              <span className="font-mono text-xs text-muted-foreground">{month} 2027</span>
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Suggested Duration
                </div>
                <div className="mt-1 font-serif text-4xl font-semibold">
                  {estimate.totalDays} Days
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Guide Estimate
                </div>
                <div className="mt-1 font-mono text-2xl font-semibold text-primary">
                  ${estimate.perPerson.toLocaleString()} pp
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              {focus !== "safari" && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mountain className="h-4 w-4 text-primary" /> Climb Trail
                  </span>
                  <span className="font-medium capitalize">{kiliRoute.replace("-", " ")}</span>
                </div>
              )}
              {focus !== "kilimanjaro" && (
                <div>
                  <span className="text-muted-foreground block mb-2">Selected Parks</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedParks.map((slug) => (
                      <span
                        key={slug}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs capitalize"
                      >
                        {slug}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Group Size</span>
                <span className="font-medium">{travelers} private guests</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lodging Caliber</span>
                <span className="font-medium">{tier}</span>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-border bg-background/80 p-4 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Included in every Tanzania dossier:
              </div>
              <p>
                TANAPA conservation &amp; crater fees, KPAP fair-wage mountain crews, private 4x4 safari Land Cruiser, domestic bush flights where selected, and AMREF Flying Doctors emergency cover.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function InquirePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-background font-mono text-xs text-muted-foreground">
          Loading Expedition Configurator...
        </div>
      }
    >
      <InquireConfigurator />
    </Suspense>
  );
}
