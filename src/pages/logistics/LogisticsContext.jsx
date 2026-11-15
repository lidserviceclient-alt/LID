import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import ShippingLabel from "../../components/ShippingLabel.jsx";
import { backofficeApi } from "../../services/api.js";
import { subscribeBackofficeRealtime } from "../../services/realtime.js";
import {
  BULK_MAX,
  COLUMNS,
  COLUMN_PREVIEW,
  EMPTY_PAGE,
  EXPORT_MAX_ROWS,
  EXPORT_PAGE_SIZE,
  POLL_MS,
  SEARCH_DEBOUNCE_MS,
  courierLabel,
  filtersFromSearch,
  filtersToSearch,
  formatDateTime,
  formatMoney,
  loadCarriers,
  saveCarriers,
  shipperLabel,
  statusLabel
} from "./logisticsUtils.js";

/**
 * État partagé des sous-pages /logistics/* : synthèse, indicateurs, filtres et liste des colis,
 * sélection pour l'affectation en lot, colis ouvert dans le panneau, QR, impression, transporteurs.
 * Monté une seule fois par LogisticsLayout : filtres et sélection survivent au changement de sous-page.
 * Les filtres de la liste sont reflétés dans l'URL (/logistics/shipments?column=FAILED&late=1…).
 */
const LogisticsContext = createContext(null);

export const LOGISTICS_BASE = "/logistics";
const LIST_PATHS = [`${LOGISTICS_BASE}/shipments`, `${LOGISTICS_BASE}/history`];

export function useLogistics() {
  const ctx = useContext(LogisticsContext);
  if (!ctx) throw new Error("useLogistics doit être utilisé sous <LogisticsProvider>.");
  return ctx;
}

