import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  CreditCard,
  FileText,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Printer,
  Undo2,
  XCircle,
} from "lucide-react";
import PageSEO from "@/components/PageSEO";
import OrderProgress from "@/components/tracking/OrderProgress";
import OrderItems from "@/components/tracking/OrderItems";
import ShipmentCard, { DeliveryCode, InfoRow } from "@/components/tracking/ShipmentCard";
import TrackingHistory from "@/components/tracking/TrackingHistory";
import { TrackingErrorState, TrackingSearchForm, TrackingSkeleton } from "@/components/tracking/TrackingStates";
import { trackOrder } from "@/services/trackingService";
import { resolveBackendAssetUrl } from "@/services/categoryService";
import { cancelCustomerOrder, openOrderReceipt } from "@/services/customerService";
import { getCurrentUserPayload } from "@/services/authService";
import { useAppConfig } from "@/features/appConfig/useAppConfig";
import { useCustomerSession } from "@/features/customerSession/CustomerSessionContext.jsx";
import { getReturnWindow } from "@/utils/policy";
import { cn } from "@/utils/cn";
import {
  ORDER_EVENT_LABEL,
  TONE_DOT,
  computeReturnDeadline,
  formatDate,
  formatMoney,
  getOrderHeadline,
  getOrderStatusMeta,
  getPaymentStatusLabel,
  hasReceipt,
  isCustomerCancellable,
  readPendingPayment,
  toDate,
} from "@/utils/orderStatus";

const SHIPMENT_EVENT_LABEL = {
  EN_PREPARATION: "Colis prêt, en attente du livreur",
  EN_COURS: "Colis en cours de livraison",
  LIVREE: "Colis livré",
  ECHEC: "Tentative de livraison échouée",
};

const TONE_RING = {
  amber: "ring-amber-500/20",
  green: "ring-[#6aa200]/20",
  blue: "ring-sky-500/20",
  violet: "ring-violet-500/20",
  red: "ring-red-500/20",
  neutral: "ring-neutral-400/20",
};

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const normalizeVatRate = (raw) => {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return 0.18;
  return value > 1 ? value / 100 : value;
};

const normalizeItem = (item, index) => {
  const quantity = num(item?.quantity) ?? 0;
  const unitPrice = num(item?.unitPrice) ?? 0;
  return {
    key: `${item?.articleId ?? "item"}-${index}`,
    name: `${item?.articleName || "Article"}`.trim(),
    imageUrl: resolveBackendAssetUrl(item?.mainImageUrl) || "",
    quantity,
    unitPrice,
    subtotal: num(item?.subtotal) ?? unitPrice * quantity,
    sellerName: `${item?.sellerName || ""}`.trim(),
  };
};

/** Historique fusionne commande + colis, sans doublons consecutifs, le plus recent en premier. */
const buildHistory = (orderHistory, shipments, hasShipments) => {
  const events = [];
  (Array.isArray(orderHistory) ? orderHistory : []).forEach((entry, index) => {
    const status = `${entry?.status || ""}`.toUpperCase();
    if (!ORDER_EVENT_LABEL[status]) return;
    // Les etapes de transport sont decrites plus finement par les colis.
    if (hasShipments && (status === "DELIVERY_IN_PROGRESS" || status === "DELIVERY_FAILED")) return;
    events.push({
      id: `o-${index}`,
      title: ORDER_EVENT_LABEL[status],
      date: entry?.changedAt || "",
      dateValue: entry?.changedAt || "",
      issue: status === "DELIVERY_FAILED",
    });
  });
  shipments.forEach((shipment, shipmentIndex) => {
    shipment.history.forEach((entry, index) => {
      const status = `${entry?.status || ""}`.toUpperCase();
      if (!SHIPMENT_EVENT_LABEL[status]) return;
      events.push({
        id: `s-${shipmentIndex}-${index}`,
        title: SHIPMENT_EVENT_LABEL[status],
        scope: shipments.length > 1 ? `Colis ${shipmentIndex + 1}` : "",
        date: entry?.changedAt || "",
        dateValue: entry?.changedAt || "",
        comment: status === "EN_COURS" || status === "ECHEC" ? `${entry?.comment || ""}`.trim() : "",
        issue: status === "ECHEC",
      });
    });
  });
  const time = (e) => toDate(e.date)?.getTime() ?? 0;
  const sorted = events.sort((a, b) => time(a) - time(b));
  const deduped = sorted.filter((event, index) => {
    const previous = sorted.slice(0, index).reverse().find((e) => e.scope === event.scope);
    return !previous || previous.title !== event.title;
  });
  return deduped.reverse();
};

