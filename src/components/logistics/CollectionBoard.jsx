import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Download, MapPin, Phone, RefreshCw, ScanLine, Search, Warehouse } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import Drawer from "../ui/Drawer.jsx";
import { backofficeApi } from "../../services/api.js";
import { subscribeBackofficeRealtime } from "../../services/realtime.js";
import ShipmentLegsPanel, { LegBadge, formatDateTime } from "./ShipmentLegsPanel.jsx";

// Suivi des collectes (option B) : partenaire -> entrepôt LID, puis livraison au client par un second trajet
const POLL_MS = 60_000;
const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZES = [25, 50, 100, 200];
const BULK_MAX = 200;
const EXPORT_PAGE_SIZE = 500;
const EXPORT_MAX_ROWS = 10_000;
const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, number: 0 };
const nf = new Intl.NumberFormat("fr-FR");

// Étapes (valeurs attendues par `stage` côté API)
const STAGES = [
  { key: "TO_COLLECT", countKey: "toCollect", label: "À collecter" },
  { key: "ASSIGNED", countKey: "assigned", label: "Collecte affectée" },
  { key: "IN_TRANSIT", countKey: "inTransit", label: "En route vers l'entrepôt" },
  { key: "DEPOSITED", countKey: "deposited", label: "Déposés, à réceptionner" },
  { key: "ANOMALY", countKey: "anomalies", label: "Anomalies", alert: true },
  { key: "AT_WAREHOUSE_UNASSIGNED", countKey: "atWarehouseUnassigned", label: "En entrepôt, livraison non affectée", alert: true },
  { key: "RECEIVED_TODAY", countKey: "receivedToday", label: "Reçus aujourd'hui" }
];

function courierLabel(courier) {
  if (!courier) return "";
  const name = `${courier.firstName || ""} ${courier.lastName || ""}`.trim();
  return name || courier.email || courier.id;
}

function formatWaiting(minutes) {
  const m = Number(minutes) || 0;
  if (m < 1) return "à l'instant";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h${m % 60 ? ` ${m % 60}` : ""}`;
  return `${Math.floor(h / 24)} j`;
}

function Tile({ label, value, active, alert, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border bg-card px-3 py-2.5 text-left transition ${
        active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
      }`}
    >
      <p className="truncate text-[11px] uppercase tracking-wider text-muted-foreground" title={label}>
        {label}
      </p>
      <p className={`text-xl font-bold ${alert && Number(value) > 0 ? "text-rose-600" : "text-foreground"}`}>{nf.format(Number(value) || 0)}</p>
    </button>
  );
}

