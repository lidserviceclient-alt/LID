import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Columns3, List, Phone, RefreshCw, Search } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Drawer from "../components/ui/Drawer.jsx";
import { backofficeApi } from "../services/api.js";
import { subscribeBackofficeRealtime } from "../services/realtime.js";

// Repli si le temps réel est coupé : le suivi se rafraîchit seul
const POLL_MS = 60_000;
const SEARCH_DEBOUNCE_MS = 350;
const COLUMN_PREVIEW = 10;
const BULK_MAX = 50;
const PAGE_SIZES = [25, 50, 100];

// Les 5 colonnes du suivi (valeurs attendues par `column` côté API)
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

const STATUS_LABEL = {
  EN_PREPARATION: "À récupérer",
  EN_COURS: "En livraison",
  LIVREE: "Livré",
  ECHEC: "Échec"
};

const SOURCE_LABEL = {
  SYSTEM: "Système",
  BACKOFFICE: "Back-office",
  DELIVERY_APP: "App livreur",
  MIGRATION: "Migration"
};

const nf = new Intl.NumberFormat("fr-FR");

function formatIdle(minutes) {
  const m = Number(minutes) || 0;
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `il y a ${h} h${m % 60 ? ` ${m % 60}` : ""}`;
  return `il y a ${Math.floor(h / 24)} j`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

function courierLabel(courier) {
  if (!courier) return "";
  const name = `${courier.firstName || ""} ${courier.lastName || ""}`.trim();
  return name || courier.email || courier.id;
}

function LaneBadge({ lane }) {
  const badge = LANE_BADGE[lane] || { label: lane || "-", cls: "bg-muted text-foreground" };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.label}</span>;
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

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, number: 0 };