const firstDate = (history, ...statuses) => {
  const list = Array.isArray(history) ? history : [];
  for (const status of statuses) {
    const hit = list.find((h) => `${h?.status || ""}`.toUpperCase() === status && h?.changedAt);
    if (hit) return hit.changedAt;
  }
  return null;
};

const normalizeTracking = (data, appConfig) => {
  const meta = getOrderStatusMeta(data?.currentStatus);
  const status = meta.code;
  const history = Array.isArray(data?.statusHistory) ? data.statusHistory : [];
  const items = (Array.isArray(data?.items) ? data.items : []).map(normalizeItem);
  const shipments = (Array.isArray(data?.shipments) ? data.shipments : []).map((s, index) => ({
    key: s?.id ?? `shipment-${index}`,
    status: `${s?.status || ""}`.toUpperCase(),
    sellerName: `${s?.sellerName || (`${s?.shipperType || ""}`.toUpperCase() === "LID" ? "LID" : "")}`.trim(),
    trackingId: `${s?.trackingId || ""}`.trim(),
    eta: s?.eta || null,
    deliveredAt: s?.deliveredAt || null,
    courierName: `${s?.courierName || ""}`.trim(),
    deliveryCode: `${s?.customerValidationCode || ""}`.trim(),
    comment: `${s?.customerFacingComment || ""}`.trim(),
    items: (Array.isArray(s?.items) ? s.items : []).map(normalizeItem),
    history: Array.isArray(s?.history) ? s.history : [],
  }));

  const currency = `${data?.currency || "FCFA"}`.trim() || "FCFA";
  const amount = num(data?.amount) ?? items.reduce((acc, it) => acc + it.subtotal, 0);
  const shippingCost = num(data?.shippingCost);
  const itemsSubtotal = num(data?.itemsSubtotal) ?? items.reduce((acc, it) => acc + it.subtotal, 0);
  const discount = num(data?.discountAmount) ?? Math.max(0, itemsSubtotal + (shippingCost ?? 0) - amount);
  const vatRate = num(data?.vatPercent) != null ? Number(data.vatPercent) / 100 : normalizeVatRate(appConfig?.vatPercent);
  const vatAmount = num(data?.vatAmount) ?? Math.round((amount - amount / (1 + vatRate)) * 100) / 100;

  const deliveredDates = shipments.map((s) => toDate(s.deliveredAt)).filter(Boolean);
  const deliveredAt = deliveredDates.length
    ? new Date(Math.max(...deliveredDates.map((d) => d.getTime())))
    : status === "DELIVERED" ? toDate(firstDate(history, "DELIVERED") || data?.deliveryDate) : null;

  const returnDeadline = toDate(data?.returnDeadline)
    || computeReturnDeadline({ status, deliveryDate: deliveredAt, createdAt: data?.createdAt }, getReturnWindow(appConfig));
  const returnable = typeof data?.returnable === "boolean"
    ? data.returnable
    : Boolean(returnDeadline && Date.now() <= returnDeadline.getTime());

  return {
    id: data?.id,
    orderNumber: `${data?.orderNumber || ""}`.trim(),
    createdAt: data?.createdAt || firstDate(history, "PENDING"),
    status,
    meta,
    currency,
    amount,
    shippingCost,
    itemsSubtotal,
    discount,
    vatAmount,
    vatPercent: Math.round(vatRate * 10000) / 100,
    paymentStatus: getPaymentStatusLabel(data?.paymentStatus),
    paymentMethod: `${data?.paymentMethod || ""}`.trim(),
    shippingMethod: `${data?.shippingMethodLabel || ""}`.trim(),
    shippingArea: `${data?.shippingArea || ""}`.trim(),
    maskedPhone: `${data?.maskedShippingPhone || ""}`.trim(),
    trackingNumber: `${data?.trackingNumber || ""}`.trim(),
    eta: status === "DELIVERED" ? null : data?.deliveryDate || null,
    deliveredAt,
    deliveryCode: `${data?.customerValidationCode || ""}`.trim(),
    items,
    shipments,
    events: buildHistory(history, shipments, shipments.length > 0),
    stepDates: {
      placed: data?.createdAt || firstDate(history, "PENDING"),
      paid: firstDate(history, "PAID"),
      preparing: firstDate(history, "PROCESSING", "PAID"),
      shipping: firstDate(history, "READY_TO_DELIVER", "DELIVERY_IN_PROGRESS"),
      delivered: deliveredAt || firstDate(history, "DELIVERED"),
    },
    canceledAt: firstDate(history, "CANCELED"),
    cancellable: typeof data?.cancellable === "boolean" ? data.cancellable : isCustomerCancellable(status),
    receiptAvailable: typeof data?.receiptAvailable === "boolean" ? data.receiptAvailable : hasReceipt(status),
    returnable,
    returnDeadline,
  };
};

