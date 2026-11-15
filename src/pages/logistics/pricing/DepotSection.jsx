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

/** Dépôt / entrepôt LID : départ des articles LID et de la livraison finale en option B. */
export function DepotCard({ data, reload, onError, onSuccess }) {
  const s = data.settings;
  const initial = useMemo(
    () => ({ depotAddress: s.depotAddress ?? "", depotLatitude: s.depotLatitude ?? "", depotLongitude: s.depotLongitude ?? "" }),
    [s]
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function geocodeDepot() {
    try {
      const r = await backofficeApi.shippingPricingGeocode(form.depotAddress);
      if (!r.found) {
        onError(r.mapsEnabled ? "Adresse introuvable." : "Google Maps est désactivé (GOOGLE_MAPS_ENABLED) : saisissez la latitude et la longitude.");
        return;
      }
      setForm((f) => ({ ...f, depotLatitude: r.lat, depotLongitude: r.lng }));
    } catch (err) {
      onError(err?.message || "Géocodage impossible.");
    }
  }
  async function submit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await backofficeApi.shippingPricingSaveSettings(
        fullSettings(s, { depotAddress: form.depotAddress, depotLatitude: num(form.depotLatitude), depotLongitude: num(form.depotLongitude) })
      );
      onSuccess("Dépôt enregistré (modification journalisée).");
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
        title="Dépôt / entrepôt LID"
        description="Départ des articles LID et de la livraison finale en option B ; sert aux calculs par distance."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField id="sp-depot" label="Adresse du dépôt / entrepôt LID" hint="Cocody Riviera 3 (coordonnées approximatives à confirmer).">
            <SettingsTextarea id="sp-depot" value={form.depotAddress} onChange={set("depotAddress")} />
          </SettingsField>
          <div className="grid gap-3">
            <SettingsField id="sp-lat" label="Latitude du dépôt">
              <Input id="sp-lat" inputMode="decimal" value={form.depotLatitude} onChange={set("depotLatitude")} />
            </SettingsField>
            <SettingsField id="sp-lng" label="Longitude du dépôt">
              <Input id="sp-lng" inputMode="decimal" value={form.depotLongitude} onChange={set("depotLongitude")} />
            </SettingsField>
            <Button type="button" variant="outline" size="sm" onClick={geocodeDepot} disabled={!form.depotAddress}>
              Trouver les coordonnées
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </SettingsCard>
    </form>
  );
}

export default function DepotSection() {
  return (
    <PricingSection>
      {({ data, reload, notify, onError }) => <DepotCard data={data} reload={reload} onError={onError} onSuccess={notify} />}
    </PricingSection>
  );
}
