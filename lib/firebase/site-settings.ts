import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase/client";

export type SiteThemeId = "savanna" | "obsidian" | "serengeti" | "zanzibar";

export interface ThemeTokens {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  ring: string;
}

export interface SiteThemePreset {
  id: SiteThemeId;
  name: string;
  subtitle: string;
  swatches: [string, string, string];
  light: ThemeTokens;
  dark: ThemeTokens;
}

export const SITE_THEMES: Record<SiteThemeId, SiteThemePreset> = {
  savanna: {
    id: "savanna",
    name: "Savanna Emerald & Gold",
    subtitle: "Crisp papyrus cream, Kilimanjaro forest green, and safari gold.",
    swatches: ["#f3f8f5", "#145131", "#e5a853"],
    light: {
      background: "#f3f8f5",
      foreground: "#14211a",
      card: "#eaf3ee",
      cardForeground: "#14211a",
      primary: "#145131",
      primaryForeground: "#f3f8f5",
      secondary: "#e2eee7",
      secondaryForeground: "#14211a",
      muted: "#e6f0ea",
      mutedForeground: "#54665c",
      accent: "#b86f2d",
      accentForeground: "#f7f2ea",
      border: "#d4e3da",
      ring: "#2e7c52",
    },
    dark: {
      background: "#08100c",
      foreground: "#e2eee7",
      card: "#0e1c15",
      cardForeground: "#e2eee7",
      primary: "#62b388",
      primaryForeground: "#08100c",
      secondary: "#12241b",
      secondaryForeground: "#e2eee7",
      muted: "#112119",
      mutedForeground: "#8aa094",
      accent: "#d8914f",
      accentForeground: "#08100c",
      border: "#1a2c22",
      ring: "#62b388",
    },
  },
  obsidian: {
    id: "obsidian",
    name: "Crater Obsidian Luxury",
    subtitle: "Deep nocturnal volcanic slate and burnished Serengeti brass.",
    swatches: ["#090e0b", "#14201a", "#e5a853"],
    light: {
      background: "#0b110e",
      foreground: "#edf3ef",
      card: "#121c16",
      cardForeground: "#edf3ef",
      primary: "#e5a853",
      primaryForeground: "#0b110e",
      secondary: "#17261e",
      secondaryForeground: "#edf3ef",
      muted: "#142019",
      mutedForeground: "#9bb0a4",
      accent: "#62b388",
      accentForeground: "#0b110e",
      border: "#22342a",
      ring: "#e5a853",
    },
    dark: {
      background: "#060907",
      foreground: "#f0f5f2",
      card: "#0e1612",
      cardForeground: "#f0f5f2",
      primary: "#e5a853",
      primaryForeground: "#060907",
      secondary: "#15211a",
      secondaryForeground: "#f0f5f2",
      muted: "#111b16",
      mutedForeground: "#9bb0a4",
      accent: "#62b388",
      accentForeground: "#060907",
      border: "#1f3026",
      ring: "#e5a853",
    },
  },
  serengeti: {
    id: "serengeti",
    name: "Serengeti Terracotta & Sand",
    subtitle: "Warm sandstone, acacia earth clay, and golden-hour amber.",
    swatches: ["#faf3ea", "#9b3d1e", "#d4883e"],
    light: {
      background: "#faf3ea",
      foreground: "#261710",
      card: "#f2e7d8",
      cardForeground: "#261710",
      primary: "#9b3d1e",
      primaryForeground: "#faf3ea",
      secondary: "#eadbcc",
      secondaryForeground: "#261710",
      muted: "#ede0d0",
      mutedForeground: "#6d5245",
      accent: "#c87b2d",
      accentForeground: "#faf3ea",
      border: "#dfccb7",
      ring: "#9b3d1e",
    },
    dark: {
      background: "#160d09",
      foreground: "#f4eae0",
      card: "#22150f",
      cardForeground: "#f4eae0",
      primary: "#e48c58",
      primaryForeground: "#160d09",
      secondary: "#2b1b13",
      secondaryForeground: "#f4eae0",
      muted: "#261711",
      mutedForeground: "#b89c8d",
      accent: "#e5a853",
      accentForeground: "#160d09",
      border: "#362219",
      ring: "#e48c58",
    },
  },
  zanzibar: {
    id: "zanzibar",
    name: "Zanzibar Coastal Teal",
    subtitle: "Coral stone ivory, Pemba lagoon teal, and spice brass.",
    swatches: ["#f1f9fa", "#0b546c", "#de973e"],
    light: {
      background: "#f1f9fa",
      foreground: "#0d242c",
      card: "#e4f2f4",
      cardForeground: "#0d242c",
      primary: "#0b546c",
      primaryForeground: "#f1f9fa",
      secondary: "#d8eaed",
      secondaryForeground: "#0d242c",
      muted: "#deedf0",
      mutedForeground: "#496973",
      accent: "#c97e29",
      accentForeground: "#f8fbfc",
      border: "#c7dfe4",
      ring: "#0b546c",
    },
    dark: {
      background: "#071318",
      foreground: "#e4f2f5",
      card: "#0d1f26",
      cardForeground: "#e4f2f5",
      primary: "#58b7cc",
      primaryForeground: "#071318",
      secondary: "#122932",
      secondaryForeground: "#e4f2f5",
      muted: "#10232b",
      mutedForeground: "#89abb5",
      accent: "#e5a853",
      accentForeground: "#071318",
      border: "#1a3540",
      ring: "#58b7cc",
    },
  },
};