const errorKind = (err) => {
  const status = err?.response?.status;
  if (status === 401) return "auth";
  if (status === 403 || status === 404 || status === 400) return "notFound";
  return "network";
};

function Card({ title, children, className, action }) {
  return (
    <section className={cn("rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900", className)}>
      {title && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function ActionButton({ action, primary = false }) {
  const Icon = action.icon;
  const className = primary
    ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#6aa200] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a8a00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6aa200]/30 disabled:opacity-60 sm:w-auto"
    : cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aa200]/40 disabled:opacity-60",
        action.danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
      );
  const content = (
    <>
      {action.busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
      {action.label}
    </>
  );
  if (action.to) {
    return <Link to={action.to} className={className}>{content}</Link>;
  }
  return (
    <button type="button" onClick={action.onClick} disabled={action.busy} className={className}>
      {content}
    </button>
  );
}

export default function OrderTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRef = `${searchParams.get("order") || searchParams.get("orderNumber") || ""}`.trim();
  const [orderId, setOrderId] = useState(urlRef);
  const [rawData, setRawData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const lastRequestedRef = useRef("");
  const { data: appConfig } = useAppConfig();
  const customerSession = useCustomerSession();

  const order = useMemo(() => (rawData ? normalizeTracking(rawData, appConfig) : null), [rawData, appConfig]);

  const runTracking = useCallback(async (ref) => {
    const trimmed = `${ref || ""}`.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Veuillez saisir un numéro de commande.");
      return;
    }
    lastRequestedRef.current = trimmed;
    setIsLoading(true);
    setError(null);
    try {
      const data = await trackOrder(trimmed);
      if (lastRequestedRef.current !== trimmed) return;
      setRawData(data);
    } catch (err) {
      if (lastRequestedRef.current !== trimmed) return;
      setRawData(null);
      setError(errorKind(err));
    } finally {
      if (lastRequestedRef.current === trimmed) setIsLoading(false);
    }
  }, []);

  // Le numero dans l'URL (lien « Suivre » du profil, e-mails) declenche le suivi.
  useEffect(() => {
    if (!urlRef) return;
    setOrderId(urlRef);
    runTracking(urlRef);
  }, [urlRef, runTracking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    const ref = `${orderId || ""}`.trim().toUpperCase();
    if (!ref) {
      toast.error("Veuillez saisir un numéro de commande.");
      return;
    }
    if (ref === urlRef.toUpperCase()) {
      runTracking(ref);
    } else {
      setSearchParams({ order: ref });
    }
  };

  const customerEmail = customerSession?.customerCollection?.customer?.email || getCurrentUserPayload()?.email || "";
  const pendingPayment = order?.status === "PENDING" ? readPendingPayment(order.orderNumber) : null;

  const handleCancel = async () => {
    if (!order?.id) return;
    const paid = order.status !== "PENDING";
    const question = paid
      ? "Annuler cette commande ? Elle sera remboursée automatiquement sur votre moyen de paiement."
      : "Annuler cette commande ?";
    if (!window.confirm(question)) return;
    setBusyAction("cancel");
    try {
      await cancelCustomerOrder(order.id);
      customerSession?.updateCustomerCollection?.((prev) => ({
        ...(prev || {}),
        orders: (Array.isArray(prev?.orders) ? prev.orders : []).map((o) =>
          o.id === order.id ? { ...o, currentStatus: "CANCELED" } : o
        ),
      }));
      toast.success(paid ? "Commande annulée, remboursement en cours." : "Commande annulée.");
      await runTracking(order.orderNumber || urlRef);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cette commande n'est plus annulable (déjà en préparation). Contactez le service client.");
    } finally {
      setBusyAction("");
    }
  };

  const handleReceipt = async () => {
    if (!order?.id) return;
    setBusyAction("receipt");
    try {
      await openOrderReceipt(order.id);
    } catch (error) {
      toast.error(error?.message || "Impossible d'ouvrir le justificatif.");
    } finally {
      setBusyAction("");
    }
  };

  const actions = [];
  if (order) {
    const list = actions;
    const contact = { key: "contact", label: "Contacter le service client", icon: MessageCircle, to: "/contact" };
    if (order.meta.issue) list.push(contact);
    if (pendingPayment) {
      list.push({ key: "pay", label: "Reprendre le paiement", icon: CreditCard, onClick: () => { window.location.href = pendingPayment.paymentUrl; } });
    }
    if (order.returnable) {
      const returnsHref = order.orderNumber && customerEmail
        ? `/returns?order=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(customerEmail)}`
        : "/returns";
      list.push({ key: "return", label: "Demander un retour", icon: Undo2, to: returnsHref });
    }
    if (order.receiptAvailable) {
      list.push({ key: "receipt", label: "Télécharger le justificatif", icon: FileText, onClick: handleReceipt, busy: busyAction === "receipt" });
    }
    if (order.cancellable) {
      list.push({ key: "cancel", label: "Annuler la commande", icon: XCircle, onClick: handleCancel, danger: true, busy: busyAction === "cancel" });
    }
    if (!order.meta.issue) list.push(contact);
  }

  const primaryAction = actions.find((a) => !a.danger);
  const secondaryActions = actions.filter((a) => a !== primaryAction);

  const multiShipment = (order?.shipments.length || 0) > 1;
  const singleShipment = order?.shipments.length === 1 ? order.shipments[0] : null;
  const singleDeliveryCode = singleShipment ? singleShipment.deliveryCode : order?.deliveryCode;
  const deliveryCompleted = order?.status === "DELIVERED" || order?.status === "REFUNDED" || order?.status === "CANCELED";

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <PageSEO title="Suivi de commande" description="Suivez votre commande Lid : étapes, livraison et historique." canonical="/tracking" noindex />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        {/* Recherche */}
        {!order && !isLoading && !error ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f7d00] dark:text-[#9fd63a]">Suivi de commande</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Où en est ma commande ?</h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Saisissez votre numéro de commande pour voir son avancement, la livraison prévue et le détail de vos articles.
            </p>
            <div className="mt-6">
              <TrackingSearchForm value={orderId} onChange={setOrderId} onSubmit={handleSubmit} loading={isLoading} />
            </div>
          </div>
        ) : (
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <Link to="/profile?tab=orders" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
              ← Mes commandes
            </Link>
            <TrackingSearchForm value={orderId} onChange={setOrderId} onSubmit={handleSubmit} loading={isLoading} compact />
          </div>
        )}

        {isLoading && !order ? <TrackingSkeleton /> : null}
        {!isLoading && error ? <TrackingErrorState kind={error} onRetry={() => runTracking(urlRef || orderId)} /> : null}

        {order && !error ? (
          <article aria-labelledby="order-status-title" className={cn("space-y-4", isLoading && "opacity-60 transition-opacity")}>
            {/* En-tete : statut unique + message + actions + frise */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                <span>Commande <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{order.orderNumber}</span></span>
                {order.createdAt && <span aria-hidden="true">·</span>}
                {order.createdAt && <span>passée le {formatDate(order.createdAt)}</span>}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span aria-hidden="true" className={cn("h-3 w-3 shrink-0 rounded-full ring-4", TONE_DOT[order.meta.tone], TONE_RING[order.meta.tone])} />
                <h1 id="order-status-title" className="text-2xl font-bold tracking-tight sm:text-3xl">{order.meta.label}</h1>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base dark:text-neutral-300">
                {getOrderHeadline(order.status, { eta: order.eta, deliveredAt: order.deliveredAt })}
              </p>

              {(order.status === "DELIVERED" && order.returnDeadline) ? (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {order.returnable
                    ? <>Retour possible jusqu'au <strong className="font-semibold text-neutral-900 dark:text-white">{formatDate(order.returnDeadline, { long: true })}</strong>.</>
                    : <>Le délai de retour a pris fin le {formatDate(order.returnDeadline)}.</>}
                </p>
              ) : null}

              {actions.length > 0 && (
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center print:hidden">
                  {primaryAction && <ActionButton action={primaryAction} primary />}
                  <div className="flex flex-wrap items-center gap-1">
                    {secondaryActions.map((action) => <ActionButton key={action.key} action={action} />)}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aa200]/40 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <Printer size={16} aria-hidden="true" /> Imprimer
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                {order.status === "CANCELED" ? (
                  <div className="flex gap-3 rounded-xl bg-neutral-100 p-4 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <XCircle size={18} className="mt-0.5 shrink-0 text-neutral-500" aria-hidden="true" />
                    <p>
                      Commande annulée{order.canceledAt ? ` le ${formatDate(order.canceledAt)}` : ""}. Aucun article ne vous sera livré.
                    </p>
                  </div>
                ) : (
                  <OrderProgress currentStep={order.meta.step} currentHint={order.meta.stepHint} issue={Boolean(order.meta.issue)} dates={order.stepDates} />
                )}
                {order.status === "REFUNDED" && (
                  <p className="mt-4 flex gap-2 rounded-xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-500/10 dark:text-sky-200">
                    <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> Votre retour a été traité et la commande remboursée.
                  </p>
                )}
                {order.meta.issue && (
                  <p className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-200">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    Assurez-vous d'être joignable au numéro indiqué ; notre service client peut convenir d'un nouveau créneau avec vous.
                  </p>
                )}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
              <div className="space-y-4 lg:col-span-2">
                {multiShipment ? (
                  <section aria-labelledby="shipments-title" className="space-y-3">
                    <div className="px-1">
                      <h2 id="shipments-title" className="text-base font-bold">Votre commande arrive en {order.shipments.length} colis</h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Vos articles proviennent de plusieurs vendeurs : chaque colis est livré séparément et peut avancer à son rythme.
                      </p>
                    </div>
                    {order.shipments.map((shipment, index) => (
                      <ShipmentCard key={shipment.key} shipment={shipment} index={index} total={order.shipments.length} currency={order.currency} />
                    ))}
                  </section>
                ) : (
                  <Card title={`Articles (${order.items.reduce((acc, it) => acc + it.quantity, 0)})`}>
                    <OrderItems items={order.items} currency={order.currency} />
                  </Card>
                )}

                <TrackingHistory events={order.events} />
              </div>

              <div className="space-y-4 lg:sticky lg:top-24">
                <Card title="Livraison">
                  <dl className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    <InfoRow label="Mode">{order.shippingMethod || "Livraison à domicile"}</InfoRow>
                    <InfoRow label="Zone">{order.shippingArea ? <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden="true" />{order.shippingArea}</span> : null}</InfoRow>
                    <InfoRow label="Téléphone">{order.maskedPhone}</InfoRow>
                    {!multiShipment && (
                      <>
                        <InfoRow label={order.deliveredAt ? "Livrée le" : "Livraison prévue"}>
                          {order.deliveredAt
                            ? formatDate(order.deliveredAt)
                            : deliveryCompleted ? null : formatDate(order.eta, { long: true }) || "Communiquée à l'expédition"}
                        </InfoRow>
                        <InfoRow label="Livreur">{singleShipment?.courierName}</InfoRow>
                        <InfoRow label="N° de suivi">
                          {(singleShipment?.trackingId || order.trackingNumber) ? <span className="font-mono text-xs">{singleShipment?.trackingId || order.trackingNumber}</span> : null}
                        </InfoRow>
                      </>
                    )}
                  </dl>
                  {!multiShipment && !deliveryCompleted && singleDeliveryCode ? <div className="mt-3"><DeliveryCode code={singleDeliveryCode} /></div> : null}
                  {singleShipment?.comment && (singleShipment.status === "EN_COURS" || singleShipment.status === "ECHEC") ? (
                    <p className="mt-3 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200">{singleShipment.comment}</p>
                  ) : null}
                </Card>

                <Card title="Paiement">
                  <dl className="text-sm">
                    <div className="flex justify-between gap-4 py-1.5">
                      <dt className="text-neutral-500 dark:text-neutral-400">Sous-total articles</dt>
                      <dd className="font-medium">{formatMoney(order.itemsSubtotal, order.currency)}</dd>
                    </div>
                    <div className="flex justify-between gap-4 py-1.5">
                      <dt className="text-neutral-500 dark:text-neutral-400">Livraison</dt>
                      <dd className="font-medium">
                        {order.shippingCost == null ? "—" : order.shippingCost > 0 ? formatMoney(order.shippingCost, order.currency) : "Offerte"}
                      </dd>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between gap-4 py-1.5 text-[#3f6300] dark:text-[#9fd63a]">
                        <dt>Remise</dt>
                        <dd className="font-medium">−{formatMoney(order.discount, order.currency)}</dd>
                      </div>
                    )}
                    <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                      <dt className="font-semibold">{order.status === "PENDING" ? "Total à payer" : "Total payé"}</dt>
                      <dd className="text-lg font-bold">{formatMoney(order.amount, order.currency)}</dd>
                    </div>
                    <p className="mt-1 text-right text-xs text-neutral-500 dark:text-neutral-400">
                      dont TVA ({order.vatPercent} %) : {formatMoney(order.vatAmount, order.currency)}
                    </p>
                  </dl>
                  {(order.paymentMethod || order.paymentStatus) && (
                    <p className="mt-3 flex items-center gap-2 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200">
                      <CreditCard size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
                      <span>
                        {order.paymentMethod || "Paiement"}
                        {order.paymentStatus ? <> · <span className="font-medium">{order.paymentStatus}</span></> : null}
                      </span>
                    </p>
                  )}
                </Card>

                <Card className="print:hidden">
                  <p className="text-sm font-semibold">Une question sur cette commande ?</p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Notre équipe vous répond avec votre numéro <span className="font-mono">{order.orderNumber}</span>.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
                    <Link to="/contact" className="text-[#4f7d00] hover:underline dark:text-[#9fd63a]">Contacter le service client</Link>
                    <Link to="/faq" className="text-[#4f7d00] hover:underline dark:text-[#9fd63a]">FAQ livraison et retours</Link>
                  </div>
                </Card>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
