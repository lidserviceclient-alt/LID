import { useState, useEffect, useRef } from "react";
import PageSEO from "@/components/PageSEO";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { trackOrder } from "@/services/trackingService";
import { resolveBackendAssetUrl } from "@/services/categoryService";

const statusKeyFromBackend = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  if (s === "PENDING") return "pending";
  if (s === "PAID" || s === "PROCESSING") return "processing";
  if (s === "READY_TO_DELIVER" || s === "DELIVERY_IN_PROGRESS") return "shipped";
  if (s === "DELIVERY_FAILED" || s === "CANCELED") return "delivery_issue";
  if (s === "DELIVERED") return "delivered";
  if (s === "REFUNDED") return "refunded";
  return "pending";
};

const statusIndexFromKey = (value) => {
  switch (`${value || ""}`.trim().toLowerCase()) {
    case "pending":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivery_issue":
      return 3;
    case "delivered":
    case "refunded":
      return 4;
    default:
      return 0;
  }
};

const stepIndexFromBackend = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  if (s === "PENDING") return 0;
  if (s === "PAID" || s === "PROCESSING") return 1;
  if (s === "READY_TO_DELIVER" || s === "DELIVERY_IN_PROGRESS") return 2;
  if (s === "DELIVERY_FAILED" || s === "CANCELED") return 3;
  if (s === "DELIVERED" || s === "REFUNDED") return 4;
  return 0;
};

const formatStepDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
};

const formatMoney = (value, currency = "FCFA") => {
  const n = Number(value);
  if (!Number.isFinite(n)) return `0 ${currency}`;
  return `${n.toLocaleString("fr-FR")} ${currency}`;
};

const shipmentStatusMeta = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  if (s === "EN_PREPARATION") return { label: "En préparation", className: "bg-blue-50 text-blue-700 border-blue-100" };
  if (s === "EN_COURS") return { label: "En transit", className: "bg-[#6aa200]/10 text-[#4f7d00] border-[#6aa200]/20" };
  if (s === "LIVREE") return { label: "Livrée", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
  if (s === "ECHEC") return { label: "Incident", className: "bg-red-50 text-red-700 border-red-100" };
  return { label: s || "À confirmer", className: "bg-neutral-100 text-neutral-700 border-neutral-200" };
};

const shipmentStatusDone = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  return ["EN_PREPARATION", "EN_COURS", "LIVREE", "ECHEC"].includes(s);
};

const summarizeShipments = (shipments = []) => {
  const list = Array.isArray(shipments) ? shipments : [];
  const total = list.length;
  const delivered = list.filter((s) => s.status === "LIVREE").length;
  const incident = list.filter((s) => s.status === "ECHEC").length;
  const active = list.filter((s) => ["EN_PREPARATION", "EN_COURS"].includes(s.status)).length;
  if (!total) return "Aucune livraison";
  if (incident > 0) return `${incident} incident${incident > 1 ? "s" : ""} à traiter`;
  if (delivered === total) return "Toutes les livraisons sont terminées";
  if (delivered > 0) return `${delivered}/${total} livraison${total > 1 ? "s" : ""} livrée${delivered > 1 ? "s" : ""}`;
  if (active > 0) return `${active}/${total} livraison${total > 1 ? "s" : ""} en cours`;
  return `${total} livraison${total > 1 ? "s" : ""} à préparer`;
};

const normalizeTrackingItem = (item) => {
  const itemType = `${item?.itemType || (item?.ticketEventId ? "TICKET" : "ARTICLE")}`.trim().toUpperCase();
  const qty = Number(item?.quantity || 0);
  const unitPrice = Number(item?.unitPrice || 0);
  const subtotal = Number(item?.subtotal);
  const fallbackImage = itemType === "TICKET" ? "/imgs/wall-1.jpg" : "/imgs/logo.png";
  return {
    id: item?.articleId || item?.ticketEventId || `${item?.articleName || "item"}-${Math.random()}`,
    itemType,
    name: `${item?.articleName || "Article"}`.trim(),
    imageUrl: resolveBackendAssetUrl(item?.mainImageUrl) || fallbackImage,
    quantity: Number.isFinite(qty) ? qty : 0,
    unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
    subtotal: Number.isFinite(subtotal) ? subtotal : ((Number.isFinite(unitPrice) ? unitPrice : 0) * (Number.isFinite(qty) ? qty : 0)),
    fallbackImage,
  };
};

