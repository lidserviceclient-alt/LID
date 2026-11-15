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

/** Option B : zone de repli et TVA des frais de ramassage facturés au partenaire. */
export function CollectionSettingsCard({ data, reload, onError, onSuccess }) {
  const s = data.settings;
  const zones = data.tariffZones || [];
  const [fallback, setFallback] = useState(s.collectionFallbackZoneCode || "CI-ABJ-Z2");
  const [vat, setVat] = useState(Boolean(s.collectionFeeVatEnabled));
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setFallback(s.collectionFallbackZoneCode || "CI-ABJ-Z2");
    setVat(Boolean(s.collectionFeeVatEnabled));
  }, [s.collectionFallbackZoneCode, s.collectionFeeVatEnabled]);

  async function submit(e) {
    e.preventDefault();
    if (vat && !s.collectionFeeVatEnabled) {
      const ok = window.confirm("Appliquer la TVA sur les frais de collecte déduits des reversements ?\n\nÀ activer seulement après validation de l’expert-comptable.");
      if (!ok) return;
    }
    try {
      setSaving(true);
      await backofficeApi.shippingPricingSaveSettings(fullSettings(s, { collectionFallbackZoneCode: fallback, collectionFeeVatEnabled: vat }));
      onSuccess("Règles de collecte enregistrées (modification journalisée).");
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
        title="Frais de collecte (option B)"
        description="Frais de ramassage facturés au partenaire en option B (son adresse → entrepôt LID)."
      >
        <SettingsField
          id="zr-fallback"
          label="Zone de collecte par défaut (option B)"
          hint="Utilisée pour les frais de ramassage quand la zone de retrait du partenaire est inconnue (signalé sur la commande)."
        >
          <Select
            id="zr-fallback"
            value={fallback}
            onChange={(e) => setFallback(e.target.value)}
            options={zones.map((z) => ({ value: z.code, label: z.name }))}
          />
        </SettingsField>
        <p className="text-xs text-muted-foreground">
          Option B : le partenaire paie le ramassage au tarif de collecte de sa zone de retrait (à défaut, tarif de livraison de cette zone
          pour la même tranche de poids), par colis, déduit de son reversement en ligne séparée ; rien si la commande est annulée avant la
          collecte. Option A : aucun frais pour le partenaire.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} />
          Appliquer la TVA (taux de la commission) sur les frais de collecte — à activer seulement après validation de l’expert-comptable
        </label>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </SettingsCard>
    </form>
  );
}

export function PickupsCard({ data, onError, onSuccess }) {
  const [rows, setRows] = useState([]);
  const [drafts, setDrafts] = useState({});
  const load = useCallback(() => {
    backofficeApi.shippingPricingPartnerPickups().then((r) => setRows(Array.isArray(r) ? r : [])).catch(() => setRows([]));
  }, []);
  useEffect(load, [load]);
  const val = (r, k) => drafts[r.partnerId]?.[k] ?? r[k] ?? "";
  const edit = (r, k) => (e) => setDrafts((d) => ({ ...d, [r.partnerId]: { ...d[r.partnerId], [k]: e.target.value } }));
  async function save(r) {
    try {
      await backofficeApi.shippingPricingSavePartnerPickup(r.partnerId, {
        pickupAddress: val(r, "pickupAddress"),
        pickupLatitude: num(val(r, "pickupLatitude")),
        pickupLongitude: num(val(r, "pickupLongitude")),
        pickupZoneCode: val(r, "pickupZoneCode")
      });
      onSuccess("Adresse de retrait enregistrée.");
      setDrafts((d) => ({ ...d, [r.partnerId]: undefined }));
      load();
    } catch (err) {
      onError(err?.message || "Enregistrement impossible.");
    }
  }
  async function geocode(r) {
    const res = await backofficeApi.shippingPricingGeocode(val(r, "pickupAddress")).catch(() => null);
    if (res?.found) {
      setDrafts((d) => ({ ...d, [r.partnerId]: { ...d[r.partnerId], pickupLatitude: res.lat, pickupLongitude: res.lng } }));
    } else {
      onError("Coordonnées introuvables (Google Maps désactivé ou adresse inconnue) : saisissez-les manuellement.");
    }
  }
  return (
    <SettingsCard
      title="Adresses de retrait des partenaires"
      description="Point de départ des colis en option A et de la collecte en option B. La zone de retrait fixe les frais de ramassage de l’option B ; sans zone, la zone de collecte par défaut s’applique (signalé)."
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun partenaire.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.partnerId} className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-[1fr_2fr_10rem_7rem_7rem_auto]">
              <div className="text-sm">
                <div className="font-medium">{r.partnerName}</div>
                <div className="text-xs text-muted-foreground">{r.logisticsMode === "VIA_WAREHOUSE" ? "Option B (entrepôt)" : "Option A (direct)"}</div>
                {r.logisticsMode === "VIA_WAREHOUSE" && !r.pickupZoneCode ? (
                  <div className="text-xs text-amber-700">Zone de retrait inconnue : ramassage facturé sur la zone par défaut</div>
                ) : null}
              </div>
              <Input aria-label="Adresse de retrait" placeholder="Adresse de retrait" value={val(r, "pickupAddress")} onChange={edit(r, "pickupAddress")} />
              <Select
                aria-label="Zone de retrait"
                value={val(r, "pickupZoneCode")}
                onChange={edit(r, "pickupZoneCode")}
                options={[{ value: "", label: "Zone inconnue" }, ...(data?.zones || []).filter((z) => z.level === "COMMUNE").map((z) => ({ value: z.code, label: z.name }))]}
              />
              <Input aria-label="Latitude" placeholder="Latitude" value={val(r, "pickupLatitude")} onChange={edit(r, "pickupLatitude")} />
              <Input aria-label="Longitude" placeholder="Longitude" value={val(r, "pickupLongitude")} onChange={edit(r, "pickupLongitude")} />
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => geocode(r)}>Localiser</Button>
                <Button type="button" size="sm" onClick={() => save(r)}>Enregistrer</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SettingsCard>
  );
}

export default function CollectionSection() {
  return (
    <PricingSection>
      {({ data, reload, notify, onError }) => (
        <>
          <CollectionSettingsCard data={data} reload={reload} onError={onError} onSuccess={notify} />
          <PickupsCard data={data} onError={onError} onSuccess={notify} />
        </>
      )}
    </PricingSection>
  );
}
