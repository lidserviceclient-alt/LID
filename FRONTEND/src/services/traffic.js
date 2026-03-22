import { doc, getDoc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const LOCAL_STORAGE_KEY = "lid_traffic_local_v1";

function safeJsonParse(value, fallback) {
  if (value === null || value === undefined) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatLocalDay(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalMonth(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

export function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;
  const consent = window.localStorage?.getItem?.("lid_cookie_consent") || "";
  const preferences = safeJsonParse(window.localStorage?.getItem?.("lid_cookie_preferences"), {});
  return consent === "all" || (consent === "custom" && Boolean(preferences?.analytics));
}

function readLocalStore() {
  if (typeof window === "undefined") return { daily: {}, monthly: {} };
  const raw = window.localStorage?.getItem?.(LOCAL_STORAGE_KEY);
  const parsed = safeJsonParse(raw, null);
  const daily = parsed?.daily && typeof parsed.daily === "object" ? parsed.daily : {};
  const monthly = parsed?.monthly && typeof parsed.monthly === "object" ? parsed.monthly : {};
  return { daily, monthly };
}

function writeLocalStore(store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem?.(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota / privacy mode
  }
}

function bumpLocalCounters(dayId, monthId) {
  const store = readLocalStore();
  store.daily[dayId] = (Number(store.daily[dayId]) || 0) + 1;
  store.monthly[monthId] = (Number(store.monthly[monthId]) || 0) + 1;
  writeLocalStore(store);
}

function resolveQueryHost() {
  if (typeof window === "undefined") return "";
  return (import.meta.env.VITE_TRAFFIC_HOST || window.location.host || "").trim();
}

function resolveTrackingHost() {
  if (typeof window === "undefined") return "";
  return (window.location.host || "").trim();
}

export async function trackTrafficHit({ path } = {}) {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const host = resolveTrackingHost();
  if (!host) return;

  const now = new Date();
  const dayId = formatLocalDay(now);
  const monthId = formatLocalMonth(now);

  bumpLocalCounters(dayId, monthId);

  try {
    await Promise.all([
      setDoc(
        doc(db, "traffic", host, "daily", dayId),
        { day: dayId, path: path || "/", count: increment(1), updatedAt: serverTimestamp() },
        { merge: true }
      ),
      setDoc(
        doc(db, "traffic", host, "monthly", monthId),
        { month: monthId, count: increment(1), updatedAt: serverTimestamp() },
        { merge: true }
      )
    ]);
  } catch {
    // Firestore might be disabled or blocked by rules; local counters are still updated.
  }
}

function buildDayIds(days) {
  const safeDays = Math.max(1, Number(days) || 1);
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (safeDays - 1));
  const ids = [];
  for (let i = 0; i < safeDays; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    ids.push(formatLocalDay(d));
  }
  return ids;
}

function buildMonthIds(months) {
  const safeMonths = Math.max(1, Number(months) || 1);
  const today = new Date();
  const ids = [];
  for (let i = safeMonths - 1; i >= 0; i -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    ids.push(formatLocalMonth(d));
  }
  return ids;
}

export async function fetchDailyTrafficSeries({ days = 7 } = {}) {
  const ids = buildDayIds(days);
  const host = resolveQueryHost();
  if (!host) {
    const local = readLocalStore();
    return ids.map((id) => Number(local.daily[id]) || 0);
  }

  try {
    const reads = await Promise.all(
      ids.map(async (id) => {
        const snap = await getDoc(doc(db, "traffic", host, "daily", id));
        return snap.exists() ? Number(snap.data()?.count) || 0 : 0;
      })
    );
    return reads;
  } catch {
    const local = readLocalStore();
    return ids.map((id) => Number(local.daily[id]) || 0);
  }
}

export async function fetchMonthlyTrafficSeries({ months = 12 } = {}) {
  const ids = buildMonthIds(months);
  const host = resolveQueryHost();
  if (!host) {
    const local = readLocalStore();
    return ids.map((id) => Number(local.monthly[id]) || 0);
  }

  try {
    const reads = await Promise.all(
      ids.map(async (id) => {
        const snap = await getDoc(doc(db, "traffic", host, "monthly", id));
        return snap.exists() ? Number(snap.data()?.count) || 0 : 0;
      })
    );
    return reads;
  } catch {
    const local = readLocalStore();
    return ids.map((id) => Number(local.monthly[id]) || 0);
  }
}