const normalizeShipmentHistory = (shipment) => {
  const history = Array.isArray(shipment?.history) ? shipment.history : [];
  const normalized = history
    .map((entry) => {
      const status = `${entry?.status || ""}`.trim().toUpperCase();
      const meta = shipmentStatusMeta(status);
      return {
        status,
        label: `${entry?.label || meta.label}`.trim(),
        changedAt: entry?.changedAt || "",
        date: formatStepDate(entry?.changedAt),
        comment: `${entry?.comment || ((status === `${shipment?.status || ""}`.trim().toUpperCase()) ? shipment?.customerFacingComment : "") || ""}`.trim(),
      };
    })
    .filter((entry) => entry.status || entry.label);

  if (normalized.length > 0) {
    return normalized;
  }

  const meta = shipmentStatusMeta(shipment?.status);
  return [{
    status: `${shipment?.status || ""}`.trim().toUpperCase(),
    label: meta.label,
    changedAt: "",
    date: "-",
    comment: `${shipment?.customerFacingComment || ""}`.trim(),
  }];
};

const shouldDisplayTimelineComment = (event) => {
  if (!event || event.kind !== "shipment") return false;
  return event.status === "EN_COURS" || event.status === "ECHEC";
};

const orderStatusLabel = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  if (s === "PENDING") return "Commande confirmée";
  if (s === "PAID") return "Paiement validé";
  if (s === "PROCESSING") return "Préparation en cours";
  if (s === "READY_TO_DELIVER") return "Commande expédiée";
  if (s === "DELIVERY_IN_PROGRESS") return "Commande expédiée";
  if (s === "DELIVERY_FAILED") return "Problème de livraison";
  if (s === "DELIVERED") return "Commande livrée";
  if (s === "CANCELED") return "Commande annulée";
  if (s === "REFUNDED") return "Commande remboursée";
  return s || "Mise à jour commande";
};

const buildUnifiedTimeline = ({ orderHistory, fallbackTimeline, shipments }) => {
  const events = [];

  if (Array.isArray(orderHistory)) {
    orderHistory.forEach((entry) => {
      const status = `${entry?.status || ""}`.trim().toUpperCase();
      if (!status) return;
      if (status === "DELIVERY_IN_PROGRESS") return;
      events.push({
        id: `order-${status}-${entry?.changedAt || events.length}`,
        kind: "order",
        status,
        title: orderStatusLabel(status),
        scope: "Commande",
        dateValue: entry?.changedAt || "",
        date: formatStepDate(entry?.changedAt),
        comment: "",
        done: true,
      });
    });
  }

  if (Array.isArray(shipments)) {
    shipments.forEach((shipment, shipmentIndex) => {
      const shipmentLabel = `Livraison ${shipmentIndex + 1}`;
      const history = Array.isArray(shipment?.history) ? shipment.history : [];
      history.forEach((entry, historyIndex) => {
        const status = `${entry?.status || ""}`.trim().toUpperCase();
        if (!status) return;
        const meta = shipmentStatusMeta(status);
        events.push({
          id: `shipment-${shipment.id || shipmentIndex}-${status}-${entry?.date || historyIndex}`,
          kind: "shipment",
          status,
          title: `${shipmentLabel} - ${entry?.label || meta.label}`,
          scope: shipmentLabel,
          dateValue: entry?.changedAt || entry?.rawDate || "",
          date: entry?.date || formatStepDate(entry?.changedAt),
          comment: shouldDisplayTimelineComment({ kind: "shipment", status })
            ? `${entry?.comment || shipment?.customerFacingComment || ""}`.trim()
            : "",
          done: shipmentStatusDone(status),
        });
      });
    });
  }

  const timedEvents = events.filter((event) => event.dateValue);
  const untimedEvents = events.filter((event) => !event.dateValue);
  timedEvents.sort((a, b) => new Date(b.dateValue).getTime() - new Date(a.dateValue).getTime());

  if (timedEvents.length || untimedEvents.length) {
    return [...timedEvents, ...untimedEvents];
  }

  return fallbackTimeline;
};

