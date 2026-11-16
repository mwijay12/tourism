"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getFirebaseServices,
  isAuthorizedAdminEmail,
  isFirebaseConfigured,
} from "@/lib/firebase/client";
import {
  SEED_EXPEDITIONS,
  SEED_INQUIRIES,
  SEED_LOCAL_MEDIA,
  type AdminExpeditionItem,
  type AdminInquiryItem,
  type AdminMediaAsset,
  type IntegrationHealth,
} from "@/lib/firebase/admin-types";
import {
  Check,
  CheckCircle2,
  CloudUpload,
  Compass,
  Copy,
  Database,
  Eye,
  EyeOff,
  FileCode2,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Mountain,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";

type AdminTab = "overview" | "expeditions" | "inquiries" | "media" | "setup";

const ENV_TEMPLATE = `# Firebase Web App & Google Sign-In
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:abcdef123456
NEXT_PUBLIC_ADMIN_EMAILS=you@gmail.com

# Cloudinary Media CDN
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# Nodemailer SMTP (Gmail App Password / Resend / Brevo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=concierge@yourdomain.com
SMTP_PASS=your_app_password
MAIL_FROM="Kibo & Plains Tanzania <concierge@yourdomain.com>"
ADMIN_NOTIFY_EMAIL=you@gmail.com`;

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        request.auth.token.email in ['you@gmail.com'];
    }
    // Visitors can read published packages & submit inquiries
    match /expeditions/{id} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }
    match /inquiries/{id} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
  }
}`;

export function AdminConsole() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sandboxMode, setSandboxMode] = useState(false);

  const [tab, setTab] = useState<AdminTab>("overview");
  const [health, setHealth] = useState<IntegrationHealth>({
    firebase: isFirebaseConfigured,
    googleAuth: isFirebaseConfigured,
    cloudinary: false,
    nodemailer: false,
  });

  const [expeditions, setExpeditions] =
    useState<AdminExpeditionItem[]>(SEED_EXPEDITIONS);
  const [inquiries, setInquiries] =
    useState<AdminInquiryItem[]>(SEED_INQUIRIES);
  const [mediaAssets, setMediaAssets] =
    useState<AdminMediaAsset[]>(SEED_LOCAL_MEDIA);

  const [syncingDb, setSyncingDb] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Expedition creator form state
  const [newTitle, setNewTitle] = useState("");
  const [newSwahili, setNewSwahili] = useState("");
  const [newDays, setNewDays] = useState(7);
  const [newPrice, setNewPrice] = useState(4200);
  const [newCategory, setNewCategory] =
    useState<AdminExpeditionItem["category"]>("Northern Circuit");
  const [newImage, setNewImage] = useState("/images/serengeti-lions.jpg");
  const [newSummary, setNewSummary] = useState("");

  // Cloudinary uploader state
  const [uploadFolder, setUploadFolder] = useState("kibo-plains/expeditions");
  const [uploading, setUploading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Nodemailer email composer state
  const [mailTo, setMailTo] = useState("");
  const [mailGuestName, setMailGuestName] = useState("");
  const [mailSubject, setMailSubject] = useState(
    "Your Kibo & Plains Custom Tanzania Dossier"
  );
  const [mailHeadline, setMailHeadline] = useState(
    "Your Private Tanzania Itinerary & Quote"
  );
  const [mailMessage, setMailMessage] = useState(
    "Asante sana for reaching out to our Arusha expedition desk.\n\nWe have reserved provisional lodge & KPAP crew slots for your target travel window. Reply to this email or message us on WhatsApp (+255 792 867 427) whenever you are ready to finalize permits."
  );
  const [sendingMail, setSendingMail] = useState(false);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4200);
  }, []);

  // Poll safe backend integration status (/api/admin/health)
  const refreshHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/health");
      if (res.ok) {
        const data = (await res.json()) as IntegrationHealth;
        setHealth(data);
      }
    } catch {
      // ignore offline
    }
  }, []);

  const loadCloudinaryMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/cloudinary/upload");
      if (!res.ok) return;
      const json = await res.json();
      if (json.configured && Array.isArray(json.assets)) {
        setMediaAssets([...json.assets, ...SEED_LOCAL_MEDIA]);
      }
    } catch {
      // keep local assets
    }
  }, []);

  const loadFirestoreCollections = useCallback(async () => {
    const fb = getFirebaseServices();
    if (!fb) return;
    setSyncingDb(true);
    try {
      const expSnap = await getDocs(collection(fb.db, "expeditions"));
      if (!expSnap.empty) {
        const list = expSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as AdminExpeditionItem
        );
        setExpeditions(list);
      }

      const inqQuery = query(
        collection(fb.db, "inquiries"),
        orderBy("createdAt", "desc")
      );
      const inqSnap = await getDocs(inqQuery);
      if (!inqSnap.empty) {
        const list = inqSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as AdminInquiryItem
        );
        setInquiries(list);
      }
    } catch {
      // Rules or empty collections; fallback seamlessly to seed
    } finally {
      setSyncingDb(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    loadCloudinaryMedia();

    const fb = getFirebaseServices();
    if (!fb) {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(fb.auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser && isAuthorizedAdminEmail(currentUser.email)) {
        loadFirestoreCollections();
      }
    });

    return () => unsub();
  }, [loadCloudinaryMedia, loadFirestoreCollections, refreshHealth]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const fb = getFirebaseServices();
    if (!fb) {
      setAuthError(
        "Firebase env keys are not added yet. Use Preview Admin Workspace below or paste NEXT_PUBLIC_FIREBASE_* keys."
      );
      return;
    }
    try {
      const cred = await signInWithPopup(fb.auth, fb.googleProvider);
      if (!isAuthorizedAdminEmail(cred.user.email)) {
        await signOut(fb.auth);
        setAuthError(
          `Signed in as ${cred.user.email}, which is not listed in NEXT_PUBLIC_ADMIN_EMAILS.`
        );
      } else {
        setSandboxMode(false);
        notify(`Karibu ${cred.user.displayName || cred.user.email}`);
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Google sign-in popup closed or failed."
      );
    }
  };

  const handleLogout = async () => {
    const fb = getFirebaseServices();
    if (fb) await signOut(fb.auth);
    setSandboxMode(false);
    setUser(null);
  };

  const handleSeedToFirestore = async () => {
    const fb = getFirebaseServices();
    if (!fb || !user) {
      notify("Connect Firebase & sign in with Google to push seed data live.");
      return;
    }
    setSyncingDb(true);
    try {
      for (const item of expeditions) {
        await setDoc(doc(fb.db, "expeditions", item.id), item);
      }
      notify("Expeditions synced to Cloud Firestore!");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Firestore write failed.");
    } finally {
      setSyncingDb(false);
    }
  };

  const handleAddExpedition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const item: AdminExpeditionItem = {
      id: id || `exp-${Date.now()}`,
      title: newTitle.trim(),
      swahiliTag: newSwahili.trim() || "Tanzania Bespoke",
      durationDays: Number(newDays) || 7,
      priceFromUsd: Number(newPrice) || 4000,
      category: newCategory,
      published: true,
      featuredImage: newImage || "/images/serengeti-lions.jpg",
      summary: newSummary.trim() || "Private 4x4 guided expedition",
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setExpeditions((prev) => [item, ...prev]);
    const fb = getFirebaseServices();
    if (fb && user) {
      await setDoc(doc(fb.db, "expeditions", item.id), item).catch(
        () => undefined
      );
    }
    setNewTitle("");
    setNewSwahili("");
    setNewSummary("");
    notify(`Added "${item.title}"`);
  };

  const handleTogglePublished = async (item: AdminExpeditionItem) => {
    const next = !item.published;
    setExpeditions((prev) =>
      prev.map((x) => (x.id === item.id ? { ...x, published: next } : x))
    );
    const fb = getFirebaseServices();
    if (fb && user) {
      await updateDoc(doc(fb.db, "expeditions", item.id), {
        published: next,
      }).catch(() => undefined);
    }
  };

  const handleDeleteExpedition = async (id: string) => {
    setExpeditions((prev) => prev.filter((x) => x.id !== id));
    const fb = getFirebaseServices();
    if (fb && user) {
      await deleteDoc(doc(fb.db, "expeditions", id)).catch(() => undefined);
    }
    notify("Removed expedition package.");
  };

  const handleInquiryStatus = async (
    inq: AdminInquiryItem,
    status: AdminInquiryItem["status"]
  ) => {
    setInquiries((prev) =>
      prev.map((x) => (x.id === inq.id ? { ...x, status } : x))
    );
    const fb = getFirebaseServices();
    if (fb && user) {
      await updateDoc(doc(fb.db, "inquiries", inq.id), { status }).catch(
        () => undefined
      );
    }
    notify(`Marked ${inq.guestName} as ${status.toUpperCase()}`);
  };

  const handleCloudinaryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", uploadFolder);
      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        notify(json.error || "Cloudinary upload unavailable yet.");
      } else {
        setMediaAssets((prev) => [json.asset, ...prev]);
        setNewImage(json.asset.url);
        notify("Uploaded to Cloudinary & copied to image selector!");
      }
    } catch {
      notify("Upload failed. Check Cloudinary configuration.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMail(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: mailTo,
          guestName: mailGuestName,
          subject: mailSubject,
          headline: mailHeadline,
          message: mailMessage,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        notify(json.error || "Nodemailer SMTP not configured yet.");
      } else {
        notify(`Email dispatched to ${mailTo}!`);
      }
    } catch {
      notify("Network error calling /api/admin/send-email.");
    } finally {
      setSendingMail(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const stats = useMemo(
    () => ({
      publishedCount: expeditions.filter((e) => e.published).length,
      newInquiries: inquiries.filter((i) => i.status === "new").length,
      cloudinaryCount: mediaAssets.filter((m) => m.source === "cloudinary").length,
      totalMedia: mediaAssets.length,
    }),
    [expeditions, inquiries, mediaAssets]
  );

  const isAuthenticated = Boolean(user && isAuthorizedAdminEmail(user.email));
  const unlocked = isAuthenticated || sandboxMode;

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background pt-24 text-foreground">
        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Initializing Kibo &amp; Plains Firebase Console...
        </div>
      </div>
    );
  }

  // Gate View (Google Sign-In + Setup Checklist + Interactive Sandbox Preview)
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-24 text-foreground">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary">
                  <Mountain className="h-3.5 w-3.5" />
                  Kibo &amp; Plains Mission Control
                </span>
                <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-semibold tracking-tight">
                  Expedition Admin Portal
                </h1>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Manage Mount Kilimanjaro packages, Serengeti &amp; Zanzibar photography via Cloudinary, Firestore inquiries, and Nodemailer client dispatches behind Firebase Google Sign-In.
                </p>
              </div>
            </div>

            {/* Live Integration Readiness Status */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Firebase Auth", ok: health.firebase, sub: "Google OAuth" },
                { label: "Cloud Firestore", ok: health.firebase, sub: "Routes & Leads" },
                { label: "Cloudinary CDN", ok: health.cloudinary, sub: "Image Studio" },
                { label: "Nodemailer SMTP", ok: health.nodemailer, sub: "Email Dispatch" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-background/80 p-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-medium">
                      {s.label}
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        s.ok ? "bg-emerald-500" : "bg-[#e5a853]"
                      }`}
                    />
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {s.ok ? "Connected" : `Awaiting env keys · ${s.sub}`}
                  </div>
                </div>
              ))}
            </div>

            {authError && (
              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-foreground">
                <ShieldAlert className="h-4 w-4 text-[#e5a853] shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="cursor-pointer inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-foreground px-6 py-4 text-sm font-semibold text-background shadow transition hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
                  />
                </svg>
                Sign in with Google (Firebase)
              </button>

              <button
                type="button"
                onClick={() => setSandboxMode(true)}
                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                <Compass className="h-4 w-4 text-primary" />
                Preview Admin Workspace
              </button>
            </div>

            <p className="mt-4 font-mono text-[11px] text-muted-foreground">
              Tip: Paste your keys from <code>.env.example</code> into Vercel Environment Variables or <code>.env.local</code>, enable Google Sign-In in Firebase Console, and click &ldquo;Sign in with Google&rdquo;.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-24 text-foreground">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
        {/* Top Toast */}
        {toast && (
          <div className="fixed top-20 right-4 z-[140] flex items-center gap-2 rounded-full border border-primary/40 bg-[#08100c] px-4 py-2.5 text-xs font-medium text-white shadow-2xl">
            <CheckCircle2 className="h-4 w-4 text-[#e5a853]" />
            {toast}
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/15 px-3 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                {isAuthenticated ? "Live Firebase Session" : "Admin Sandbox Preview"}
              </span>
              {user?.email && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              )}
            </div>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
              Kibo &amp; Plains Operations Console
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={loadFirestoreCollections}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-secondary"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncingDb ? "animate-spin" : ""}`}
                />
                Sync Firestore
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Connect Google Auth
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isAuthenticated ? "Sign Out" : "Exit Sandbox"}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "expeditions", label: "Expeditions", icon: Mountain },
            { id: "inquiries", label: "Inquiries & Mail", icon: Inbox },
            { id: "media", label: "Cloudinary Media", icon: ImageIcon },
            { id: "setup", label: "Firebase & Env Setup", icon: FileCode2 },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as AdminTab)}
                className={`shrink-0 cursor-pointer inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {tab === "overview" && (
          <div className="mt-8 space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-border bg-card p-5">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Published Expeditions
                </div>
                <div className="mt-2 font-serif text-4xl font-semibold">
                  {stats.publishedCount}
                </div>
                <div className="mt-1 text-xs text-primary">
                  Synced with Kilimanjaro &amp; Circuits
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  New Safari Leads
                </div>
                <div className="mt-2 font-serif text-4xl font-semibold">
                  {stats.newInquiries}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {inquiries.length} total dossiers logged
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Media Studio Assets
                </div>
                <div className="mt-2 font-serif text-4xl font-semibold">
                  {stats.totalMedia}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {stats.cloudinaryCount} Cloudinary CDN · {mediaAssets.length - stats.cloudinaryCount} local
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-5">
                <div className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  PWA Offline Readiness
                </div>
                <div className="mt-2 font-serif text-4xl font-semibold text-primary">
                  Active
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Smartphone className="h-3.5 w-3.5" />
                  Manifest &amp; Service Worker live
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <h2 className="font-serif text-2xl font-semibold">
                  Stack Integration Readiness
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      name: "Firebase Auth (Google Sign-In)",
                      ok: health.googleAuth,
                      hint: "Authorize your Google accounts via NEXT_PUBLIC_FIREBASE_* & NEXT_PUBLIC_ADMIN_EMAILS.",
                    },
                    {
                      name: "Cloud Firestore Database",
                      ok: health.firebase,
                      hint: "Stores /expeditions packages and /inquiries traveler leads.",
                    },
                    {
                      name: "Cloudinary Media CDN",
                      ok: health.cloudinary,
                      hint: "Server-signed & stream uploads under kibo-plains/* with auto WebP/AVIF.",
                    },
                    {
                      name: "Nodemailer SMTP Dispatcher",
                      ok: health.nodemailer,
                      hint: "Sends automatic inquiry confirmations & custom admin Safari quotes.",
                    },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold">{row.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {row.hint}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                          row.ok
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-[#b86f2d] dark:text-[#e5a853]"
                        }`}
                      >
                        {row.ok ? "READY" : "SETUP NEEDED"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-semibold">
                    Quick Operations
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Seed starter Tanzania expeditions straight into your Firestore database once connected, or jump directly to Cloudinary uploads &amp; email quotes.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleSeedToFirestore}
                    className="cursor-pointer flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Database className="h-4 w-4" />
                    Push Seed to Firestore
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("media")}
                    className="cursor-pointer flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3.5 text-xs font-semibold"
                  >
                    <CloudUpload className="h-4 w-4 text-primary" />
                    Upload Photo to Cloudinary
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("inquiries")}
                    className="cursor-pointer flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3.5 text-xs font-semibold"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    Send Nodemailer Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("setup")}
                    className="cursor-pointer flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3.5 text-xs font-semibold"
                  >
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Copy .env &amp; Firestore Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPEDITIONS MANAGER */}
        {tab === "expeditions" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <form
              onSubmit={handleAddExpedition}
              className="rounded-3xl border border-border bg-card p-6 space-y-4"
            >
              <h2 className="font-serif text-2xl font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Expedition Package
              </h2>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Package Title
                </label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="7-Day Serengeti Calving Fly-In"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Swahili / Subtitle
                  </label>
                  <input
                    value={newSwahili}
                    onChange={(e) => setNewSwahili(e.target.value)}
                    placeholder="Ndutu & Crater Rim"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Circuit Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(
                        e.target.value as AdminExpeditionItem["category"]
                      )
                    }
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  >
                    <option value="Kilimanjaro">Kilimanjaro</option>
                    <option value="Northern Circuit">Northern Circuit</option>
                    <option value="Southern & Western">Southern &amp; Western</option>
                    <option value="Coast">Coast</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Price From (USD pp)
                  </label>
                  <input
                    type="number"
                    min={500}
                    step={50}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Cover Image URL (Cloudinary or local)
                </label>
                <input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Highlights Summary
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Private Land Cruiser · KPAP guides · Serengeti flights"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
              >
                Save Package
              </button>
            </form>

            <div className="space-y-4">
              {expeditions.map((exp) => (
                <div
                  key={exp.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={exp.featuredImage}
                      alt={exp.title}
                      className="h-16 w-24 shrink-0 rounded-2xl object-cover border border-border"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                          {exp.category} · {exp.durationDays}D
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          From ${exp.priceFromUsd.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold leading-tight">
                        {exp.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {exp.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(exp)}
                      title={exp.published ? "Hide package" : "Publish package"}
                      className="cursor-pointer rounded-full border border-border bg-background p-2 text-xs hover:bg-secondary"
                    >
                      {exp.published ? (
                        <Eye className="h-4 w-4 text-primary" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpedition(exp.id)}
                      title="Delete package"
                      className="cursor-pointer rounded-full border border-border bg-background p-2 text-xs text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INQUIRIES & NODEMAILER DISPATCH */}
        {tab === "inquiries" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold">
                Traveler Inquiries ({inquiries.length})
              </h2>
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-3xl border border-border bg-card p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-serif text-xl font-semibold">
                        {inq.guestName}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {inq.guestEmail} · {inq.travelers} guests · {inq.month} 2027
                      </div>
                    </div>
                    <select
                      value={inq.status}
                      onChange={(e) =>
                        handleInquiryStatus(
                          inq,
                          e.target.value as AdminInquiryItem["status"]
                        )
                      }
                      className="rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px]"
                    >
                      <option value="new">NEW</option>
                      <option value="quoted">QUOTED</option>
                      <option value="confirmed">CONFIRMED</option>
                      <option value="archived">ARCHIVED</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-foreground uppercase">
                      {inq.focus}
                    </span>
                    <span>{inq.totalDays} days</span>
                    <span>· Est. ${inq.estimatePerPerson.toLocaleString()} pp</span>
                    <span>· {inq.tier}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMailTo(inq.guestEmail);
                        setMailGuestName(inq.guestName);
                        setMailSubject(
                          `Kibo & Plains Safari Dossier — ${inq.totalDays} Days (${inq.month} 2027)`
                        );
                      }}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Compose Quote Email
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Nodemailer Dispatch Form */}
            <form
              onSubmit={handleSendMail}
              className="rounded-3xl border border-border bg-card p-6 space-y-4 lg:sticky lg:top-28"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold">
                  Nodemailer Quote Composer
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                    health.nodemailer
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-[#b86f2d] dark:text-[#e5a853]"
                  }`}
                >
                  {health.nodemailer ? "SMTP LIVE" : "SMTP UNCONFIGURED"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Guest Email
                  </label>
                  <input
                    required
                    type="email"
                    value={mailTo}
                    onChange={(e) => setMailTo(e.target.value)}
                    placeholder="amina@example.com"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Guest Name
                  </label>
                  <input
                    value={mailGuestName}
                    onChange={(e) => setMailGuestName(e.target.value)}
                    placeholder="Amina Msuya"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Email Subject
                </label>
                <input
                  required
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Email Banner Headline
                </label>
                <input
                  value={mailHeadline}
                  onChange={(e) => setMailHeadline(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Message Body
                </label>
                <textarea
                  required
                  rows={5}
                  value={mailMessage}
                  onChange={(e) => setMailMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={sendingMail}
                className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {sendingMail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Branded HTML Email
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: CLOUDINARY MEDIA STUDIO */}
        {tab === "media" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-semibold">
                    Cloudinary Media Studio
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                      health.cloudinary
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-[#b86f2d] dark:text-[#e5a853]"
                    }`}
                  >
                    {health.cloudinary ? "CLOUDINARY LIVE" : "LOCAL PREVIEW"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Uploads directly via <code>/api/cloudinary/upload</code> with automatic WebP/AVIF &amp; quality optimization.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="rounded-full border border-border bg-background px-4 py-2 font-mono text-xs"
                >
                  <option value="kibo-plains/expeditions">kibo-plains/expeditions</option>
                  <option value="kibo-plains/parks">kibo-plains/parks</option>
                  <option value="kibo-plains/kilimanjaro">kibo-plains/kilimanjaro</option>
                  <option value="kibo-plains/fleet">kibo-plains/fleet</option>
                </select>

                <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CloudUpload className="h-4 w-4" />
                  )}
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCloudinaryUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mediaAssets.map((asset) => (
                <div
                  key={asset.publicId}
                  className="overflow-hidden rounded-3xl border border-border bg-card p-3 space-y-2.5"
                >
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-border bg-muted">
                    <img
                      src={asset.url}
                      alt={asset.label}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 rounded-full bg-black/65 px-2.5 py-0.5 font-mono text-[9.5px] text-white uppercase">
                      {asset.source}
                    </span>
                  </div>

                  <div className="px-1">
                    <div className="truncate text-sm font-medium">{asset.label}</div>
                    <div className="truncate font-mono text-[10px] text-muted-foreground">
                      {asset.folder}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(asset.publicId, asset.url)}
                      className="cursor-pointer flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-border bg-background py-1.5 font-mono text-[10.5px] hover:bg-secondary"
                    >
                      {copiedKey === asset.publicId ? (
                        <>
                          <Check className="h-3 w-3 text-primary" />
                          Copied URL
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy URL
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewImage(asset.url);
                        setTab("expeditions");
                        notify(`Attached "${asset.label}" to new expedition form.`);
                      }}
                      className="cursor-pointer rounded-full bg-primary/15 px-3 py-1.5 font-mono text-[10.5px] font-semibold text-primary hover:bg-primary/25"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETUP & ENV KEYS CHECKLIST */}
        {tab === "setup" && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold">
                  1. Paste Keys in .env.local / Vercel
                </h2>
                <button
                  type="button"
                  onClick={() => handleCopy("env", ENV_TEMPLATE)}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px]"
                >
                  {copiedKey === "env" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Template
                </button>
              </div>
              <pre className="overflow-x-auto rounded-2xl border border-border bg-[#08100c] p-4 font-mono text-[11px] leading-relaxed text-[#d7eee1]">
                {ENV_TEMPLATE}
              </pre>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold">
                  2. Firebase Console Checklist &amp; Rules
                </h2>
                <button
                  type="button"
                  onClick={() => handleCopy("rules", FIRESTORE_RULES)}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px]"
                >
                  {copiedKey === "rules" ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Rules
                </button>
              </div>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-muted-foreground">
                <li>
                  In <strong>Firebase Console → Authentication → Sign-in method</strong>, enable <strong>Google</strong> and add your Vercel domain (<code>kibo-plains-tanzania.vercel.app</code>) to <em>Authorized domains</em>.
                </li>
                <li>
                  In <strong>Firestore Database</strong>, paste the security rules below and replace <code>you@gmail.com</code> with your admin Google email(s).
                </li>
                <li>
                  Paste <code>CLOUDINARY_*</code> and <code>SMTP_*</code> variables into Vercel Project Settings → Environment Variables, then redeploy.
                </li>
              </ol>
              <pre className="overflow-x-auto rounded-2xl border border-border bg-[#08100c] p-4 font-mono text-[11px] leading-relaxed text-[#d7eee1]">
                {FIRESTORE_RULES}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
