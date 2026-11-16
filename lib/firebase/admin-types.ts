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

export interface IntegrationHealth {
  firebase: boolean;
  googleAuth: boolean;
  cloudinary: boolean;
  nodemailer: boolean;
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