export default function OrderTracking() {
  const [orderId, setOrderId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const lastAutoTrackedRef = useRef("");
  const timelineRef = useRef(null);
  const steps = [
    { key: "pending", label: "Commande confirmée", icon: Package },
    { key: "processing", label: "Préparation", icon: Clock },
    { key: "shipped", label: "Expédiée", icon: Truck },
    { key: "delivery_issue", label: "Problème", icon: AlertTriangle },
    { key: "delivered", label: "Livrée", icon: CheckCircle },
  ];

  const runTracking = async (ref) => {
    const trimmed = `${ref || ""}`.trim();
    if (!trimmed) {
      toast.error("Veuillez entrer un numéro de commande");
      return;
    }

    setIsLoading(true);
    try {
      const data = await trackOrder(trimmed);
      const currentStatus = data?.currentStatus || "PENDING";
      const idx = stepIndexFromBackend(currentStatus);

      const history = Array.isArray(data?.statusHistory) ? data.statusHistory : [];
      const dateByStatus = new Map(
        history
          .filter((h) => h?.status && h?.changedAt)
          .map((h) => [`${h.status}`.toUpperCase(), h.changedAt])
      );

      const eta = data?.deliveryDate
        ? new Date(data.deliveryDate).toLocaleDateString("fr-FR", { dateStyle: "medium" })
        : data?.updatedAt
          ? new Date(data.updatedAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })
          : "À confirmer";

      const statusKey = statusKeyFromBackend(currentStatus);
      const latestComment = history.length ? `${history[history.length - 1]?.comment || ""}`.trim() : "";
      const location =
        statusKey === "pending"
          ? "Commande enregistrée"
          : statusKey === "processing"
            ? "Préparation en cours"
              : statusKey === "shipped"
                ? "Commande expédiée"
                : statusKey === "delivery_issue"
                  ? "Tentative de livraison échouée"
                  : statusKey === "refunded"
                    ? "Remboursement effectué"
                    : "Livré";

      const items = Array.isArray(data?.items)
        ? data.items.map(normalizeTrackingItem).filter((item) => item.name)
        : [];

      const currency = `${data?.currency || "FCFA"}`.trim() || "FCFA";
      const itemsAmount = items.reduce((acc, item) => acc + Number(item?.subtotal || 0), 0);
      const totalAmount = Number.isFinite(Number(data?.amount))
        ? Number(data.amount)
        : itemsAmount;
      const shippingMethodCode = `${data?.shippingMethodCode || ""}`.trim();
      const shippingMethodLabel = `${data?.shippingMethodLabel || data?.deliveryType || ""}`.trim();
      const persistedShippingCost = Number(data?.shippingCost);
      const shippingCost = Number.isFinite(persistedShippingCost) && persistedShippingCost >= 0
        ? persistedShippingCost
        : null;
      const rawShipments = Array.isArray(data?.shipments) && data.shipments.length > 0
        ? data.shipments
        : [{
            trackingId: data?.trackingNumber || "",
            shipperType: "LID",
            shipperId: "LID",
            shipperLabel: data?.deliveryType || "LID",
            carrier: data?.deliveryType || "Standard",
            status: currentStatus === "DELIVERED" ? "LIVREE" : currentStatus === "DELIVERY_IN_PROGRESS" ? "EN_COURS" : currentStatus === "DELIVERY_FAILED" ? "ECHEC" : "EN_PREPARATION",
            eta: data?.deliveryDate,
            customerValidationCode: data?.customerValidationCode,
            items
          }];
      const shipments = rawShipments.map((shipment, index) => {
        const shipmentItems = Array.isArray(shipment?.items)
          ? shipment.items.map(normalizeTrackingItem).filter((item) => item.name)
          : items;
        return {
          id: shipment?.id || `${shipment?.trackingId || "shipment"}-${index}`,
          trackingId: `${shipment?.trackingId || ""}`.trim(),
          shipperType: `${shipment?.shipperType || ""}`.trim().toUpperCase(),
          shipperId: `${shipment?.shipperId || ""}`.trim(),
          shipperLabel: `${shipment?.shipperLabel || (shipment?.shipperType === "PARTNER" ? "Partenaire" : "LID")}`.trim(),
          carrier: `${shipment?.carrier || "Standard"}`.trim(),
          status: `${shipment?.status || "EN_PREPARATION"}`.trim().toUpperCase(),
          eta: shipment?.eta ? new Date(shipment.eta).toLocaleDateString("fr-FR", { dateStyle: "medium" }) : "À confirmer",
          customerValidationCode: `${shipment?.customerValidationCode || ""}`.trim(),
          customerFacingComment: `${shipment?.customerFacingComment || ""}`.trim(),
          items: shipmentItems,
          amount: shipmentItems.reduce((acc, item) => acc + Number(item?.subtotal || 0), 0),
          history: normalizeShipmentHistory(shipment),
        };
      });

      const fallbackTimeline = [
        { status: "Commande confirmée", title: "Commande confirmée", scope: "Commande", date: formatStepDate(dateByStatus.get("PENDING") || data?.updatedAt), done: idx >= 0 },
        { status: "Préparation en cours", title: "Préparation en cours", scope: "Commande", date: formatStepDate(dateByStatus.get("PROCESSING") || dateByStatus.get("PAID")), done: idx >= 1 },
        { status: "Expédié", title: "Expédié", scope: "Commande", date: formatStepDate(dateByStatus.get("READY_TO_DELIVER")), done: idx >= 2 },
        { status: "Problème de livraison", title: "Problème de livraison", scope: "Commande", date: formatStepDate(dateByStatus.get("DELIVERY_FAILED") || dateByStatus.get("CANCELED")), done: idx >= 3 },
        { status: "Livré", title: "Livré", scope: "Commande", date: formatStepDate(dateByStatus.get("DELIVERED")), done: idx >= 4 }
      ];

      setTrackingData({
        id: data?.orderNumber || trimmed,
        customerValidationCode: `${data?.customerValidationCode || ""}`.trim(),
        status: statusKey,
        trackingNumber: data?.trackingNumber || "",
        deliveryType: data?.deliveryType || "Standard",
        currency,
        amount: totalAmount,
        shippingMethodCode,
        shippingMethodLabel,
        shippingCost,
        items,
        shipments,
        shipmentsCount: shipments.length,
        eta,
        location,
        note: latestComment,
        timeline: buildUnifiedTimeline({ orderHistory: history, fallbackTimeline, shipments })
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.errorMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Impossible de récupérer le suivi."
      );
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    await runTracking(orderId);
  };

  useEffect(() => {
    const ref = `${searchParams.get("order") || searchParams.get("orderNumber") || ""}`.trim();
    if (!ref) return;
    if (lastAutoTrackedRef.current === ref) return;
    lastAutoTrackedRef.current = ref;
    setOrderId(ref);
    if (!isLoading) {
      runTracking(ref);
    }
  }, [searchParams, isLoading]);

  useEffect(() => {
    return () => {
      lastAutoTrackedRef.current = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <PageSEO title="Suivi de commande" description="Suivez votre commande Lid en temps réel. Entrez votre numéro de commande pour voir son statut." canonical="/tracking" noindex />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#6aa200]/15 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-6 h-56 w-56 rounded-full bg-[#FF9900]/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 sm:pt-24 pb-10 sm:pb-14">
        <div className="rounded-3xl border border-neutral-200 bg-white/90 shadow-xl shadow-neutral-200/60 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70 dark:shadow-black/40">
          <div className="px-6 sm:px-10 py-8 sm:py-10 border-b border-neutral-200/70 dark:border-neutral-800">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6aa200]">Suivi de commande</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight">
                  Suivez votre livraison en temps réel
                </h1>
                <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl">
                  Entrez votre numéro de commande pour voir le statut, l’estimation et l’historique détaillé.
                </p>
              </div>

              <Motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleTrack}
                className="w-full max-w-md"
              >
                <div className="group sm:relative">
                  <Search className="absolute left-4 top-6 hidden -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-[#6aa200] sm:block" />
                  <input
                    type="text"
                    placeholder="Ex: ORD-9XK3-7P2L"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full rounded-2xl border border-transparent bg-neutral-100 px-4 py-4 text-base font-semibold outline-none transition-all focus:border-[#6aa200] focus:ring-2 focus:ring-[#6aa200]/20 sm:pl-12 sm:pr-32 dark:bg-neutral-900"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full rounded-xl bg-[#6aa200] px-4 py-3 font-bold text-white transition-colors hover:bg-[#5a8a00] disabled:opacity-50 sm:absolute sm:bottom-2 sm:right-2 sm:top-2 sm:mt-0 sm:w-auto sm:px-5 sm:py-0"
                  >
                    {isLoading ? "..." : "Suivre"}
                  </button>
                </div>
              </Motion.form>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {trackingData && (
              <Motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="space-y-6 px-4 py-6 sm:px-10 sm:py-10"
              >
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Commande</p>
                    <div className="mt-2 break-words text-lg font-bold">{trackingData.id}</div>
                    <p className="text-xs text-neutral-500">{Array.isArray(trackingData.items) ? trackingData.items.length : 0} article(s)</p>
                    <p className="text-xs text-neutral-500">{trackingData.shipmentsCount} livraison(s)</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Livraisons</p>
                    <div className="mt-2 text-lg font-bold">{summarizeShipments(trackingData.shipments)}</div>
                    <p className="text-xs text-neutral-500">Le détail est disponible par livraison.</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Montant</p>
                    <div className="mt-2 text-2xl font-black">{formatMoney(trackingData.amount, trackingData.currency)}</div>
                    <p className="text-xs text-neutral-500">Total de la commande</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">Récapitulatif de la commande</h3>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {Array.isArray(trackingData.items) ? trackingData.items.length : 0} article(s)
                    </span>
                  </div>

                  {Array.isArray(trackingData.items) && trackingData.items.length > 0 ? (
                    <div className="space-y-3">
                      {trackingData.items.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-100 p-3 sm:flex-nowrap sm:p-4 dark:border-neutral-800"
                        >
                          <div className="h-14 w-14 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = item.fallbackImage || "/imgs/logo.png";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{item.name}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {item.itemType === "TICKET" ? "Ticket" : "Article"} • Qté: {item.quantity} • {formatMoney(item.unitPrice, trackingData.currency)}
                            </p>
                          </div>
                          <div className="w-full text-right text-sm font-bold sm:w-auto sm:whitespace-nowrap">{formatMoney(item.subtotal, trackingData.currency)}</div>
                        </div>
                      ))}

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Frais de livraison</span>
                        <span className="text-right text-sm font-bold text-neutral-900 dark:text-white">
                          {trackingData.shippingCost == null
                            ? "À confirmer"
                            : trackingData.shippingCost > 0
                              ? formatMoney(trackingData.shippingCost, trackingData.currency)
                              : "Offerts"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Montant total</span>
                        <span className="text-right text-xl font-black text-neutral-900 dark:text-white">
                          {formatMoney(trackingData.amount, trackingData.currency)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-4 text-sm text-neutral-500 dark:text-neutral-400">
                      Les détails des articles ne sont pas disponibles pour cette commande.
                    </div>
                  )}
                </div>

                {Array.isArray(trackingData.shipments) && trackingData.shipments.length > 0 && (
                  <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm shadow-neutral-900/5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
                    <div className="mb-4 flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-950 dark:text-white">Vos livraisons</h3>
                        <p className="mt-0.5 text-xs text-neutral-500">Suivi détaillé par livraison.</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-neutral-400">{trackingData.shipments.length} livraison(s)</span>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                      {trackingData.shipments.map((shipment, index) => {
                        const meta = shipmentStatusMeta(shipment.status);
                        const hasSingleItem = shipment.items.length === 1;
                        return (
                          <div key={shipment.id} className="py-4 first:pt-1 last:pb-0 sm:py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-neutral-950 dark:text-white">Livraison {index + 1}</p>
                              </div>
                              <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none ${meta.className}`}>
                                {meta.label}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-2 rounded-2xl bg-neutral-50/80 p-2 dark:bg-neutral-950/45 sm:grid-cols-3">
                              <div className="min-w-0 px-1.5 py-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Référence suivi</p>
                                <p className="mt-0.5 break-all font-mono text-xs font-semibold text-neutral-900 dark:text-white">{shipment.trackingId || "Suivi à confirmer"}</p>
                              </div>
                              <div className="min-w-0 px-1.5 py-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Estimation</p>
                                <p className="mt-0.5 truncate text-xs font-semibold text-neutral-900 dark:text-white">{shipment.eta}</p>
                              </div>
                              <div className="min-w-0 px-1.5 py-1">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Code de validation</p>
                                <p className="mt-0.5 break-all font-mono text-xs font-bold text-neutral-900 dark:text-white">{shipment.customerValidationCode || "_"}</p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Détail de la livraison</p>
                                <span className="shrink-0 text-xs text-neutral-400">{shipment.items.length} article(s)</span>
                              </div>
                              <div className="mt-3 space-y-2">
                              {shipment.items.length > 0 ? (
                                shipment.items.map((item, itemIndex) => (
                                  <div key={item.id || itemIndex} className="flex items-center gap-3 rounded-2xl bg-neutral-50/70 px-2.5 py-2 dark:bg-neutral-950/40 sm:gap-4 sm:px-3">
                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:h-12 sm:w-12">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = item.fallbackImage || "/imgs/logo.png";
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">{item.name}</p>
                                      <p className="mt-0.5 text-xs text-neutral-500">
                                        Qté {item.quantity}
                                        {!hasSingleItem && (
                                          <>
                                            <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">•</span>
                                            {formatMoney(item.unitPrice, trackingData.currency)}
                                          </>
                                        )}
                                      </p>
                                    </div>
                                    {!hasSingleItem && (
                                      <div className="hidden shrink-0 whitespace-nowrap text-sm font-bold text-neutral-950 dark:text-white sm:block sm:min-w-[96px] sm:text-right">
                                        {formatMoney(item.subtotal, trackingData.currency)}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="rounded-2xl bg-neutral-50 px-3 py-2 text-sm text-neutral-500 dark:bg-neutral-950/45">
                                  Les articles de cette livraison ne sont pas disponibles.
                                </div>
                              )}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Progression de la commande</p>
                      <p className="text-xs text-neutral-500">Vue globale de l’avancement</p>
                    </div>
                    <button
                      onClick={() => {
                        try {
                          timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        } catch (e) {
                          void e;
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#6aa200] transition-all hover:gap-3"
                    >
                      Historique détaillé <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="relative mt-6 overflow-x-auto pb-1">
                    <div className="min-w-[560px]">
                      <div className="absolute left-0 right-0 top-4 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                      <div
                        className="absolute left-0 top-4 h-1 rounded-full bg-[#6aa200] transition-all"
                        style={{
                          width: `${(statusIndexFromKey(trackingData.status) / Math.max(1, steps.length - 1)) * 100}%`,
                        }}
                      />
                      <div className="relative grid grid-cols-6 gap-3">
                        {steps.map((step, stepIndex) => {
                          const done = stepIndex <= statusIndexFromKey(trackingData.status);
                          const Icon = step.icon;
                          return (
                            <div key={step.key} className="flex flex-col items-center text-center">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${done ? "border-[#6aa200] bg-[#6aa200] text-white" : "border-neutral-200 bg-white text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"}`}>
                                <Icon size={18} />
                              </div>
                              <div className={`mt-2 text-[11px] font-semibold sm:text-xs ${done ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={timelineRef} className="rounded-3xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">Historique de commande</h3>
                    <span className="shrink-0 text-xs text-neutral-400">Commande et livraisons</span>
                  </div>
                  <div className="space-y-3">
                    {trackingData.timeline.map((step, index) => (
                      <div key={step.id || index} className="flex gap-3 rounded-2xl border border-neutral-100 p-3 sm:gap-4 sm:p-4 dark:border-neutral-800">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${step.done ? "bg-[#6aa200]/10 text-[#6aa200]" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"}`}>
                          {step.done ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          {step.scope && <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">{step.scope}</p>}
                          <p className={`text-sm font-semibold ${step.done ? "text-neutral-900 dark:text-white" : "text-neutral-500"}`}>
                            {step.title || step.status}
                          </p>
                          <p className="text-xs text-neutral-400">{step.date}</p>
                          {step.comment && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{step.comment}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
