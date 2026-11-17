"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  type ClientNotification,
} from "@/lib/firebase/admin-types";
import {
  fetchAllNotifications,
  filterNotificationsForEmail,
  markAllNotificationsReadByEmail,
  markNotificationReadByEmail,
  readNotificationsLocal,
} from "@/lib/firebase/notifications";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettingsRemote,
  readSiteSettingsLocal,
  type SiteControlSettings,
} from "@/lib/firebase/site-settings";
import { formatMoney, generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";
import { TransitionLink } from "@/components/creative/transition-provider";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Calendar,
  Check,
  CheckCheck,
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

const CATEGORY_BADGE: Record<
  ClientNotification["category"],
  { label: string; style: string }
> = {
  permits: {
    label: "Permits",
    style: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  invoice: {
    label: "Invoice",
    style: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  crew: {
    label: "Crew & 4x4",
    style: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  urgent: {
    label: "Urgent",
    style: "bg-red-500/15 text-red-700 dark:text-red-300",
  },
  update: {
    label: "Update",
    style: "bg-primary/15 text-primary",
  },
};

export function ClientPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const [clientRecord, setClientRecord] = useState<AdminClientRecord>(
    SEED_CLIENTS[0]
  );
  const [siteSettings, setSiteSettings] =
    useState<SiteControlSettings>(DEFAULT_SITE_SETTINGS);
  const [allNotifications, setAllNotifications] = useState<
    ClientNotification[]
  >([]);
  const [showNotifPanel, setShowNotifPanel] = useState(true);
  const [notesInput, setNotesInput] = useState(SEED_CLIENTS[0].notes);
  const [savingNotes, setSavingNotes] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    setSiteSettings(readSiteSettingsLocal());
    fetchSiteSettingsRemote().then(setSiteSettings).catch(() => undefined);

    setAllNotifications(readNotificationsLocal());
    fetchAllNotifications().then(setAllNotifications).catch(() => undefined);

    const onNotifUpdate = (e: Event) => {
      const detail = (e as CustomEvent<ClientNotification[]>).detail;
      if (Array.isArray(detail)) setAllNotifications(detail);
      else setAllNotifications(readNotificationsLocal());
    };
    const onSiteUpdate = (e: Event) => {
      const detail = (e as CustomEvent<SiteControlSettings>).detail;
      if (detail) setSiteSettings(detail);
    };
    const onStorage = () => {
      setAllNotifications(readNotificationsLocal());
      setSiteSettings(readSiteSettingsLocal());
    };

    window.addEventListener("kp-notifications-updated", onNotifUpdate);
    window.addEventListener("kp-site-settings-updated", onSiteUpdate);
    window.addEventListener("storage", onStorage);

    const fb = getFirebaseServices();
    if (!fb) {
      setLoading(false);
      return () => {
        window.removeEventListener("kp-notifications-updated", onNotifUpdate);
        window.removeEventListener("kp-site-settings-updated", onSiteUpdate);
        window.removeEventListener("storage", onStorage);
      };
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

    return () => {
      unsub();
      window.removeEventListener("kp-notifications-updated", onNotifUpdate);
      window.removeEventListener("kp-site-settings-updated", onSiteUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const clientEmail = (user?.email || clientRecord.email).toLowerCase();

  const myNotifications = useMemo(
    () => filterNotificationsForEmail(allNotifications, clientEmail),
    [allNotifications, clientEmail]
  );

  const unreadCount = useMemo(
    () =>
      myNotifications.filter(
        (n) => !n.readBy.map((e) => e.toLowerCase()).includes(clientEmail)
      ).length,
    [myNotifications, clientEmail]
  );

  const handleMarkRead = async (id: string) => {
    const next = await markNotificationReadByEmail(id, clientEmail);
    setAllNotifications(next);
  };

  const handleMarkAllRead = async () => {
    const next = await markAllNotificationsReadByEmail(clientEmail);
    setAllNotifications(next);
    notify("All expedition notifications marked as read.");
  };

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
        companyName: siteSettings.brandName,
        companyLogoUrl: siteSettings.brandLogoUrl,
        companyEmail: siteSettings.contactEmail,
        companyPhone: siteSettings.whatsappNumber,
        statusLabel: clientRecord.tripStatus,
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
      <div className="min-h-screen flex flex-col justify-between bg-background px-5 py-8 text-foreground">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2.5 font-serif text-xl font-semibold">
            {siteSettings.brandLogoUrl && (
              <img
                src={siteSettings.brandLogoUrl}
                alt={siteSettings.brandName}
                className="h-7 w-7 rounded-lg object-contain bg-white p-0.5 border border-border"
              />
            )}
            <span>
              {siteSettings.brandName}{" "}
              <span className="text-primary">· Portal</span>
            </span>
          </div>
          <TransitionLink
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-xs hover:bg-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Public Site
          </TransitionLink>
        </header>

        <div className="mx-auto my-auto max-w-xl w-full py-10">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xl space-y-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-primary">
              <Compass className="h-3.5 w-3.5" />
              Private Traveler Portal
            </span>
            <h1 className="font-serif text-4xl font-semibold tracking-tight">
              Your Tanzania Expedition Hub
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in with the Google account linked to your expedition welcome email to inspect live alerts from Arusha, your permit status, KPAP guide allocation, and PDF invoices.
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
        <footer className="mx-auto w-full max-w-5xl text-center font-mono text-[11px] text-muted-foreground">
          {siteSettings.brandName} Expeditions · Arusha &amp; Moshi · Tanzania
        </footer>
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
  const waDigits =
    siteSettings.whatsappNumber.replace(/[^0-9]/g, "") || "255792867427";

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      {/* Standalone Portal Topbar with Live Notification Bell */}
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/85 backdrop-blur-xl mb-8">
        <div className="mx-auto flex h-full max-w-[1160px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            {siteSettings.brandLogoUrl && (
              <img
                src={siteSettings.brandLogoUrl}
                alt={siteSettings.brandName}
                className="h-7 w-7 rounded-lg object-contain bg-white p-0.5 border border-border"
              />
            )}
            <span className="font-serif text-lg sm:text-xl font-semibold">
              {siteSettings.brandName}{" "}
              <span className="text-primary">· Client Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowNotifPanel((v) => !v)}
              className="relative cursor-pointer inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-xs hover:bg-secondary"
            >
              {unreadCount > 0 ? (
                <BellRing className="h-3.5 w-3.5 text-[#e5a853]" />
              ) : (
                <Bell className="h-3.5 w-3.5 text-primary" />
              )}
              <span className="hidden sm:inline">Notifications</span>
              {unreadCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#e5a853] px-1.5 text-[10px] font-bold text-[#08100c]">
                  {unreadCount}
                </span>
              )}
            </button>

            <TransitionLink
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-xs hover:bg-secondary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Public Site
            </TransitionLink>
          </div>
        </div>
      </header>

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

        {/* LIVE CLIENT NOTIFICATIONS & CONCIERGE FEED */}
        {showNotifPanel && (
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <BellRing className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-semibold">
                    Expedition Notifications &amp; Dispatch Updates
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Live permit alerts, crew briefings, and invoice updates from Arusha Operations.
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 font-mono text-[11px] font-medium hover:bg-secondary"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-primary" />
                  Mark All Read ({unreadCount})
                </button>
              )}
            </div>

            {myNotifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No notifications yet for {clientEmail}.
              </div>
            ) : (
              <div className="space-y-3">
                {myNotifications.map((notif) => {
                  const isRead = notif.readBy
                    .map((e) => e.toLowerCase())
                    .includes(clientEmail);
                  const badge =
                    CATEGORY_BADGE[notif.category] || CATEGORY_BADGE.update;
                  return (
                    <div
                      key={notif.id}
                      className={`rounded-2xl border p-4 transition ${
                        isRead
                          ? "border-border bg-background/60 opacity-85"
                          : "border-primary/45 bg-background shadow-sm"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {!isRead && (
                              <span className="h-2 w-2 rounded-full bg-[#e5a853]" />
                            )}
                            <span
                              className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${badge.style}`}
                            >
                              {badge.label}
                            </span>
                            <span className="font-mono text-[10.5px] text-muted-foreground">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                            {notif.targetEmail === "*" && (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                · Broadcast
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-xl font-semibold">
                            {notif.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {notif.message}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {notif.actionLabel && (
                            <button
                              type="button"
                              onClick={handleDownloadInvoice}
                              className="cursor-pointer rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-semibold text-primary-foreground"
                            >
                              {notif.actionLabel}
                            </button>
                          )}
                          {!isRead && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(notif.id)}
                              className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10.5px] hover:bg-secondary"
                            >
                              <Check className="h-3 w-3 text-primary" />
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
                href={`https://wa.me/${waDigits}?text=${encodeURIComponent(
                  `Jambo ${siteSettings.brandName}! Updating my trip ${clientRecord.invoiceNumber} (${clientRecord.name}).`
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
