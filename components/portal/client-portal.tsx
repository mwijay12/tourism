"use client";

import React, { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  getFirebaseServices,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import {
  DEFAULT_INVOICE_ITEMS,
  SEED_CLIENTS,
  type AdminClientRecord,
} from "@/lib/firebase/admin-types";
import { formatMoney, generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";
import {
  Calendar,
  CheckCircle2,
  Compass,
  Download,
  Loader2,
  LogOut,
  MessageCircle,
  Mountain,
  Save,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const TRIP_STAGES: AdminClientRecord["tripStatus"][] = [
  "Planning",
  "Permits Issued",
  "Deposit Paid",
  "In Field",
  "Completed",
];

export function ClientPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const [clientRecord, setClientRecord] = useState<AdminClientRecord>(
    SEED_CLIENTS[0]
  );
  const [notesInput, setNotesInput] = useState(SEED_CLIENTS[0].notes);
  const [savingNotes, setSavingNotes] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fb = getFirebaseServices();
    if (!fb) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(fb.auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        try {
          const snap = await getDocs(
            query(
              collection(fb.db, "clients"),
              where("email", "==", currentUser.email)
            )
          );
          if (!snap.empty) {
            const first = snap.docs[0];
            const rec = {
              id: first.id,
              ...first.data(),
            } as AdminClientRecord;
            setClientRecord(rec);
            setNotesInput(rec.notes || "");
          } else {
            setClientRecord({
              ...SEED_CLIENTS[0],
              name: currentUser.displayName || currentUser.email,
              email: currentUser.email,
            });
          }
        } catch {
          // fallback cleanly
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    const fb = getFirebaseServices();
    if (!fb) {
      setDemoUnlocked(true);
      notify("Loaded sample Client Trip Workspace (awaiting Firebase keys).");
      return;
    }
    try {
      await signInWithPopup(fb.auth, fb.googleProvider);
    } catch (err) {
      notify(err instanceof Error ? err.message : "Google sign-in closed.");
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNotes(true);
    setClientRecord((prev) => ({ ...prev, notes: notesInput }));

    const fb = getFirebaseServices();
    if (fb && user && clientRecord.id) {
      await updateDoc(doc(fb.db, "clients", clientRecord.id), {
        notes: notesInput,
      }).catch(() => undefined);
    }

    setSavingNotes(false);
    notify("Updated expedition notes & dietary/gear preferences!");
  };

  const handleDownloadInvoice = async () => {
    setDownloadingPdf(true);
    try {
      await generateInvoicePdf({
        invoiceNumber: clientRecord.invoiceNumber,
        issueDate: "2026-11-15",
        dueDate: "2026-12-01",
        currency: "USD",
        tzsRate: 2680,
        taxPct: 5,
        depositPct: 30,
        clientName: clientRecord.name,
        clientEmail: clientRecord.email,
        clientOrg: clientRecord.organization,
        clientLogoUrl: clientRecord.logoUrl,
        tripTitle: clientRecord.tripTitle,
        notes:
          "Kibo & Plains Expeditions Ltd · M-Pesa, Card & SWIFT Wire accepted.",
        items: DEFAULT_INVOICE_ITEMS,
      });
      notify(`Downloaded ${clientRecord.invoiceNumber}.pdf`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background pt-24">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !demoUnlocked) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-24 text-foreground">
        <div className="mx-auto max-w-xl px-5">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xl space-y-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-primary">
              <Compass className="h-3.5 w-3.5" />
              Private Traveler Portal
            </span>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">
              Your Tanzania Expedition Hub
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in with the Google account linked to your expedition welcome email to inspect your live permit status, KPAP guide allocation, travel preferences, and PDF invoices.
            </p>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full cursor-pointer inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-6 py-4 text-sm font-semibold text-background shadow transition hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
                  />
                </svg>
                Sign in with Google
              </button>

              {!isFirebaseConfigured && (
                <button
                  type="button"
                  onClick={() => setDemoUnlocked(true)}
                  className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  Preview Sample Client Trip (Amina Msuya)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeStageIndex = Math.max(
    0,
    TRIP_STAGES.indexOf(clientRecord.tripStatus)
  );
  const sampleSubtotal = DEFAULT_INVOICE_ITEMS.reduce(
    (s, i) => s + i.qty * i.unitPriceUsd,
    0
  );

  return (
    <div className="min-h-screen bg-background pt-28 pb-24 text-foreground">
      {toast && (
        <div className="fixed top-20 right-4 z-[150] flex items-center gap-2 rounded-full border border-primary/40 bg-[#08100c] px-4 py-2.5 text-xs font-medium text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-[#e5a853]" />
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-[1160px] px-4 sm:px-8 space-y-8">
        {/* Top Banner */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-white/10 bg-[#08100c] p-6 sm:p-8 text-[#e2eee7] shadow-2xl">
          <div>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#e5a853]">
              Karibu {clientRecord.name} · {clientRecord.organization}
            </span>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-white">
              {clientRecord.tripTitle}
            </h1>
            <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#e5a853]" />
                {clientRecord.travelDates}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mountain className="h-3.5 w-3.5 text-[#62b388]" />
                {clientRecord.leadGuide}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-[#e5a853]" />
                {clientRecord.vehicleUnit}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloadingPdf}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-[#e5a853] px-5 py-3 text-xs font-semibold text-[#08100c] shadow hover:bg-white"
            >
              {downloadingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download PDF Invoice
            </button>
            <button
              type="button"
              onClick={async () => {
                const fb = getFirebaseServices();
                if (fb && user) await signOut(fb.auth);
                setDemoUnlocked(false);
                setUser(null);
              }}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-xs text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Milestone Progress Strip */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-primary mb-4">
            Expedition Readiness Milestones
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            {TRIP_STAGES.map((stage, idx) => {
              const done = idx <= activeStageIndex;
              return (
                <div
                  key={stage}
                  className={`rounded-2xl border p-3.5 ${
                    done
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <div className="font-mono text-[10px]">0{idx + 1}</div>
                  <div className="mt-1 text-sm font-semibold">{stage}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Cost Breakdown Card */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold">
                Itemized Cost Breakdown
              </h2>
              <span className="font-mono text-xs text-primary">
                {clientRecord.invoiceNumber}
              </span>
            </div>

            <div className="divide-y divide-border text-sm">
              {DEFAULT_INVOICE_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-mono text-[10px] uppercase text-[#b86f2d] dark:text-[#e5a853]">
                      {item.category} · ×{item.qty}
                    </div>
                    <div className="text-foreground">{item.description}</div>
                  </div>
                  <div className="font-mono font-semibold shrink-0">
                    {formatMoney(item.qty * item.unitPriceUsd, {
                      currency: "USD",
                      tzsRate: 2680,
                    } as never)}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-background border border-border p-4 flex items-center justify-between font-mono text-xs">
              <span>Estimated Contract Total (+5% Levy)</span>
              <strong className="text-base text-primary">
                ${Math.round(sampleSubtotal * 1.05).toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Client Gear / Dietary / Arrival Notes Form */}
          <form
            onSubmit={handleSaveNotes}
            className="rounded-3xl border border-border bg-card p-6 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-semibold">
                  Pre-Departure Notes &amp; Gear
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Share flight arrival times, sleeping bag rentals, or dietary requirements straight with your Arusha crew.
              </p>
              <textarea
                rows={6}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={savingNotes}
                className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground"
              >
                {savingNotes ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save to Expedition File
              </button>

              <a
                href={`https://wa.me/255792867427?text=${encodeURIComponent(
                  `Jambo Kibo & Plains! Updating my trip ${clientRecord.invoiceNumber} (${clientRecord.name}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-xs font-semibold hover:bg-secondary"
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                WhatsApp Guide
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
