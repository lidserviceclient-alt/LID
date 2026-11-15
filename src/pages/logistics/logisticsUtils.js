// Constantes et formatteurs de la page Livraison (/logistics/*), partagés par les sous-pages.

export const CARRIERS_STORAGE_KEY = "lid.backoffice.shipping.carriers";
export const DEFAULT_CARRIERS = ["DHL Express", "La Poste", "Jumia Force"];

// Repli si le temps réel est coupé : la page se rafraîchit seule
export const POLL_MS = 60_000;
export const SEARCH_DEBOUNCE_MS = 350;
export const COLUMN_PREVIEW = 10;
export const BULK_MAX = 200;
export const PAGE_SIZES = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;
// Export : toutes les lignes du filtre courant, par pages de 500 (taille maximale de l'API)
export const EXPORT_PAGE_SIZE = 500;
export const EXPORT_MAX_ROWS = 10_000;
export const OTHER_COURIER = "__other__";

// Colonnes du suivi (valeurs attendues par `column` côté API)
export const COLUMNS = [
  { key: "TO_ASSIGN", countKey: "unassigned", label: "À affecter", tone: "border-amber-300 bg-amber-50/60 dark:bg-amber-500/5" },
  { key: "TO_PICKUP", countKey: "toPickup", label: "À récupérer", tone: "border-slate-300 bg-slate-50/60 dark:bg-slate-500/5" },
  { key: "IN_TRANSIT", countKey: "inTransit", label: "En livraison", tone: "border-blue-300 bg-blue-50/60 dark:bg-blue-500/5" },
  { key: "FAILED", countKey: "failed", label: "Échecs", tone: "border-rose-300 bg-rose-50/60 dark:bg-rose-500/5" },
  { key: "DELIVERED_TODAY", countKey: "deliveredToday", label: "Livrés aujourd'hui", tone: "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-500/5" }
];

export const LANE_BADGE = {
  UNASSIGNED: { label: "À affecter", cls: "bg-amber-500/15 text-amber-700" },
  TO_PICKUP: { label: "À récupérer", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  IN_TRANSIT: { label: "En livraison", cls: "bg-blue-500/15 text-blue-700" },
  FAILED: { label: "Échec", cls: "bg-rose-500/15 text-rose-700" },
  DELIVERED: { label: "Livré", cls: "bg-emerald-500/15 text-emerald-700" },
  IN_COLLECTION: { label: "En collecte (B)", cls: "bg-amber-500/15 text-amber-700" }
};

// Un seul libellé par statut, repris par les colonnes, les badges, le panneau et l'historique
export const STATUS_OPTIONS = [
  { value: "EN_PREPARATION", label: "À récupérer" },
  { value: "EN_COURS", label: "En livraison" },
  { value: "LIVREE", label: "Livré" },
  { value: "ECHEC", label: "Échec" }
];

export const SORT_OPTIONS = [
  { value: "urgency", label: "Urgence" },
  { value: "oldest", label: "Sans mouvement depuis longtemps" },
  { value: "newest", label: "Mouvement le plus récent" },
  { value: "created", label: "Création la plus récente" }
];

export const SOURCE_LABEL = {
  SYSTEM: "Système",
  BACKOFFICE: "Back-office",
  DELIVERY_APP: "App livreur",
  MIGRATION: "Migration"
};

export const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, number: 0 };
export const nf = new Intl.NumberFormat("fr-FR");

export function formatMoney(value) {
  if (value === null || value === undefined) return "-";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n))} FCFA`;
}

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

// Délai moyen : « — » seulement sans colis livré (null) ; 0 = livré tout de suite ; en heures sous 1 jour
export function formatAvgDelay(days) {
  const d = Number(days);
  if (days == null || !Number.isFinite(d)) return "—";
  if (d < 1) {
    const hours = d * 24;
    return hours < 1 ? "< 1 h" : `${nf.format(Math.round(hours))} h`;
  }
  return `${nf.format(Math.round(d * 10) / 10)} jours`;
}

export function formatIdle(minutes) {
  const m = Number(minutes) || 0;
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `il y a ${h} h${m % 60 ? ` ${m % 60}` : ""}`;
  return `il y a ${Math.floor(h / 24)} j`;
}

export function statusLabel(status) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label || status || "-";
}

export function shipperLabel(s) {
  return s?.shipperLabel || (s?.shipperType === "PARTNER" ? `Partenaire ${s?.shipperId || ""}`.trim() : "LID");
}

export function courierLabel(courier) {
  if (!courier) return "";
  const name = `${courier.firstName || ""} ${courier.lastName || ""}`.trim();
  return name || courier.email || courier.id;
}

// Code de remise (QR) : uniquement pour un colis non livré
export function qrValueOf(s) {
  if (!s || s.status === "LIVREE") return null;
  return s.handoffCode || (s.id ? `SHIP:${s.id}` : null);
}

export function buildQrUrl(data, size = 96) {
  const safe = String(data || "").trim();
  if (!safe) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(safe)}`;
}