export function LogisticsProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/\/+$/, "");
  const history = pathname === `${LOGISTICS_BASE}/history`; // historique complet = sous-page dédiée
  const listActive = LIST_PATHS.includes(pathname);

  // Synthèse du suivi (compteurs, charge des livreurs) et indicateurs historiques (délai, coût, dernières livraisons)
  const [collectionCounts, setCollectionCounts] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [kpis, setKpis] = useState({ avgDelayDays: null, avgCost: 0 });
  const [delivered, setDelivered] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [companyInfo, setCompanyInfo] = useState(null);

  // Filtres (tous appliqués côté serveur), initialisés depuis l'URL (lien profond)
  const initial = useMemo(() => filtersFromSearch(location.search), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [tab, setTab] = useState(initial.tab); // colonne du suivi ("" = tous)
  const [status, setStatus] = useState(initial.status);
  const [carrier, setCarrier] = useState(initial.carrier);
  const [lateOnly, setLateOnly] = useState(initial.lateOnly);
  const [courierFilter, setCourierFilter] = useState(initial.courierFilter); // "" | UNASSIGNED | email
  const [qInput, setQInput] = useState(initial.q);
  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort);
  const [page, setPage] = useState(initial.page);
  const [size, setSize] = useState(initial.size);
  const [prepHours, setPrepHours] = useState(initial.prepHours);
  const [transitHours, setTransitHours] = useState(initial.transitHours);
  const [viewState, setView] = useState(initial.view); // list | columns
  const view = history ? "list" : viewState;

  const [pageData, setPageData] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [colData, setColData] = useState({});
  const [colLoading, setColLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  // Sélection multiple (id -> référence), affectation en lot
  const [checked, setChecked] = useState(() => new Map());
  const [bulkCourier, setBulkCourier] = useState("");
  const [bulk, setBulk] = useState(null);

  // Panneau latéral du colis
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Transporteurs (liste locale au navigateur)
  const [carriers, setCarriers] = useState(() => loadCarriers());

  // QR code de remise
  const [qrModal, setQrModal] = useState({ open: false, value: "", title: "" });

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

  // Recherche : debounce, retour en première page (pas au montage : la page vient peut-être de l'URL)
  useEffect(() => {
    const timer = setTimeout(() => setQ(qInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [qInput]);

  const firstQ = useRef(true);
  useEffect(() => {
    if (firstQ.current) {
      firstQ.current = false;
      return;
    }
    setPage(0);
    setChecked(new Map());
  }, [q]);

  // Entrée / sortie de l'historique : première page, sélection vidée ; tri « urgence » -> « création »
  const prevHistory = useRef(history);
  useEffect(() => {
    if (prevHistory.current === history) return;
    prevHistory.current = history;
    setPage(0);
    setChecked(new Map());
    setBulk(null);
    if (history) setSort((s) => (s === "urgency" ? "created" : s));
  }, [history]);

  // URL <-> filtres : une query string étrangère (lien collé) s'applique ; sinon l'état courant est écrit
  const lastWritten = useRef(null);
  const pendingSearch = useRef(null);
  useEffect(() => {
    if (!listActive) return;
    const incoming = location.search.replace(/^\?/, "");
    if (!incoming || incoming === lastWritten.current) return;
    const f = filtersFromSearch(incoming);
    if (history && f.sort === "urgency" && !new URLSearchParams(incoming).has("sort")) f.sort = "created";
    lastWritten.current = incoming;
    // L'écriture de l'URL attend que l'état ait rattrapé la query string reçue (forme normalisée)
    pendingSearch.current = filtersToSearch(f, { history });
    setTab(f.tab);
    setStatus(f.status);
    setCarrier(f.carrier);
    setLateOnly(f.lateOnly);
    setCourierFilter(f.courierFilter);
    setQInput(f.q);
    setQ(f.q);
    setSort(f.sort);
    setPage(f.page);
    setSize(f.size);
    setPrepHours(f.prepHours);
    setTransitHours(f.transitHours);
    setView(f.view);
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtersSearch = filtersToSearch(
    { tab, status, carrier, lateOnly, courierFilter, q, sort, page, size, prepHours, transitHours, view: viewState },
    { history }
  );
  useEffect(() => {
    if (!listActive) return;
    const current = location.search.replace(/^\?/, "");
    if (pendingSearch.current !== null) {
      if (filtersSearch !== pendingSearch.current) return; // état pas encore appliqué
      pendingSearch.current = null;
    }
    if (current === filtersSearch) {
      lastWritten.current = current;
      return;
    }
    // Ne pas écraser une query string étrangère pas encore lue par l'effet précédent
    if (current && current !== lastWritten.current) return;
    lastWritten.current = filtersSearch;
    navigate({ pathname: location.pathname, search: filtersSearch ? `?${filtersSearch}` : "" }, { replace: true });
  }, [listActive, filtersSearch, location.pathname, location.search, navigate]);

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
    // Compteurs des collectes (option B)
    backofficeApi
      .collectionSummary()
      .then((data) => setCollectionCounts(data?.counts || null))
      .catch(() => {});
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

  // La liste n'est chargée que sur les sous-pages qui l'affichent
  useEffect(() => {
    if (listActive && view === "list") loadList();
  }, [listActive, view, loadList]);

  useEffect(() => {
    if (listActive && view === "columns") loadColumns();
  }, [listActive, view, loadColumns]);

  refreshRef.current = () => {
    loadSummary();
    loadOverview();
    if (!listActive) return;
    if (view === "list") loadList();
    else loadColumns();
  };
  const refresh = useCallback(() => refreshRef.current(), []);

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
  const counts = useMemo(() => summary?.counts || {}, [summary]);
  const totalOpen = COLUMNS.reduce((acc, col) => acc + (Number(counts[col.countKey]) || 0), 0);
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

  const openShipment = useCallback((item) => {
    setSelectedId(item?.shipment?.id ?? null);
    setSelectedItem(item || null);
  }, []);
  const closeShipment = useCallback(() => setSelectedId(null), []);

  function resetSelection() {
    setChecked(new Map());
    setBulk(null);
  }

  function resetPaging() {
    setPage(0);
    resetSelection();
  }

  const goTo = (sub) => {
    const target = `${LOGISTICS_BASE}/${sub}`;
    if (pathname !== target) navigate(target);
  };

  // Tuiles : une colonne du suivi (sous-page Livraisons clients), ou l'historique complet
  function showTab(next) {
    setView("list");
    setTab(next);
    setStatus(""); // une tuile remplace la précédente : pas de cumul avec le filtre de statut
    resetPaging();
    goTo("shipments");
  }

  function showHistory() {
    if (sort === "urgency") setSort("created");
    resetPaging();
    goTo("history");
  }

  function showColumns() {
    setView("columns");
    goTo("shipments");
  }

  function showList() {
    setView("list");
  }

  function toggleLate() {
    setLateOnly((v) => !v);
    resetPaging();
  }

  function changeCourier(value, { open = false } = {}) {
    setCourierFilter(value);
    resetPaging();
    if (open && !listActive) goTo("shipments");
  }

  function changeStatus(value) {
    setStatus(value);
    resetPaging();
  }

  function changeCarrier(value) {
    setCarrier(value);
    resetPaging();
  }

  function changeSort(value) {
    setSort(value);
    setPage(0);
  }

  function changeSize(value) {
    setSize(value);
    setPage(0);
  }

  function resetFilters() {
    setQInput("");
    setQ("");
    setStatus("");
    setCarrier("");
    setLateOnly(false);
    setCourierFilter("");
    if (history) {
      // Historique : on reste sur la sous-page, tri par création
      setSort("created");
      resetPaging();
      return;
    }
    setSort("urgency");
    showTab("");
  }

  function toggleChecked(item) {
    const id = item.shipment.id;
    setChecked((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < BULK_MAX) next.set(id, item.shipment.orderId || `#${id}`);
      return next;
    });
  }

  const selectableOnPage = items.filter((item) => item.shipment?.status !== "LIVREE");
  const allPageChecked = selectableOnPage.length > 0 && selectableOnPage.every((item) => checked.has(item.shipment.id));

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

  // Une seule requête pour toute la sélection (200 colis max) ; chaque refus est rapporté
  async function bulkAssign() {
    const courier = activeCouriers.find((c) => c.email === bulkCourier);
    if (!courier || checked.size === 0 || bulk?.running) return;
    const entries = [...checked.entries()];
    setBulk({ running: true, done: 0, total: entries.length, ok: 0, failures: [], courier: courierLabel(courier) });
    let failures = [];
    let ok = 0;
    try {
      const result = await backofficeApi.bulkAssignLeg({
        legType: "LIVRAISON",
        shipmentIds: entries.map(([id]) => id),
        courierUser: courier.email,
        courierName: courierLabel(courier),
        courierPhone: courier.phoneNumber || undefined
      });
      ok = result?.assigned?.length || 0;
      failures = (result?.failures || []).map((f) => ({ id: f.shipmentId, ref: f.reference || checked.get(f.shipmentId) || `#${f.shipmentId}`, message: f.message }));
    } catch (err) {
      failures = entries.map(([id, ref]) => ({ id, ref, message: err?.message || "Échec" }));
    }
    setBulk({ running: false, done: entries.length, total: entries.length, ok, failures, courier: courierLabel(courier) });
    setChecked(new Map(failures.filter((f) => f.id != null).map((f) => [f.id, f.ref])));
    refreshRef.current();
  }

  const initPrint = useCallback(async (shipmentId) => {
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
  }, []);

  const openQrModal = useCallback((value, title) => {
    setQrModal({ open: true, value: String(value || "").trim(), title: String(title || "").trim() });
  }, []);
  const closeQrModal = useCallback(() => setQrModal({ open: false, value: "", title: "" }), []);

  function persistCarriers(next) {
    const cleaned = Array.from(new Set(next.map((x) => String(x).trim()).filter(Boolean)));
    setCarriers(cleaned);
    saveCarriers(cleaned);
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

  const value = {
    // données
    summary, summaryError, updatedAt, counts, couriers, activeCouriers, totalOpen, collectionCounts,
    kpis, delivered, overviewLoading, overviewError, companyInfo,
    pageData, items, listLoading, listError, colData, colLoading,
    // filtres
    history, view, tab, status, carrier, lateOnly, courierFilter, qInput, setQInput, q, sort, page, setPage, size,
    prepHours, setPrepHours, transitHours, setTransitHours, hasFilter,
    showTab, showHistory, showColumns, showList, toggleLate, changeCourier, changeStatus, changeCarrier,
    changeSort, changeSize, resetFilters,
    // sélection / lot
    checked, toggleChecked, togglePage, allPageChecked, selectableOnPage, resetSelection, bulkCourier, setBulkCourier, bulk, bulkAssign,
    // panneau, QR, impression, transporteurs, export
    selectedId, selected, openShipment, closeShipment, setSelectedItem,
    qrModal, openQrModal, closeQrModal, initPrint,
    carriers, persistCarriers,
    exporting, exportError, exportShipmentsCsv,
    refresh, busy: listActive && (listLoading || colLoading), goTo
  };

  return (
    <LogisticsContext.Provider value={value}>
      {children}
      {/* Composant d'impression (masqué) */}
      <div style={{ display: "none" }}>
        <ShippingLabel ref={labelRef} order={printOrder} company={companyInfo} />
      </div>
    </LogisticsContext.Provider>
  );
}
