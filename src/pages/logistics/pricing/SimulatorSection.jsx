import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import SettingsCard from "../../settings/components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "../../settings/components/SettingsField.jsx";
import SettingsStatus from "../../settings/components/SettingsStatus.jsx";
import { backofficeApi } from "../../../services/api.js";
import { PricingSection } from "./PricingContext.jsx";
import { fmt, num } from "./pricingUtils.js";

export function SimulatorCard({ data }) {
  const [form, setForm] = useState({
    strategyCode: "",
    fromAddress: "",
    toAddress: "",
    weightGrams: "1000",
    methodCode: "STANDARD",
    zoneCode: "",
    subTotal: "0",
    viaWarehouse: false,
    pickupZoneCode: ""
  });
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  async function run(e) {
    e.preventDefault();
    try {
      setErr("");
      setResult(
        await backofficeApi.shippingPricingSimulate({
          strategyCode: form.strategyCode || undefined,
          fromAddress: form.fromAddress || undefined,
          toAddress: form.toAddress || undefined,
          zoneCode: form.zoneCode || undefined,
          weightGrams: num(form.weightGrams),
          methodCode: form.methodCode,
          subTotal: num(form.subTotal),
          viaWarehouse: form.viaWarehouse || undefined,
          pickupZoneCode: form.viaWarehouse ? form.pickupZoneCode || undefined : undefined
        })
      );
    } catch (e2) {
      setResult(null);
      setErr(e2?.message || "Simulation impossible.");
    }
  }
  const p = result?.parcels?.[0];
  return (
    <form onSubmit={run}>
      <SettingsCard
        title="Simulateur"
        description="Choisissez la commune du client et le poids du colis (grille par zone) ; pour la distance, les adresses de départ (vide = dépôt LID) et d’arrivée. Aucune commande n’est créée."
      >
        <SettingsStatus error={err} />
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField id="sim-from" label="Adresse de départ">
            <Input id="sim-from" placeholder="Vide = dépôt LID" value={form.fromAddress} onChange={set("fromAddress")} />
          </SettingsField>
          <SettingsField id="sim-to" label="Adresse d’arrivée">
            <Input id="sim-to" placeholder="Ex : Cocody Angré, Abidjan" value={form.toAddress} onChange={set("toAddress")} />
          </SettingsField>
          <SettingsField id="sim-weight" label="Poids (g)">
            <Input id="sim-weight" inputMode="numeric" value={form.weightGrams} onChange={set("weightGrams")} />
          </SettingsField>
          <SettingsField id="sim-sub" label="Sous-total panier (FCFA)" hint="Pour tester le seuil de livraison gratuite.">
            <Input id="sim-sub" inputMode="decimal" value={form.subTotal} onChange={set("subTotal")} />
          </SettingsField>
          <SettingsField id="sim-mode" label="Mode">
            <Select
              id="sim-mode"
              value={form.methodCode}
              onChange={set("methodCode")}
              options={[
                { value: "STANDARD", label: "Standard" },
                { value: "EXPRESS", label: "Express" }
              ]}
            />
          </SettingsField>
          <SettingsField id="sim-strategy" label="Stratégie">
            <Select
              id="sim-strategy"
              value={form.strategyCode}
              onChange={set("strategyCode")}
              options={[{ value: "", label: "Stratégie active" }, ...data.strategies.map((s) => ({ value: s.code, label: s.label }))]}
            />
          </SettingsField>
          <SettingsField id="sim-zone" label="Commune / zone du client">
            <Select
              id="sim-zone"
              value={form.zoneCode}
              onChange={set("zoneCode")}
              options={[{ value: "", label: "—" }, ...data.zones.map((z) => ({ value: z.code, label: `${z.name} (${z.code})` }))]}
            />
          </SettingsField>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.viaWarehouse} onChange={(e) => setForm((f) => ({ ...f, viaWarehouse: e.target.checked }))} />
              Option B (collecte partenaire → entrepôt)
            </label>
            {form.viaWarehouse ? (
              <Select
                aria-label="Zone de retrait du partenaire"
                value={form.pickupZoneCode}
                onChange={set("pickupZoneCode")}
                options={[{ value: "", label: "Zone de retrait inconnue (repli)" }, ...data.zones.map((z) => ({ value: z.code, label: z.name }))]}
              />
            ) : null}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Calculer</Button>
        </div>
        {result ? (
          <div className="rounded-md border border-border p-3 text-sm">
            <div className="font-medium">
              Coût pour le client : {fmt(result.cost)} FCFA{" "}
              {result.freeShippingApplied ? <Badge label="LIVRAISON OFFERTE (seuil)" variant="success" /> : null}
              {result.fallback ? <Badge label="REPLI TARIF FIXE" variant="outline" /> : null}
              {result.estimate || result.distanceEstimated ? <Badge label="ESTIMATION" variant="outline" /> : null}
              {result.outsideZone ? <Badge label="HORS ZONES" variant="outline" /> : null}
              {result.available === false ? <Badge label="LIVRAISON DÉSACTIVÉE" variant="outline" /> : null}
            </div>
            {result.tariffZoneName ? <div className="mt-1">Zone : {result.tariffZoneName}</div> : null}
            {result.unavailableReason ? <div className="mt-1 text-rose-700">{result.unavailableReason}</div> : null}
            {p?.collectionCost != null ? (
              <div className="mt-1">
                Ramassage facturé au partenaire : {fmt(p.collectionCost)} FCFA (zone {p.collectionZoneCode || "—"})
                {p.collectionZoneFallback ? " — zone de retrait inconnue : zone par défaut" : ""}
              </div>
            ) : null}
            <div className="mt-1 text-muted-foreground">
              Stratégie : {result.strategyCode} · avant gratuité : {fmt(result.grossCost)} FCFA · pris en charge LID : {fmt(result.coveredByLid)} FCFA
              {p?.distanceKm != null ? ` · distance : ${p.distanceKm} km` : ""}
              {p?.tierCode ? ` · tranche : ${p.tierCode}` : ""}
              {result.fallbackReason ? ` · raison du repli : ${result.fallbackReason}` : ""}
            </div>
          </div>
        ) : null}
      </SettingsCard>
    </form>
  );
}

export default function SimulatorSection() {
  return <PricingSection>{({ data }) => <SimulatorCard data={data} />}</PricingSection>;
}
