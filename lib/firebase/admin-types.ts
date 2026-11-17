import { EXPEDITION_ITINERARIES, NATIONAL_PARKS } from "@/lib/tanzania-data";

export interface AdminExpeditionItem {
  id: string;
  title: string;
  swahiliTag: string;
  durationDays: number;
  priceFromUsd: number;
  category: "Kilimanjaro" | "Northern Circuit" | "Southern & Western" | "Coast";
  published: boolean;
  featuredImage: string;
  summary: string;
  updatedAt: string;
}

export interface AdminInquiryItem {
  id: string;
  guestName: string;
  guestEmail: string;
  focus: "combo" | "kilimanjaro" | "safari";
  kiliRoute: string;
  selectedParks: string[];
  travelers: number;
  month: string;
  tier: string;
  totalDays: number;
  estimatePerPerson: number;
  status: "new" | "quoted" | "confirmed" | "archived";
  mailSent: boolean;
  createdAt: string;
}

export interface InvoiceLineItem {
  id: string;
  category: string;
  description: string;
  qty: number;
  unitPriceUsd: number;
}

export interface InvoiceDraft {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: "USD" | "TZS";
  tzsRate: number;
  taxPct: number;
  depositPct: number;
  clientName: string;
  clientEmail: string;
  clientOrg: string;
  clientLogoUrl: string;
  companyName?: string;
  companyLogoUrl?: string;
  companyEmail?: string;
  companyPhone?: string;
  statusLabel?: string;
  tripTitle: string;
  notes: string;
  items: InvoiceLineItem[];
}

export interface AdminClientRecord {
  id: string;
  name: string;
  email: string;
  organization: string;
  logoUrl: string;
  tripTitle: string;
  tripStatus: "Planning" | "Permits Issued" | "Deposit Paid" | "In Field" | "Completed";
  travelDates: string;
  travelers: number;
  leadGuide: string;
  vehicleUnit: string;
  totalUsd: number;
  paidUsd: number;
  welcomeSent: boolean;
  invoiceNumber: string;
  notes: string;
  createdAt: string;
}

export interface AdminMediaAsset {
  publicId: string;
  url: string;
  folder: string;
  label: string;
  width?: number;
  height?: number;
  format?: string;
  source: "cloudinary" | "local";
  createdAt: string;
}

