import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, MapPin, CheckCircle, Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { trackOrder } from "@/services/trackingService";
import { resolveBackendAssetUrl } from "@/services/categoryService";

const statusKeyFromBackend = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  if (s === "PENDING") return "pending";
  if (s === "PAID" || s === "PROCESSING") return "processing";
  if (s === "READY_TO_DELIVER") return "shipped";
  if (s === "DELIVERY_IN_PROGRESS") return "out_for_delivery";
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
    case "out_for_delivery":
      return 3;
    case "delivery_issue":
      return 4;
    case "delivered":
    case "refunded":
      return 5;
    default:
      return 0;
  }
};

const stepIndexFromBackend = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  if (s === "PENDING") return 0;
  if (s === "PAID" || s === "PROCESSING") return 1;
  if (s === "READY_TO_DELIVER") return 2;
  if (s === "DELIVERY_IN_PROGRESS") return 3;
  if (s === "DELIVERY_FAILED" || s === "CANCELED") return 4;
  if (s === "DELIVERED" || s === "REFUNDED") return 5;
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
    { key: "out_for_delivery", label: "Livraison", icon: MapPin },
    { key: "delivery_issue", label: "Problème de livraison", icon: AlertTriangle },
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
              ? "En transit"
              : statusKey === "out_for_delivery"
                ? "En cours de livraison"
                : statusKey === "delivery_issue"
                  ? "Tentative de livraison échouée"
                  : statusKey === "refunded"
                    ? "Remboursement effectué"
                    : "Livré";

      const items = Array.isArray(data?.items)
        ? data.items
            .map((item) => {
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
            })
            .filter((item) => item.name)
        : [];

      const currency = `${data?.currency || "FCFA"}`.trim() || "FCFA";
      const totalAmount = Number.isFinite(Number(data?.amount))
        ? Number(data.amount)
        : items.reduce((acc, item) => acc + Number(item?.subtotal || 0), 0);

      setTrackingData({
        id: data?.orderNumber || trimmed,
        customerValidationCode: `${data?.customerValidationCode || ""}`.trim(),
        status: statusKey,
        trackingNumber: data?.trackingNumber || "",
        deliveryType: data?.deliveryType || "Standard",
        currency,
        amount: totalAmount,
        items,
        eta,
        location,
        note: latestComment,
        timeline: [
          { status: "Commande confirmée", date: formatStepDate(dateByStatus.get("PENDING") || data?.updatedAt), done: idx >= 0 },
          { status: "Préparation en cours", date: formatStepDate(dateByStatus.get("PROCESSING") || dateByStatus.get("PAID")), done: idx >= 1 },
          { status: "Expédié", date: formatStepDate(dateByStatus.get("READY_TO_DELIVER")), done: idx >= 2 },
          { status: "En livraison", date: formatStepDate(dateByStatus.get("DELIVERY_IN_PROGRESS")), done: idx >= 3 },
          { status: "Problème de livraison", date: formatStepDate(dateByStatus.get("DELIVERY_FAILED") || dateByStatus.get("CANCELED")), done: idx >= 4 },
          { status: "Livré", date: formatStepDate(dateByStatus.get("DELIVERED")), done: idx >= 5 }
        ]
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
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#6aa200] transition-colors" />
                  <input
                    type="text"
                    placeholder="Ex: LID-ORD-24 ou ORD-24"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full pl-12 pr-28 sm:pr-32 py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-[#6aa200] focus:ring-2 focus:ring-[#6aa200]/20 outline-none transition-all text-base font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 sm:px-5 rounded-xl bg-[#6aa200] text-white font-bold hover:bg-[#5a8a00] transition-colors disabled:opacity-50"
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
                className="px-6 sm:px-10 py-8 sm:py-10 space-y-6"
              >
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Commande</p>
                    <div className="mt-2 text-lg font-bold">{trackingData.id}</div>
                    <p className="text-xs text-neutral-500">Livraison {trackingData.deliveryType}</p>
                    <p className="text-xs text-neutral-500">Suivi {trackingData.trackingNumber || "—"}</p>
                    <p className="text-xs text-neutral-800">
                      Code à donner au transporteur : <span className="font-bold">{trackingData.customerValidationCode || "—"}</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Statut actuel</p>
                    <div className="mt-2 text-lg font-bold">
                      {trackingData.status === "pending" && "Commande confirmée"}
                      {trackingData.status === "processing" && "Préparation en cours"}
                      {trackingData.status === "shipped" && "Expédiée"}
                      {trackingData.status === "out_for_delivery" && "En livraison"}
                      {trackingData.status === "delivery_issue" && "Problème de livraison"}
                      {trackingData.status === "delivered" && "Livrée"}
                      {trackingData.status === "refunded" && "Remboursée"}
                    </div>
                    <p className="text-xs text-neutral-500">{trackingData.location}</p>
                    {trackingData.note && <p className="mt-1 text-xs text-neutral-500">{trackingData.note}</p>}
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Estimation</p>
                    <div className="mt-2 text-2xl font-black">{trackingData.eta || "À confirmer"}</div>
                    <p className="text-xs text-neutral-500">Date estimée ou dernière mise à jour</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">Récapitulatif de la commande</h3>
                    <span className="text-xs text-neutral-400">
                      {Array.isArray(trackingData.items) ? trackingData.items.length : 0} article(s)
                    </span>
                  </div>

                  {Array.isArray(trackingData.items) && trackingData.items.length > 0 ? (
                    <div className="space-y-3">
                      {trackingData.items.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex items-center gap-3 rounded-2xl border border-neutral-100 p-3 sm:p-4 dark:border-neutral-800"
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
                          <div className="text-sm font-bold whitespace-nowrap">{formatMoney(item.subtotal, trackingData.currency)}</div>
                        </div>
                      ))}

                      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Montant total</span>
                        <span className="text-xl font-black text-neutral-900 dark:text-white">
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

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Progression de la commande</p>
                      <p className="text-xs text-neutral-500">Basée sur le statut actuel</p>
                    </div>
                    <button
                      onClick={() => {
                        try {
                          timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        } catch (e) {
                          void e;
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#6aa200] hover:gap-3 transition-all"
                    >
                      Historique détaillé <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="relative mt-6">
                    <div className="absolute left-0 right-0 top-4 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                    <div
                      className="absolute left-0 top-4 h-1 rounded-full bg-[#6aa200] transition-all"
                      style={{
                        width: `${(statusIndexFromKey(trackingData.status) / Math.max(1, steps.length - 1)) * 100}%`,
                      }}
                    />
                    <div className="grid grid-cols-6 gap-3 relative">
                      {steps.map((step, idx) => {
                        const done = idx <= statusIndexFromKey(trackingData.status);
                        const Icon = step.icon;
                        return (
                          <div key={step.key} className="flex flex-col items-center text-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${done ? "bg-[#6aa200] text-white border-[#6aa200]" : "bg-white dark:bg-neutral-900 text-neutral-400 border-neutral-200 dark:border-neutral-800"}`}>
                              <Icon size={18} />
                            </div>
                            <div className={`mt-2 text-[11px] sm:text-xs font-semibold ${done ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>
                              {step.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div ref={timelineRef} className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">Historique de statut</h3>
                    <span className="text-xs text-neutral-400">Mises à jour récentes</span>
                  </div>
                  <div className="space-y-3">
                    {trackingData.timeline.map((step, index) => (
                      <div key={index} className="flex items-center gap-4 rounded-2xl border border-neutral-100 p-4 dark:border-neutral-800">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step.done ? "bg-[#6aa200]/10 text-[#6aa200]" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"}`}>
                          {step.done ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${step.done ? "text-neutral-900 dark:text-white" : "text-neutral-500"}`}>
                            {step.status}
                          </p>
                          <p className="text-xs text-neutral-400">{step.date}</p>
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
