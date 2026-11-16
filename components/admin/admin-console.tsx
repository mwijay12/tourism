"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
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
  DEFAULT_INVOICE_ITEMS,
  SEED_CLIENTS,
  SEED_EXPEDITIONS,
  SEED_INQUIRIES,
  SEED_LOCAL_MEDIA,
  type AdminClientRecord,
  type AdminExpeditionItem,
  type AdminInquiryItem,
  type AdminMediaAsset,
  type IntegrationHealth,
  type InvoiceDraft,
  type InvoiceLineItem,
} from "@/lib/firebase/admin-types";
import { formatMoney, generateInvoicePdf } from "@/lib/pdf/generate-invoice-pdf";
import { TransitionLink } from "@/components/creative/transition-provider";
import {
  ArrowUpRight,
  Briefcase,
  Check,
  CheckCircle2,
  CloudUpload,
  Command,
  Compass,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  FileText,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Mountain,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

gsap.registerPlugin(DrawSVGPlugin);

type AdminTab =
  | "overview"
  | "clients"
  | "invoices"
  | "expeditions"
  | "inquiries"
  | "media"
  | "setup";

const ENV_TEMPLATE = `# Admin Passcode Gate (override default build passcode)
ADMIN_ACCESS_PASSWORD=your_strong_admin_password

# Firebase Web App, Google Sign-In & Firestore
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
    match /expeditions/{id} {
      allow read: if resource.data.published == true || isAdmin();
      allow write: if isAdmin();
    }
    match /inquiries/{id} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    match /clients/{id} {
      allow read: if isAdmin() || (request.auth != null && resource.data.email == request.auth.token.email);
      allow update: if isAdmin() || (request.auth != null && resource.data.email == request.auth.token.email);
      allow create, delete: if isAdmin();
    }
  }
}`;

const HEATMAP_MATRIX = [
  [2, 3, 5, 4, 6, 7, 4, 8, 5, 6],
  [4, 2, 6, 7, 5, 8, 6, 9, 7, 5],
  [3, 5, 4, 6, 8, 7, 9, 6, 8, 9],
  [5, 6, 7, 5, 9, 8, 7, 8, 6, 7],
  [2, 4, 5, 8, 7, 6, 5, 9, 8, 6],
  [6, 7, 8, 9, 6, 7, 8, 7, 9, 8],
  [4, 5, 6, 4, 5, 6, 7, 5, 7, 9],
];

const NAV_ITEMS: {
  id: AdminTab;
  label: string;
  group: "WORKSPACE" | "OPERATIONS" | "STUDIO";
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview", group: "WORKSPACE", icon: LayoutDashboard },
  { id: "clients", label: "Clients & Portal", group: "WORKSPACE", icon: Users },
  { id: "invoices", label: "Invoices & PDF", group: "OPERATIONS", icon: Receipt },
  { id: "inquiries", label: "Inquiries & Mail", group: "OPERATIONS", icon: Inbox },
  { id: "expeditions", label: "Expeditions", group: "OPERATIONS", icon: Mountain },
  { id: "media", label: "Cloudinary Media", group: "STUDIO", icon: ImageIcon },
  { id: "setup", label: "Keys & Rules", group: "STUDIO", icon: FileCode2 },
];

export function AdminConsole() {
  const dashShellRef = useRef<HTMLDivElement | null>(null);
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);
  const splinePathRef = useRef<SVGPathElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeChecking, setPasscodeChecking] = useState(false);
  const [passcodeUnlocked, setPasscodeUnlocked] = useState(false);
  const [authRoleTab, setAuthRoleTab] = useState<"admin" | "client">("admin");

  const [tab, setTab] = useState<AdminTab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  const [health, setHealth] = useState<IntegrationHealth>({
    firebase: isFirebaseConfigured,
    googleAuth: isFirebaseConfigured,
    cloudinary: false,
    nodemailer: false,
    passcodeConfigured: false,
    previewPasscodeHint: "kibo2026",
  });

  const [expeditions, setExpeditions] =
    useState<AdminExpeditionItem[]>(SEED_EXPEDITIONS);
  const [inquiries, setInquiries] =
    useState<AdminInquiryItem[]>(SEED_INQUIRIES);
  const [clients, setClients] = useState<AdminClientRecord[]>(SEED_CLIENTS);
  const [mediaAssets, setMediaAssets] =
    useState<AdminMediaAsset[]>(SEED_LOCAL_MEDIA);

  const [syncingDb, setSyncingDb] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Client Add State
  const [cliName, setCliName] = useState("");
  const [cliEmail, setCliEmail] = useState("");
  const [cliOrg, setCliOrg] = useState("");
  const [cliTrip, setCliTrip] = useState("10-Day Serengeti & Kilimanjaro Private");
  const [cliDates, setCliDates] = useState("12 – 22 Aug 2027");
  const [cliGuide, setCliGuide] = useState("Juma Kessy (KPAP Lead)");
  const [cliLogoUrl, setCliLogoUrl] = useState("");
  const [cliTotalUsd, setCliTotalUsd] = useState(11800);

  // Invoice Builder State
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceDraft>({
    invoiceNumber: "KP-INV-2027-014",
    issueDate: "2026-11-15",
    dueDate: "2026-12-01",
    currency: "USD",
    tzsRate: 2680,
    taxPct: 5,
    depositPct: 30,
    clientName: SEED_CLIENTS[0].name,
    clientEmail: SEED_CLIENTS[0].email,
    clientOrg: SEED_CLIENTS[0].organization,
    clientLogoUrl: "",
    tripTitle: SEED_CLIENTS[0].tripTitle,
    notes:
      "Vodacom M-Pesa Lipa Namba & USD SWIFT Wire instructions included upon booking lock. TANAPA conservation fees and KPAP porter welfare funds are protected in full.",
    items: DEFAULT_INVOICE_ITEMS,
  });
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Expedition creator state
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

  // Nodemailer composer state
  const [mailTo, setMailTo] = useState(SEED_CLIENTS[0].email);
  const [mailGuestName, setMailGuestName] = useState(SEED_CLIENTS[0].name);
  const [mailTemplate, setMailTemplate] = useState<"welcome" | "invoice" | "quote">(
    "welcome"
  );
  const [mailSubject, setMailSubject] = useState(
    "Karibu Tanzania — Your Kibo & Plains Private Welcome Pack"
  );
  const [mailHeadline, setMailHeadline] = useState(
    "Your Tanzania Expedition Workspace is Ready"
  );
  const [mailMessage, setMailMessage] = useState(
    "Jambo and warm greetings from Arusha & Moshi.\n\nYour private Kibo & Plains client workspace is now unlocked. Sign in with Google on our Client Portal to review your assigned KPAP summit team, custom 4x4 Land Cruiser unit, pre-departure checklist, and downloadable PDF invoice."
  );
  const [sendingMail, setSendingMail] = useState(false);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4200);
  }, []);

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
      // fallback
    }
  }, []);

  const loadFirestoreCollections = useCallback(async () => {
    const fb = getFirebaseServices();
    if (!fb) return;
    setSyncingDb(true);
    try {
      const expSnap = await getDocs(collection(fb.db, "expeditions"));
      if (!expSnap.empty) {
        setExpeditions(
          expSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as AdminExpeditionItem
          )
        );
      }

      const cliSnap = await getDocs(collection(fb.db, "clients"));
      if (!cliSnap.empty) {
        setClients(
          cliSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as AdminClientRecord
          )
        );
      }

      const inqSnap = await getDocs(
        query(collection(fb.db, "inquiries"), orderBy("createdAt", "desc"))
      );
      if (!inqSnap.empty) {
        setInquiries(
          inqSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as AdminInquiryItem
          )
        );
      }
    } catch {
      // rules or fresh empty collections
    } finally {
      setSyncingDb(false);
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    loadCloudinaryMedia();

    try {
      if (window.sessionStorage.getItem("kp_admin_pass_ok") === "1") {
        setPasscodeUnlocked(true);
      }
    } catch {
      // ignore
    }

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

  const isGoogleAdmin = Boolean(user && isAuthorizedAdminEmail(user.email));
  const unlocked = isGoogleAdmin || passcodeUnlocked;

  // Timbre-style ambient cursor glow & ⌘K Command Palette hotkey
  useEffect(() => {
    if (!unlocked) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glow = cursorGlowRef.current;

    if (!fine || reduced || !glow) {
      return () => window.removeEventListener("keydown", onKeyDown);
    }

    const qx = gsap.quickTo(glow, "x", { duration: 0.42, ease: "power3.out" });
    const qy = gsap.quickTo(glow, "y", { duration: 0.42, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      qx(e.clientX);
      qy(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointermove", onMove);
    };
  }, [unlocked]);

  // Timbre-style GSAP reveal + bar scale + SVG spline draw + ring animations on tab change
  useEffect(() => {
    if (!unlocked) return;
    const root = dashShellRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-dash-reveal]",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.56,
          stagger: 0.055,
          ease: "power3.out",
          clearProps: "transform",
        }
      );

      gsap.fromTo(
        "[data-dash-bar]",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          duration: 0.72,
          stagger: 0.05,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        "[data-dash-heat]",
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.006,
          ease: "back.out(1.6)",
        }
      );

      gsap.utils.toArray<SVGPathElement>("[data-dash-ring]").forEach((ring, idx) => {
        const target = ring.getAttribute("data-pct") || "85";
        gsap.fromTo(
          ring,
          { drawSVG: "0% 0%" },
          {
            drawSVG: `0% ${target}%`,
            duration: 1.05,
            delay: 0.1 + idx * 0.12,
            ease: "power3.out",
          }
        );
      });

      if (splinePathRef.current) {
        gsap.fromTo(
          splinePathRef.current,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 1.1, ease: "power2.out" }
        );
      }
    }, root);

    return () => ctx.revert();
  }, [tab, unlocked]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setPasscodeChecking(true);
    try {
      const res = await fetch("/api/admin/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setAuthError(json.error || "Incorrect admin passcode.");
      } else {
        setPasscodeUnlocked(true);
        try {
          window.sessionStorage.setItem("kp_admin_pass_ok", "1");
        } catch {
          // ignore
        }
        notify("Welcome to Kibo & Plains Mission Control!");
      }
    } catch {
      setAuthError("Unable to verify passcode right now.");
    } finally {
      setPasscodeChecking(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const fb = getFirebaseServices();
    if (!fb) {
      setAuthError(
        "Firebase keys are not set yet — use the Admin Passcode right below or paste NEXT_PUBLIC_FIREBASE_* into Vercel."
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
        notify(`Karibu ${cred.user.displayName || cred.user.email}`);
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Google sign-in popup closed."
      );
    }
  };

  const handleLogout = async () => {
    const fb = getFirebaseServices();
    if (fb) await signOut(fb.auth);
    setPasscodeUnlocked(false);
    try {
      window.sessionStorage.removeItem("kp_admin_pass_ok");
    } catch {
      // ignore
    }
    setUser(null);
  };

  const handleSeedToFirestore = async () => {
    const fb = getFirebaseServices();
    if (!fb || !user) {
      notify("Connect Firebase & sign in with Google to push live data to Firestore.");
      return;
    }
    setSyncingDb(true);
    try {
      for (const item of expeditions) {
        await setDoc(doc(fb.db, "expeditions", item.id), item);
      }
      for (const cli of clients) {
        await setDoc(doc(fb.db, "clients", cli.id), cli);
      }
      notify("Expeditions & Client Workspaces synced to Firestore!");
    } catch (err) {
      notify(err instanceof Error ? err.message : "Firestore write failed.");
    } finally {
      setSyncingDb(false);
    }
  };

  // Client Management Actions
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliName.trim() || !cliEmail.trim()) return;
    const id = `cli-${cliName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const invNo = `KP-INV-2027-${String(clients.length + 15).padStart(3, "0")}`;
    const record: AdminClientRecord = {
      id,
      name: cliName.trim(),
      email: cliEmail.trim(),
      organization: cliOrg.trim() || "Private Expedition Group",
      logoUrl: cliLogoUrl.trim(),
      tripTitle: cliTrip.trim(),
      tripStatus: "Planning",
      travelDates: cliDates.trim(),
      travelers: 2,
      leadGuide: cliGuide.trim(),
      vehicleUnit: "Cruiser TZ-06 · Arusha Fleet",
      totalUsd: Number(cliTotalUsd) || 9500,
      paidUsd: 0,
      welcomeSent: false,
      invoiceNumber: invNo,
      notes: "Created from Admin Operations Console.",
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setClients((prev) => [record, ...prev]);
    const fb = getFirebaseServices();
    if (fb && user) {
      await setDoc(doc(fb.db, "clients", record.id), record).catch(
        () => undefined
      );
    }
    setCliName("");
    setCliEmail("");
    setCliOrg("");
    setCliLogoUrl("");
    notify(`Created client workspace for ${record.name}`);
  };

  const handleClientStatusChange = async (
    cli: AdminClientRecord,
    tripStatus: AdminClientRecord["tripStatus"]
  ) => {
    setClients((prev) =>
      prev.map((c) => (c.id === cli.id ? { ...c, tripStatus } : c))
    );
    const fb = getFirebaseServices();
    if (fb && user) {
      await updateDoc(doc(fb.db, "clients", cli.id), { tripStatus }).catch(
        () => undefined
      );
    }
    notify(`${cli.name} → ${tripStatus}`);
  };

  const handleSendWelcomePack = async (cli: AdminClientRecord) => {
    setSendingMail(true);
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: cli.email,
          guestName: cli.name,
          templateType: "welcome",
          subject: `Karibu Tanzania — Welcome to Your ${cli.tripTitle}`,
          headline: "Your Private Tanzania Expedition Awaits",
          message: `We are thrilled to welcome you (${cli.organization}) to Kibo & Plains Expeditions.\n\nYour dedicated crew, private Land Cruiser (${cli.vehicleUnit}), and expedition timeline are now live inside your Google-linked Client Portal.`,
          summaryRows: [
            { label: "Expedition", value: cli.tripTitle },
            { label: "Dates", value: cli.travelDates },
            { label: "Lead Guide", value: cli.leadGuide },
            { label: "Vehicle Unit", value: cli.vehicleUnit },
            { label: "Invoice Ref", value: cli.invoiceNumber },
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        notify(
          json.error ||
            "SMTP credentials needed in .env to email live (preview template ready in Mail tab)."
        );
      } else {
        setClients((prev) =>
          prev.map((c) => (c.id === cli.id ? { ...c, welcomeSent: true } : c))
        );
        notify(`VIP Welcome Pack emailed to ${cli.email}!`);
      }
    } catch {
      notify("Error dispatching welcome email.");
    } finally {
      setSendingMail(false);
    }
  };

  const loadClientIntoInvoice = (cli: AdminClientRecord) => {
    setInvoiceDraft((prev) => ({
      ...prev,
      invoiceNumber: cli.invoiceNumber,
      clientName: cli.name,
      clientEmail: cli.email,
      clientOrg: cli.organization,
      clientLogoUrl: cli.logoUrl || prev.clientLogoUrl,
      tripTitle: cli.tripTitle,
    }));
    setTab("invoices");
    notify(`Loaded ${cli.name} into PDF Invoice Studio`);
  };

  const handleClientLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "invoice" | "clientForm"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      if (target === "invoice") {
        setInvoiceDraft((p) => ({ ...p, clientLogoUrl: result }));
        notify("Client logo attached to PDF Invoice!");
      } else {
        setCliLogoUrl(result);
        notify("Client logo attached!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Invoice Computations
  const invoiceTotals = useMemo(() => {
    const subtotal = invoiceDraft.items.reduce(
      (sum, item) => sum + item.qty * item.unitPriceUsd,
      0
    );
    const tax = (subtotal * (invoiceDraft.taxPct || 0)) / 100;
    const total = subtotal + tax;
    const deposit = (total * (invoiceDraft.depositPct || 30)) / 100;
    const balance = total - deposit;
    return { subtotal, tax, total, deposit, balance };
  }, [invoiceDraft]);

  const handleUpdateInvoiceItem = (
    id: string,
    patch: Partial<InvoiceLineItem>
  ) => {
    setInvoiceDraft((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  };

  const handleAddInvoiceItem = () => {
    setInvoiceDraft((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `li-${Date.now()}`,
          category: "Custom Service",
          description: "Private Zanzibar Sunset Dhow / Extra Safari Day",
          qty: 1,
          unitPriceUsd: 650,
        },
      ],
    }));
  };

  const handleRemoveInvoiceItem = (id: string) => {
    setInvoiceDraft((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      await generateInvoicePdf(invoiceDraft);
      notify(`Downloaded ${invoiceDraft.invoiceNumber}.pdf`);
    } catch {
      notify("Could not generate PDF — verify logo image format.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!invoiceDraft.clientEmail) {
      notify("Enter client email first.");
      return;
    }
    setSendingMail(true);
    try {
      const summaryRows = [
        ...invoiceDraft.items.map((it) => ({
          label: `${it.category} (×${it.qty})`,
          value: formatMoney(it.qty * it.unitPriceUsd, invoiceDraft),
        })),
        {
          label: `Levy & Tax (${invoiceDraft.taxPct}%)`,
          value: formatMoney(invoiceTotals.tax, invoiceDraft),
        },
        {
          label: "TOTAL CONTRACT",
          value: formatMoney(invoiceTotals.total, invoiceDraft),
        },
        {
          label: `Deposit Due (${invoiceDraft.depositPct}%)`,
          value: formatMoney(invoiceTotals.deposit, invoiceDraft),
        },
      ];

      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: invoiceDraft.clientEmail,
          guestName: invoiceDraft.clientName,
          templateType: "invoice",
          subject: `Invoice ${invoiceDraft.invoiceNumber} — ${invoiceDraft.tripTitle}`,
          headline: `Expedition Invoice ${invoiceDraft.invoiceNumber}`,
          message: `Please find below the complete itemized cost breakdown for ${invoiceDraft.tripTitle}.\n\n${invoiceDraft.notes}`,
          summaryRows,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        notify(json.error || "Configure SMTP keys in .env to email invoice directly.");
      } else {
        notify(`Invoice emailed to ${invoiceDraft.clientEmail}!`);
      }
    } catch {
      notify("Failed to dispatch invoice email.");
    } finally {
      setSendingMail(false);
    }
  };

  // Expeditions Actions
  const handleAddExpedition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id =
      newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `exp-${Date.now()}`;
    const item: AdminExpeditionItem = {
      id,
      title: newTitle.trim(),
      swahiliTag: newSwahili.trim() || "Bespoke Safari",
      durationDays: Number(newDays) || 7,
      priceFromUsd: Number(newPrice) || 4000,
      category: newCategory,
      published: true,
      featuredImage: newImage || "/images/serengeti-lions.jpg",
      summary: newSummary.trim() || "Private 4x4 guided Tanzania expedition",
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
    notify("Removed package.");
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
    notify(`${inq.guestName} → ${status.toUpperCase()}`);
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
        notify(json.error || "Cloudinary credentials needed in .env.");
      } else {
        setMediaAssets((prev) => [json.asset, ...prev]);
        setNewImage(json.asset.url);
        notify("Uploaded to Cloudinary CDN!");
      }
    } catch {
      notify("Upload error.");
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
          templateType: mailTemplate,
          subject: mailSubject,
          headline: mailHeadline,
          message: mailMessage,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        notify(json.error || "Add Nodemailer SMTP keys in .env to send live.");
      } else {
        notify(`Dispatched email to ${mailTo}!`);
      }
    } catch {
      notify("Error dispatching email.");
    } finally {
      setSendingMail(false);
    }
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredPalette = NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#08100c] text-[#e2eee7]">
        <div className="flex items-center gap-3 font-mono text-xs">
          <Loader2 className="h-4 w-4 animate-spin text-[#e5a853]" />
          Loading Kibo &amp; Plains Command...
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1. TIMBRE-STYLE SPLIT AUTH SHOWCASE + PASSWORD GATE + GOOGLE OAUTH
  // =========================================================================
  if (!unlocked) {
    return (
      <div className="min-h-screen grid lg:grid-cols-[1.08fr_0.92fr] bg-[#08100c] text-[#e2eee7] pt-16 sm:pt-0">
        {/* Left Showcase Panel (matches Timbre Studio dark showcase craft) */}
        <section className="relative flex flex-col justify-between overflow-hidden px-6 py-10 sm:px-12 sm:py-14 bg-[radial-gradient(circle_at_82%_4%,rgba(229,168,83,0.22),transparent_36%),radial-gradient(circle_at_12%_92%,rgba(46,124,82,0.24),transparent_44%),linear-gradient(155deg,#102319,#070f0b_68%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(circle at 28% 26%, black, transparent 74%)",
            }}
          />

          <div className="relative z-10 flex items-center gap-3 font-serif text-2xl font-semibold text-white">
            <Mountain className="h-6 w-6 text-[#e5a853]" />
            Kibo &amp; Plains Studio
          </div>

          <div className="relative z-10 my-10 max-w-xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#e5a853]">
              Expedition Intelligence &amp; Client Concierge
            </span>
            <h1 className="mt-4 font-serif text-4xl sm:text-6xl font-semibold tracking-tight leading-[0.98] text-white">
              Every summit.{" "}
              <span className="italic text-[#e5a853]">One clear signal.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed">
              Manage Kilimanjaro permits, client itineraries, custom PDF invoices with partner logos, Cloudinary photography, and Nodemailer VIP welcomes from one calm workspace.
            </p>
          </div>

          {/* Live Signal Preview Card (inspired by Timbre login signal card) */}
          <div className="relative z-10 max-w-md rounded-3xl border border-white/15 bg-black/45 p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-[#62b388]">
                <span className="h-2 w-2 rounded-full bg-[#62b388] animate-pulse" />
                Live Expedition Signal
              </span>
              <span className="rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] text-white/70">
                2026–27 Season
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <strong className="font-serif text-4xl font-semibold text-white">
                $148.4K
              </strong>
              <span className="font-mono text-xs text-white/65">
                Q3 bookings <b className="text-[#e5a853]">+24.6%</b>
              </span>
            </div>

            <div className="mt-4 flex h-12 items-end gap-1.5" aria-hidden="true">
              {[34, 46, 38, 58, 52, 68, 61, 76, 72, 88, 82, 95, 86, 100].map(
                (h, idx) => (
                  <span
                    key={idx}
                    style={{ height: `${h}%` }}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-[#2e7c52] to-[#e5a853] opacity-90"
                  />
                )
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[10.5px] text-white/70">
              <span>● Kilimanjaro</span>
              <span>● Serengeti</span>
              <span>● Zanzibar</span>
              <strong className="text-white">3 Active Hubs</strong>
            </div>
          </div>
        </section>

        {/* Right Access Panel */}
        <section className="flex flex-col justify-between bg-background px-6 py-10 sm:px-12 sm:py-14 text-foreground">
          <div className="mx-auto my-auto w-full max-w-md space-y-6">
            <div>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-primary">
                Account &amp; Workspace Access
              </span>
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold">
                {authRoleTab === "admin" ? "Admin Sign In." : "Client Trip Portal."}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {authRoleTab === "admin"
                  ? "Use Google Auth (Firebase) or enter your admin passcode to inspect the full animated dashboard."
                  : "Travelers sign in with Google to view their itinerary, crew notes, and PDF cost invoices."}
              </p>
            </div>

            {/* Mode Switch */}
            <div className="grid grid-cols-2 rounded-full border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setAuthRoleTab("admin")}
                className={`cursor-pointer rounded-full py-2 text-xs font-semibold transition ${
                  authRoleTab === "admin"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin Console
              </button>
              <button
                type="button"
                onClick={() => setAuthRoleTab("client")}
                className={`cursor-pointer rounded-full py-2 text-xs font-semibold transition ${
                  authRoleTab === "client"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Client Portal
              </button>
            </div>

            {authRoleTab === "admin" ? (
              <>
                {/* Google Auth Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full cursor-pointer flex items-center justify-center gap-3 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-secondary"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
                    />
                  </svg>
                  Continue with Google (Firebase)
                </button>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-border" />
                  <span className="mx-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    or quick admin password
                  </span>
                  <div className="flex-grow border-t border-border" />
                </div>

                {/* Admin Passcode Form */}
                <form onSubmit={handlePasscodeSubmit} className="space-y-3">
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="Enter admin access password"
                      className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passcodeChecking}
                    className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 disabled:opacity-60"
                  >
                    {passcodeChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    Unlock Admin Dashboard
                  </button>
                </form>

                {health.previewPasscodeHint && (
                  <div className="rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 font-mono text-[11px] text-foreground">
                    Build preview password:{" "}
                    <strong className="text-primary">
                      {health.previewPasscodeHint}
                    </strong>{" "}
                    · Override anytime via <code>ADMIN_ACCESS_PASSWORD</code>.
                  </div>
                )}

                {authError && (
                  <div className="flex items-start gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-foreground">
                    <ShieldAlert className="h-4 w-4 text-[#e5a853] shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Clients can sign in with their invited Google account on the dedicated Client Portal to track trip readiness, KPAP crew notes, and download branded PDF cost invoices.
                </p>
                <TransitionLink
                  href="/portal"
                  label="CLIENT EXPEDITION PORTAL"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
                >
                  Open Client Portal
                  <ArrowUpRight className="h-4 w-4" />
                </TransitionLink>
              </div>
            )}

            {/* Integration Readiness Strip */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { label: "Firebase Auth", ok: health.firebase },
                { label: "Cloudinary CDN", ok: health.cloudinary },
                { label: "Nodemailer SMTP", ok: health.nodemailer },
                { label: "PDF Invoice Studio", ok: true },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-xl border border-border bg-card/70 px-3 py-2 font-mono text-[10.5px]"
                >
                  <span>{s.label}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      s.ok ? "bg-emerald-500" : "bg-[#e5a853]"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md pt-6 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>Kibo &amp; Plains · Arusha</span>
            <TransitionLink href="/" className="hover:underline">
              ← Back to Website
            </TransitionLink>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // 2. TIMBRE-STYLE ANIMATED DASHBOARD SHELL (SIDEBAR + TOPBAR + ⌘K + MOTION)
  // =========================================================================
  return (
    <div
      ref={dashShellRef}
      className="relative min-h-screen bg-background text-foreground pt-20 pb-16"
    >
      {/* Ambient Timbre-style soft pointer glow */}
      <div
        ref={cursorGlowRef}
        aria-hidden="true"
        className="pointer-events-none fixed -top-52 -left-52 z-0 hidden lg:block h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(46,124,82,0.12)_0%,rgba(229,168,83,0.06)_40%,transparent_72%)] blur-2xl"
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-[150] flex items-center gap-2 rounded-full border border-primary/40 bg-[#08100c] px-4 py-2.5 text-xs font-medium text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-[#e5a853]" />
          {toast}
        </div>
      )}

      {/* ⌘K Command Palette Modal */}
      {paletteOpen && (
        <div
          className="fixed inset-0 z-[180] grid place-items-start justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-border bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-border pb-3 px-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Jump to Overview, Clients, Invoices PDF, Cloudinary..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="cursor-pointer rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {filteredPalette.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setPaletteOpen(false);
                      setPaletteQuery("");
                    }}
                    className="w-full cursor-pointer flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm hover:bg-secondary"
                  >
                    <span className="flex items-center gap-2.5 font-medium">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {item.group}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[264px_1fr] lg:items-start">
          {/* Desktop Floating Dark Sidebar (Timbre Studio signature) */}
          <aside className="hidden lg:flex sticky top-24 flex-col justify-between rounded-3xl border border-white/10 bg-[#0b1711] p-4 text-[#e2eee7] shadow-2xl min-h-[calc(100vh-7.5rem)]">
            <div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#2e7c52] to-[#e5a853] font-serif text-lg font-bold text-[#08100c]">
                    KP
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Kibo Studio
                    </div>
                    <div className="font-mono text-[10px] text-white/60">
                      {isGoogleAdmin ? "Firebase Live" : "Passcode Session"}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-[#e5a853]/20 px-2 py-0.5 font-mono text-[9.5px] font-semibold text-[#e5a853]">
                  PRO
                </span>
              </div>

              {(["WORKSPACE", "OPERATIONS", "STUDIO"] as const).map((group) => (
                <div key={group} className="mt-5">
                  <div className="px-3 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/45">
                    {group}
                  </div>
                  <nav className="mt-1.5 space-y-1">
                    {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                      const Icon = item.icon;
                      const active = tab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTab(item.id)}
                          className={`w-full cursor-pointer flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                            active
                              ? "bg-[#1a3828] text-white shadow-sm"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon
                              className={`h-4 w-4 ${
                                active ? "text-[#e5a853]" : "text-white/60"
                              }`}
                            />
                            {item.label}
                          </span>
                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#e5a853]" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
              <TransitionLink
                href="/portal"
                label="CLIENT PORTAL"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-[11px] text-white/80 hover:border-[#e5a853]/50"
              >
                <span>Preview Client Portal</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[#e5a853]" />
              </TransitionLink>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center justify-between rounded-xl px-3 py-2 font-mono text-[11px] text-white/60 hover:bg-white/5 hover:text-white"
              >
                <span>{user?.email || "Admin Unlocked"}</span>
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </aside>

          {/* Main Dashboard Stage */}
          <div className="space-y-6 min-w-0">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card/90 px-4 sm:px-6 py-3.5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  className="lg:hidden cursor-pointer rounded-full border border-border p-2"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    Mission Control · {tab.toUpperCase()}
                  </div>
                  <h1 className="font-serif text-xl sm:text-2xl font-semibold leading-tight">
                    {NAV_ITEMS.find((n) => n.id === tab)?.label}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="cursor-pointer hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <Command className="h-3 w-3" />K Search
                </button>

                {isGoogleAdmin ? (
                  <button
                    type="button"
                    onClick={loadFirestoreCollections}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${syncingDb ? "animate-spin" : ""}`}
                    />
                    Sync Cloud
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Link Google Auth
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="lg:hidden cursor-pointer rounded-full border border-border p-2"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile Horizontal Tabs */}
            <div
              className={`lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
                mobileMenuOpen ? "flex-wrap" : ""
              }`}
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`shrink-0 cursor-pointer inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* =========================================================== */}
            {/* TAB: OVERVIEW (TIMBRE-STYLE ANIMATED CHARTS + RINGS + HEATMAP) */}
            {/* =========================================================== */}
            {tab === "overview" && (
              <div className="space-y-6">
                {/* 4 Animated KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: "Projected Season Volume",
                      value: "$39,920",
                      delta: "+24.6%",
                      sub: `${clients.length} active VIP dossiers`,
                    },
                    {
                      label: "Client Portal Access",
                      value: `${clients.filter((c) => c.welcomeSent).length} / ${clients.length}`,
                      delta: "Google Ready",
                      sub: "Branded welcome emails sent",
                    },
                    {
                      label: "Summit Permits & Leads",
                      value: String(inquiries.length),
                      delta: `${inquiries.filter((i) => i.status === "new").length} New`,
                      sub: "Linked with /inquire",
                    },
                    {
                      label: "Media CDN Library",
                      value: String(mediaAssets.length),
                      delta: health.cloudinary ? "Cloudinary" : "Local Ready",
                      sub: "Auto f_auto WebP delivery",
                    },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      data-dash-reveal
                      className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>{kpi.label}</span>
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary font-semibold">
                          {kpi.delta}
                        </span>
                      </div>
                      <div className="mt-2 font-serif text-3xl sm:text-4xl font-semibold">
                        {kpi.value}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {kpi.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Animated Monotone SVG Curve + Radial Goal Rings */}
                <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                  <div
                    data-dash-reveal
                    className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                          Booking Trajectory · Monotone Curve
                        </span>
                        <h2 className="mt-1 font-serif text-2xl font-semibold">
                          Expedition Revenue &amp; Permits
                        </h2>
                      </div>
                      <span className="rounded-full border border-border bg-background px-3 py-1 font-mono text-[10.5px]">
                        2026–2027 Peak
                      </span>
                    </div>

                    <div className="mt-5">
                      <svg
                        viewBox="0 0 640 180"
                        className="w-full h-44 overflow-visible"
                        fill="none"
                      >
                        <defs>
                          <linearGradient id="dashSplineFill" x1="0" y1="0" x2="0" y2="180" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2e7c52" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#2e7c52" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="dashSplineStroke" x1="0" y1="0" x2="640" y2="0" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2e7c52" />
                            <stop offset="60%" stopColor="#e5a853" />
                            <stop offset="100%" stopColor="#62b388" />
                          </linearGradient>
                        </defs>

                        {[35, 80, 125, 165].map((y) => (
                          <line
                            key={y}
                            x1="0"
                            y1={y}
                            x2="640"
                            y2={y}
                            stroke="currentColor"
                            className="text-border"
                            strokeDasharray="4 6"
                            strokeWidth="1"
                          />
                        ))}

                        <path
                          d="M 10 150 C 90 142, 130 98, 210 105 C 290 112, 330 56, 415 62 C 495 68, 540 22, 630 18 L 630 175 L 10 175 Z"
                          fill="url(#dashSplineFill)"
                        />

                        <path
                          ref={splinePathRef}
                          d="M 10 150 C 90 142, 130 98, 210 105 C 290 112, 330 56, 415 62 C 495 68, 540 22, 630 18"
                          stroke="url(#dashSplineStroke)"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                        />

                        {[
                          [10, 150, "Jan"],
                          [210, 105, "Apr"],
                          [415, 62, "Jul"],
                          [630, 18, "Oct"],
                        ].map(([cx, cy, label]) => (
                          <g key={String(label)}>
                            <circle
                              cx={Number(cx)}
                              cy={Number(cy)}
                              r="4.5"
                              fill="#e5a853"
                              stroke="#08100c"
                              strokeWidth="1.5"
                            />
                            <text
                              x={Number(cx)}
                              y="178"
                              textAnchor="middle"
                              fontSize="10"
                              fill="currentColor"
                              className="text-muted-foreground font-mono"
                            >
                              {label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Animated Radial Progress Rings */}
                  <div
                    data-dash-reveal
                    className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                        Live Operations Gauges
                      </span>
                      <h2 className="mt-1 font-serif text-2xl font-semibold">
                        KPAP &amp; Fleet Readiness
                      </h2>
                    </div>

                    <div className="my-5 grid grid-cols-3 gap-3 text-center">
                      {[
                        { label: "Summit Rate", pct: 94, color: "#62b388" },
                        { label: "Fleet Booked", pct: 82, color: "#e5a853" },
                        { label: "Invoices Paid", pct: 76, color: "#3b9d73" },
                      ].map((ring) => (
                        <div key={ring.label} className="flex flex-col items-center">
                          <div className="relative flex h-20 w-20 items-center justify-center">
                            <svg viewBox="0 0 80 80" className="h-full w-full" fill="none">
                              <circle
                                cx="40"
                                cy="40"
                                r="32"
                                stroke="currentColor"
                                className="text-border"
                                strokeWidth="5"
                              />
                              <path
                                data-dash-ring
                                data-pct={ring.pct}
                                d="M 40 8 A 32 32 0 1 1 39.99 8"
                                stroke={ring.color}
                                strokeWidth="5.5"
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute font-mono text-xs font-bold">
                              {ring.pct}%
                            </span>
                          </div>
                          <span className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                            {ring.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setTab("invoices")}
                      className="cursor-pointer w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground"
                    >
                      Open PDF Invoice Studio →
                    </button>
                  </div>
                </div>

                {/* Circuit Bars + Dispatch Activity Heatmap */}
                <div className="grid gap-5 lg:grid-cols-2">
                  <div
                    data-dash-reveal
                    className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm"
                  >
                    <h2 className="font-serif text-2xl font-semibold">
                      Circuit Demand Breakdown
                    </h2>
                    <div className="space-y-3">
                      {[
                        { name: "Kilimanjaro Lemosho & Northern", pct: 88 },
                        { name: "Serengeti Mara Crossings", pct: 76 },
                        { name: "Ngorongoro & Tarangire", pct: 69 },
                        { name: "Zanzibar Reef Extensions", pct: 61 },
                      ].map((row) => (
                        <div key={row.name}>
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span>{row.name}</span>
                            <span className="font-mono text-primary">
                              {row.pct}%
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                            <div
                              data-dash-bar
                              style={{ width: `${row.pct}%` }}
                              className="h-full rounded-full bg-gradient-to-r from-[#2e7c52] to-[#e5a853]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    data-dash-reveal
                    className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-serif text-2xl font-semibold">
                        Concierge &amp; Crew Heatmap
                      </h2>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        7 Days × 10 Windows
                      </span>
                    </div>
                    <div className="grid grid-cols-10 gap-1.5">
                      {HEATMAP_MATRIX.flatMap((row, rIdx) =>
                        row.map((val, cIdx) => (
                          <span
                            key={`${rIdx}-${cIdx}`}
                            data-dash-heat
                            style={{
                              opacity: 0.25 + val * 0.08,
                            }}
                            className={`h-5 rounded-md ${
                              val >= 7
                                ? "bg-[#e5a853]"
                                : val >= 5
                                ? "bg-primary"
                                : "bg-primary/40"
                            }`}
                          />
                        ))
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                      <span>Peak dispatch: 09:00 – 17:00 EAT</span>
                      <button
                        type="button"
                        onClick={handleSeedToFirestore}
                        className="cursor-pointer font-mono text-[11px] font-semibold text-primary hover:underline"
                      >
                        Push Seed to Firestore →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/* TAB: CLIENTS & CLIENT PORTAL WORKSPACES                     */}
            {/* =========================================================== */}
            {tab === "clients" && (
              <div className="grid gap-7 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
                <form
                  data-dash-reveal
                  onSubmit={handleAddClient}
                  className="rounded-3xl border border-border bg-card p-6 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h2 className="font-serif text-2xl font-semibold">
                      Add Client Workspace
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When clients sign in via Google on <code>/portal</code>, they automatically unlock their assigned trip, KPAP crew, and PDF invoices.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Client Full Name
                      </label>
                      <input
                        required
                        value={cliName}
                        onChange={(e) => setCliName(e.target.value)}
                        placeholder="Baraka Mrema"
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Google Email (Portal Access)
                      </label>
                      <input
                        required
                        type="email"
                        value={cliEmail}
                        onChange={(e) => setCliEmail(e.target.value)}
                        placeholder="baraka@gmail.com"
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Company / Family Group
                      </label>
                      <input
                        value={cliOrg}
                        onChange={(e) => setCliOrg(e.target.value)}
                        placeholder="Serengeti Collective"
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Client Logo Upload (for Invoice)
                      </label>
                      <label className="mt-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-2 text-xs hover:border-primary">
                        <Upload className="h-3.5 w-3.5 text-primary" />
                        {cliLogoUrl ? "Logo Ready ✓" : "Upload PNG/JPG"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleClientLogoUpload(e, "clientForm")}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Assigned Expedition Title
                    </label>
                    <input
                      value={cliTrip}
                      onChange={(e) => setCliTrip(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Travel Dates
                      </label>
                      <input
                        value={cliDates}
                        onChange={(e) => setCliDates(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Lead Guide
                      </label>
                      <input
                        value={cliGuide}
                        onChange={(e) => setCliGuide(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Contract USD
                      </label>
                      <input
                        type="number"
                        value={cliTotalUsd}
                        onChange={(e) => setCliTotalUsd(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Create Client Workspace
                  </button>
                </form>

                {/* Active Client Cards */}
                <div className="space-y-4">
                  {clients.map((cli) => (
                    <div
                      key={cli.id}
                      data-dash-reveal
                      className="rounded-3xl border border-border bg-card p-5 space-y-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          {cli.logoUrl ? (
                            <img
                              src={cli.logoUrl}
                              alt={cli.organization}
                              className="h-12 w-12 rounded-2xl object-contain bg-white p-1 border border-border"
                            />
                          ) : (
                            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 font-serif text-lg font-bold text-primary">
                              {cli.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                          )}
                          <div>
                            <h3 className="font-serif text-xl font-semibold">
                              {cli.name}
                            </h3>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {cli.organization} · {cli.email}
                            </div>
                          </div>
                        </div>

                        <select
                          value={cli.tripStatus}
                          onChange={(e) =>
                            handleClientStatusChange(
                              cli,
                              e.target.value as AdminClientRecord["tripStatus"]
                            )
                          }
                          className="rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px]"
                        >
                          <option value="Planning">Planning</option>
                          <option value="Permits Issued">Permits Issued</option>
                          <option value="Deposit Paid">Deposit Paid</option>
                          <option value="In Field">In Field</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div className="rounded-2xl border border-border bg-background/80 p-3.5 grid gap-2 sm:grid-cols-3 text-xs">
                        <div>
                          <div className="font-mono text-[9.5px] text-muted-foreground">
                            EXPEDITION
                          </div>
                          <div className="font-medium">{cli.tripTitle}</div>
                        </div>
                        <div>
                          <div className="font-mono text-[9.5px] text-muted-foreground">
                            CREW &amp; UNIT
                          </div>
                          <div className="font-medium">{cli.leadGuide}</div>
                        </div>
                        <div>
                          <div className="font-mono text-[9.5px] text-muted-foreground">
                            CONTRACT / PAID
                          </div>
                          <div className="font-mono font-semibold text-primary">
                            ${cli.totalUsd.toLocaleString()} ($
                            {cli.paidUsd.toLocaleString()} paid)
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendWelcomePack(cli)}
                          disabled={sendingMail}
                          className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {cli.welcomeSent
                            ? "Resend VIP Welcome Pack"
                            : "Send VIP Welcome Email"}
                        </button>

                        <button
                          type="button"
                          onClick={() => loadClientIntoInvoice(cli)}
                          className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-secondary"
                        >
                          <FileText className="h-3.5 w-3.5 text-[#b86f2d] dark:text-[#e5a853]" />
                          PDF Invoice ({cli.invoiceNumber})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/* TAB: PDF INVOICE STUDIO WITH CLIENT LOGO & COST BREAKDOWN    */}
            {/* =========================================================== */}
            {tab === "invoices" && (
              <div className="grid gap-7 xl:grid-cols-[0.95fr_1.05fr] xl:items-start">
                {/* Left Editor */}
                <div
                  data-dash-reveal
                  className="rounded-3xl border border-border bg-card p-6 space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold">
                        PDF Invoice Builder
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Upload client logo, adjust line-item costs, then export crisp PDF or email directly.
                      </p>
                    </div>
                    <select
                      value={invoiceDraft.currency}
                      onChange={(e) =>
                        setInvoiceDraft((p) => ({
                          ...p,
                          currency: e.target.value as "USD" | "TZS",
                        }))
                      }
                      className="rounded-full border border-border bg-background px-3 py-1 font-mono text-xs"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="TZS">TZS (Shs)</option>
                    </select>
                  </div>

                  {/* Client Logo & Metadata */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Client / Partner Name
                      </label>
                      <input
                        value={invoiceDraft.clientName}
                        onChange={(e) =>
                          setInvoiceDraft((p) => ({
                            ...p,
                            clientName: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Organization / Studio
                      </label>
                      <input
                        value={invoiceDraft.clientOrg}
                        onChange={(e) =>
                          setInvoiceDraft((p) => ({
                            ...p,
                            clientOrg: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Client Email
                      </label>
                      <input
                        value={invoiceDraft.clientEmail}
                        onChange={(e) =>
                          setInvoiceDraft((p) => ({
                            ...p,
                            clientEmail: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Invoice Number
                      </label>
                      <input
                        value={invoiceDraft.invoiceNumber}
                        onChange={(e) =>
                          setInvoiceDraft((p) => ({
                            ...p,
                            invoiceNumber: e.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Upload Client Logo */}
                  <div className="rounded-2xl border border-dashed border-primary/40 bg-background p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {invoiceDraft.clientLogoUrl ? (
                        <img
                          src={invoiceDraft.clientLogoUrl}
                          alt="Client logo preview"
                          className="h-11 w-16 rounded-lg object-contain bg-white p-1 border border-border"
                        />
                      ) : (
                        <span className="grid h-11 w-16 place-items-center rounded-lg bg-secondary font-mono text-[10px] text-muted-foreground">
                          NO LOGO
                        </span>
                      )}
                      <div>
                        <div className="text-xs font-semibold">
                          Client / Agency Logo
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Embeds crisply at top-right of PDF header
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {invoiceDraft.clientLogoUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setInvoiceDraft((p) => ({ ...p, clientLogoUrl: "" }))
                          }
                          className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-[11px]"
                        >
                          Clear
                        </button>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                        <Upload className="h-3.5 w-3.5" />
                        Upload Client Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleClientLogoUpload(e, "invoice")}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Line Items Editor */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                        Cost Breakdown Line Items
                      </span>
                      <button
                        type="button"
                        onClick={handleAddInvoiceItem}
                        className="cursor-pointer inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-primary"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Row
                      </button>
                    </div>

                    {invoiceDraft.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-border bg-background p-3 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            value={item.category}
                            onChange={(e) =>
                              handleUpdateInvoiceItem(item.id, {
                                category: e.target.value,
                              })
                            }
                            placeholder="Category"
                            className="w-40 rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-[11px]"
                          />
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateInvoiceItem(item.id, {
                                qty: Math.max(1, Number(e.target.value)),
                              })
                            }
                            className="w-16 rounded-lg border border-border bg-card px-2 py-1 text-center font-mono text-xs"
                          />
                          <input
                            type="number"
                            min={0}
                            value={item.unitPriceUsd}
                            onChange={(e) =>
                              handleUpdateInvoiceItem(item.id, {
                                unitPriceUsd: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-24 rounded-lg border border-border bg-card px-2 py-1 text-right font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInvoiceItem(item.id)}
                            className="ml-auto cursor-pointer p-1 text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          value={item.description}
                          onChange={(e) =>
                            handleUpdateInvoiceItem(item.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Tax / Deposit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Park Levy / Tax %
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={25}
                        value={invoiceDraft.taxPct}
                        onChange={(e) =>
                          setInvoiceDraft((p) => ({
                            ...p,
                            taxPct: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        Deposit Due %
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={invoiceDraft.depositPct}
                        onChange={(e) =>
                          setInvoiceDraft((p) => ({
                            ...p,
                            depositPct: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={generatingPdf}
                      className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-semibold text-primary-foreground shadow"
                    >
                      {generatingPdf ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download Branded PDF Invoice
                    </button>
                    <button
                      type="button"
                      onClick={handleEmailInvoice}
                      disabled={sendingMail}
                      className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3.5 text-xs font-semibold hover:bg-secondary"
                    >
                      <Mail className="h-4 w-4 text-primary" />
                      Email Invoice
                    </button>
                  </div>
                </div>

                {/* Right: Live Branded A4 Paper Preview */}
                <div
                  data-dash-reveal
                  className="overflow-hidden rounded-3xl border border-border bg-white text-[#14211a] shadow-2xl"
                >
                  {/* Obsidian Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#e5a853] bg-[#08100c] px-6 py-5 text-white">
                    <div>
                      <div className="font-serif text-xl font-bold tracking-wide">
                        KIBO &amp; PLAINS
                      </div>
                      <div className="font-mono text-[10px] text-[#e5a853]">
                        ARUSHA &amp; MOSHI · TANAPA &amp; KPAP CERTIFIED
                      </div>
                    </div>

                    {invoiceDraft.clientLogoUrl ? (
                      <div className="rounded-xl bg-white p-1.5 shadow">
                        <img
                          src={invoiceDraft.clientLogoUrl}
                          alt="Client Logo"
                          className="h-10 max-w-[120px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-[#e5a853]">
                          OFFICIAL INVOICE
                        </div>
                        <div className="text-[11px] text-white/80">
                          {invoiceDraft.invoiceNumber}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Client & Totals Body */}
                  <div className="p-6 space-y-5">
                    <div className="flex flex-wrap justify-between gap-4 rounded-2xl border border-[#d6e4dc] bg-[#f4f8f5] p-4 text-xs">
                      <div>
                        <div className="font-mono text-[9.5px] uppercase tracking-wider text-[#145131] font-bold">
                          Billed To
                        </div>
                        <div className="mt-1 text-base font-bold">
                          {invoiceDraft.clientName}
                        </div>
                        <div className="text-[#54665c]">
                          {invoiceDraft.clientOrg} · {invoiceDraft.clientEmail}
                        </div>
                        <div className="mt-1 font-semibold text-[#145131]">
                          {invoiceDraft.tripTitle}
                        </div>
                      </div>
                      <div className="font-mono text-[11px] text-right space-y-0.5 text-[#54665c]">
                        <div>
                          <strong className="text-[#14211a]">
                            {invoiceDraft.invoiceNumber}
                          </strong>
                        </div>
                        <div>Issued: {invoiceDraft.issueDate}</div>
                        <div>Due: {invoiceDraft.dueDate}</div>
                        <div>Currency: {invoiceDraft.currency}</div>
                      </div>
                    </div>

                    {/* Breakdown Rows */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#145131]/20 bg-[#145131] text-white font-mono text-[10px]">
                            <th className="rounded-l-lg px-3 py-2 text-left">
                              BREAKDOWN ITEM
                            </th>
                            <th className="px-2 py-2 text-right">QTY</th>
                            <th className="px-2 py-2 text-right">UNIT</th>
                            <th className="rounded-r-lg px-3 py-2 text-right">
                              TOTAL
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2eee7]">
                          {invoiceDraft.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2.5">
                                <div className="font-mono text-[9.5px] font-bold uppercase text-[#b86f2d]">
                                  {item.category}
                                </div>
                                <div className="text-[#14211a]">
                                  {item.description}
                                </div>
                              </td>
                              <td className="px-2 py-2.5 text-right font-mono">
                                {item.qty}
                              </td>
                              <td className="px-2 py-2.5 text-right font-mono">
                                {formatMoney(item.unitPriceUsd, invoiceDraft)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-mono font-bold">
                                {formatMoney(
                                  item.qty * item.unitPriceUsd,
                                  invoiceDraft
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Box */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f4f8f5] p-3.5 text-[11px] text-[#54665c]">
                        <div className="font-mono text-[9.5px] font-bold uppercase text-[#145131] mb-1">
                          Payment Channels
                        </div>
                        {invoiceDraft.notes}
                      </div>

                      <div className="rounded-2xl bg-[#08100c] p-4 text-white font-mono text-xs space-y-1.5">
                        <div className="flex justify-between text-white/75">
                          <span>Subtotal</span>
                          <span>
                            {formatMoney(invoiceTotals.subtotal, invoiceDraft)}
                          </span>
                        </div>
                        <div className="flex justify-between text-white/75">
                          <span>Levy / Tax ({invoiceDraft.taxPct}%)</span>
                          <span>{formatMoney(invoiceTotals.tax, invoiceDraft)}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/15 pt-1.5 text-sm font-bold">
                          <span>Total</span>
                          <span className="text-[#e5a853]">
                            {formatMoney(invoiceTotals.total, invoiceDraft)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#62b388]">
                          <span>Deposit ({invoiceDraft.depositPct}%)</span>
                          <span>
                            {formatMoney(invoiceTotals.deposit, invoiceDraft)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/* TAB: EXPEDITIONS                                            */}
            {/* =========================================================== */}
            {tab === "expeditions" && (
              <div className="grid gap-7 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
                <form
                  data-dash-reveal
                  onSubmit={handleAddExpedition}
                  className="rounded-3xl border border-border bg-card p-6 space-y-4"
                >
                  <h2 className="font-serif text-2xl font-semibold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add Expedition Package
                  </h2>
                  <div>
                    <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Title
                    </label>
                    <input
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="7-Day Serengeti Calving Fly-In"
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={newSwahili}
                      onChange={(e) => setNewSwahili(e.target.value)}
                      placeholder="Swahili Tagline"
                      className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                    <select
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(
                          e.target.value as AdminExpeditionItem["category"]
                        )
                      }
                      className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    >
                      <option value="Kilimanjaro">Kilimanjaro</option>
                      <option value="Northern Circuit">Northern Circuit</option>
                      <option value="Southern & Western">
                        Southern &amp; Western
                      </option>
                      <option value="Coast">Coast</option>
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="number"
                      value={newDays}
                      onChange={(e) => setNewDays(Number(e.target.value))}
                      className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Image URL"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-xs"
                  />
                  <textarea
                    rows={2}
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Highlights summary..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
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
                      data-dash-reveal
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={exp.featuredImage}
                          alt={exp.title}
                          className="h-16 w-24 shrink-0 rounded-2xl object-cover border border-border"
                        />
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
                            {exp.category} · {exp.durationDays}D · From $
                            {exp.priceFromUsd.toLocaleString()}
                          </span>
                          <h3 className="font-serif text-xl font-semibold">
                            {exp.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {exp.summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(exp)}
                          className="cursor-pointer rounded-full border border-border bg-background p-2"
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
                          className="cursor-pointer rounded-full border border-border bg-background p-2 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/* TAB: INQUIRIES & NODEMAILER DISPATCH                        */}
            {/* =========================================================== */}
            {tab === "inquiries" && (
              <div className="grid gap-7 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      data-dash-reveal
                      className="rounded-3xl border border-border bg-card p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="font-serif text-xl font-semibold">
                            {inq.guestName}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {inq.guestEmail} · {inq.travelers} guests ·{" "}
                            {inq.month} 2027
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
                      <div className="flex flex-wrap gap-2 font-mono text-[11px] text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-foreground uppercase">
                          {inq.focus}
                        </span>
                        <span>{inq.totalDays} days</span>
                        <span>· ${inq.estimatePerPerson.toLocaleString()} pp</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMailTo(inq.guestEmail);
                            setMailGuestName(inq.guestName);
                            setMailTemplate("welcome");
                            setMailSubject(
                              `Karibu Tanzania — Your ${inq.totalDays}-Day Kibo & Plains Dossier`
                            );
                          }}
                          className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Load into Mail Composer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  data-dash-reveal
                  onSubmit={handleSendMail}
                  className="rounded-3xl border border-border bg-card p-6 space-y-4 xl:sticky xl:top-24"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold">
                      Nodemailer Custom Dispatcher
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                        health.nodemailer
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/15 text-[#b86f2d] dark:text-[#e5a853]"
                      }`}
                    >
                      {health.nodemailer ? "SMTP LIVE" : "PREVIEW READY"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 rounded-full border border-border bg-background p-1">
                    {(["welcome", "invoice", "quote"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMailTemplate(t)}
                        className={`cursor-pointer rounded-full py-1.5 font-mono text-[10.5px] uppercase ${
                          mailTemplate === t
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      type="email"
                      value={mailTo}
                      onChange={(e) => setMailTo(e.target.value)}
                      placeholder="Guest Email"
                      className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                    <input
                      value={mailGuestName}
                      onChange={(e) => setMailGuestName(e.target.value)}
                      placeholder="Guest Name"
                      className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <input
                    required
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
                  <input
                    value={mailHeadline}
                    onChange={(e) => setMailHeadline(e.target.value)}
                    placeholder="Banner Headline"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
                  <textarea
                    required
                    rows={5}
                    value={mailMessage}
                    onChange={(e) => setMailMessage(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                  />
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
                    Dispatch Custom Branded Email
                  </button>
                </form>
              </div>
            )}

            {/* =========================================================== */}
            {/* TAB: CLOUDINARY MEDIA                                       */}
            {/* =========================================================== */}
            {tab === "media" && (
              <div className="space-y-6">
                <div
                  data-dash-reveal
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6"
                >
                  <div>
                    <h2 className="font-serif text-2xl font-semibold">
                      Cloudinary Media Studio
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Optimized WebP/AVIF uploads via <code>/api/cloudinary/upload</code>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="rounded-full border border-border bg-background px-4 py-2 font-mono text-xs"
                    >
                      <option value="kibo-plains/expeditions">
                        kibo-plains/expeditions
                      </option>
                      <option value="kibo-plains/parks">kibo-plains/parks</option>
                      <option value="kibo-plains/kilimanjaro">
                        kibo-plains/kilimanjaro
                      </option>
                      <option value="kibo-plains/fleet">kibo-plains/fleet</option>
                    </select>
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CloudUpload className="h-4 w-4" />
                      )}
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCloudinaryUpload}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.publicId}
                      data-dash-reveal
                      className="rounded-3xl border border-border bg-card p-3 space-y-2.5"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-border">
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
                      <div className="truncate text-sm font-medium px-1">
                        {asset.label}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(asset.publicId, asset.url)}
                          className="cursor-pointer flex-1 inline-flex items-center justify-center gap-1 rounded-full border border-border bg-background py-1.5 font-mono text-[10.5px]"
                        >
                          {copiedKey === asset.publicId ? (
                            <Check className="h-3 w-3 text-primary" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedKey === asset.publicId ? "Copied" : "Copy URL"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =========================================================== */}
            {/* TAB: FIREBASE, ENV & FIRESTORE SETUP                        */}
            {/* =========================================================== */}
            {tab === "setup" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div
                  data-dash-reveal
                  className="rounded-3xl border border-border bg-card p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold">
                      1. Environment Keys (.env / Vercel)
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleCopy("env", ENV_TEMPLATE)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px]"
                    >
                      {copiedKey === "env" ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-2xl border border-border bg-[#08100c] p-4 font-mono text-[11px] leading-relaxed text-[#d7eee1]">
                    {ENV_TEMPLATE}
                  </pre>
                </div>

                <div
                  data-dash-reveal
                  className="rounded-3xl border border-border bg-card p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-semibold">
                      2. Firestore Security Rules (Admin + Client Portal)
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleCopy("rules", FIRESTORE_RULES)}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 font-mono text-[11px]"
                    >
                      {copiedKey === "rules" ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-2xl border border-border bg-[#08100c] p-4 font-mono text-[11px] leading-relaxed text-[#d7eee1]">
                    {FIRESTORE_RULES}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