export interface ClientNotification {
  id: string;
  targetEmail: string; // specific email or "*" for all clients
  targetName: string;
  title: string;
  message: string;
  category: "permits" | "invoice" | "crew" | "urgent" | "update";
  readBy: string[];
  createdAt: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface SiteMediaSlot {
  slotKey: string;
  label: string;
  section: string;
  defaultUrl: string;
  hint: string;
}

export interface IntegrationHealth {
  firebase: boolean;
  googleAuth: boolean;
  cloudinary: boolean;
  nodemailer: boolean;
  passcodeConfigured: boolean;
  previewPasscodeHint: string | null;
}

export const SEED_EXPEDITIONS: AdminExpeditionItem[] = EXPEDITION_ITINERARIES.map(
  (exp, idx) => ({
    id: exp.id,
    title: exp.title,
    swahiliTag: exp.tier,
    durationDays: exp.days,
    priceFromUsd: exp.startingFromUsd,
    category:
      idx === 0
        ? "Kilimanjaro"
        : idx === 1
        ? "Northern Circuit"
        : idx === 2
        ? "Southern & Western"
        : "Coast",
    published: true,
    featuredImage: exp.image,
    summary: exp.highlight,
    updatedAt: "2026-11-15",
  })
);

export const SEED_INQUIRIES: AdminInquiryItem[] = [
  {
    id: "inq-demo-101",
    guestName: "Amina Msuya",
    guestEmail: "amina.msuya@example.com",
    focus: "combo",
    kiliRoute: "lemosho",
    selectedParks: ["serengeti", "ngorongoro", "tarangire"],
    travelers: 2,
    month: "July",
    tier: "Signature Tented",
    totalDays: 14,
    estimatePerPerson: 6820,
    status: "new",
    mailSent: false,
    createdAt: "2026-11-15T09:20:00Z",
  },
  {
    id: "inq-demo-102",
    guestName: "Henrik Lindholm",
    guestEmail: "henrik@nordic-sample.org",
    focus: "kilimanjaro",
    kiliRoute: "northern-circuit",
    selectedParks: [],
    travelers: 4,
    month: "September",
    tier: "Signature Tented",
    totalDays: 9,
    estimatePerPerson: 3690,
    status: "quoted",
    mailSent: true,
    createdAt: "2026-11-14T16:45:00Z",
  },
  {
    id: "inq-demo-103",
    guestName: "Claire & Julian Mercer",
    guestEmail: "mercer@studio-sample.uk",
    focus: "safari",
    kiliRoute: "lemosho",
    selectedParks: ["serengeti", "ngorongoro", "zanzibar"],
    travelers: 2,
    month: "February",
    tier: "Ultra-Luxury Fly-In",
    totalDays: 6,
    estimatePerPerson: 5760,
    status: "confirmed",
    mailSent: true,
    createdAt: "2026-11-12T11:10:00Z",
  },
];

export const SEED_CLIENTS: AdminClientRecord[] = [
  {
    id: "cli-amina-msuya",
    name: "Amina Msuya",
    email: "amina.msuya@example.com",
    organization: "Msuya Studio Dar es Salaam",
    logoUrl: "",
    tripTitle: "14-Day Lemosho & Serengeti Migration Private",
    tripStatus: "Permits Issued",
    travelDates: "14 – 28 Jul 2027",
    travelers: 2,
    leadGuide: "Juma Kessy (KPAP Lead)",
    vehicleUnit: "Cruiser TZ-04 · Arusha Fleet",
    totalUsd: 13640,
    paidUsd: 4092,
    welcomeSent: true,
    invoiceNumber: "KP-INV-2027-014",
    notes: "Vegetarian mountain rations + telephoto beanbags mounted.",
    createdAt: "2026-11-14",
  },
  {
    id: "cli-nordic-alpine",
    name: "Henrik Lindholm",
    email: "henrik@nordic-sample.org",
    organization: "Nordic Alpine Collective",
    logoUrl: "",
    tripTitle: "9-Day Northern Circuit 360° Traverse",
    tripStatus: "Deposit Paid",
    travelDates: "04 – 13 Sep 2027",
    travelers: 4,
    leadGuide: "Emanuel Mrema (TALA Summit)",
    vehicleUnit: "Transfer Shuttle Moshi",
    totalUsd: 14760,
    paidUsd: 14760,
    welcomeSent: true,
    invoiceNumber: "KP-INV-2027-012",
    notes: "Full 4-season tent camp + hyperbaric Gamow bag + O2 cylinders.",
    createdAt: "2026-11-10",
  },
  {
    id: "cli-mercer-flyin",
    name: "Claire & Julian Mercer",
    email: "mercer@studio-sample.uk",
    organization: "Mercer Architectural Press",
    logoUrl: "",
    tripTitle: "6-Day Serengeti Calving & Zanzibar Reef Fly-In",
    tripStatus: "Planning",
    travelDates: "18 – 24 Feb 2027",
    travelers: 2,
    leadGuide: "Rehema Pallangyo (Master Spotter)",
    vehicleUnit: "Cruiser TZ-02 + Coastal Aviation",
    totalUsd: 11520,
    paidUsd: 0,
    welcomeSent: false,
    invoiceNumber: "KP-INV-2027-015",
    notes: "Awaiting Mnemba villa confirmation before issuing final balance.",
    createdAt: "2026-11-15",
  },
];

export const DEFAULT_INVOICE_ITEMS: InvoiceLineItem[] = [
  {
    id: "li-1",
    category: "TANAPA & Conservation",
    description: "Mount Kilimanjaro Lemosho 8-Day Entry, Camping & Rescue Permits (2 Pax)",
    qty: 2,
    unitPriceUsd: 1180,
  },
  {
    id: "li-2",
    category: "KPAP Summit Crew",
    description: "Chagga Lead Guide, Assistant Guide, Chef, Porters, O2 & Pulse Oximetry",
    qty: 1,
    unitPriceUsd: 3420,
  },
  {
    id: "li-3",
    category: "Safari Fleet & Naturalist",
    description: "Extended 4x4 Pop-Top Land Cruiser (Serengeti & Ngorongoro · 6 Days)",
    qty: 6,
    unitPriceUsd: 460,
  },
  {
    id: "li-4",
    category: "Tented Sanctuaries",
    description: "Signature Serengeti Migration Camp & Crater Rim Full-Board Lodging",
    qty: 6,
    unitPriceUsd: 780,
  },
  {
    id: "li-5",
    category: "Flights & AMREF Evac",
    description: "Coastal Aviation Seronera -> Zanzibar Bush Flight & AMREF Flying Doctors",
    qty: 2,
    unitPriceUsd: 495,
  },
];

export const SEED_LOCAL_MEDIA: AdminMediaAsset[] = [
  ...NATIONAL_PARKS.map((p) => ({
    publicId: `local/${p.slug}`,
    url: p.image,
    folder: "local-verified",
    label: p.name,
    source: "local" as const,
    createdAt: "2026-11-15",
  })),
  {
    publicId: "local/inst-land-cruiser",
    url: "/images/inst-land-cruiser.jpg",
    folder: "local-verified",
    label: "4x4 Safari Land Cruiser",
    source: "local",
    createdAt: "2026-11-15",
  },
  {
    publicId: "local/inst-kpap-medical",
    url: "/images/inst-kpap-medical.jpg",
    folder: "local-verified",
    label: "KPAP Oximeter Barafu",
    source: "local",
    createdAt: "2026-11-15",
  },
  {
    publicId: "local/inst-naturalist-optics",
    url: "/images/inst-naturalist-optics.jpg",
    folder: "local-verified",
    label: "Naturalist Spotter",
    source: "local",
    createdAt: "2026-11-15",
  },
  {
    publicId: "local/inst-zanzibar-dhow",
    url: "/images/inst-zanzibar-dhow.jpg",
    folder: "local-verified",
    label: "Zanzibar Mnemba Dhow",
    source: "local",
    createdAt: "2026-11-15",
  },
];

export const SEED_NOTIFICATIONS: ClientNotification[] = [
  {
    id: "notif-seed-1",
    targetEmail: "amina.msuya@example.com",
    targetName: "Amina Msuya",
    title: "TANAPA Kilimanjaro & Serengeti Permits Approved",
    message:
      "Your 8-day Lemosho Gate summit permits and Northern Serengeti mobile camp reservations are officially cleared under KPAP Lead Guide Juma Kessy.",
    category: "permits",
    readBy: [],
    createdAt: "2026-11-16T08:30:00Z",
    actionLabel: "Download Updated PDF Invoice",
  },
  {
    id: "notif-seed-2",
    targetEmail: "*",
    targetName: "All Active Expedition Guests",
    title: "Pre-Departure Kit & Pulse Oximetry Briefing Live",
    message:
      "Please share your Kilimanjaro Airport (JRO) flight arrival time and cold-weather sleeping bag size inside Pre-Departure Notes so our Moshi warehouse can pack your crate.",
    category: "crew",
    readBy: [],
    createdAt: "2026-11-15T14:15:00Z",
  },
  {
    id: "notif-seed-3",
    targetEmail: "amina.msuya@example.com",
    targetName: "Amina Msuya",
    title: "Invoice KP-INV-2027-014 Published",
    message:
      "Your itemized cost breakdown including TANAPA conservation fees, KPAP crew allocation, and Coastal Aviation flights is ready to download as a branded PDF.",
    category: "invoice",
    readBy: ["amina.msuya@example.com"],
    createdAt: "2026-11-14T11:00:00Z",
  },
];

export const SITE_MEDIA_SLOTS: SiteMediaSlot[] = [
  {
    slotKey: "hero-backdrop",
    label: "Homepage Hero Backdrop",
    section: "Hero",
    defaultUrl: "/images/kilimanjaro-panorama.jpg",
    hint: "Full-width hero skyline behind TANZANIA headline",
  },
  {
    slotKey: "kili-card-1",
    label: "Kilimanjaro Summit Dawn",
    section: "Kilimanjaro Section",
    defaultUrl: "/images/kilimanjaro-summit-dawn.jpg",
    hint: "Left showcase card in Roof of Africa section",
  },
  {
    slotKey: "kili-card-2",
    label: "Kilimanjaro Mawenzi Ridge",
    section: "Kilimanjaro Section",
    defaultUrl: "/images/kilimanjaro-mawenzi-ridge.jpg",
    hint: "Right staggered card in Roof of Africa section",
  },
  {
    slotKey: "reel-01",
    label: "Reel 01 · Tarangire Baobabs",
    section: "Aerial Cinema Reel",
    defaultUrl: "/images/tarangire-baobabs-sunset.jpg",
    hint: "Chapter 01 of scroll-animated reel",
  },
  {
    slotKey: "reel-02",
    label: "Reel 02 · Serengeti River",
    section: "Aerial Cinema Reel",
    defaultUrl: "/images/serengeti-migration-river.jpg",
    hint: "Chapter 02 Mara Crossing frame",
  },
  {
    slotKey: "reel-03",
    label: "Reel 03 · Ngorongoro Crater",
    section: "Aerial Cinema Reel",
    defaultUrl: "/images/ngorongoro-crater.jpg",
    hint: "Chapter 03 caldera basin frame",
  },
  {
    slotKey: "reel-04",
    label: "Reel 04 · Uhuru Summit",
    section: "Aerial Cinema Reel",
    defaultUrl: "/images/kilimanjaro-summit-dawn.jpg",
    hint: "Chapter 04 summit glacial crest",
  },
  {
    slotKey: "reel-05",
    label: "Reel 05 · Zanzibar Dhow",
    section: "Aerial Cinema Reel",
    defaultUrl: "/images/inst-zanzibar-dhow.jpg",
    hint: "Chapter 05 coastal reef finale",
  },
  {
    slotKey: "inst-A",
    label: "Instrument A · Altitude Survey",
    section: "Field Instruments",
    defaultUrl: "/images/kilimanjaro-summit-dawn.jpg",
    hint: "Card 01 / ALTITUDE",
  },
  {
    slotKey: "inst-B",
    label: "Instrument B · 4x4 Land Cruiser",
    section: "Field Instruments",
    defaultUrl: "/images/inst-land-cruiser.jpg",
    hint: "Card 02 / FLEET",
  },
  {
    slotKey: "inst-C",
    label: "Instrument C · Great Migration",
    section: "Field Instruments",
    defaultUrl: "/images/serengeti-migration-river.jpg",
    hint: "Card 03 / ECOLOGY",
  },
  {
    slotKey: "inst-D",
    label: "Instrument D · KPAP Medical",
    section: "Field Instruments",
    defaultUrl: "/images/inst-kpap-medical.jpg",
    hint: "Card 04 / MEDICAL",
  },
  {
    slotKey: "inst-E",
    label: "Instrument E · Naturalist Optics",
    section: "Field Instruments",
    defaultUrl: "/images/inst-naturalist-optics.jpg",
    hint: "Card 05 / OPTICS",
  },
  {
    slotKey: "inst-F",
    label: "Instrument F · Zanzibar Reef",
    section: "Field Instruments",
    defaultUrl: "/images/inst-zanzibar-dhow.jpg",
    hint: "Card 06 / COAST",
  },
  ...NATIONAL_PARKS.map((p) => ({
    slotKey: `park-${p.slug}`,
    label: p.name,
    section: "National Parks Atlas",
    defaultUrl: p.image,
    hint: `${p.region} cover photograph`,
  })),
  ...EXPEDITION_ITINERARIES.map((e) => ({
    slotKey: `exp-${e.id}`,
    label: e.title,
    section: "Signature Expeditions",
    defaultUrl: e.image,
    hint: `${e.days}-Day itinerary cover`,
  })),
];
