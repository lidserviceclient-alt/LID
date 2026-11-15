import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import SettingsCard from "../../settings/components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "../../settings/components/SettingsField.jsx";
import { backofficeApi } from "../../../services/api.js";
import { PricingSection } from "./PricingContext.jsx";
import { num, fullSettings } from "./pricingUtils.js";

export function StrategyCard({ data, reload, onError, onSuccess }) {
  const active = data.settings.activeStrategy;
  const [busy, setBusy] = useState("");
  async function change(s) {
    if (s.code === active) return;
    const ok = window.confirm(
      `Basculer le calcul de livraison sur « ${s.label} » ?\n\nLes nouveaux devis et les nouvelles commandes seront calculés avec cette stratégie dès maintenant. Les commandes déjà créées ne changent pas.`
    );
    if (!ok) return;
    try {
      setBusy(s.code);
      await backofficeApi.shippingPricingChangeStrategy(s.code);
      onSuccess(`Stratégie active : ${s.label}.`);
      await reload();
    } catch (err) {
      onError(err?.message || "Changement impossible.");
    } finally {
      setBusy("");
    }
  }
  return (
    <SettingsCard
      title="Stratégie de calcul"
      description="Par défaut « Zone et poids » (grille par zone validée par le métier). Les autres stratégies restent disponibles ; le seuil de livraison offerte s’applique quelle que soit la stratégie."
    >
      {data.hasIndicativeRates ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Les tarifs des 4 zones d’Abidjan sont validés par le métier (grille proposée). Les autres montants fournis au départ
          (suppléments de poids, villes de l’intérieur, UEMOA, frais de collecte explicites, paramètres de la distance) restent
          INDICATIFS – à calibrer avec vos coûts réels.
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {data.strategies.map((s) => (
          <div key={s.code} className="flex flex-col justify-between gap-3 rounded-lg border border-border p-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.label}</span>
                {s.code === active ? <Badge label="ACTIVE" variant="success" /> : null}
                {s.code === "ZONE_WEIGHT" ? <Badge label="PAR DÉFAUT" variant="outline" /> : null}
                {s.code === "DISTANCE_COEFFICIENT" ? <Badge label="REPLI HORS ABIDJAN" variant="outline" /> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </div>
            <Button variant="outline" size="sm" disabled={s.code === active || busy === s.code} onClick={() => change(s)}>
              {s.code === active ? "Stratégie active" : busy === s.code ? "Bascule…" : "Activer"}
            </Button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

const PARAM_FIELDS = [
  ["distanceFixedFee", "Frais fixes (FCFA)", "Montant de base de chaque colis."],
  ["distanceCoefficientPerKm", "Coefficient (FCFA par km routier)", "Ajusté dans le temps selon vos coûts réels."],
  ["distanceFloorAmount", "Plancher (FCFA)", "Coût minimum d’un colis."],
  ["distanceCapAmount", "Plafond (FCFA)", "Coût maximum d’un colis ; vide = pas de plafond."],
  ["roadFactor", "Facteur de repli routier", "Distance à vol d’oiseau × facteur quand Google Maps est indisponible (1,3 par défaut)."]
];

/** Calcul par distance (hors Abidjan en mode « distance », ou stratégie distance active). */
export function ParametersCard({ data, reload, onError, onSuccess }) {
  const s = data.settings;
  const initial = useMemo(
    () => ({
      distanceFixedFee: s.distanceFixedFee ?? "",
      distanceCoefficientPerKm: s.distanceCoefficientPerKm ?? "",
      distanceFloorAmount: s.distanceFloorAmount ?? "",
      distanceCapAmount: s.distanceCapAmount ?? "",
      roadFactor: s.roadFactor ?? "",
      weightSurchargeEnabled: Boolean(s.weightSurchargeEnabled)
    }),
    [s]
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await backofficeApi.shippingPricingSaveSettings(
        fullSettings(s, {
          distanceFixedFee: num(form.distanceFixedFee),
          distanceCoefficientPerKm: num(form.distanceCoefficientPerKm),
          distanceFloorAmount: num(form.distanceFloorAmount),
          distanceCapAmount: num(form.distanceCapAmount),
          roadFactor: num(form.roadFactor),
          weightSurchargeEnabled: form.weightSurchargeEnabled
        })
      );
      onSuccess("Paramètres enregistrés (modification journalisée).");
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
        title="Paramètres du calcul par distance (hors Abidjan)"
        description="Utilisés hors des zones tarifées (mode « distance ») ou si la stratégie distance est active. Coût d’un colis = arrondi( frais fixes + coefficient × distance routière ), borné par le plancher et le plafond, plus le supplément express."
      >
        <p className="text-xs text-muted-foreground">
          Valeurs de départ INDICATIVES – à calibrer avec vos coûts réels. Google Maps :{" "}
          {s.mapsEnabled ? "actif (distances routières)" : "inactif (repli : distance à vol d’oiseau × facteur routier, signalée « estimation »)"}.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PARAM_FIELDS.map(([key, label, hint]) => (
            <SettingsField key={key} id={`sp-${key}`} label={label} hint={hint}>
              <Input id={`sp-${key}`} inputMode="decimal" value={form[key]} onChange={set(key)} />
            </SettingsField>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.weightSurchargeEnabled}
            onChange={(e) => setForm((f) => ({ ...f, weightSurchargeEnabled: e.target.checked }))}
          />
          Majoration par tranche de poids (montants dans la section « Poids »)
        </label>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </SettingsCard>
    </form>
  );
}

export default function StrategySection() {
  return (
    <PricingSection>
      {({ data, reload, notify, onError }) => (
        <>
          <StrategyCard data={data} reload={reload} onError={onError} onSuccess={notify} />
          <ParametersCard data={data} reload={reload} onError={onError} onSuccess={notify} />
        </>
      )}
    </PricingSection>
  );
}
