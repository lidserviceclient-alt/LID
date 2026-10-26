import { KeyRound, Truck } from "lucide-react";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import { OrderItemRow, SellerLabel } from "@/components/tracking/OrderItems";
import { formatDate, getShipmentStatusMeta } from "@/utils/orderStatus";

/**
 * Code de remise : genere au depart en livraison et visible uniquement par le titulaire de la commande
 * (l'API de suivi exige d'etre connecte et proprietaire). Il n'est plus utile une fois le colis livre.
 */
export function DeliveryCode({ code }) {
  if (!code) return null;
  return (
    <div className="rounded-xl border border-dashed border-[#6aa200]/40 bg-[#6aa200]/5 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-[#3f6300] dark:text-[#9fd63a]">
        <KeyRound size={14} aria-hidden="true" /> Code de remise
      </p>
      <p className="mt-1 font-mono text-xl font-bold tracking-[0.3em] text-neutral-900 dark:text-white">{code}</p>
      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
        Donnez ce code au livreur uniquement au moment où il vous remet le colis.
      </p>
    </div>
  );
}

export function InfoRow({ label, children }) {
  if (!children) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="shrink-0 text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-neutral-900 dark:text-white">{children}</dd>
    </div>
  );
}

/** Un colis d'une commande multi-vendeurs : statut, transporteur, date, code de remise et contenu. */
export default function ShipmentCard({ shipment, index, total, currency }) {
  const meta = getShipmentStatusMeta(shipment.status);
  const delivered = meta.code === "LIVREE";
  return (
    <section
      aria-label={`Colis ${index + 1} sur ${total}`}
      className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
            <Truck size={16} className="text-neutral-400" aria-hidden="true" />
            Colis {index + 1} sur {total}
          </h3>
          <div className="mt-1"><SellerLabel seller={shipment.sellerName} /></div>
        </div>
        <OrderStatusBadge label={meta.label} tone={meta.tone} />
      </div>

      {shipment.comment && (meta.code === "EN_COURS" || meta.code === "ECHEC") && (
        <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${meta.code === "ECHEC" ? "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200" : "bg-neutral-50 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200"}`}>
          {shipment.comment}
        </p>
      )}

      <dl className="mt-3 divide-y divide-neutral-100 dark:divide-neutral-800">
        <InfoRow label={delivered ? "Livré le" : "Livraison prévue"}>
          {delivered ? formatDate(shipment.deliveredAt) || "—" : formatDate(shipment.eta, { long: true }) || "Date communiquée à l'expédition"}
        </InfoRow>
        <InfoRow label="Livreur">{shipment.courierName}</InfoRow>
        <InfoRow label="N° de suivi">{shipment.trackingId ? <span className="font-mono text-xs">{shipment.trackingId}</span> : null}</InfoRow>
      </dl>

      {!delivered && shipment.deliveryCode ? <div className="mt-3"><DeliveryCode code={shipment.deliveryCode} /></div> : null}

      {shipment.items.length > 0 && (
        <ul className="mt-4 divide-y divide-neutral-100 border-t border-neutral-100 pt-4 dark:divide-neutral-800 dark:border-neutral-800">
          {shipment.items.map((item) => <OrderItemRow key={item.key} item={item} currency={currency} />)}
        </ul>
      )}
    </section>
  );
}
