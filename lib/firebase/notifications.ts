import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  SEED_NOTIFICATIONS,
  type ClientNotification,
} from "@/lib/firebase/admin-types";

const NOTIF_STORAGE_KEY = "kp_client_notifications_v1";

export function readNotificationsLocal(): ClientNotification[] {
  if (typeof window === "undefined") return SEED_NOTIFICATIONS;
  try {
    const raw = window.localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) return SEED_NOTIFICATIONS;
    const parsed = JSON.parse(raw) as ClientNotification[];
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : SEED_NOTIFICATIONS;
  } catch {
    return SEED_NOTIFICATIONS;
  }
}

export function saveNotificationsLocal(list: ClientNotification[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent("kp-notifications-updated", { detail: list })
    );
  } catch {
    // ignore storage errors
  }
}

export async function fetchAllNotifications(): Promise<ClientNotification[]> {
  const local = readNotificationsLocal();
  if (!isFirebaseConfigured || typeof window === "undefined") return local;
  const fb = getFirebaseServices();
  if (!fb) return local;
  try {
    const snap = await getDocs(
      query(collection(fb.db, "notifications"), orderBy("createdAt", "desc"))
    );
    if (!snap.empty) {
      const list = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as ClientNotification
      );
      saveNotificationsLocal(list);
      return list;
    }
  } catch {
    // fallback to local
  }
  return local;
}

export function filterNotificationsForEmail(
  list: ClientNotification[],
  clientEmail?: string | null
): ClientNotification[] {
  if (!clientEmail) return list;
  const target = clientEmail.toLowerCase();
  return list.filter(
    (n) =>
      n.targetEmail === "*" || n.targetEmail.toLowerCase() === target
  );
}

export async function pushClientNotification(
  input: Omit<ClientNotification, "id" | "readBy" | "createdAt">
): Promise<{ notification: ClientNotification; cloudSaved: boolean }> {
  const notification: ClientNotification = {
    ...input,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    readBy: [],
    createdAt: new Date().toISOString(),
  };

  const current = readNotificationsLocal();
  const next = [notification, ...current];
  saveNotificationsLocal(next);

  const fb = getFirebaseServices();
  if (!fb) return { notification, cloudSaved: false };
  try {
    await setDoc(doc(fb.db, "notifications", notification.id), notification);
    return { notification, cloudSaved: true };
  } catch {
    return { notification, cloudSaved: false };
  }
}

export async function markNotificationReadByEmail(
  notificationId: string,
  clientEmail: string
): Promise<ClientNotification[]> {
  const emailLower = clientEmail.toLowerCase();
  const current = readNotificationsLocal();
  const next = current.map((n) => {
    if (n.id !== notificationId) return n;
    if (n.readBy.map((e) => e.toLowerCase()).includes(emailLower)) return n;
    return { ...n, readBy: [...n.readBy, emailLower] };
  });
  saveNotificationsLocal(next);

  const fb = getFirebaseServices();
  if (fb) {
    await updateDoc(doc(fb.db, "notifications", notificationId), {
      readBy: arrayUnion(emailLower),
    }).catch(() => undefined);
  }
  return next;
}

export async function markAllNotificationsReadByEmail(
  clientEmail: string
): Promise<ClientNotification[]> {
  const emailLower = clientEmail.toLowerCase();
  const current = readNotificationsLocal();
  const unread = current.filter(
    (n) =>
      (n.targetEmail === "*" ||
        n.targetEmail.toLowerCase() === emailLower) &&
      !n.readBy.map((e) => e.toLowerCase()).includes(emailLower)
  );
  const next = current.map((n) => {
    if (
      n.targetEmail !== "*" &&
      n.targetEmail.toLowerCase() !== emailLower
    ) {
      return n;
    }
    if (n.readBy.map((e) => e.toLowerCase()).includes(emailLower)) return n;
    return { ...n, readBy: [...n.readBy, emailLower] };
  });
  saveNotificationsLocal(next);

  const fb = getFirebaseServices();
  if (fb) {
    for (const item of unread) {
      await updateDoc(doc(fb.db, "notifications", item.id), {
        readBy: arrayUnion(emailLower),
      }).catch(() => undefined);
    }
  }
  return next;
}
