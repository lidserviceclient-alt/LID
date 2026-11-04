import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  History,
  List,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings2,
  Truck
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ShippingLabel from "../components/ShippingLabel.jsx";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Drawer from "../components/ui/Drawer.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { backofficeApi } from "../services/api.js";
import { subscribeBackofficeRealtime } from "../services/realtime.js";

const CARRIERS_STORAGE_KEY = "lid.backoffice.shipping.carriers";
const DEFAULT_CARRIERS = ["DHL Express", "La Poste", "Jumia Force"];

// Repli si le temps réel est coupé : la page se rafraîchit seule
const POLL_MS = 60_000;
const SEARCH_DEBOUNCE_MS = 350;
const COLUMN_PREVIEW = 10;
const BULK_MAX = 50;
const PAGE_SIZES = [10, 20, 50, 100];
// Export : toutes les lignes du filtre courant, par pages de 500 (taille maximale de l'API)
const EXPORT_PAGE_SIZE = 500;
const EXPORT_MAX_ROWS = 10_000;
const OTHER_COURIER = "__other__";

// Colonnes du suivi (valeurs attendues par `column` côté API)
const COLUMNS = [
  { key: "TO_ASSIGN", countKey: "unassigned", label: "À affecter", tone: "border-amber-300 bg-amber-50/60 dark:bg-amber-500/5" },
  { key: "TO_PICKUP", countKey: "toPickup", label: "À récupérer", tone: "border-slate-300 bg-slate-50/60 dark:bg-slate-500/5" },
  { key: "IN_TRANSIT", countKey: "inTransit", label: "En livraison", tone: "border-blue-300 bg-blue-50/60 dark:bg-blue-500/5" },
  { key: "FAILED", countKey: "failed", label: "Échecs", tone: "border-rose-300 bg-rose-50/60 dark:bg-rose-500/5" },
  { key: "DELIVERED_TODAY", countKey: "deliveredToday", label: "Livrés aujourd'hui", tone: "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-500/5" }
];

const LANE_BADGE = {
  UNASSIGNED: { label: "À affecter", cls: "bg-amber-500/15 text-amber-700" },
  TO_PICKUP: { label: "À récupérer", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  IN_TRANSIT: { label: "En livraison", cls: "bg-blue-500/15 text-blue-700" },
  FAILED: { label: "Échec", cls: "bg-rose-500/15 text-rose-700" },
  DELIVERED: { label: "Livré", cls: "bg-emerald-500/15 text-emerald-700" }
};

// Un seul libellé par statut, repris par les colonnes, les badges, le panneau et l'historique
const STATUS_OPTIONS = [
  { value: "EN_PREPARATION", label: "À récupérer" },
  { value: "EN_COURS", label: "En livraison" },
  { value: "LIVREE", label: "Livré" },
  { value: "ECHEC", label: "Échec" }
];

const SOURCE_LABEL = {
  SYSTEM: "Système",
  BACKOFFICE: "Back-office",
  DELIVERY_APP: "App livreur",
  MIGRATION: "Migration"
};

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, number: 0 };
const nf = new Intl.NumberFormat("fr-FR");

function formatMoney(value) {
  if (value === null || value === undefined) return "-";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n))} FCFA`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

// Délai moyen : « — » seulement sans colis livré (null) ; 0 = livré tout de suite ; en heures sous 1 jour
function formatAvgDelay(days) {
  const d = Number(days);
  if (days == null || !Number.isFinite(d)) return "—";
  if (d < 1) {
    const hours = d * 24;
    return hours < 1 ? "< 1 h" : `${nf.format(Math.round(hours))} h`;
  }
  return `${nf.format(Math.round(d * 10) / 10)} jours`;
}

function formatIdle(minutes) {
  const m = Number(minutes) || 0;
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `il y a ${h} h${m % 60 ? ` ${m % 60}` : ""}`;
  return `il y a ${Math.floor(h / 24)} j`;
}

function statusLabel(status) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label || status || "-";
}

function shipperLabel(s) {
  return s?.shipperLabel || (s?.shipperType === "PARTNER" ? `Partenaire ${s?.shipperId || ""}`.trim() : "LID");
}

function courierLabel(courier) {
  if (!courier) return "";
  const name = `${courier.firstName || ""} ${courier.lastName || ""}`.trim();
  return name || courier.email || courier.id;
}

// Code de remise (QR) : uniquement pour un colis non livré
function qrValueOf(s) {
  if (!s || s.status === "LIVREE") return null;
  return s.handoffCode || (s.id ? `SHIP:${s.id}` : null);
}

function buildQrUrl(data, size = 96) {
  const safe = String(data || "").trim();
  if (!safe) return null;
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(safe)}`;
}

function loadCarriers() {
  try {
    const list = JSON.parse(localStorage.getItem(CARRIERS_STORAGE_KEY) || "null");
    if (!Array.isArray(list) || list.length === 0) return DEFAULT_CARRIERS;
    return list.map((x) => String(x)).filter(Boolean);
  } catch {
    return DEFAULT_CARRIERS;
  }
}

function saveCarriers(carriers) {
  try {
    localStorage.setItem(CARRIERS_STORAGE_KEY, JSON.stringify(carriers));
  } catch {
    // stockage indisponible : la liste reste valable pour la session
  }
}

// Libellé affiché pour un colis : celui de sa colonne (« À affecter » est un EN_PREPARATION sans livreur)
function laneLabel(lane, status) {
  return LANE_BADGE[lane]?.label || statusLabel(status);
}

function LaneBadge({ lane, status }) {
  const badge = LANE_BADGE[lane] || { label: statusLabel(status), cls: "bg-muted text-foreground" };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}
      title={`Statut : ${badge.label}`}
    >
      {badge.label}
    </span>
  );
}

function LateBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
      <AlertTriangle className="h-3 w-3" /> Retard
    </span>
  );
}

// Carte compacte de la vue colonnes (limitée aux premiers colis de chaque colonne)
function ShipmentCard({ item, onOpen }) {
  const s = item.shipment || {};
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-lg border border-border bg-background p-2.5 text-left shadow-sm transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">{s.orderId || `#${s.id}`}</p>
        {item.late ? <LateBadge /> : null}
      </div>
      <p className="mt-0.5 truncate text-xs text-foreground">{s.customerName || "Client"}</p>
      <p className="truncate text-[11px] text-muted-foreground">
        {s.courierName || s.courierUser || "Non affecté"} · {formatIdle(item.idleMinutes)}
      </p>
    </button>
  );
}