export default function DeliveryBoard() {
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  // Filtres (tous appliqués côté serveur)
  const [tab, setTab] = useState(""); // colonne ("" = tous les colis du suivi)
  const [lateOnly, setLateOnly] = useState(false);
  const [courierFilter, setCourierFilter] = useState(""); // "" | UNASSIGNED | email
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("urgency");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [prepHours, setPrepHours] = useState(24);
  const [transitHours, setTransitHours] = useState(6);
  const [view, setView] = useState("list"); // list | columns
  const [showLoad, setShowLoad] = useState(false);

  const [pageData, setPageData] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [colData, setColData] = useState({});
  const [colLoading, setColLoading] = useState(false);

  // Sélection multiple (id -> référence), affectation en lot séquentielle
  const [checked, setChecked] = useState(() => new Map());
  const [bulkCourier, setBulkCourier] = useState("");
  const [bulk, setBulk] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineError, setTimelineError] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [depotReason, setDepotReason] = useState("");
  const [actionBusy, setActionBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");

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

  const baseParams = useMemo(
    () => ({
      courier: courierFilter || undefined,
      late: lateOnly || undefined,
      q: q || undefined,
      preparationAlertHours: prepHours,
      transitAlertHours: transitHours
    }),
    [courierFilter, lateOnly, q, prepHours, transitHours]
  );

  // Liste paginée : on garde l'affichage précédent pendant le rechargement (pas de saut de défilement)
  const loadList = useCallback(async () => {
    const seq = ++listSeq.current;
    setListLoading(true);
    try {
      const data = await backofficeApi.deliveryBoardShipments({
        ...baseParams,
        column: tab || undefined,
        page,
        size,
        sort
      });
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
  }, [baseParams, tab, page, size, sort]);

  // Vue colonnes : les COLUMN_PREVIEW premiers colis (par urgence) de chaque colonne
  const loadColumns = useCallback(async () => {
    const seq = ++colSeq.current;
    setColLoading(true);
    try {
      const results = await Promise.all(
        COLUMNS.map((col) =>
          backofficeApi.deliveryBoardShipments({ ...baseParams, column: col.key, page: 0, size: COLUMN_PREVIEW, sort: "urgency" })
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
    if (view === "list") loadList();
  }, [view, loadList]);

  useEffect(() => {
    if (view === "columns") loadColumns();
  }, [view, loadColumns]);

  refreshRef.current = () => {
    loadSummary();
    if (view === "list") loadList();
    else loadColumns();
  };

  // Temps réel : chaque transition de colis publie « shipment:<déclencheur> » ; filtres/page conservés
  useEffect(() => {
    let timer;
    const unsubscribe = subscribeBackofficeRealtime((event) => {
      if (event?.topic !== "backoffice.overview.updated") return;
      const reason = `${event?.payload?.reason || ""}`.toLowerCase();
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
  const hasFilter = Boolean(tab || lateOnly || courierFilter || q);

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
    setDepotReason("");
    setActionError("");
    setActionInfo("");
  }

  function resetSelection() {
    setChecked(new Map());
    setBulk(null);
  }

  function changeTab(next) {
    setTab(next);
    setPage(0);
    resetSelection();
  }

  function toggleLate() {
    setLateOnly((v) => !v);
    setPage(0);
    resetSelection();
  }

  function changeCourier(value) {
    setCourierFilter(value);
    setPage(0);
    resetSelection();
  }

  function showAllOfColumn(key) {
    setView("list");
    changeTab(key);
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
    const courier = activeCouriers.find((c) => c.email === assignTo);
    if (!selected || !courier) return;
    runAction("assign", () => assignRequest(selected.shipment.id, courier), `Colis affecté à ${courierLabel(courier)}.`);
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

  const s = selected?.shipment || {};
  const isOpen = Boolean(selected);
  const error = summaryError || listError;
  const tiles = [
    { key: "", label: "Tous", value: totalOpen },
    ...COLUMNS.map((col) => ({ key: col.key, label: col.label, value: Number(counts[col.countKey]) || 0 }))
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Suivi des livraisons"
        subtitle={
          updatedAt
            ? `Mis à jour à ${new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(updatedAt)} · actualisation automatique`
            : "Vue d'ensemble en temps réel des colis et des livreurs."
        }
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/logistics">
              <Button variant="outline">Liste des expéditions</Button>
            </Link>
            <Button variant="outline" className="gap-2" onClick={() => refreshRef.current()} disabled={listLoading || colLoading}>
              <RefreshCw className={`h-4 w-4 ${listLoading || colLoading ? "animate-spin" : ""}`} />
              Actualiser
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

      {/* Compteurs cliquables = onglets */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
        {tiles.map((tile) => {
          const active = tab === tile.key;
          const alert = tile.key === "FAILED" && tile.value > 0;
          return (
            <button
              key={tile.key || "ALL"}
              type="button"
              onClick={() => {
                setView("list");
                changeTab(tile.key);
              }}
              aria-pressed={active}
              className={`rounded-xl border bg-card px-3 py-2.5 text-left transition ${
                active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
              }`}
            >
              <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{tile.label}</p>
              <p className={`text-xl font-bold ${alert ? "text-rose-600" : "text-foreground"}`}>{nf.format(tile.value)}</p>
            </button>
          );
        })}
        <button
          type="button"
          onClick={toggleLate}
          aria-pressed={lateOnly}
          className={`rounded-xl border bg-card px-3 py-2.5 text-left transition ${
            lateOnly ? "border-rose-500 ring-2 ring-rose-500/30" : "border-border hover:border-rose-400"
          }`}
        >
          <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">En retard</p>
          <p className={`text-xl font-bold ${Number(counts.late) > 0 ? "text-rose-600" : "text-foreground"}`}>
            {nf.format(Number(counts.late) || 0)}
          </p>
        </button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full space-y-1 sm:w-72">
            <p className="text-xs text-muted-foreground">Recherche</p>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Commande, client, adresse, livreur…"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
              />
            </div>
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
            <div className="w-full space-y-1 sm:w-44">
              <p className="text-xs text-muted-foreground">Tri</p>
              <Select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(0);
                }}
              >
                <option value="urgency">Urgence</option>
                <option value="oldest">Plus ancien</option>
                <option value="newest">Plus récent</option>
              </Select>
            </div>
          ) : null}
          <label className="flex h-10 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" checked={lateOnly} onChange={toggleLate} />
            En retard seulement
          </label>
          <div className="w-full space-y-1 sm:w-32">
            <p className="text-xs text-muted-foreground">Retard dépôt</p>
            <Select value={`${prepHours}`} onChange={(e) => setPrepHours(Number(e.target.value))} aria-label="Seuil de retard au dépôt">
              {[4, 12, 24, 48].map((h) => (
                <option key={h} value={h}>
                  {h} h
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full space-y-1 sm:w-32">
            <p className="text-xs text-muted-foreground">Retard en route</p>
            <Select value={`${transitHours}`} onChange={(e) => setTransitHours(Number(e.target.value))} aria-label="Seuil de retard en route">
              {[2, 4, 6, 12].map((h) => (
                <option key={h} value={h}>
                  {h} h
                </option>
              ))}
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-border p-1" role="group" aria-label="Mode d'affichage">
            <Button variant={view === "list" ? "primary" : "ghost"} size="sm" className="gap-1" onClick={() => setView("list")}>
              <List className="h-4 w-4" /> Liste
            </Button>
            <Button variant={view === "columns" ? "primary" : "ghost"} size="sm" className="gap-1" onClick={() => setView("columns")}>
              <Columns3 className="h-4 w-4" /> Colonnes
            </Button>
          </div>
        </div>
        {hasFilter ? (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Filtres actifs.</span>
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                setQInput("");
                setQ("");
                setLateOnly(false);
                setCourierFilter("");
                changeTab("");
              }}
            >
              Réinitialiser
            </button>
          </div>
        ) : null}
      </Card>

      {view === "list" ? (
        <Card className="overflow-hidden p-0">
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
                  <th className="px-3 py-2">Commande</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Livreur</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Dernier mouvement</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!pageData && listLoading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                      Chargement…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                      {listError && !pageData
                        ? "La liste n'a pas pu être chargée."
                        : hasFilter
                          ? "Aucun colis ne correspond à ces filtres."
                          : "Aucun colis à suivre pour le moment."}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const sh = item.shipment || {};
                    const isChecked = checked.has(sh.id);
                    return (
                      <tr
                        key={sh.id}
                        className={`cursor-pointer border-t border-border hover:bg-muted/30 ${
                          `${selectedId}` === `${sh.id}` ? "bg-primary/5" : ""
                        }`}
                        onClick={() => openShipment(item)}
                      >
                        <td className="px-3 py-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            aria-label={`Sélectionner ${sh.orderId || sh.id}`}
                            checked={isChecked}
                            disabled={sh.status === "LIVREE" || (!isChecked && checked.size >= BULK_MAX)}
                            onChange={() => toggleChecked(item)}
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-1.5 font-semibold text-foreground">{sh.orderId || `#${sh.id}`}</td>
                        <td className="max-w-[18rem] px-3 py-1.5">
                          <p className="truncate text-foreground">{sh.customerName || "Client"}</p>
                          <p className="truncate text-xs text-muted-foreground">{sh.customerAddress || "Adresse non renseignée"}</p>
                        </td>
                        <td className="max-w-[12rem] truncate px-3 py-1.5">
                          {sh.courierName || sh.courierUser || <span className="text-muted-foreground">Non affecté</span>}
                        </td>
                        <td className="px-3 py-1.5">
                          <div className="flex flex-wrap items-center gap-1">
                            <LaneBadge lane={item.lane} />
                            {sh.failedAttempts ? <span className="text-[11px] text-muted-foreground">×{sh.failedAttempts}</span> : null}
                            {sh.codeLocked ? <span className="text-[11px] font-semibold text-rose-700">Code verrouillé</span> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-1.5">
                          <div className="flex items-center gap-2">
                            <span className={item.late ? "font-medium text-rose-700" : "text-muted-foreground"}>
                              {formatIdle(item.idleMinutes)}
                            </span>
                            {item.late ? <LateBadge /> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                          {sh.customerPhone ? (
                            <a
                              className="mr-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              href={`tel:${sh.customerPhone}`}
                              aria-label={`Appeler le client ${sh.customerName || ""}`}
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                          ) : null}
                          <Button size="sm" variant="outline" onClick={() => openShipment(item)}>
                            {sh.status !== "LIVREE" && !sh.courierUser ? "Affecter" : "Détail"}
                          </Button>
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
                ? `${nf.format(page * size + 1)}–${nf.format(page * size + items.length)} sur ${nf.format(totalElements)}`
                : "0 colis"}
              {listLoading && pageData ? " · actualisation…" : ""}
            </span>
            <div className="flex items-center gap-2">
              <Select
                value={`${size}`}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                aria-label="Colis par page"
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
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages || listLoading}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Page suivante"
              >
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
                  <button type="button" className="mt-2 w-full text-center text-xs font-medium text-primary hover:underline" onClick={() => showAllOfColumn(col.key)}>
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

      <Drawer
        isOpen={isOpen}
        onClose={() => setSelectedId(null)}
        title={isOpen ? `Colis ${s.orderId || `#${s.id}`}` : "Colis"}
        width="w-full sm:w-[32rem]"
      >
        {isOpen ? (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{STATUS_LABEL[s.status] || s.status}</span>
              {selected.late ? (
                <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-700">
                  Sans mouvement {formatIdle(selected.idleMinutes)}
                </span>
              ) : null}
              {s.codeLocked ? (
                <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-700">Code verrouillé</span>
              ) : null}
              {s.paid === false ? (
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700">Paiement non confirmé</span>
              ) : null}
            </div>

            <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
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
              <dt className="text-muted-foreground">Code colis</dt>
              <dd className="col-span-2 font-mono">{s.handoffCode || "-"}</dd>
              <dt className="text-muted-foreground">ETA</dt>
              <dd className="col-span-2">{formatDateTime(s.eta)}</dd>
              {s.deliveryIssueComment ? (
                <>
                  <dt className="text-muted-foreground">Motif d'échec</dt>
                  <dd className="col-span-2 break-words font-medium text-rose-700">{s.deliveryIssueComment}</dd>
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
                  </Select>
                  <Button onClick={assignCourier} disabled={!assignTo || Boolean(actionBusy)} isLoading={actionBusy === "assign"}>
                    Affecter
                  </Button>
                </div>
                {activeCouriers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun livreur actif.</p>
                ) : null}
              </div>
            ) : null}

            {s.status === "ECHEC" || s.codeLocked ? (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="font-semibold">Incident</p>
                <div className="flex flex-wrap gap-2">
                  {s.codeLocked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={Boolean(actionBusy)}
                      onClick={() =>
                        runAction("unlock", () => backofficeApi.unlockShipmentCode(s.id), "Code client débloqué.")
                      }
                    >
                      Débloquer le code
                    </Button>
                  ) : null}
                  {s.status === "ECHEC" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={Boolean(actionBusy)}
                      onClick={() =>
                        runAction(
                          "retry",
                          () => backofficeApi.updateShipmentStatus(s.id, { status: "EN_COURS" }),
                          "Livraison relancée."
                        )
                      }
                    >
                      Relancer la livraison
                    </Button>
                  ) : null}
                </div>
                {s.status === "ECHEC" ? (
                  <div className="space-y-2 pt-2">
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
                      onClick={() =>
                        runAction(
                          "depot",
                          () => backofficeApi.returnShipmentToDepot(s.id, depotReason.trim()),
                          "Colis renvoyé au dépôt, commande annulée."
                        )
                      }
                    >
                      Retour dépôt
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {actionError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{actionError}</div>
            ) : null}
            {actionInfo ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">{actionInfo}</div>
            ) : null}

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
                        {entry.statusLabel || entry.status}
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
    </div>
  );
}
