import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import SettingsCard from "../../settings/components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "../../settings/components/SettingsField.jsx";
import { backofficeApi } from "../../../services/api.js";

/** Ancien import rapide : une ligne par tarif « zone_code;tranche_code;mode;montant » (appliqué immédiatement, sans aperçu). */
export function QuickCsvCard({ reload, onError, onSuccess }) {
  const [csv, setCsv] = useState("");
  async function importCsv() {
    try {
      const r = await backofficeApi.shippingPricingImportRates(csv);
      onSuccess(`Import : ${r.imported} enregistré(s), ${r.deleted} supprimé(s)${r.errors?.length ? ` · erreurs : ${r.errors.join(" | ")}` : ""}`);
      setCsv("");
      await reload();
    } catch (err) {
      onError(err?.message || "Import impossible.");
    }
  }
  return (
    <SettingsCard
      title="Import rapide de tarifs (ancien format)"
      description="Appliqué immédiatement, sans aperçu : préférez l’import de la grille complète ci-dessus (aperçu, validation, sauvegarde, annulation)."
    >
      <SettingsField
        id="grid-csv"
        label="Import CSV"
        hint="Une ligne par tarif : zone_code;tranche_code;mode;montant (ex. CI-ABJ-Z2;P1;STANDARD;1500). En-tête optionnel ; montant vide = suppression."
      >
        <SettingsTextarea id="grid-csv" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={"zone_code;tier_code;mode;amount\nCI-ABJ-Z2;P1;STANDARD;1500"} />
      </SettingsField>
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={importCsv} disabled={!csv.trim()}>Importer</Button>
      </div>
    </SettingsCard>
  );
}