function Tile({ label, value, active, alert, onClick, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border bg-card px-3 py-2.5 text-left transition ${
        active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
      }`}
    >
      <p className="flex items-center gap-1 truncate text-[11px] uppercase tracking-wider text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </p>
      <p className={`text-xl font-bold ${alert ? "text-rose-600" : "text-foreground"}`}>{value}</p>
    </button>
  );
}

export default function Logistics() {
  // Synthèse du suivi (compteurs, charge des livreurs) et indicateurs historiques (délai, coût, dernières livraisons)
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [kpis, setKpis] = useState({ avgDelayDays: null, avgCost: 0 });
  const [delivered, setDelivered] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [companyInfo, setCompanyInfo] = useState(null);

  // Filtres (tous appliqués côté serveur)
  const [history, setHistory] = useState(false); // false = colis du suivi ; true = historique complet
  const [tab, setTab] = useState(""); // colonne du suivi ("" = tous)
  const [status, setStatus] = useState("");
  const [carrier, setCarrier] = useState("");
  const [lateOnly, setLateOnly] = useState(false);
  const [courierFilter, setCourierFilter] = useState(""); // "" | UNASSIGNED | email
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("urgency");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [prepHours, setPrepHours] = useState(24);
  const [transitHours, setTransitHours] = useState(6);
  const [view, setView] = useState("list"); // list | columns
  const [showLoad, setShowLoad] = useState(false);

  const [pageData, setPageData] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [colData, setColData] = useState({});
  const [colLoading, setColLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  // Sélection multiple (id -> référence), affectation en lot séquentielle
  const [checked, setChecked] = useState(() => new Map());
  const [bulkCourier, setBulkCourier] = useState("");
  const [bulk, setBulk] = useState(null);

  // Panneau latéral du colis
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineError, setTimelineError] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [assignOther, setAssignOther] = useState("");
  const [depotReason, setDepotReason] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [actionBusy, setActionBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");

  // Transporteurs (liste locale au navigateur)
  const [carriers, setCarriers] = useState(() => loadCarriers());
  const [isCarriersOpen, setIsCarriersOpen] = useState(false);
  const [newCarrier, setNewCarrier] = useState("");

  // Nouvelle expédition
  const [isShipmentOpen, setIsShipmentOpen] = useState(false);
  const [shipmentSaving, setShipmentSaving] = useState(false);
  const [shipmentError, setShipmentError] = useState("");
  const [shipmentForm, setShipmentForm] = useState({
    orderId: "",
    carrier: "",
    trackingId: "",
    status: "EN_PREPARATION",
    eta: "",
    cost: ""
  });

  // QR code de remise
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalValue, setQrModalValue] = useState("");
  const [qrModalTitle, setQrModalTitle] = useState("");
  const [qrCopyState, setQrCopyState] = useState("");

  // Impression de la facture / étiquette
  const [printOrder, setPrintOrder] = useState(null);
  const labelRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: labelRef,
    documentTitle: printOrder ? `Invoice-${printOrder.orderNumber || printOrder.orderId}` : "Invoice",
    onAfterPrint: () => setPrintOrder(null)
  });

  useEffect(() => {
    if (printOrder) handlePrint();
  }, [printOrder, handlePrint]);

  const listSeq = useRef(0);
  const colSeq = useRef(0);
  const refreshRef = useRef(() => {});

  // Recherche : debounce, retour en première page
  useEffect(() => {
    const timer = setTimeout(() => setQ(qInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [qInput]);

  useEffect(() => {
    setPage(0);
    setChecked(new Map());
  }, [q]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await backofficeApi.deliveryBoardSummary({
        preparationAlertHours: prepHours,
        transitAlertHours: transitHours
      });
      setSummary(data || null);
      setSummaryError("");
      setUpdatedAt(new Date());
    } catch (err) {
      setSummaryError(err?.message || "Impossible de charger le suivi des livraisons.");
    }
  }, [prepHours, transitHours]);

  // Indicateurs sur 30 jours, profil boutique (impression) et 10 dernières livraisons clôturées
  const loadOverview = useCallback(async () => {
    try {
      const data = await backofficeApi.logisticsCollection({
        days: 30,
        page: 0,
        size: 1,
        deliveredPage: 0,
        deliveredSize: 10,
        deliveredStatus: "LIVREE"
      });
      setDelivered(Array.isArray(data?.delivered) ? data.delivered : []);
      setCompanyInfo(data?.appConfig || null);
      setKpis({
        avgDelayDays: Number.isFinite(Number(data?.kpis?.avgDelayDays)) && data?.kpis?.avgDelayDays != null ? Number(data.kpis.avgDelayDays) : null,
        avgCost: data?.kpis?.avgCost ?? 0
      });
      setOverviewError("");
    } catch (err) {
      setOverviewError(err?.message || "Impossible de charger les indicateurs.");
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const baseParams = useMemo(
    () => ({
      history: history || undefined,
      status: status || undefined,
      carrier: carrier || undefined,
      courier: courierFilter || undefined,
      late: lateOnly || undefined,
      q: q || undefined,
      preparationAlertHours: prepHours,
      transitAlertHours: transitHours
    }),
    [history, status, carrier, courierFilter, lateOnly, q, prepHours, transitHours]
  );

  const listParams = useMemo(
    () => ({ ...baseParams, column: history ? undefined : tab || undefined, sort }),
    [baseParams, history, tab, sort]
  );

  // Liste paginée : on garde l'affichage précédent pendant le rechargement (pas de saut de défilement)
  const loadList = useCallback(async () => {
    const seq = ++listSeq.current;
    setListLoading(true);
    try {
      const data = await backofficeApi.deliveryBoardShipments({ ...listParams, page, size });
      if (seq !== listSeq.current) return;
      setPageData(data || EMPTY_PAGE);
      setListError("");
      // La dernière page a pu se vider (colis traités) : on revient à la dernière page existante
      if ((data?.content?.length || 0) === 0 && (data?.totalPages || 0) > 0 && page > 0) {
        setPage(Math.max(0, data.totalPages - 1));
      }
    } catch (err) {
      if (seq !== listSeq.current) return;
      setListError(err?.message || "Impossible de charger la liste des colis.");
    } finally {
      if (seq === listSeq.current) setListLoading(false);
    }
  }, [listParams, page, size]);

  // Vue colonnes : les COLUMN_PREVIEW premiers colis (par urgence) de chaque colonne du suivi
  const loadColumns = useCallback(async () => {
    const seq = ++colSeq.current;
    setColLoading(true);
    try {
      const results = await Promise.all(
        COLUMNS.map((col) =>
          backofficeApi.deliveryBoardShipments({
            ...baseParams,
            history: undefined,
            column: col.key,
            page: 0,
            size: COLUMN_PREVIEW,
            sort: "urgency"
          })
        )
      );
      if (seq !== colSeq.current) return;
      setColData(Object.fromEntries(COLUMNS.map((col, i) => [col.key, results[i] || EMPTY_PAGE])));
      setListError("");
    } catch (err) {
      if (seq !== colSeq.current) return;
      setListError(err?.message || "Impossible de charger les colonnes.");
    } finally {
      if (seq === colSeq.current) setColLoading(false);
    }
  }, [baseParams]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (view === "list") loadList();
  }, [view, loadList]);

  useEffect(() => {
    if (view === "columns") loadColumns();
  }, [view, loadColumns]);

  refreshRef.current = () => {
    loadSummary();
    loadOverview();
    if (view === "list") loadList();
    else loadColumns();
  };

  // Temps réel : chaque transition de colis publie « shipment:<déclencheur> » ; filtres/page conservés
  useEffect(() => {
    let timer;
    const unsubscribe = subscribeBackofficeRealtime((event) => {
      if (event?.topic !== "backoffice.overview.updated") return;
      const reason = `${event?.payload?.reason || event?.reason || ""}`.trim().toLowerCase();
      if (!reason.startsWith("shipment:")) return;
      clearTimeout(timer);
      timer = setTimeout(() => refreshRef.current(), 400);
    }, ["backoffice.overview.updated"]);
    const poll = setInterval(() => {
      if (document.visibilityState === "visible") refreshRef.current();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshRef.current();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
      unsubscribe();
    };
  }, []);

  const items = useMemo(() => (Array.isArray(pageData?.content) ? pageData.content : []), [pageData]);
  const couriers = useMemo(() => (Array.isArray(summary?.couriers) ? summary.couriers : []), [summary]);
  const activeCouriers = useMemo(() => couriers.filter((c) => c.active && c.email), [couriers]);
  const counts = summary?.counts || {};
  const totalOpen = COLUMNS.reduce((acc, col) => acc + (Number(counts[col.countKey]) || 0), 0);
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;
  const hasFilter = Boolean(history || tab || status || carrier || lateOnly || courierFilter || q);

  // Le panneau suit la page courante quand le colis y figure encore, sinon la dernière version connue
  const selected = useMemo(() => {
    if (!selectedId) return null;
    const fromPage = items.find((item) => `${item.shipment?.id}` === `${selectedId}`);
    if (fromPage) return fromPage;
    for (const col of COLUMNS) {
      const hit = (colData[col.key]?.content || []).find((item) => `${item.shipment?.id}` === `${selectedId}`);
      if (hit) return hit;
    }
    return selectedItem;
  }, [items, colData, selectedId, selectedItem]);

  const loadTimeline = useCallback(async (id) => {
    if (!id) return;
    try {
      const list = await backofficeApi.shipmentTimeline(id);
      setTimeline(Array.isArray(list) ? list : []);
      setTimelineError("");
    } catch (err) {
      setTimelineError(err?.message || "Historique indisponible.");
    }
  }, []);

  // L'historique suit le suivi : rechargé à chaque mise à jour reçue
  useEffect(() => {
    if (selectedId) loadTimeline(selectedId);
  }, [selectedId, updatedAt, loadTimeline]);

  function openShipment(item) {
    setSelectedId(item.shipment?.id);
    setSelectedItem(item);
    setTimeline([]);
    setAssignTo("");
    setAssignOther("");
    setDepotReason("");
    setCustomerMessage(item.shipment?.customerFacingComment || "");
    setActionError("");
    setActionInfo("");
  }

  function resetSelection() {
    setChecked(new Map());
    setBulk(null);
  }

  function resetPaging() {
    setPage(0);
    resetSelection();
  }

  // Tuiles : une colonne du suivi, ou l'historique complet
  function showTab(next) {
    setView("list");
    setHistory(false);
    setTab(next);
    setStatus(""); // une tuile remplace la précédente : pas de cumul avec le filtre de statut
    resetPaging();
  }

  function showHistory() {
    setView("list");
    setHistory(true);
    setTab("");
    if (sort === "urgency") setSort("created");
    resetPaging();
  }

  function showColumns() {
    setView("columns");
    setHistory(false);
  }

  function toggleLate() {
    setLateOnly((v) => !v);
    resetPaging();
  }

  function changeCourier(value) {
    setCourierFilter(value);
    resetPaging();
  }

  function resetFilters() {
    setQInput("");
    setQ("");
    setStatus("");
    setCarrier("");
    setLateOnly(false);
    setCourierFilter("");
    setSort("urgency");
    showTab("");
  }

  async function runAction(key, action, successMessage) {
    setActionBusy(key);
    setActionError("");
    setActionInfo("");
    try {
      const result = await action();
      setActionInfo(successMessage);
      if (result && typeof result === "object" && result.id) {
        setSelectedItem((prev) => (prev ? { ...prev, shipment: { ...prev.shipment, ...result } } : prev));
      }
      refreshRef.current();
    } catch (err) {
      setActionError(err?.message || "Action impossible.");
    } finally {
      setActionBusy("");
    }
  }

  function assignRequest(id, courier) {
    return backofficeApi.assignShipmentCourier(id, {
      courierUser: courier.email,
      courierName: courierLabel(courier),
      courierPhone: courier.phoneNumber || undefined
    });
  }

  function assignCourier() {
    if (!selected) return;
    const id = selected.shipment.id;
    if (assignTo === OTHER_COURIER) {
      // Saisie libre (compte livreur hors liste) : le serveur complète nom et téléphone si le compte existe
      const email = assignOther.trim();
      if (!email) return;
      runAction("assign", () => backofficeApi.assignShipmentCourier(id, { courierUser: email }), `Colis affecté à ${email}.`);
      return;
    }
    const courier = activeCouriers.find((c) => c.email === assignTo);
    if (!courier) return;
    runAction("assign", () => assignRequest(id, courier), `Colis affecté à ${courierLabel(courier)}.`);
  }

  const selectableOnPage = items.filter((item) => item.shipment?.status !== "LIVREE");
  const allPageChecked = selectableOnPage.length > 0 && selectableOnPage.every((item) => checked.has(item.shipment.id));

  function toggleChecked(item) {
    const id = item.shipment.id;
    setChecked((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < BULK_MAX) next.set(id, item.shipment.orderId || `#${id}`);
      return next;
    });
  }

  function togglePage() {
    setChecked((prev) => {
      const next = new Map(prev);
      if (allPageChecked) {
        selectableOnPage.forEach((item) => next.delete(item.shipment.id));
      } else {
        for (const item of selectableOnPage) {
          if (next.size >= BULK_MAX) break;
          next.set(item.shipment.id, item.shipment.orderId || `#${item.shipment.id}`);
        }
      }
      return next;
    });
  }

  // Aucune API de lot : appels séquentiels (un à la fois), résumé réussite/échec
  async function bulkAssign() {
    const courier = activeCouriers.find((c) => c.email === bulkCourier);
    if (!courier || checked.size === 0 || bulk?.running) return;
    const entries = [...checked.entries()];
    const failures = [];
    let ok = 0;
    setBulk({ running: true, done: 0, total: entries.length, ok: 0, failures: [], courier: courierLabel(courier) });
    for (let i = 0; i < entries.length; i += 1) {
      const [id, ref] = entries[i];
      try {
        await assignRequest(id, courier);
        ok += 1;
      } catch (err) {
        failures.push({ id, ref, message: err?.message || "Échec" });
      }
      setBulk({ running: true, done: i + 1, total: entries.length, ok, failures: [...failures], courier: courierLabel(courier) });
    }
    setBulk({ running: false, done: entries.length, total: entries.length, ok, failures, courier: courierLabel(courier) });
    setChecked(new Map(failures.map((f) => [f.id, f.ref])));
    refreshRef.current();
  }

  async function initPrint(shipmentId) {
    try {
      const details = await backofficeApi.shipment(shipmentId);
      setPrintOrder({
        ...details,
        id: details.orderNumber || details.orderId,
        orderNumber: details.orderNumber || details.orderId,
        trackingId: details.trackingId,
        createdAt: details.scannedAt || new Date().toISOString(),
        customerName: details.customerName,
        shippingAddress: details.customerAddress,
        phone: details.customerPhone,
        carrier: details.carrier,
        weight: "1.2 kg",
        handoffCode: details.handoffCode,
        qrValue: details.handoffCode || `SHIP:${details.id}`
      });
    } catch (e) {
      console.error("Failed to fetch shipment details for print", e);
    }
  }

  async function copyToClipboard(value) {
    const text = String(value || "").trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setQrCopyState("Copié");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        setQrCopyState("Copié");
      } catch {
        setQrCopyState("Impossible");
      }
    }
  }

  function openQrModal(value, title) {
    setQrModalValue(String(value || "").trim());
    setQrModalTitle(String(title || "").trim());
    setQrCopyState("");
    setQrModalOpen(true);
  }

  function closeQrModal() {
    setQrModalOpen(false);
    setQrModalValue("");
    setQrModalTitle("");
    setQrCopyState("");
  }

  function openShipmentModal() {
    setShipmentError("");
    setIsShipmentOpen(true);
    setShipmentForm({ orderId: "", carrier: carrier || "", trackingId: "", status: "EN_PREPARATION", eta: "", cost: "" });
  }

  function closeShipmentModal() {
    if (shipmentSaving) return;
    setIsShipmentOpen(false);
    setShipmentError("");
  }

  async function saveShipment() {
    if (!shipmentForm.orderId.trim()) {
      setShipmentError("ID de commande requis.");
      return;
    }
    const payload = {
      orderId: shipmentForm.orderId.trim(),
      carrier: shipmentForm.carrier || null,
      trackingId: shipmentForm.trackingId || null,
      status: shipmentForm.status,
      eta: shipmentForm.eta ? shipmentForm.eta : null,
      cost: shipmentForm.cost !== "" ? Number(shipmentForm.cost) : null
    };
    if (payload.cost !== null && (!Number.isFinite(payload.cost) || payload.cost < 0)) {
      setShipmentError("Coût invalide.");
      return;
    }
    setShipmentSaving(true);
    setShipmentError("");
    try {
      await backofficeApi.upsertShipment(payload);
      refreshRef.current();
      setIsShipmentOpen(false);
    } catch (err) {
      setShipmentError(err?.message || "Impossible d’enregistrer l’expédition.");
    } finally {
      setShipmentSaving(false);
    }
  }

  // Export CSV de toutes les lignes du filtre courant (pas seulement la page affichée)
  async function exportShipmentsCsv() {
    setExporting(true);
    setExportError("");
    try {
      const all = [];
      for (let p = 0; all.length < EXPORT_MAX_ROWS; p += 1) {
        const data = await backofficeApi.deliveryBoardShipments({ ...listParams, page: p, size: EXPORT_PAGE_SIZE });
        const content = Array.isArray(data?.content) ? data.content : [];
        all.push(...content);
        if (content.length < EXPORT_PAGE_SIZE || p + 1 >= (data?.totalPages || 0)) break;
      }
      const header = [
        "Tracking ID", "Commande", "Expéditeur", "Client", "Adresse livraison", "Livreur",
        "Transporteur", "Statut", "ETA", "Coût", "Dernier mouvement", "En retard"
      ];
      const csvRows = [
        header.join(";"),
        ...all.slice(0, EXPORT_MAX_ROWS).map((item) => {
          const s = item.shipment || {};
          return [
            s.trackingId || "-", s.orderId || "-", shipperLabel(s), s.customerName || "-", s.customerAddress || "-",
            s.courierName || s.courierUser || "-", s.carrier || "-", statusLabel(s.status), formatDateTime(s.eta),
            formatMoney(s.cost), formatDateTime(s.lastActivityAt), item.late ? "Oui" : "Non"
          ]
            .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
            .join(";");
        })
      ];
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expeditions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err?.message || "Export impossible.");
    } finally {
      setExporting(false);
    }
  }

  function persistCarriers(next) {
    const cleaned = Array.from(new Set(next.map((x) => String(x).trim()).filter(Boolean)));
    setCarriers(cleaned);
    saveCarriers(cleaned);
  }

  const s = selected?.shipment || {};
  const isOpen = Boolean(selected);
  const error = summaryError || listError;
  const busy = listLoading || colLoading;
  const selectedQr = qrValueOf(s);
  const listTitle = history
    ? "Historique complet des expéditions"
    : tab
      ? COLUMNS.find((c) => c.key === tab)?.label
      : "Colis du suivi (en cours et livrés du jour)";

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Logistique & Livraison"
        subtitle={
          updatedAt
            ? `Suivi des expéditions et performance transporteurs · mis à jour à ${new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(updatedAt)}, actualisation automatique`
            : "Suivi des expéditions et performance transporteurs."
        }
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => refreshRef.current()} disabled={busy}>
              <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setIsCarriersOpen(true)}>
              <Settings2 className="h-4 w-4" />
              Configurer transporteurs
            </Button>
            <Button className="gap-2" onClick={openShipmentModal}>
              <Plus className="h-4 w-4" />
              Nouvelle expédition
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{summary || pageData ? `Dernière actualisation impossible : ${error}` : error}</span>
          <Button variant="outline" size="sm" onClick={() => refreshRef.current()}>
            Réessayer
          </Button>
        </div>
      ) : null}

      {/* Compteurs cliquables = onglets de la liste */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        <Tile label="Tous" value={nf.format(totalOpen)} active={!history && tab === ""} onClick={() => showTab("")} />
        {COLUMNS.map((col) => {
          const value = Number(counts[col.countKey]) || 0;
          return (
            <Tile
              key={col.key}
              label={col.label}
              value={nf.format(value)}
              active={!history && tab === col.key}
              alert={col.key === "FAILED" && value > 0}
              onClick={() => showTab(col.key)}
            />
          );
        })}
        <Tile
          label="Historique"
          icon={History}
          value={history && pageData ? nf.format(totalElements) : "Tout"}
          active={history}
          onClick={showHistory}
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Card className="flex items-baseline justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Délai moyen</p>
            <p className="text-xs text-muted-foreground">Livraisons clôturées sur 30 jours</p>
          </div>
          <p className="text-xl font-bold text-foreground">{overviewLoading ? "…" : formatAvgDelay(kpis.avgDelayDays)}</p>
        </Card>
        <Card className="flex items-baseline justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Coût moyen</p>
            <p className="text-xs text-muted-foreground">{overviewError || "Expéditions avec coût renseigné, 30 jours"}</p>
          </div>
          <p className="text-xl font-bold text-foreground">{overviewLoading ? "…" : formatMoney(kpis.avgCost)}</p>
        </Card>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full space-y-1 sm:w-72">
            <p className="text-xs text-muted-foreground">Recherche</p>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Commande, tracking, client, adresse, livreur…"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full space-y-1 sm:w-40">
            <p className="text-xs text-muted-foreground">Statut</p>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                resetPaging();
              }}
            >
              <option value="">Tous</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full space-y-1 sm:w-44">
            <p className="text-xs text-muted-foreground">Transporteur</p>
            <Select
              value={carrier}
              onChange={(e) => {
                setCarrier(e.target.value);
                resetPaging();
              }}
            >
              <option value="">Tous</option>
              {carriers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full space-y-1 sm:w-60">
            <p className="text-xs text-muted-foreground">Livreur</p>
            <Select value={courierFilter} onChange={(e) => changeCourier(e.target.value)}>
              <option value="">Tous</option>
              <option value="UNASSIGNED">Non affectés ({nf.format(Number(counts.unassigned) || 0)})</option>
              {couriers
                .filter((c) => c.email)
                .map((c) => (
                  <option key={c.id} value={c.email.toLowerCase()}>
                    {courierLabel(c)} · {c.toPickup + c.inTransit} en cours{c.active ? "" : " (désactivé)"}
                  </option>
                ))}
            </Select>
          </div>
          {view === "list" ? (
            <div className="w-full space-y-1 sm:w-48">
              <p className="text-xs text-muted-foreground">Tri</p>
              <Select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(0);
                }}
              >
                <option value="urgency">Urgence</option>
                <option value="oldest">Sans mouvement depuis longtemps</option>
                <option value="newest">Mouvement le plus récent</option>
                <option value="created">Création la plus récente</option>
              </Select>
            </div>
          ) : null}
          <label className="flex h-10 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" checked={lateOnly} onChange={toggleLate} />
            <span className={Number(counts.late) > 0 ? "font-medium text-rose-700" : ""}>
              En retard seulement ({nf.format(Number(counts.late) || 0)})
            </span>
          </label>
          <div className="w-full space-y-1 sm:w-28">
            <p className="text-xs text-muted-foreground">Retard dépôt</p>
            <Select value={`${prepHours}`} onChange={(e) => setPrepHours(Number(e.target.value))} aria-label="Seuil de retard au dépôt">
              {[4, 12, 24, 48].map((h) => (
                <option key={h} value={h}>
                  {h} h
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full space-y-1 sm:w-28">
            <p className="text-xs text-muted-foreground">Retard en route</p>
            <Select value={`${transitHours}`} onChange={(e) => setTransitHours(Number(e.target.value))} aria-label="Seuil de retard en route">
              {[2, 4, 6, 12].map((h) => (
                <option key={h} value={h}>
                  {h} h
                </option>
              ))}
            </Select>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={exportShipmentsCsv} disabled={exporting || totalElements === 0} isLoading={exporting}>
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <div className="flex items-center gap-1 rounded-lg border border-border p-1" role="group" aria-label="Mode d'affichage">
              <Button variant={view === "list" ? "primary" : "ghost"} size="sm" className="gap-1" onClick={() => setView("list")}>
                <List className="h-4 w-4" /> Liste
              </Button>
              <Button variant={view === "columns" ? "primary" : "ghost"} size="sm" className="gap-1" onClick={showColumns}>
                <Columns3 className="h-4 w-4" /> Colonnes
              </Button>
            </div>
          </div>
        </div>
        {hasFilter || exportError ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {hasFilter ? (
              <>
                <span>Filtres actifs.</span>
                <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              </>
            ) : null}
            {exportError ? <span className="text-red-600">{exportError}</span> : null}
          </div>
        ) : null}
      </Card>

      {view === "list" ? (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-3 py-2">
            <p className="text-sm font-semibold text-foreground">{listTitle}</p>
            <p className="text-xs text-muted-foreground">Cliquez sur une ligne pour le détail, l'historique et les actions.</p>
          </div>
          {checked.size > 0 || bulk ? (
            <div className="space-y-2 border-b border-border bg-muted/40 px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">
                  {checked.size} sélectionné{checked.size > 1 ? "s" : ""}
                  {checked.size >= BULK_MAX ? ` (max ${BULK_MAX})` : ""}
                </span>
                <div className="w-64">
                  <Select value={bulkCourier} onChange={(e) => setBulkCourier(e.target.value)} aria-label="Livreur pour la sélection">
                    <option value="">Affecter la sélection à…</option>
                    {activeCouriers.map((c) => (
                      <option key={c.id} value={c.email}>
                        {courierLabel(c)} — {c.toPickup + c.inTransit} en cours
                      </option>
                    ))}
                  </Select>
                </div>
                <Button size="sm" onClick={bulkAssign} disabled={!bulkCourier || checked.size === 0 || Boolean(bulk?.running)} isLoading={Boolean(bulk?.running)}>
                  Affecter
                </Button>
                <Button size="sm" variant="ghost" onClick={resetSelection} disabled={Boolean(bulk?.running)}>
                  Vider la sélection
                </Button>
              </div>
              {bulk ? (
                <div aria-live="polite" className="text-xs">
                  {bulk.running ? (
                    <span>
                      Affectation à {bulk.courier} : {bulk.done}/{bulk.total}…
                    </span>
                  ) : (
                    <span className={bulk.failures.length ? "text-amber-700" : "text-emerald-700"}>
                      {bulk.ok} colis affecté{bulk.ok > 1 ? "s" : ""} à {bulk.courier}
                      {bulk.failures.length ? ` · ${bulk.failures.length} échec(s) : ${bulk.failures.slice(0, 5).map((f) => `${f.ref} (${f.message})`).join(", ")}` : "."}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      aria-label="Sélectionner la page"
                      checked={allPageChecked}
                      disabled={selectableOnPage.length === 0}
                      onChange={togglePage}
                    />
                  </th>
                  <th className="px-3 py-2">Commande / Tracking</th>
                  <th className="px-3 py-2">Client / Adresse</th>
                  <th className="px-3 py-2">Expéditeur / Transporteur</th>
                  <th className="px-3 py-2">Livreur</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">ETA / Coût</th>
                  <th className="px-3 py-2">Dernier mouvement</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!pageData && listLoading ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">
                      Chargement…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">
                      {listError && !pageData
                        ? "La liste n'a pas pu être chargée."
                        : hasFilter
                          ? "Aucune expédition ne correspond à ces filtres."
                          : "Aucun colis à suivre pour le moment."}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const sh = item.shipment || {};
                    const isChecked = checked.has(sh.id);
                    const qr = qrValueOf(sh);
                    return (
                      <tr
                        key={sh.id}
                        className={`cursor-pointer border-t border-border align-top hover:bg-muted/30 ${
                          `${selectedId}` === `${sh.id}` ? "bg-primary/5" : ""
                        }`}
                        onClick={() => openShipment(item)}
                      >
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            aria-label={`Sélectionner ${sh.orderId || sh.id}`}
                            checked={isChecked}
                            disabled={sh.status === "LIVREE" || (!isChecked && checked.size >= BULK_MAX)}
                            onChange={() => toggleChecked(item)}
                          />
                        </td>
                        <td className="max-w-[11rem] px-3 py-2">
                          <p className="whitespace-nowrap font-semibold text-foreground">{sh.orderId || `#${sh.id}`}</p>
                          <p className="break-all font-mono text-[11px] text-muted-foreground">{sh.trackingId || "-"}</p>
                        </td>
                        <td className="max-w-[16rem] px-3 py-2">
                          <p className="truncate text-foreground">{sh.customerName || "-"}</p>
                          <p className="whitespace-normal break-words text-xs text-muted-foreground">{sh.customerAddress || "Adresse non renseignée"}</p>
                        </td>
                        <td className="max-w-[10rem] px-3 py-2">
                          <p className="truncate">{shipperLabel(sh)}</p>
                          <p className="truncate text-xs text-muted-foreground">{sh.carrier || "-"}</p>
                        </td>
                        <td className="max-w-[10rem] truncate px-3 py-2">
                          {sh.courierName || sh.courierUser || <span className="text-muted-foreground">Non affecté</span>}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap items-center gap-1">
                            <LaneBadge lane={item.lane} status={sh.status} />
                            {sh.failedAttempts ? <span className="text-[11px] text-muted-foreground" title="Échecs de livraison">×{sh.failedAttempts}</span> : null}
                            {sh.codeLocked ? <span className="text-[11px] font-semibold text-rose-700">Code verrouillé</span> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <p>{formatDateTime(sh.eta)}</p>
                          <p className="text-xs text-muted-foreground">{formatMoney(sh.cost)}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className={item.late ? "font-medium text-rose-700" : "text-muted-foreground"}>{formatIdle(item.idleMinutes)}</span>
                            {item.late ? <LateBadge /> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {sh.customerPhone ? (
                              <a
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-muted"
                                href={`tel:${sh.customerPhone}`}
                                aria-label={`Appeler le client ${sh.customerName || ""}`}
                                title={`Appeler ${sh.customerPhone}`}
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </a>
                            ) : null}
                            <Button variant="outline" size="sm" onClick={() => initPrint(sh.id)} title="Imprimer Facture" aria-label="Imprimer la facture">
                              <Printer className="h-4 w-4" />
                            </Button>
                            {qr ? (
                              <button
                                type="button"
                                onClick={() => openQrModal(qr, sh.orderId)}
                                className="rounded-md border border-border bg-white p-1 hover:bg-muted/30"
                                title="Voir QR Code"
                              >
                                <img src={buildQrUrl(qr, 84)} alt={`QR ${sh.orderId}`} className="h-7 w-7" referrerPolicy="no-referrer" />
                              </button>
                            ) : (
                              <div className="h-9 w-9" />
                            )}
                            <Button size="sm" variant={sh.status === "ECHEC" ? "primary" : "outline"} onClick={() => openShipment(item)}>
                              {sh.status === "ECHEC" ? "Gérer" : sh.status !== "LIVREE" && !sh.courierUser ? "Affecter" : "Détail"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span>
              {totalElements > 0
                ? `${nf.format(page * size + 1)}–${nf.format(page * size + items.length)} sur ${nf.format(totalElements)} expéditions`
                : "0 expédition"}
              {listLoading && pageData ? " · actualisation…" : ""}
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={`${size}`}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                aria-label="Expéditions par page"
                className="h-8 w-24 py-1 text-xs"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </Select>
              <Button size="sm" variant="outline" disabled={page <= 0 || listLoading} onClick={() => setPage((p) => Math.max(0, p - 1))} aria-label="Page précédente">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
              </span>
              <Button size="sm" variant="outline" disabled={page + 1 >= totalPages || listLoading} onClick={() => setPage((p) => p + 1)} aria-label="Page suivante">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-5">
          {COLUMNS.map((col) => {
            const data = colData[col.key];
            const list = data?.content || [];
            const total = data?.totalElements ?? 0;
            return (
              <section key={col.key} className={`rounded-xl border border-t-4 ${col.tone} p-2.5`} aria-label={col.label}>
                <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-foreground">
                  {col.label}
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">{nf.format(total)}</span>
                </h3>
                <div className="space-y-2">
                  {!data && colLoading ? (
                    <p className="text-xs text-muted-foreground">Chargement…</p>
                  ) : list.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucun colis.</p>
                  ) : (
                    list.map((item) => <ShipmentCard key={item.shipment?.id} item={item} onOpen={() => openShipment(item)} />)
                  )}
                </div>
                {total > list.length ? (
                  <button type="button" className="mt-2 w-full text-center text-xs font-medium text-primary hover:underline" onClick={() => showTab(col.key)}>
                    Voir tous ({nf.format(total)})
                  </button>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      <Card className="p-3">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setShowLoad((v) => !v)}
          aria-expanded={showLoad}
        >
          <span className="text-sm font-semibold">
            Charge des livreurs <span className="font-normal text-muted-foreground">({couriers.length})</span>
          </span>
          <ChevronDown className={`h-4 w-4 transition ${showLoad ? "rotate-180" : ""}`} />
        </button>
        {showLoad ? (
          couriers.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Aucun livreur enregistré. <Link className="text-primary underline" to="/couriers">Créer un livreur</Link>
            </p>
          ) : (
            <div className="mt-3 max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-1.5 pr-4">Livreur</th>
                    <th className="py-1.5 pr-4">À récupérer</th>
                    <th className="py-1.5 pr-4">En livraison</th>
                    <th className="py-1.5 pr-4">Échecs</th>
                    <th className="py-1.5 pr-4">En retard</th>
                    <th className="py-1.5 pr-4">Livrés</th>
                    <th className="py-1.5 pr-4">Tél.</th>
                  </tr>
                </thead>
                <tbody>
                  {couriers.map((c) => (
                    <tr
                      key={c.id}
                      className={`cursor-pointer border-t border-border hover:bg-muted/30 ${c.active ? "" : "opacity-50"}`}
                      onClick={() => c.email && changeCourier(c.email.toLowerCase())}
                      title="Filtrer la liste sur ce livreur"
                    >
                      <td className="py-1.5 pr-4 font-medium text-foreground">
                        {courierLabel(c)}
                        {c.active ? "" : " (désactivé)"}
                      </td>
                      <td className="py-1.5 pr-4">{c.toPickup}</td>
                      <td className="py-1.5 pr-4">{c.inTransit}</td>
                      <td className={`py-1.5 pr-4 ${c.failed ? "font-semibold text-rose-600" : ""}`}>{c.failed}</td>
                      <td className={`py-1.5 pr-4 ${c.late ? "font-semibold text-rose-600" : ""}`}>{c.late}</td>
                      <td className="py-1.5 pr-4">{c.deliveredToday}</td>
                      <td className="py-1.5 pr-4" onClick={(e) => e.stopPropagation()}>
                        {c.phoneNumber ? (
                          <a className="text-primary hover:underline" href={`tel:${c.phoneNumber}`}>
                            {c.phoneNumber}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}
      </Card>

      <Card className="space-y-4 p-4">
        <SectionHeader title="Livraisons effectuées" subtitle="Dernières livraisons clôturées (statut LIVREE)" titleClassName="text-lg" />
        <Table>
          <THead>
            <TRow>
              <TCell>Tracking ID</TCell>
              <TCell>Commande</TCell>
              <TCell>Expéditeur</TCell>
              <TCell>Transporteur</TCell>
              <TCell>ETA</TCell>
              <TCell>Coût</TCell>
            </TRow>
          </THead>
          <tbody>
            {overviewLoading ? (
              <TRow>
                <TCell colSpan={6} className="text-sm text-muted-foreground">Chargement…</TCell>
              </TRow>
            ) : overviewError && delivered.length === 0 ? (
              <TRow>
                <TCell colSpan={6} className="text-sm text-red-600">{overviewError}</TCell>
              </TRow>
            ) : delivered.length === 0 ? (
              <TRow>
                <TCell colSpan={6} className="text-sm text-muted-foreground">Aucune livraison effectuée.</TCell>
              </TRow>
            ) : (
              delivered.map((d) => (
                <TRow key={d.id}>
                  <TCell className="font-mono text-xs font-semibold">{d.trackingId || "-"}</TCell>
                  <TCell className="font-semibold text-foreground">{d.orderId || "-"}</TCell>
                  <TCell>{shipperLabel(d)}</TCell>
                  <TCell>{d.carrier || "-"}</TCell>
                  <TCell>{formatDateTime(d.eta)}</TCell>
                  <TCell>{formatMoney(d.cost)}</TCell>
                </TRow>
              ))
            )}
          </tbody>
        </Table>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
          onClick={() => {
            setStatus("LIVREE");
            showHistory();
          }}
        >
          Voir toutes les livraisons effectuées
        </button>
      </Card>

      {/* Composant d'impression (masqué) */}
      <div style={{ display: "none" }}>
        <ShippingLabel ref={labelRef} order={printOrder} company={companyInfo} />
      </div>

      <Drawer
        isOpen={isOpen}
        onClose={() => setSelectedId(null)}
        title={isOpen ? `Colis ${s.orderId || `#${s.id}`}` : "Colis"}
        width="w-full sm:w-[34rem]"
      >
        {isOpen ? (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <LaneBadge lane={selected.lane} status={s.status} />
              {selected.late ? (
                <span className="rounded-full bg-rose-500/15 px-3 py-0.5 text-xs font-semibold text-rose-700">
                  Sans mouvement {formatIdle(selected.idleMinutes)}
                </span>
              ) : null}
              <span className="rounded-full border border-border bg-muted/30 px-3 py-0.5 text-xs">
                Échecs de livraison : {s.failedAttempts ?? 0}
              </span>
              {s.codeLocked ? (
                <span className="rounded-full border border-red-300 bg-red-50 px-3 py-0.5 text-xs text-red-700">
                  Code client verrouillé (trop d'essais)
                </span>
              ) : null}
              {s.paid === false ? (
                <span className="rounded-full bg-amber-500/15 px-3 py-0.5 text-xs font-semibold text-amber-700">Paiement non confirmé</span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => initPrint(s.id)}>
                <Printer className="h-4 w-4" /> Imprimer la facture
              </Button>
              {selectedQr ? (
                <Button variant="outline" size="sm" onClick={() => openQrModal(selectedQr, s.orderId)}>
                  QR / code de remise
                </Button>
              ) : null}
            </div>

            <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
              <dt className="text-muted-foreground">Statut</dt>
              <dd className="col-span-2">{laneLabel(selected.lane, s.status)}</dd>
              <dt className="text-muted-foreground">Tracking ID</dt>
              <dd className="col-span-2 font-mono">{s.trackingId || "-"}</dd>
              <dt className="text-muted-foreground">Expéditeur</dt>
              <dd className="col-span-2">{shipperLabel(s)}</dd>
              <dt className="text-muted-foreground">Client</dt>
              <dd className="col-span-2 font-medium">{s.customerName || "-"}</dd>
              <dt className="text-muted-foreground">Téléphone</dt>
              <dd className="col-span-2">
                {s.customerPhone ? (
                  <a className="inline-flex items-center gap-1 text-primary hover:underline" href={`tel:${s.customerPhone}`}>
                    <Phone className="h-3 w-3" /> {s.customerPhone}
                  </a>
                ) : (
                  "-"
                )}
              </dd>
              <dt className="text-muted-foreground">Adresse</dt>
              <dd className="col-span-2 break-words">{s.customerAddress || "-"}</dd>
              <dt className="text-muted-foreground">Livreur</dt>
              <dd className="col-span-2">
                {s.courierName || s.courierUser || "Non affecté"}
                {s.courierPhone ? (
                  <a className="ml-2 text-primary hover:underline" href={`tel:${s.courierPhone}`}>
                    {s.courierPhone}
                  </a>
                ) : null}
              </dd>
              <dt className="text-muted-foreground">Transporteur</dt>
              <dd className="col-span-2">{s.carrier || "-"}</dd>
              <dt className="text-muted-foreground">Code colis</dt>
              <dd className="col-span-2 font-mono">{s.handoffCode || "-"}</dd>
              <dt className="text-muted-foreground">ETA</dt>
              <dd className="col-span-2">{formatDateTime(s.eta)}</dd>
              <dt className="text-muted-foreground">Coût</dt>
              <dd className="col-span-2">{formatMoney(s.cost)}</dd>
              {s.customerFacingComment && s.status !== "ECHEC" ? (
                <>
                  <dt className="text-muted-foreground">Message client</dt>
                  <dd className="col-span-2 whitespace-pre-wrap break-words">{s.customerFacingComment}</dd>
                </>
              ) : null}
            </dl>

            {s.status !== "LIVREE" ? (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="font-semibold">{s.courierUser ? "Réaffecter" : "Affecter un livreur"}</p>
                <div className="flex gap-2">
                  <Select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} aria-label="Livreur">
                    <option value="">Choisir un livreur actif…</option>
                    {activeCouriers.map((c) => (
                      <option key={c.id} value={c.email}>
                        {courierLabel(c)} — {c.toPickup + c.inTransit} en cours
                      </option>
                    ))}
                    <option value={OTHER_COURIER}>Autre compte (saisir l'e-mail)…</option>
                  </Select>
                  <Button
                    onClick={assignCourier}
                    disabled={!assignTo || (assignTo === OTHER_COURIER && !assignOther.trim()) || Boolean(actionBusy)}
                    isLoading={actionBusy === "assign"}
                  >
                    Affecter
                  </Button>
                </div>
                {assignTo === OTHER_COURIER ? (
                  <Input
                    type="email"
                    placeholder="E-mail du compte livreur"
                    value={assignOther}
                    onChange={(e) => setAssignOther(e.target.value)}
                    aria-label="E-mail du compte livreur"
                  />
                ) : null}
                {activeCouriers.length === 0 ? <p className="text-xs text-muted-foreground">Aucun livreur actif.</p> : null}
              </div>
            ) : null}

            {s.status === "ECHEC" || s.codeLocked ? (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <p className="font-semibold">Incident de livraison</p>
                {s.status === "ECHEC" ? (
                  <div className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-xs font-semibold">Motif transmis par le livreur</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{s.deliveryIssueComment || "Aucun motif détaillé."}</p>
                  </div>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={Boolean(actionBusy)}
                  isLoading={actionBusy === "unlock"}
                  onClick={() => runAction("unlock", () => backofficeApi.unlockShipmentCode(s.id), "Code client débloqué.")}
                >
                  Débloquer le code
                </Button>
                {s.status === "ECHEC" ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Message client affiché dans le suivi</p>
                      <textarea
                        rows={4}
                        value={customerMessage}
                        onChange={(e) => setCustomerMessage(e.target.value)}
                        placeholder="Ex: Nous n'avons pas pu finaliser la livraison aujourd'hui. Notre équipe reviendra vers vous avec un nouveau créneau."
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      <p className="text-xs text-muted-foreground">Ce message est visible côté client dans le suivi de commande.</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={Boolean(actionBusy)}
                          isLoading={actionBusy === "message"}
                          onClick={() =>
                            runAction(
                              "message",
                              () =>
                                backofficeApi.updateShipmentStatus(s.id, {
                                  status: "ECHEC",
                                  deliveryIssueComment: s.deliveryIssueComment || null,
                                  customerFacingComment: customerMessage || null
                                }),
                              "Message client mis à jour."
                            )
                          }
                        >
                          Mettre à jour le message client
                        </Button>
                        <Button
                          size="sm"
                          disabled={Boolean(actionBusy)}
                          isLoading={actionBusy === "retry"}
                          onClick={() =>
                            runAction(
                              "retry",
                              () => backofficeApi.updateShipmentStatus(s.id, { status: "EN_COURS", customerFacingComment: customerMessage || null }),
                              "Livraison relancée."
                            )
                          }
                        >
                          Relancer la livraison
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground">
                        Retour dépôt : la commande sera annulée et remboursée. Motif obligatoire, conservé dans l'historique.
                      </p>
                      <textarea
                        rows={2}
                        value={depotReason}
                        onChange={(e) => setDepotReason(e.target.value)}
                        placeholder="Ex : client injoignable après 3 passages"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!depotReason.trim() || Boolean(actionBusy)}
                        isLoading={actionBusy === "depot"}
                        onClick={() =>
                          runAction("depot", () => backofficeApi.returnShipmentToDepot(s.id, depotReason.trim()), "Colis renvoyé au dépôt, commande annulée.")
                        }
                      >
                        Retour dépôt
                      </Button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {actionError ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{actionError}</div> : null}
            {actionInfo ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">{actionInfo}</div> : null}

            <div>
              <p className="mb-2 font-semibold">Historique</p>
              {timelineError ? <p className="text-red-600">{timelineError}</p> : null}
              {timeline.length === 0 && !timelineError ? (
                <p className="text-muted-foreground">Aucun évènement.</p>
              ) : (
                <ol className="relative space-y-3 border-l border-border pl-4">
                  {[...timeline].reverse().map((entry) => (
                    <li key={entry.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                      <p className="font-medium text-foreground">
                        {STATUS_OPTIONS.some((o) => o.value === entry.status) ? statusLabel(entry.status) : entry.statusLabel || entry.status}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">{formatDateTime(entry.changedAt)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {SOURCE_LABEL[entry.source] || entry.source}
                        {entry.actorLabel || entry.actorId ? ` · ${entry.actorLabel || entry.actorId}` : ""}
                      </p>
                      {entry.comment ? <p className="mt-0.5 break-words text-foreground">{entry.comment}</p> : null}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal
        isOpen={qrModalOpen}
        onClose={closeQrModal}
        title={qrModalTitle ? `QR - ${qrModalTitle}` : "QR"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeQrModal}>
              Fermer
            </Button>
            <Button onClick={() => copyToClipboard(qrModalValue)} disabled={!qrModalValue}>
              {qrCopyState ? qrCopyState : "Copier le code"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            {qrModalValue ? (
              <img
                src={buildQrUrl(qrModalValue, 260)}
                alt="QR"
                className="h-64 w-64 rounded-xl border border-border bg-white"
                referrerPolicy="no-referrer"
              />
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Saisie manuelle</p>
            <Input value={qrModalValue} readOnly />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCarriersOpen}
        onClose={() => setIsCarriersOpen(false)}
        title="Transporteurs"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCarriersOpen(false)}>
              Fermer
            </Button>
            <Button
              onClick={() => {
                persistCarriers(carriers);
                setIsCarriersOpen(false);
              }}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Liste des transporteurs</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Cette liste est utilisée dans les filtres et lors de la création d’une expédition (stockée localement sur ce navigateur).
            </p>
          </div>

          <div className="flex gap-2">
            <Input placeholder="Ajouter un transporteur..." value={newCarrier} onChange={(e) => setNewCarrier(e.target.value)} />
            <Button
              variant="outline"
              onClick={() => {
                const name = newCarrier.trim();
                if (!name) return;
                persistCarriers([...carriers, name]);
                setNewCarrier("");
              }}
            >
              Ajouter
            </Button>
          </div>

          <div className="grid gap-2">
            {carriers.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucun transporteur.</div>
            ) : (
              carriers.map((c) => (
                <div key={c} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="text-sm font-medium">{c}</div>
                  <Button variant="destructive" size="sm" onClick={() => persistCarriers(carriers.filter((x) => x !== c))}>
                    Supprimer
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isShipmentOpen}
        onClose={closeShipmentModal}
        title="Nouvelle expédition"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeShipmentModal} disabled={shipmentSaving}>
              Annuler
            </Button>
            <Button onClick={saveShipment} disabled={shipmentSaving}>
              {shipmentSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Commande</p>
            <Input
              placeholder="ID de commande (ex: cmd-xxx ou UUID)"
              value={shipmentForm.orderId}
              onChange={(e) => setShipmentForm((p) => ({ ...p, orderId: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Astuce: copie l’ID depuis la page Commandes.</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Transporteur</p>
            <Select value={shipmentForm.carrier} onChange={(e) => setShipmentForm((p) => ({ ...p, carrier: e.target.value }))}>
              <option value="">Sélectionner…</option>
              {carriers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Statut</p>
            <Select value={shipmentForm.status} onChange={(e) => setShipmentForm((p) => ({ ...p, status: e.target.value }))}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Tracking ID</p>
            <Input value={shipmentForm.trackingId} onChange={(e) => setShipmentForm((p) => ({ ...p, trackingId: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">ETA</p>
            <Input type="datetime-local" value={shipmentForm.eta} onChange={(e) => setShipmentForm((p) => ({ ...p, eta: e.target.value }))} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <p className="text-sm font-medium">Coût</p>
            <Input
              type="number"
              min={0}
              placeholder="Ex: 2500"
              value={shipmentForm.cost}
              onChange={(e) => setShipmentForm((p) => ({ ...p, cost: e.target.value }))}
            />
          </div>

          {shipmentError ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200 md:col-span-2">
              {shipmentError}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
