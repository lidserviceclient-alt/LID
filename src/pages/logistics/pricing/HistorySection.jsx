import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import SettingsCard from "../../settings/components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "../../settings/components/SettingsField.jsx";
import { backofficeApi } from "../../../services/api.js";
import { PricingSection } from "./PricingContext.jsx";
import { fmt } from "./pricingUtils.js";

export function HistoryCard() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    backofficeApi.shippingPricingHistory().then((r) => setRows(Array.isArray(r) ? r : [])).catch(() => setRows([]));
  }, []);
  return (
    <SettingsCard title="Historique des modifications" description="Changements de stratégie, de paramètres (coefficient, plancher, plafond…) et imports / annulations de grille, journalisés avec leur auteur.">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune modification enregistrée.</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {rows.map((r, i) => (
            <li key={i} className="py-2">
              <span className="text-muted-foreground">{new Date(r.at).toLocaleString("fr-FR")} · {r.userId || "—"} · </span>
              {r.summary}
            </li>
          ))}
        </ul>
      )}
    </SettingsCard>
  );
}

/** Rapport : livraison facturée au client vs coût réel payé au livreur, par zone. */
export function CostReportCard({ onError }) {
  const [report, setReport] = useState(null);
  async function loadReport() {
    try {
      setReport(await backofficeApi.shippingPricingCostReport());
    } catch (err) {
      onError(err?.message || "Rapport indisponible.");
    }
  }
  return (
    <SettingsCard
      title="Rapport coût facturé / coût réel"
      description="Compare ce que paient les clients au coût réel saisi sur la fiche colis, par zone tarifaire (commandes payées)."
      actions={<Button variant="outline" size="sm" onClick={loadReport}>Afficher le rapport</Button>}
    >
      {report ? (
        report.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune commande payée. Le coût réel se saisit par colis dans la page Livraison (fiche colis).</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-1">Zone</th><th>Commandes</th><th>Facturé</th><th>Avec coût réel</th><th>Coût réel livreur</th><th>Marge</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.zoneCode} className="border-t border-border">
                  <td className="py-1">{r.zoneCode}</td><td>{r.orders}</td><td>{fmt(r.billed)}</td>
                  <td>{r.ordersWithRealCost}</td><td>{r.ordersWithRealCost ? fmt(r.realCost) : "non saisi"}</td><td>{fmt(r.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : null}
    </SettingsCard>
  );
}

export default function HistorySection() {
  return (
    <PricingSection>
      {({ notify, onError }) => (
        <>
          <HistoryCard />
          <CostReportCard onError={onError} />
        </>
      )}
    </PricingSection>
  );
}