function mapsLink(partner) {
  if (!partner) return "";
  if (partner.latitude != null && partner.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`;
  }
  return partner.address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(partner.address)}` : "";
}

/** Réception à l'entrepôt avec contrôle de conformité (note obligatoire en cas d'anomalie, photo optionnelle). */
function ReceiptModal({ item, onClose, onDone }) {
  const [check, setCheck] = useState("CONFORME");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const s = item?.shipment || {};

  useEffect(() => {
    setCheck(item?.collection?.status === "ANOMALIE" ? "CONFORME" : "CONFORME");
    setNote("");
    setPhoto(null);
    setError("");
  }, [item]);

  async function submit() {
    if (check === "ANOMALIE" && !note.trim()) {
      setError("Décrivez l'anomalie constatée.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let photoUrl = null;
      if (photo) {
        const uploaded = await backofficeApi.uploadMedia(photo, "warehouse-receipts");
        photoUrl = uploaded?.url || null;
      }
      await backofficeApi.receiveShipmentAtWarehouse(s.id, { check, note: note.trim() || null, photoUrl });
      onDone(check === "ANOMALIE" ? "Anomalie enregistrée : la livraison reste bloquée." : "Colis réceptionné à l'entrepôt.");
    } catch (err) {
      setError(err?.message || "Réception impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={Boolean(item)}
      onClose={() => !busy && onClose()}
      title={`Réception entrepôt · ${s.orderId || `#${s.id || ""}`}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button onClick={submit} isLoading={busy} variant={check === "ANOMALIE" ? "destructive" : "primary"}>
            {check === "ANOMALIE" ? "Enregistrer l'anomalie" : "Confirmer la réception"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="font-semibold">{item?.partner?.name || s.shipperLabel || "Partenaire"}</p>
          <p className="text-xs text-muted-foreground">
            Code colis <span className="font-mono">{s.handoffCode || "-"}</span> · {item?.itemCount || 0} article(s)
            {item?.collection?.courierName || item?.collection?.courierUser
              ? ` · collecté par ${item.collection.courierName || item.collection.courierUser}`
              : " · aucun retrait scanné par un livreur"}
          </p>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-muted-foreground">Contrôle de conformité</legend>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="check" checked={check === "CONFORME"} onChange={() => setCheck("CONFORME")} />
            Conforme : colis complet et en bon état
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" name="check" checked={check === "ANOMALIE"} onChange={() => setCheck("ANOMALIE")} />
            Anomalie : la livraison au client reste bloquée
          </label>
        </fieldset>
        <div className="space-y-1">
          <p className="text-xs font-medium">Note {check === "ANOMALIE" ? "(obligatoire)" : "(optionnelle)"}</p>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder={check === "ANOMALIE" ? "Ex : carton abîmé, article manquant…" : "Ex : regroupé avec la commande …"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium">Photo (optionnelle)</p>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </div>
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{error}</div> : null}
      </div>
    </Modal>
  );
}

export default function CollectionBoard({ couriers = [] }) {
  const activeCouriers = useMemo(() => couriers.filter((c) => c.active && c.email), [couriers]);
  const [summary, setSummary] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const [stage, setStage] = useState(""); // "" = collectes ouvertes
  const [lateOnly, setLateOnly] = useState(false);
  const [courierFilter, setCourierFilter] = useState("");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("urgency");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [waitHours, setWaitHours] = useState(24);
  const [transitHours, setTransitHours] = useState(4);

  const [checked, setChecked] = useState(() => new Map());
  const [bulkCourier, setBulkCourier] = useState("");
  const [bulk, setBulk] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [scanCode, setScanCode] = useState("");
  const [scanError, setScanError] = useState("");
  const [receiptItem, setReceiptItem] = useState(null);
  const [info, setInfo] = useState("");

  const [selected, setSelected] = useState(null);
  const [assignTo, setAssignTo] = useState("");
  const [actionBusy, setActionBusy] = useState("");
  const [actionError, setActionError] = useState("");
  const [legsKey, setLegsKey] = useState(0);
  const seq = useRef(0);
  const refreshRef = useRef(() => {});
  const scanRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setQ(qInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [qInput]);

  // Sélection propre à la vue : tout changement de filtre la vide
  useEffect(() => {
    setPage(0);
    setChecked(new Map());
    setBulk(null);
  }, [q, stage, lateOnly, courierFilter, sort, size]);

  // « En entrepôt, livraison non affectée » : l'affectation en masse porte sur le trajet de LIVRAISON
  const bulkLeg = stage === "AT_WAREHOUSE_UNASSIGNED" ? "LIVRAISON" : "COLLECTE";

  const params = useMemo(
    () => ({
      stage: stage || undefined,
      courier: courierFilter || undefined,
      late: lateOnly || undefined,
      q: q || undefined,
      sort,
      waitAlertHours: waitHours,
      transitAlertHours: transitHours
    }),
    [stage, courierFilter, lateOnly, q, sort, waitHours, transitHours]
  );

  const load = useCallback(async () => {
    const current = ++seq.current;
    setLoading(true);
    try {
      const [sum, list] = await Promise.all([
        backofficeApi.collectionSummary({ waitAlertHours: waitHours, transitAlertHours: transitHours }),
        backofficeApi.collections({ ...params, page, size })
      ]);
      if (current !== seq.current) return;
      setSummary(sum || null);
      setPageData(list || EMPTY_PAGE);
      setError("");
      setUpdatedAt(new Date());
      if ((list?.content?.length || 0) === 0 && (list?.totalPages || 0) > 0 && page > 0) setPage(list.totalPages - 1);
    } catch (err) {
      if (current === seq.current) setError(err?.message || "Impossible de charger les collectes.");
    } finally {
      if (current === seq.current) setLoading(false);
    }
  }, [params, page, size, waitHours, transitHours]);

  useEffect(() => {
    load();
  }, [load]);

  refreshRef.current = () => {
    load();
    setLegsKey((k) => k + 1);
  };

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
    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      unsubscribe();
    };
  }, []);

  const items = useMemo(() => (Array.isArray(pageData?.content) ? pageData.content : []), [pageData]);
  const counts = summary?.counts || {};
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;
  const openTotal = (Number(counts.toCollect) || 0) + (Number(counts.assigned) || 0) + (Number(counts.inTransit) || 0)
    + (Number(counts.deposited) || 0) + (Number(counts.anomalies) || 0);
  const selectedItem = useMemo(() => {
    if (!selected) return null;
    return items.find((i) => i.shipment?.id === selected.shipment?.id) || selected;
  }, [items, selected]);

  function selectable(item) {
    const st = item.collection?.status;
    if (bulkLeg === "LIVRAISON") return st === "RECUE_ENTREPOT" && !item.shipment?.courierUser;
    return st === "A_COLLECTER" || st === "AFFECTEE" || st === "COLLECTEE";
  }
  const selectableOnPage = items.filter(selectable);
  const allPageChecked = selectableOnPage.length > 0 && selectableOnPage.every((i) => checked.has(i.shipment.id));

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
      if (allPageChecked) selectableOnPage.forEach((i) => next.delete(i.shipment.id));
      else
        for (const i of selectableOnPage) {
          if (next.size >= BULK_MAX) break;
          next.set(i.shipment.id, i.shipment.orderId || `#${i.shipment.id}`);
        }
      return next;
    });
  }

  // Une seule requête pour toute la sélection ; un e-mail « collecte prévue » par boutique côté serveur
  async function bulkAssign() {
    const courier = activeCouriers.find((c) => c.email === bulkCourier);
    if (!courier || checked.size === 0 || bulk?.running) return;
    setBulk({ running: true });
    try {
      const result = await backofficeApi.bulkAssignLeg({
        legType: bulkLeg,
        shipmentIds: [...checked.keys()],
        courierUser: courier.email,
        courierName: courierLabel(courier),
        courierPhone: courier.phoneNumber || undefined
      });
      const failures = Array.isArray(result?.failures) ? result.failures : [];
      setBulk({ running: false, ok: result?.assigned?.length || 0, failures, courier: courierLabel(courier) });
      setChecked(new Map(failures.map((f) => [f.shipmentId, f.reference])));
    } catch (err) {
      setBulk({ running: false, ok: 0, failures: [{ reference: "", message: err?.message || "Échec" }], courier: courierLabel(courier) });
    }
    refreshRef.current();
  }

  async function lookupAndReceive(event) {
    event?.preventDefault();
    const code = scanCode.trim();
    if (!code) return;
    setScanError("");
    try {
      const item = await backofficeApi.lookupCollection(code);
      setReceiptItem(item);
      setScanCode("");
    } catch (err) {
      setScanError(err?.message || "Colis introuvable.");
    }
  }

  async function runAction(key, action, message) {
    setActionBusy(key);
    setActionError("");
    setInfo("");
    try {
      await action();
      setInfo(message);
      refreshRef.current();
    } catch (err) {
      setActionError(err?.message || "Action impossible.");
    } finally {
      setActionBusy("");
    }
  }

  function assignSelected(leg) {
    const s = selectedItem?.shipment;
    const courier = activeCouriers.find((c) => c.email === assignTo);
    if (!s || !courier) return;
    const body = { courierUser: courier.email, courierName: courierLabel(courier), courierPhone: courier.phoneNumber || undefined };
    runAction(
      leg,
      () => (leg === "COLLECTE" ? backofficeApi.assignCollectionCourier(s.id, body) : backofficeApi.assignShipmentCourier(s.id, body)),
      leg === "COLLECTE" ? `Collecte affectée à ${courierLabel(courier)}.` : `Livraison affectée à ${courierLabel(courier)}.`
    );
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const all = [];
      for (let p = 0; all.length < EXPORT_MAX_ROWS; p += 1) {
        const data = await backofficeApi.collections({ ...params, page: p, size: EXPORT_PAGE_SIZE });
        const content = Array.isArray(data?.content) ? data.content : [];
        all.push(...content);
        if (content.length < EXPORT_PAGE_SIZE || p + 1 >= (data?.totalPages || 0)) break;
      }
      const header = ["Commande", "Code colis", "Boutique", "Adresse de retrait", "Téléphone boutique", "Articles", "Étape",
        "Livreur collecte", "Affectée", "Retirée", "Déposée", "Réceptionnée", "Contrôle", "Note", "Attente", "En retard"];
      const rows = [
        header.join(";"),
        ...all.slice(0, EXPORT_MAX_ROWS).map((i) => {
          const s = i.shipment || {};
          const c = i.collection || {};
          return [s.orderId, s.handoffCode, i.partner?.name, i.partner?.address, i.partner?.phone, i.itemCount, i.stageLabel || c.statusLabel,
            c.courierName || c.courierUser, formatDateTime(c.assignedAt), formatDateTime(c.pickedUpAt), formatDateTime(c.depositedAt),
            formatDateTime(c.receivedAt), c.receiptCheck || "", c.receiptNote || "", formatWaiting(i.waitingMinutes), i.late ? "Oui" : "Non"]
            .map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`)
            .join(";");
        })
      ];
      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `collectes_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || "Export impossible.");
    } finally {
      setExporting(false);
    }
  }

  const sel = selectedItem;
  const selStatus = sel?.collection?.status;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Option B : le livreur collecte chez le partenaire et dépose à l'entrepôt LID (Cocody Riviera 3) ; le personnel réceptionne
        et contrôle ; la livraison au client (second trajet, livreur éventuellement différent) ne s'affecte qu'après la réception.
        {updatedAt ? ` Mis à jour à ${new Intl.DateTimeFormat("fr-FR", { timeStyle: "medium" }).format(updatedAt)}.` : ""}
      </p>

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => refreshRef.current()}>
            Réessayer
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        <Tile label="Collectes en cours" value={openTotal} active={!stage && !lateOnly} onClick={() => { setStage(""); setLateOnly(false); }} />
        {STAGES.map((st) => (
          <Tile key={st.key} label={st.label} value={counts[st.countKey]} alert={st.alert} active={stage === st.key} onClick={() => { setStage(st.key); setLateOnly(false); }} />
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => { setStage(""); setLateOnly(true); }}
          className={`flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-left ${lateOnly ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
        >
          <span>
            <span className="block text-xs uppercase tracking-widest text-muted-foreground">En attente de collecte &gt; {waitHours} h</span>
            <span className="text-xs text-muted-foreground">Colis prêts chez le partenaire, pas encore retirés</span>
          </span>
          <span className={`text-xl font-bold ${Number(counts.waitingTooLong) > 0 ? "text-rose-600" : ""}`}>{nf.format(Number(counts.waitingTooLong) || 0)}</span>
        </button>
        <button
          type="button"
          onClick={() => { setStage(""); setLateOnly(true); }}
          className={`flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-left ${lateOnly ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
        >
          <span>
            <span className="block text-xs uppercase tracking-widest text-muted-foreground">Collectes en retard (&gt; {transitHours} h)</span>
            <span className="text-xs text-muted-foreground">Retirés mais pas encore réceptionnés à l'entrepôt</span>
          </span>
          <span className={`text-xl font-bold ${Number(counts.transitLate) > 0 ? "text-rose-600" : ""}`}>{nf.format(Number(counts.transitLate) || 0)}</span>
        </button>
      </div>

      <Card className="p-3">
        <form onSubmit={lookupAndReceive} className="flex flex-wrap items-end gap-2">
          <div className="w-full space-y-1 sm:w-96">
            <p className="flex items-center gap-1 text-xs font-medium text-foreground">
              <Warehouse className="h-3.5 w-3.5" /> Réception à l'entrepôt
            </p>
            <div className="relative">
              <ScanLine className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                ref={scanRef}
                className="pl-10 font-mono"
                placeholder="Scannez ou saisissez le code colis (ex. A7K2P)"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                aria-label="Code colis à réceptionner"
              />
            </div>
          </div>
          <Button type="submit" disabled={!scanCode.trim()}>
            Réceptionner
          </Button>
          {scanError ? <p className="w-full text-xs text-red-600">{scanError}</p> : null}
          {info && !sel ? <p className="w-full text-xs text-emerald-700">{info}</p> : null}
        </form>
      </Card>

      <Card className="p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full space-y-1 sm:w-72">
            <p className="text-xs text-muted-foreground">Recherche</p>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Commande, code, boutique, adresse, livreur…" value={qInput} onChange={(e) => setQInput(e.target.value)} />
            </div>
          </div>
          <div className="w-full space-y-1 sm:w-56">
            <p className="text-xs text-muted-foreground">Livreur de collecte</p>
            <Select value={courierFilter} onChange={(e) => setCourierFilter(e.target.value)}>
              <option value="">Tous</option>
              <option value="UNASSIGNED">Non affectées</option>
              {(summary?.couriers || []).map((c) => (
                <option key={c.courier} value={c.courier}>
                  {c.courierName || c.courier} · {c.assigned + c.inTransit} en cours
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full space-y-1 sm:w-48">
            <p className="text-xs text-muted-foreground">Tri</p>
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="urgency">Urgence</option>
              <option value="partner">Par boutique (tournée)</option>
              <option value="oldest">Plus anciennes</option>
              <option value="newest">Plus récentes</option>
            </Select>
          </div>
          <label className="flex h-10 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4" checked={lateOnly} onChange={() => setLateOnly((v) => !v)} />
            En retard seulement
          </label>
          <div className="w-full space-y-1 sm:w-28">
            <p className="text-xs text-muted-foreground">Attente max</p>
            <Select value={`${waitHours}`} onChange={(e) => setWaitHours(Number(e.target.value))} aria-label="Seuil d'attente de collecte">
              {[4, 12, 24, 48].map((h) => (
                <option key={h} value={h}>{h} h</option>
              ))}
            </Select>
          </div>
          <div className="w-full space-y-1 sm:w-28">
            <p className="text-xs text-muted-foreground">Trajet max</p>
            <Select value={`${transitHours}`} onChange={(e) => setTransitHours(Number(e.target.value))} aria-label="Seuil de trajet vers l'entrepôt">
              {[2, 4, 8, 24].map((h) => (
                <option key={h} value={h}>{h} h</option>
              ))}
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => refreshRef.current()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualiser
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={exporting || totalElements === 0} isLoading={exporting}>
              <Download className="h-4 w-4" /> Exporter
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {checked.size > 0 || bulk ? (
          <div className="space-y-2 border-b border-border bg-muted/40 px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">
                {checked.size} sélectionné{checked.size > 1 ? "s" : ""}
                {checked.size >= BULK_MAX ? ` (max ${BULK_MAX})` : ""}
              </span>
              <div className="w-72">
                <Select value={bulkCourier} onChange={(e) => setBulkCourier(e.target.value)} aria-label="Livreur pour la sélection">
                  <option value="">{bulkLeg === "COLLECTE" ? "Affecter la collecte à…" : "Affecter la livraison à…"}</option>
                  {activeCouriers.map((c) => (
                    <option key={c.id} value={c.email}>{courierLabel(c)}</option>
                  ))}
                </Select>
              </div>
              <Button size="sm" onClick={bulkAssign} disabled={!bulkCourier || checked.size === 0 || Boolean(bulk?.running)} isLoading={Boolean(bulk?.running)}>
                Affecter
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setChecked(new Map()); setBulk(null); }} disabled={Boolean(bulk?.running)}>
                Vider la sélection
              </Button>
            </div>
            {bulk && !bulk.running ? (
              <p aria-live="polite" className={`text-xs ${bulk.failures?.length ? "text-amber-700" : "text-emerald-700"}`}>
                {bulk.ok} colis affecté{bulk.ok > 1 ? "s" : ""} à {bulk.courier}
                {bulk.failures?.length ? ` · ${bulk.failures.length} refus : ${bulk.failures.slice(0, 5).map((f) => `${f.reference} (${f.message})`).join(", ")}` : "."}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-2">
                  <input type="checkbox" className="h-4 w-4" aria-label="Sélectionner la page" checked={allPageChecked} disabled={selectableOnPage.length === 0} onChange={togglePage} />
                </th>
                <th className="px-3 py-2">Commande / Code</th>
                <th className="px-3 py-2">Boutique / Retrait</th>
                <th className="px-3 py-2">Articles</th>
                <th className="px-3 py-2">Livreur collecte</th>
                <th className="px-3 py-2">Étape</th>
                <th className="px-3 py-2">Attente</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!pageData && loading ? (
                <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">Chargement…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">Aucune collecte pour ces critères.</td></tr>
              ) : (
                items.map((item) => {
                  const s = item.shipment || {};
                  const c = item.collection || {};
                  const canSelect = selectable(item);
                  const isChecked = checked.has(s.id);
                  return (
                    <tr key={s.id} className={`cursor-pointer border-t border-border align-top hover:bg-muted/30 ${sel?.shipment?.id === s.id ? "bg-primary/5" : ""}`} onClick={() => { setSelected(item); setAssignTo(""); setActionError(""); setInfo(""); }}>
                      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="h-4 w-4" aria-label={`Sélectionner ${s.orderId || s.id}`} checked={isChecked} disabled={!canSelect || (!isChecked && checked.size >= BULK_MAX)} onChange={() => toggleChecked(item)} />
                      </td>
                      <td className="px-3 py-2">
                        <p className="whitespace-nowrap font-semibold text-foreground">{s.orderId || `#${s.id}`}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{s.handoffCode || "-"}</p>
                      </td>
                      <td className="max-w-[16rem] px-3 py-2">
                        <p className="truncate font-medium">{item.partner?.name || s.shipperLabel}</p>
                        <p className="whitespace-normal break-words text-xs text-muted-foreground">
                          {item.partner?.address || <span className="text-amber-700">Adresse de retrait non renseignée</span>}
                        </p>
                      </td>
                      <td className="px-3 py-2">{item.itemCount || "-"}</td>
                      <td className="max-w-[10rem] truncate px-3 py-2">{c.courierName || c.courierUser || <span className="text-muted-foreground">Non affectée</span>}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <LegBadge status={c.status} />
                          {c.status === "COLLECTEE" && c.depositedAt ? <span className="text-[11px] font-semibold text-amber-700">Déposé, à réceptionner</span> : null}
                          {c.status === "RECUE_ENTREPOT" ? (
                            <span className="text-[11px] text-muted-foreground">{s.courierUser ? `Livraison : ${s.courierName || s.courierUser}` : "Livraison à affecter"}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        <span className={item.late ? "font-medium text-rose-700" : "text-muted-foreground"}>{c.status === "RECUE_ENTREPOT" ? "-" : formatWaiting(item.waitingMinutes)}</span>
                        {item.late ? (
                          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                            <AlertTriangle className="h-3 w-3" /> Retard
                          </span>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {c.status === "COLLECTEE" || c.status === "ANOMALIE" || c.status === "AFFECTEE" || c.status === "A_COLLECTER" ? (
                          <Button size="sm" variant={c.status === "COLLECTEE" ? "primary" : "outline"} onClick={() => setReceiptItem(item)}>
                            Réceptionner
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setSelected(item)}>Détail</Button>
                        )}
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
            {totalElements > 0 ? `${nf.format(page * size + 1)}–${nf.format(page * size + items.length)} sur ${nf.format(totalElements)} collectes` : "0 collecte"}
            {loading && pageData ? " · actualisation…" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Select value={`${size}`} onChange={(e) => setSize(Number(e.target.value))} aria-label="Collectes par page" className="h-8 w-24 py-1 text-xs">
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </Select>
            <Button size="sm" variant="outline" disabled={page <= 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))} aria-label="Page précédente">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>Page {totalPages === 0 ? 0 : page + 1} / {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((p) => p + 1)} aria-label="Page suivante">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {(summary?.couriers || []).length > 0 ? (
        <Card className="p-3">
          <p className="mb-2 text-sm font-semibold">Charge des livreurs de collecte</p>
          <div className="flex flex-wrap gap-2">
            {summary.couriers.map((c) => (
              <button
                key={c.courier}
                type="button"
                onClick={() => setCourierFilter(c.courier)}
                className="rounded-lg border border-border px-3 py-1.5 text-left text-xs hover:border-primary/50"
              >
                <span className="font-medium">{c.courierName || c.courier}</span>
                <span className="ml-2 text-muted-foreground">{c.assigned} à collecter · {c.inTransit} en route</span>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      <Drawer isOpen={Boolean(sel)} onClose={() => setSelected(null)} title={sel ? `Colis ${sel.shipment?.orderId || `#${sel.shipment?.id}`}` : "Colis"} width="w-full sm:w-[34rem]">
        {sel ? (
          <div className="space-y-5 text-sm">
            <div className="space-y-1 rounded-lg border border-border p-3">
              <p className="font-semibold">{sel.partner?.name || sel.shipment?.shipperLabel}</p>
              <p className="flex items-start gap-1 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {sel.partner?.address || "Adresse de retrait non renseignée"}
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                {sel.partner?.phone ? (
                  <a className="inline-flex items-center gap-1 text-primary hover:underline" href={`tel:${sel.partner.phone}`}>
                    <Phone className="h-3 w-3" /> {sel.partner.phone}
                  </a>
                ) : null}
                {mapsLink(sel.partner) ? (
                  <a className="text-primary hover:underline" href={mapsLink(sel.partner)} target="_blank" rel="noreferrer">Itinéraire</a>
                ) : null}
                <span className="text-muted-foreground">Code colis <span className="font-mono">{sel.shipment?.handoffCode || "-"}</span> · {sel.itemCount || 0} article(s)</span>
              </div>
            </div>

            {selStatus && selStatus !== "RECUE_ENTREPOT" ? (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="font-semibold">{sel.collection?.courierUser ? "Réaffecter la collecte" : "Affecter la collecte"}</p>
                <div className="flex gap-2">
                  <Select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} aria-label="Livreur de collecte">
                    <option value="">Choisir un livreur actif…</option>
                    {activeCouriers.map((c) => (
                      <option key={c.id} value={c.email}>{courierLabel(c)}</option>
                    ))}
                  </Select>
                  <Button onClick={() => assignSelected("COLLECTE")} disabled={!assignTo || Boolean(actionBusy)} isLoading={actionBusy === "COLLECTE"}>
                    Affecter
                  </Button>
                </div>
                <Button size="sm" variant={selStatus === "COLLECTEE" ? "primary" : "outline"} className="gap-2" onClick={() => setReceiptItem(sel)}>
                  <Warehouse className="h-4 w-4" /> {selStatus === "ANOMALIE" ? "Lever l'anomalie (nouvelle réception)" : "Réceptionner à l'entrepôt"}
                </Button>
              </div>
            ) : null}

            {selStatus === "RECUE_ENTREPOT" && sel.shipment?.status === "EN_PREPARATION" ? (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <p className="font-semibold">{sel.shipment?.courierUser ? "Réaffecter la livraison au client" : "Affecter la livraison au client"}</p>
                <div className="flex gap-2">
                  <Select value={assignTo} onChange={(e) => setAssignTo(e.target.value)} aria-label="Livreur de livraison">
                    <option value="">Choisir un livreur actif…</option>
                    {activeCouriers.map((c) => (
                      <option key={c.id} value={c.email}>{courierLabel(c)} — {c.toPickup + c.inTransit} en cours</option>
                    ))}
                  </Select>
                  <Button onClick={() => assignSelected("LIVRAISON")} disabled={!assignTo || Boolean(actionBusy)} isLoading={actionBusy === "LIVRAISON"}>
                    Affecter
                  </Button>
                </div>
              </div>
            ) : null}

            {actionError ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">{actionError}</div> : null}
            {info ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">{info}</div> : null}

            <ShipmentLegsPanel shipmentId={sel.shipment?.id} refreshKey={legsKey} />
          </div>
        ) : null}
      </Drawer>

      <ReceiptModal
        item={receiptItem}
        onClose={() => {
          setReceiptItem(null);
          scanRef.current?.focus?.();
        }}
        onDone={(message) => {
          setReceiptItem(null);
          setInfo(message);
          refreshRef.current();
          scanRef.current?.focus?.();
        }}
      />
    </div>
  );
}