export function loadCarriers() {
  try {
    const list = JSON.parse(localStorage.getItem(CARRIERS_STORAGE_KEY) || "null");
    if (!Array.isArray(list) || list.length === 0) return DEFAULT_CARRIERS;
    return list.map((x) => String(x)).filter(Boolean);
  } catch {
    return DEFAULT_CARRIERS;
  }
}

export function saveCarriers(carriers) {
  try {
    localStorage.setItem(CARRIERS_STORAGE_KEY, JSON.stringify(carriers));
  } catch {
    // stockage indisponible : la liste reste valable pour la session
  }
}

// Libellé affiché pour un colis : celui de sa colonne (« À affecter » est un EN_PREPARATION sans livreur)
export function laneLabel(lane, status) {
  return LANE_BADGE[lane]?.label || statusLabel(status);
}

/** Total des collectes option B encore ouvertes (badge de la sous-page Collectes). */
export function openCollectionsTotal(counts) {
  if (!counts) return 0;
  return ["toCollect", "assigned", "inTransit", "deposited", "anomalies"].reduce((acc, k) => acc + (Number(counts[k]) || 0), 0);
}

// ---- Filtres de la liste <-> paramètres d'URL (liens profonds partageables) ----

const COLUMN_KEYS = new Set(COLUMNS.map((c) => c.key));
const STATUS_KEYS = new Set(STATUS_OPTIONS.map((o) => o.value));
const SORT_KEYS = new Set(SORT_OPTIONS.map((o) => o.value));
const PREP_HOURS = [4, 12, 24, 48];
const TRANSIT_HOURS = [2, 4, 6, 12];

export const DEFAULT_FILTERS = {
  tab: "",
  status: "",
  carrier: "",
  lateOnly: false,
  courierFilter: "",
  q: "",
  sort: "urgency",
  page: 0,
  size: DEFAULT_PAGE_SIZE,
  prepHours: 24,
  transitHours: 6,
  view: "list"
};

/** Lit les filtres depuis une query string (valeurs inconnues ignorées). */
export function filtersFromSearch(search) {
  const p = new URLSearchParams(search || "");
  const out = { ...DEFAULT_FILTERS };
  const column = p.get("column") || p.get("tab");
  if (column && COLUMN_KEYS.has(column)) out.tab = column;
  const status = p.get("status");
  if (status && STATUS_KEYS.has(status)) out.status = status;
  if (p.get("carrier")) out.carrier = p.get("carrier");
  if (p.get("courier")) out.courierFilter = p.get("courier");
  if (["1", "true"].includes(p.get("late") || "")) out.lateOnly = true;
  if (p.get("q")) out.q = p.get("q").trim();
  const sort = p.get("sort");
  if (sort && SORT_KEYS.has(sort)) out.sort = sort;
  const page = Number(p.get("page"));
  if (Number.isInteger(page) && page > 0) out.page = page - 1; // page affichée (1-based) dans l'URL
  const size = Number(p.get("size"));
  if (PAGE_SIZES.includes(size)) out.size = size;
  const prep = Number(p.get("prep"));
  if (PREP_HOURS.includes(prep)) out.prepHours = prep;
  const transit = Number(p.get("transit"));
  if (TRANSIT_HOURS.includes(transit)) out.transitHours = transit;
  if (p.get("view") === "columns") out.view = "columns";
  return out;
}

/** Écrit les filtres non par défaut dans une query string (sans « ? »). */
export function filtersToSearch(f, { history = false } = {}) {
  const p = new URLSearchParams();
  if (!history && f.tab) p.set("column", f.tab);
  if (f.status) p.set("status", f.status);
  if (f.carrier) p.set("carrier", f.carrier);
  if (f.courierFilter) p.set("courier", f.courierFilter);
  if (f.lateOnly) p.set("late", "1");
  if (f.q) p.set("q", f.q);
  if (f.sort && f.sort !== DEFAULT_FILTERS.sort) p.set("sort", f.sort);
  if (f.page > 0) p.set("page", `${f.page + 1}`);
  if (f.size !== DEFAULT_FILTERS.size) p.set("size", `${f.size}`);
  if (f.prepHours !== DEFAULT_FILTERS.prepHours) p.set("prep", `${f.prepHours}`);
  if (f.transitHours !== DEFAULT_FILTERS.transitHours) p.set("transit", `${f.transitHours}`);
  if (!history && f.view === "columns") p.set("view", "columns");
  return p.toString();
}

export const PREP_HOUR_OPTIONS = PREP_HOURS;
export const TRANSIT_HOUR_OPTIONS = TRANSIT_HOURS;
