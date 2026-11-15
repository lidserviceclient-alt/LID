import { useEffect, useState } from "react";
import { getOrderShipping } from "@/services/trackingService";

const money = (v, currency = "FCFA") => `${Math.round(Number(v) || 0).toLocaleString("fr-FR")} ${currency}`;

/** Suivi / recu : zone de livraison et detail par colis (frais figes a la commande). */
export default function OrderShippingDetail({ reference, currency }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let active = true;
    if (!reference) return undefined;
    getOrderShipping(reference)
      .then((res) => active && setData(res || null))
      .catch(() => active && setData(null));
    return () => {
      active = false;
    };
  }, [reference]);
  const parcels = Array.isArray(data?.parcels) ? data.parcels : [];
  if (!data || parcels.length === 0) return null;
  return (
    <div className="mt-3 space-y-1 rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300">
      <p>
        {data.tariffZoneName ? <>Zone de livraison : <span className="font-semibold">{data.tariffZoneName}</span></> : "Livraison hors Abidjan"}
        {data.estimate ? " (montant estimé selon la distance)" : ""}
      </p>
      {parcels.length > 1 ? (
        <ul className="space-y-0.5">
          {parcels.map((p, i) => (
            <li key={`${p.sellerName}-${i}`} className="flex justify-between gap-2">
              <span>Colis {i + 1} · {p.sellerName || "LID"}</span>
              <span>{money(p.amount, currency)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {Number(data.coveredByLid) > 0 ? <p className="text-[#3f6300] dark:text-[#9fd63a]">Livraison offerte : −{money(data.coveredByLid, currency)}</p> : null}
    </div>
  );
}
