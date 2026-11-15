import { useEffect, useState } from "react";
import { backofficeApi } from "../../services/api.js";

const money = (v) => (v === null || v === undefined ? "—" : `${Number(v).toLocaleString("fr-FR")} FCFA`);
const kg = (g) => (g ? `${(Number(g) / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} kg` : "—");
const SOURCE = {
  GRID: "grille par zone",
  DISTANCE: "distance (estimation)",
  FLAT: "tarif fixe",
  OUTSIDE_FLAT: "forfait hors zones",
  FALLBACK: "repli tarif fixe"
};
const COLLECTION = {
  PLANNED: "prévue (déduite du reversement)",
  CHARGED: "effectuée (due)",
  WAIVED_NOT_COLLECTED: "annulée avant collecte : aucun frais"
};

/**
 * Détail de commande (back-office) : frais de livraison par colis et par zone, figés à la commande, frais de ramassage
 * option B facturés au partenaire, et coût réel du trajet s'il a été saisi (page Livraison).
 */
export default function OrderShippingParcels({ orderId, shippingCost }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    let active = true;
    if (!orderId) return undefined;
    backofficeApi
      .shippingPricingOrderParcels(orderId)
      .then((r) => active && setRows(Array.isArray(r) ? r : []))
      .catch(() => active && setRows([]));
    return () => {
      active = false;
    };
  }, [orderId]);

  if (!rows || rows.length === 0) return null;
  const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const offered = Math.max(0, total - Number(shippingCost || 0));
  return (
    <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
      <p className="font-semibold">Frais de livraison par colis</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1 pr-2">Colis</th>
              <th className="pr-2">Zone</th>
              <th className="pr-2">Poids</th>
              <th className="pr-2">Facturé client</th>
              <th className="pr-2">Ramassage (partenaire)</th>
              <th className="pr-2">Coût réel</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="py-1 pr-2">
                  <div className="font-medium">{r.sellerName || r.sellerId}</div>
                  <div className="text-muted-foreground">
                    {r.logisticsMode === "VIA_WAREHOUSE" ? "Option B (entrepôt)" : r.logisticsMode ? "Option A (direct)" : "Article LID"}
                  </div>
                </td>
                <td className="pr-2">
                  {r.tariffZoneName || (r.estimate ? "Hors Abidjan" : r.zoneCode || "—")}
                  <div className="text-muted-foreground">{SOURCE[r.pricingSource] || r.pricingSource}{r.estimate ? " · estimation" : ""}</div>
                </td>
                <td className="pr-2">
                  {kg(r.billableWeightGrams)}
                  {r.weightEstimated ? <div className="text-muted-foreground">poids par défaut</div> : null}
                  {r.tierCode ? <div className="text-muted-foreground">tranche {r.tierCode}</div> : null}
                </td>
                <td className="pr-2">{money(r.amount)}</td>
                <td className="pr-2">
                  {r.logisticsMode === "VIA_WAREHOUSE" ? (
                    <>
                      {money(r.collectionStatus === "WAIVED_NOT_COLLECTED" ? 0 : r.collectionFeeAmount)}
                      <div className="text-muted-foreground">{COLLECTION[r.collectionStatus] || ""}</div>
                      {r.collectionZoneFallback ? (
                        <div className="text-amber-700">Zone de retrait inconnue : zone par défaut ({r.collectionZoneCode})</div>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="pr-2">{r.shipmentRealCost == null ? "non saisi" : money(r.shipmentRealCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Total colis : {money(total)}
        {offered > 0 ? ` · livraison offerte par LID : ${money(offered)}` : ""} · payé par le client : {money(shippingCost)}. Le ramassage
        option B est déduit du reversement du partenaire, jamais facturé au client.
      </p>
    </div>
  );
}
