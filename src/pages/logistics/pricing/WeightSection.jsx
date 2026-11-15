import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import SettingsCard from "../../settings/components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "../../settings/components/SettingsField.jsx";
import { backofficeApi } from "../../../services/api.js";
import { PricingSection } from "./PricingContext.jsx";
import { fmt, num, fullSettings, activeTiers } from "./pricingUtils.js";

/** Tranches de poids actives et supplément par colis. */
export function TiersCard({ data, reload, onError, onSuccess }) {
  const tiers = activeTiers(data);
  async function saveTierSurcharge(t, v) {
    try {
      await backofficeApi.shippingPricingSaveTier(t.code, { ...t, surchargeAmount: num(v) ?? 0 });
      onSuccess("Majoration enregistrée.");
      await reload();
    } catch (err) {
      onError(err?.message || "Enregistrement impossible.");
    }
  }
  return (
    <SettingsCard
      title="Tranches de poids"
      description="Le poids d’un colis détermine sa tranche. Le supplément de la tranche s’ajoute au tarif de base de la zone (grille par zone), au forfait hors zones, et à la distance si la majoration est activée."
    >
      <div className="text-sm font-medium">Tranches de poids actives (supplément par colis : grille par zone, forfait hors zones, et distance si la majoration est activée)</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 pr-3">Code</th><th className="pr-3">Tranche</th><th>Majoration (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t) => (
              <tr key={t.code} className="border-t border-border">
                <td className="py-1 pr-3">{t.code}</td>
                <td className="pr-3">{t.label} ({t.minKg}–{t.maxKg ?? "∞"} kg)</td>
                <td>
                  <Input
                    aria-label={`Majoration ${t.code}`}
                    className="h-8 w-28"
                    defaultValue={t.surchargeAmount ?? 0}
                    onBlur={(e) => `${e.target.value}` !== `${t.surchargeAmount ?? 0}` && saveTierSurcharge(t, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </SettingsCard>
  );
}

/** Poids retenu pour un article sans poids renseigné. */
export function DefaultWeightCard({ data, reload, onError, onSuccess }) {
  const s = data.settings;
  const [value, setValue] = useState(s.defaultWeightGrams ?? "");
  const [saving, setSaving] = useState(false);
  useEffect(() => setValue(s.defaultWeightGrams ?? ""), [s.defaultWeightGrams]);
  async function submit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await backofficeApi.shippingPricingSaveSettings(fullSettings(s, { defaultWeightGrams: num(value) }));
      onSuccess("Poids par défaut enregistré (modification journalisée).");
      await reload();
    } catch (err) {
      onError(err?.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <SettingsCard title="Poids par défaut" description="Utilisé pour les articles dont le poids n’est pas renseigné.">
        <SettingsField id="dw-grams" label="Poids par défaut d’un article (g)" hint="Les poids se renseignent sur la fiche article.">
          <Input id="dw-grams" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} />
        </SettingsField>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </SettingsCard>
    </form>
  );
}

export default function WeightSection() {
  return (
    <PricingSection>
      {({ data, reload, notify, onError }) => (
        <>
          <TiersCard data={data} reload={reload} onError={onError} onSuccess={notify} />
          <DefaultWeightCard data={data} reload={reload} onError={onError} onSuccess={notify} />
        </>
      )}
    </PricingSection>
  );
}
