import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import SettingsCard from "../../settings/components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "../../settings/components/SettingsField.jsx";
import { backofficeApi } from "../../../services/api.js";
import { PricingSection } from "./PricingContext.jsx";
import { num, fullSettings, OUTSIDE_LABELS } from "./pricingUtils.js";

/** Traitement des adresses hors des zones tarifées (villes de l’intérieur, UEMOA, commune non rattachée). */
export function OutsideZoneCard({ data, reload, onError, onSuccess }) {
  const s = data.settings;
  const [mode, setMode] = useState(s.outsideZoneMode || "DISTANCE");
  const [flat, setFlat] = useState(s.outsideZoneFlatAmount ?? "");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setMode(s.outsideZoneMode || "DISTANCE");
    setFlat(s.outsideZoneFlatAmount ?? "");
  }, [s.outsideZoneMode, s.outsideZoneFlatAmount]);

  async function submit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await backofficeApi.shippingPricingSaveSettings(fullSettings(s, { outsideZoneMode: mode, outsideZoneFlatAmount: num(flat) }));
      onSuccess("Règle hors Abidjan enregistrée (modification journalisée).");
      await reload();
    } catch (err) {
      onError(err?.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <SettingsCard
        title="Hors Abidjan"
        description="Adresse hors des zones tarifées (villes de l’intérieur, UEMOA, commune non rattachée)."
      >
        <SettingsField id="zr-outside" label="Hors des zones tarifées" hint="Le devis du client affiche « estimation » en mode distance.">
          <Select
            id="zr-outside"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            options={Object.entries(OUTSIDE_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </SettingsField>
        {mode === "FLAT" ? (
          <SettingsField id="zr-flat" label="Forfait hors zones par colis (FCFA)" hint="Le supplément de poids de la tranche s’ajoute.">
            <Input id="zr-flat" inputMode="decimal" value={flat} onChange={(e) => setFlat(e.target.value)} required />
          </SettingsField>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </SettingsCard>
    </form>
  );
}

export default function OutsideSection() {
  return (
    <PricingSection>
      {({ data, reload, notify, onError }) => <OutsideZoneCard data={data} reload={reload} onError={onError} onSuccess={notify} />}
    </PricingSection>
  );
}