export interface SiteControlSettings {
  siteTheme: SiteThemeId;
  brandName: string;
  brandLogoUrl: string;
  brandTagline: string;
  navCtaLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackdrop: string;
  kilimanjaroTitle: string;
  kilimanjaroBody: string;
  parksTitle: string;
  expeditionsTitle: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementHref: string;
  whatsappNumber: string;
  contactEmail: string;
  seasonalModifierPct: number;
  showExpeditionReel: boolean;
  showInstrumentsSection: boolean;
  imageOverrides: Record<string, string>;
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteControlSettings = {
  siteTheme: "savanna",
  brandName: "Kibo & Plains",
  brandLogoUrl: "",
  brandTagline:
    "Bespoke Mount Kilimanjaro expeditions, private Northern & Southern Circuit safaris, and Zanzibar island escapes crafted in Arusha, Tanzania · Digital system engineered by Altraware Technology.",
  navCtaLabel: "Book Safari",
  heroEyebrow: "ARUSHA · MOSHI · TANZANIA · 5,895 M",
  heroTitle: "TANZANIA",
  heroSubtitle:
    "Ascend the glacial crown of Mount Kilimanjaro, trace two million hooves across the Serengeti, and drift onto Zanzibar's coral reefs.",
  heroBackdrop: "/images/kilimanjaro-panorama.jpg",
  kilimanjaroTitle: "Five ecosystems in a single footstep journey.",
  kilimanjaroBody:
    "Rising 5,895 meters directly above northern Tanzania’s acacia plains, Mount Kilimanjaro is Earth’s highest free-standing peak. Our Chagga-led expeditions prioritize slow acclimatization—pole pole—along the scenic Lemosho and 360° Northern Circuit trails.",
  parksTitle: "From volcanic craters to coral reefs.",
  expeditionsTitle: "Signature Tanzania expeditions.",
  announcementEnabled: false,
  announcementText:
    "2026–2027 Lemosho & Great Migration Permits Open · Complimentary Arusha Chauffeur Transfer",
  announcementHref: "/inquire",
  whatsappNumber: "255792867427",
  contactEmail: "concierge@kiboplains.tz",
  seasonalModifierPct: 0,
  showExpeditionReel: true,
  showInstrumentsSection: true,
  imageOverrides: {},
  updatedAt: "2026-11-17",
};

const STORAGE_KEY = "kp_site_controls_v1";

export function resolveSiteMedia(
  settings: SiteControlSettings,
  slotKey: string,
  fallbackUrl: string
): string {
  const override = settings.imageOverrides?.[slotKey];
  if (override && override.trim().length > 0) return override.trim();
  if (slotKey === "hero-backdrop" && settings.heroBackdrop) {
    return settings.heroBackdrop;
  }
  return fallbackUrl;
}

export function applySiteThemeTokens(themeId: SiteThemeId, isDark: boolean): void {
  if (typeof document === "undefined") return;
  const preset = SITE_THEMES[themeId] ?? SITE_THEMES.savanna;
  const tokens = isDark ? preset.dark : preset.light;
  const root = document.documentElement;
  root.setAttribute("data-site-theme", preset.id);

  root.style.setProperty("--background", tokens.background);
  root.style.setProperty("--foreground", tokens.foreground);
  root.style.setProperty("--card", tokens.card);
  root.style.setProperty("--card-foreground", tokens.cardForeground);
  root.style.setProperty("--primary", tokens.primary);
  root.style.setProperty("--primary-foreground", tokens.primaryForeground);
  root.style.setProperty("--secondary", tokens.secondary);
  root.style.setProperty("--secondary-foreground", tokens.secondaryForeground);
  root.style.setProperty("--muted", tokens.muted);
  root.style.setProperty("--muted-foreground", tokens.mutedForeground);
  root.style.setProperty("--accent", tokens.accent);
  root.style.setProperty("--accent-foreground", tokens.accentForeground);
  root.style.setProperty("--border", tokens.border);
  root.style.setProperty("--ring", tokens.ring);
}

export function readSiteSettingsLocal(): SiteControlSettings {
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<SiteControlSettings>;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
      imageOverrides: {
        ...DEFAULT_SITE_SETTINGS.imageOverrides,
        ...(parsed.imageOverrides || {}),
      },
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveSiteSettingsLocal(settings: SiteControlSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent("kp-site-settings-updated", { detail: settings })
    );
  } catch {
    // ignore storage quota errors
  }
}

export async function fetchSiteSettingsRemote(): Promise<SiteControlSettings> {
  const local = readSiteSettingsLocal();
  if (!isFirebaseConfigured || typeof window === "undefined") return local;
  const fb = getFirebaseServices();
  if (!fb) return local;
  try {
    const snap = await getDoc(doc(fb.db, "site_config", "live"));
    if (snap.exists()) {
      const remote = snap.data() as Partial<SiteControlSettings>;
      const merged: SiteControlSettings = {
        ...DEFAULT_SITE_SETTINGS,
        ...remote,
        imageOverrides: {
          ...DEFAULT_SITE_SETTINGS.imageOverrides,
          ...(remote.imageOverrides || {}),
        },
      };
      saveSiteSettingsLocal(merged);
      return merged;
    }
  } catch {
    // fallback to local
  }
  return local;
}

export async function saveSiteSettingsRemote(
  settings: SiteControlSettings
): Promise<{ cloudSaved: boolean }> {
  saveSiteSettingsLocal(settings);
  const fb = getFirebaseServices();
  if (!fb) return { cloudSaved: false };
  try {
    await setDoc(doc(fb.db, "site_config", "live"), settings, { merge: true });
    return { cloudSaved: true };
  } catch {
    return { cloudSaved: false };
  }
}
