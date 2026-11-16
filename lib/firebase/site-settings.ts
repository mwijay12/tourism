import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase/client";

export interface SiteControlSettings {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBackdrop: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementHref: string;
  whatsappNumber: string;
  contactEmail: string;
  seasonalModifierPct: number;
  showExpeditionReel: boolean;
  showInstrumentsSection: boolean;
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteControlSettings = {
  heroEyebrow: "ARUSHA · MOSHI · TANZANIA · 5,895 M",
  heroTitle: "TANZANIA",
  heroSubtitle:
    "Ascend the glacial crown of Mount Kilimanjaro, trace two million hooves across the Serengeti, and drift onto Zanzibar's coral reefs.",
  heroBackdrop: "/images/kilimanjaro-panorama.jpg",
  announcementEnabled: false,
  announcementText:
    "2026–2027 Lemosho & Great Migration Permits Open · Complimentary Arusha Chauffeur Transfer",
  announcementHref: "/inquire",
  whatsappNumber: "255792867427",
  contactEmail: "concierge@kiboplains.tz",
  seasonalModifierPct: 0,
  showExpeditionReel: true,
  showInstrumentsSection: true,
  updatedAt: "2026-11-16",
};

const STORAGE_KEY = "kp_site_controls_v1";

export function readSiteSettingsLocal(): SiteControlSettings {
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveSiteSettingsLocal(settings: SiteControlSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("kp-site-settings-updated", { detail: settings }));
  } catch {
    // ignore storage limits
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
      const merged = {
        ...DEFAULT_SITE_SETTINGS,
        ...(snap.data() as Partial<SiteControlSettings>),
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
