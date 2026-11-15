import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import SettingsCard from "./components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "./components/SettingsField.jsx";
import SettingsStatus from "./components/SettingsStatus.jsx";
import { backofficeApi } from "../../services/api.js";

const fmt = (n) => (n === null || n === undefined || n === "" ? "—" : Number(n).toLocaleString("fr-FR"));
const num = (v) => (`${v ?? ""}`.trim() === "" ? null : Number(`${v}`.replace(",", ".")));

/**
 * Paramètres > Livraison, organisé autour de la grille PAR ZONE (décision métier) : tarifs des 4 zones d'Abidjan ×
 * tranches de poids, rattachement commune → zone, traitement « hors Abidjan », simulateur ; puis les réglages avancés
 * (stratégie, calcul par distance, adresses de retrait, grille complète / CSV, rapport facturé vs coût réel).
 */
export default function ShippingPricingSettings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const load = useCallback(async () => {
    try {
      setError("");
      setData(await backofficeApi.shippingPricing());
    } catch (err) {
      setError(err?.message || "Impossible de charger le calcul de livraison.");
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <SettingsCard title="Calcul de la livraison" description="Chargement…">
        <SettingsStatus error={error} />
      </SettingsCard>
    );
  }
  const notify = (msg) => {
    setSuccess(msg);
    setError("");
  };
  return (
    <>
      <ZoneGridCard data={data} reload={load} onError={setError} onSuccess={notify} error={error} success={success} />
      <ZoneRulesCard data={data} reload={load} onError={setError} onSuccess={notify} />
      <SimulatorCard data={data} />
      <PickupsCard data={data} onError={setError} onSuccess={notify} />
      <StrategyCard data={data} reload={load} onError={setError} onSuccess={notify} />
      <ParametersCard data={data} reload={load} onError={setError} onSuccess={notify} />
      <GridCard data={data} reload={load} onError={setError} onSuccess={notify} />
      <HistoryCard />
    </>
  );
}


/** Toutes les valeurs du réglage (le serveur remplace plafonds et dépôt par ce qui est envoyé). */
function fullSettings(s, patch = {}) {
  return {
    defaultWeightGrams: s.defaultWeightGrams,
    volumetricDivisor: s.volumetricDivisor,
    expressSurchargeAmount: s.expressSurchargeAmount,
    freeShippingCapAmount: s.freeShippingCapAmount ?? null,
    distanceFixedFee: s.distanceFixedFee,
    distanceCoefficientPerKm: s.distanceCoefficientPerKm,
    distanceFloorAmount: s.distanceFloorAmount,
    distanceCapAmount: s.distanceCapAmount ?? null,
    roadFactor: s.roadFactor,
    weightSurchargeEnabled: s.weightSurchargeEnabled,
    depotAddress: s.depotAddress ?? "",
    depotLatitude: s.depotLatitude ?? null,
    depotLongitude: s.depotLongitude ?? null,
    outsideZoneMode: s.outsideZoneMode,
    outsideZoneFlatAmount: s.outsideZoneFlatAmount ?? null,
    collectionFallbackZoneCode: s.collectionFallbackZoneCode,
    collectionFeeVatEnabled: s.collectionFeeVatEnabled,
    ...patch
  };
}

const activeTiers = (data) => (data.tiers || []).filter((t) => t.active !== false);
const tierRange = (t) => `${Number(t.minKg)}–${t.maxKg == null ? "∞" : Number(t.maxKg)} kg`;
const OUTSIDE_LABELS = {
  DISTANCE: "Calcul par la distance (Google Maps ou vol d’oiseau × facteur routier), affiché « estimation »",
  FLAT: "Tarif forfaitaire par colis (+ supplément de poids)",
  DISABLED: "Livraison désactivée hors des zones (commande refusée)"
};

/** Grille par zone : 4 zones × tranches, suppléments de poids, communes rattachées. */
function ZoneGridCard({ data, reload, onError, onSuccess, error, success }) {
  const zones = data.tariffZones || [];
  const tiers = activeTiers(data);
  const base = tiers[0];
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const communes = (data.zones || []).filter((z) => z.level === "COMMUNE" && `${z.parentCode || ""}`.startsWith("CI-ABJ"));
  const cellKey = (z, t) => `${z}|${t}`;
  const amountOf = (z, t) => z.amounts?.find((a) => a.tierCode === t.code);
  const dirty = Object.keys(draft);

  async function saveRates() {
    try {
      setSaving(true);
      const payload = dirty.map((k) => {
        const [zoneCode, tierCode] = k.split("|");
        return { zoneCode, tierCode, mode: "STANDARD", amount: num(draft[k]) };
      });
      if (payload.some((r) => base && r.tierCode === base.code && r.amount == null)) {
        onError("Le tarif de base d’une zone (première tranche) est obligatoire : sans lui, la zone serait traitée « hors zones ».");
        return;
      }
      const r = await backofficeApi.shippingPricingSaveRates(payload);
      setDraft({});
      onSuccess(`${r.imported} tarif(s) enregistré(s), ${r.deleted} remis par défaut${r.errors?.length ? ` · ${r.errors.length} erreur(s)` : ""}.`);
      await reload();
    } catch (err) {
      onError(err?.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }
  async function saveSurcharge(t, v) {
    try {
      await backofficeApi.shippingPricingSaveTier(t.code, { ...t, surchargeAmount: num(v) ?? 0 });
      onSuccess(`Supplément « ${t.label} » enregistré.`);
      await reload();
    } catch (err) {
      onError(err?.message || "Enregistrement impossible.");
    }
  }
  async function moveCommune(c, zoneCode) {
    if (!zoneCode || zoneCode === c.parentCode) return;
    try {
      await backofficeApi.shippingPricingSaveZone(c.code, { ...c, parentCode: zoneCode });
      onSuccess(`${c.name} rattachée à ${zones.find((z) => z.code === zoneCode)?.name || zoneCode}.`);
      await reload();
    } catch (err) {
      onError(err?.message || "Rattachement impossible.");
    }
  }

  return (
    <SettingsCard
      title="Tarifs de livraison par zone"
      description="Le client paie le tarif de SA zone pour chaque colis (un colis par vendeur), plus le supplément de poids du colis. Le découpage par défaut suit la distance au dépôt de Cocody Riviera 3 et reste modifiable."
    >
      <SettingsStatus error={error} success={success} />
      {data.settings.activeStrategy !== "ZONE_WEIGHT" && data.settings.activeStrategy !== "ZONE_VOLUMETRIC" ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          La stratégie active est « {data.settings.activeStrategy} » : cette grille n’est pas utilisée pour la livraison client
          (elle reste utilisée pour les frais de collecte de l’option B). Activez « Zone et poids » dans « Stratégie de calcul ».
        </p>
      ) : null}
      {zones.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune zone tarifaire (niveau TARIFF_ZONE) : créez-les dans la grille complète ci-dessous.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-1 pr-3">Zone</th>
                {tiers.map((t) => (
                  <th key={t.code} className="pr-2">{t.label}<div className="font-normal">{tierRange(t)}</div></th>
                ))}
                <th className="pr-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => {
                const baseAmount = amountOf(z, base || {});
                return (
                  <tr key={z.code} className="border-t border-border align-top">
                    <td className="py-2 pr-3">
                      <div className="font-medium whitespace-nowrap">{z.name}</div>
                      <div className="text-xs text-muted-foreground">{(z.communes || []).map((c) => c.name).join(", ") || "Aucune commune"}</div>
                    </td>
                    {tiers.map((t, i) => {
                      const a = amountOf(z, t);
                      const k = cellKey(z.code, t.code);
                      return (
                        <td key={t.code} className="py-2 pr-2">
                          <Input
                            aria-label={`${z.name} ${t.label}`}
                            className="h-8 w-24"
                            inputMode="decimal"
                            placeholder={a?.amount != null ? `${fmt(a.amount)}` : "—"}
                            value={draft[k] ?? (a?.explicit ? a.amount : "")}
                            onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                          />
                          {i > 0 && !a?.explicit ? (
                            <div className="mt-0.5 text-[11px] text-muted-foreground">base + {fmt(t.surchargeAmount)}</div>
                          ) : null}
                        </td>
                      );
                    })}
                    <td className="py-2 pr-2">
                      {baseAmount?.statusNote ? (
                        <Badge label={baseAmount.statusNote} variant={baseAmount.statusNote.startsWith("Validé") ? "success" : "outline"} />
                      ) : baseAmount?.explicit ? (
                        <Badge label="Saisi dans le back-office" variant="outline" />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-border">
                <td className="py-2 pr-3 text-xs text-muted-foreground">Supplément de poids par colis (indicatif)</td>
                {tiers.map((t, i) => (
                  <td key={t.code} className="py-2 pr-2">
                    <Input
                      aria-label={`Supplément ${t.label}`}
                      className="h-8 w-24"
                      inputMode="decimal"
                      defaultValue={t.surchargeAmount ?? 0}
                      disabled={i === 0}
                      title={i === 0 ? "Première tranche : tarif de base de la zone" : undefined}
                      onBlur={(e) => i > 0 && `${e.target.value}` !== `${t.surchargeAmount ?? 0}` && saveSurcharge(t, e.target.value)}
                    />
                  </td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          Case vide = tarif de base de la zone + supplément de la tranche. Vider une case saisie la remet par défaut. {dirty.length} modification(s) non enregistrée(s).
        </span>
        <Button size="sm" onClick={saveRates} disabled={dirty.length === 0 || saving}>{saving ? "Enregistrement…" : "Enregistrer les tarifs"}</Button>
      </div>

      <div className="text-sm font-medium">Commune → zone</div>
      <p className="text-xs text-muted-foreground">
        Une commune rattachée directement à « Abidjan » (sans zone) est traitée comme « hors zones » (voir ci-dessous).
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {communes.map((c) => (
          <label key={c.code} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span>{c.name}</span>
            <Select
              aria-label={`Zone de ${c.name}`}
              className="h-8 w-48"
              value={c.parentCode || ""}
              onChange={(e) => moveCommune(c, e.target.value)}
              options={[
                ...(zones.some((z) => z.code === c.parentCode) ? [] : [{ value: c.parentCode || "", label: "Sans zone (hors zones)" }]),
                ...zones.map((z) => ({ value: z.code, label: z.name }))
              ]}
            />
          </label>
        ))}
      </div>
    </SettingsCard>
  );
}

/** Hors Abidjan, frais de collecte option B, gratuité et poids par défaut. */
function ZoneRulesCard({ data, reload, onError, onSuccess }) {
  const s = data.settings;
  const initial = useMemo(
    () => ({
      outsideZoneMode: s.outsideZoneMode || "DISTANCE",
      outsideZoneFlatAmount: s.outsideZoneFlatAmount ?? "",
      collectionFallbackZoneCode: s.collectionFallbackZoneCode || "CI-ABJ-Z2",
      collectionFeeVatEnabled: Boolean(s.collectionFeeVatEnabled),
      defaultWeightGrams: s.defaultWeightGrams ?? "",
      freeShippingCapAmount: s.freeShippingCapAmount ?? "",
      expressSurchargeAmount: s.expressSurchargeAmount ?? ""
    }),
    [s]
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const zones = data.tariffZones || [];

  async function submit(e) {
    e.preventDefault();
    if (form.collectionFeeVatEnabled && !s.collectionFeeVatEnabled) {
      const ok = window.confirm("Appliquer la TVA sur les frais de collecte déduits des reversements ?\n\nÀ activer seulement après validation de l’expert-comptable.");
      if (!ok) return;
    }
    try {
      setSaving(true);
      await backofficeApi.shippingPricingSaveSettings(
        fullSettings(s, {
          outsideZoneMode: form.outsideZoneMode,
          outsideZoneFlatAmount: num(form.outsideZoneFlatAmount),
          collectionFallbackZoneCode: form.collectionFallbackZoneCode,
          collectionFeeVatEnabled: form.collectionFeeVatEnabled,
          defaultWeightGrams: num(form.defaultWeightGrams),
          freeShippingCapAmount: num(form.freeShippingCapAmount),
          expressSurchargeAmount: num(form.expressSurchargeAmount)
        })
      );
      onSuccess("Règles de livraison enregistrées (modification journalisée).");
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
        title="Hors Abidjan, collecte (option B) et règles communes"
        description="Adresse hors des zones tarifées (villes de l’intérieur, UEMOA, commune non rattachée) ; frais de ramassage facturés au partenaire en option B."
      >
        <SettingsField id="zr-outside" label="Hors des zones tarifées" hint="Le devis du client affiche « estimation » en mode distance.">
          <Select
            id="zr-outside"
            value={form.outsideZoneMode}
            onChange={set("outsideZoneMode")}
            options={Object.entries(OUTSIDE_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </SettingsField>
        {form.outsideZoneMode === "FLAT" ? (
          <SettingsField id="zr-flat" label="Forfait hors zones par colis (FCFA)" hint="Le supplément de poids de la tranche s’ajoute.">
            <Input id="zr-flat" inputMode="decimal" value={form.outsideZoneFlatAmount} onChange={set("outsideZoneFlatAmount")} required />
          </SettingsField>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField
            id="zr-fallback"
            label="Zone de collecte par défaut (option B)"
            hint="Utilisée pour les frais de ramassage quand la zone de retrait du partenaire est inconnue (signalé sur la commande)."
          >
            <Select
              id="zr-fallback"
              value={form.collectionFallbackZoneCode}
              onChange={set("collectionFallbackZoneCode")}
              options={zones.map((z) => ({ value: z.code, label: z.name }))}
            />
          </SettingsField>
          <SettingsField id="zr-weight" label="Poids par défaut d’un article (g)" hint="Articles sans poids renseigné.">
            <Input id="zr-weight" inputMode="numeric" value={form.defaultWeightGrams} onChange={set("defaultWeightGrams")} />
          </SettingsField>
          <SettingsField
            id="zr-cap"
            label="Plafond de prise en charge (FCFA)"
            hint="Seuil de livraison offerte atteint (sous-total articles) : LID prend en charge la livraison de TOUTE la commande (tous colis), dans la limite de ce montant ; vide = entièrement offerte."
          >
            <Input id="zr-cap" inputMode="decimal" value={form.freeShippingCapAmount} onChange={set("freeShippingCapAmount")} />
          </SettingsField>
          <SettingsField id="zr-express" label="Supplément express par colis (FCFA)">
            <Input id="zr-express" inputMode="decimal" value={form.expressSurchargeAmount} onChange={set("expressSurchargeAmount")} />
          </SettingsField>
        </div>
        <p className="text-xs text-muted-foreground">
          Option B : le partenaire paie le ramassage (son adresse → entrepôt LID) au tarif de collecte de sa zone de retrait (à défaut,
          tarif de livraison de cette zone pour la même tranche de poids), par colis, déduit de son reversement en ligne séparée ; rien
          si la commande est annulée avant la collecte. Option A : aucun frais pour le partenaire.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.collectionFeeVatEnabled}
            onChange={(e) => setForm((f) => ({ ...f, collectionFeeVatEnabled: e.target.checked }))}
          />
          Appliquer la TVA (taux de la commission) sur les frais de collecte — à activer seulement après validation de l’expert-comptable
        </label>
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </SettingsCard>
    </form>
  );
}

function StrategyCard({ data, reload, onError, onSuccess }) {
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
      title="Stratégie de calcul (avancé)"
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
  ["expressSupplement", "Supplément express (FCFA)", "Ajouté à chaque colis en livraison express."],
  ["roadFactor", "Facteur de repli routier", "Distance à vol d’oiseau × facteur quand Google Maps est indisponible (1,3 par défaut)."],
  ["freeShippingCapAmount", "Plafond de prise en charge (FCFA)", "Livraison offerte : montant maximum pris en charge par LID ; vide = entièrement offerte."],
  ["defaultWeightGrams", "Poids par défaut d’un article (g)", "Utilisé pour les articles sans poids renseigné."]
];

function ParametersCard({ data, reload, onError, onSuccess }) {
  const s = data.settings;
  const initial = useMemo(
    () => ({
      distanceFixedFee: s.distanceFixedFee ?? "",
      distanceCoefficientPerKm: s.distanceCoefficientPerKm ?? "",
      distanceFloorAmount: s.distanceFloorAmount ?? "",
      distanceCapAmount: s.distanceCapAmount ?? "",
      expressSupplement: s.expressSurchargeAmount ?? "",
      roadFactor: s.roadFactor ?? "",
      freeShippingCapAmount: s.freeShippingCapAmount ?? "",
      defaultWeightGrams: s.defaultWeightGrams ?? "",
      weightSurchargeEnabled: Boolean(s.weightSurchargeEnabled),
      depotAddress: s.depotAddress ?? "",
      depotLatitude: s.depotLatitude ?? "",
      depotLongitude: s.depotLongitude ?? ""
    }),
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
      await backofficeApi.shippingPricingSaveSettings({
        defaultWeightGrams: num(form.defaultWeightGrams),
        volumetricDivisor: s.volumetricDivisor,
        expressSurchargeAmount: num(form.expressSupplement),
        freeShippingCapAmount: num(form.freeShippingCapAmount),
        distanceFixedFee: num(form.distanceFixedFee),
        distanceCoefficientPerKm: num(form.distanceCoefficientPerKm),
        distanceFloorAmount: num(form.distanceFloorAmount),
        distanceCapAmount: num(form.distanceCapAmount),
        roadFactor: num(form.roadFactor),
        weightSurchargeEnabled: form.weightSurchargeEnabled,
        depotAddress: form.depotAddress,
        depotLatitude: num(form.depotLatitude),
        depotLongitude: num(form.depotLongitude)
      });
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
          Majoration par tranche de poids (montants dans le tableau « Tranches de poids » ci-dessous)
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField id="sp-depot" label="Adresse du dépôt / entrepôt LID" hint="Cocody Riviera 3 (coordonnées approximatives à confirmer). Départ des articles LID et de la livraison finale en option B.">
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
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </SettingsCard>
    </form>
  );
}

function SimulatorCard({ data }) {
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

function HistoryCard() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    backofficeApi.shippingPricingHistory().then((r) => setRows(Array.isArray(r) ? r : [])).catch(() => setRows([]));
  }, []);
  return (
    <SettingsCard title="Historique des modifications" description="Changements de stratégie et de paramètres (coefficient, plancher, plafond…), journalisés.">
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

function PickupsCard({ data, onError, onSuccess }) {
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

function GridCard({ data, reload, onError, onSuccess }) {
  const [csv, setCsv] = useState("");
  const [cell, setCell] = useState({});
  const [report, setReport] = useState(null);
  const tiers = activeTiers(data);
  const rateOf = (z, t) => data.rates.find((r) => r.zoneCode === z && r.tierCode === t && r.mode === "STANDARD");
  const value = (z, t) => cell[`${z}|${t}`] ?? rateOf(z, t)?.amount ?? "";
  const dirty = Object.keys(cell);

  async function saveCells() {
    try {
      const payload = dirty.map((k) => {
        const [zoneCode, tierCode] = k.split("|");
        return { zoneCode, tierCode, mode: "STANDARD", amount: num(cell[k]) };
      });
      const r = await backofficeApi.shippingPricingSaveRates(payload);
      setCell({});
      onSuccess(`${r.imported} tarif(s) enregistré(s), ${r.deleted} supprimé(s)${r.errors?.length ? ` · ${r.errors.length} erreur(s)` : ""}.`);
      await reload();
    } catch (err) {
      onError(err?.message || "Enregistrement impossible.");
    }
  }
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
  async function saveTierSurcharge(t, v) {
    try {
      await backofficeApi.shippingPricingSaveTier(t.code, { ...t, surchargeAmount: num(v) ?? 0 });
      onSuccess("Majoration enregistrée.");
      await reload();
    } catch (err) {
      onError(err?.message || "Enregistrement impossible.");
    }
  }
  async function loadReport() {
    try {
      setReport(await backofficeApi.shippingPricingCostReport());
    } catch (err) {
      onError(err?.message || "Rapport indisponible.");
    }
  }
  return (
    <SettingsCard
      title="Grille complète, import CSV et rapport (avancé)"
      description="Toutes les zones (pays, villes, communes, zones tarifaires) × tranches actives, tarifs STANDARD ; l’express ajoute le supplément fixe. Une case vide hérite de la zone parente (base + supplément). Les montants hors des 4 zones d’Abidjan sont INDICATIFS."
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

      <div className="text-sm font-medium">Grille zone × tranche (STANDARD)</div>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 pr-3">Zone</th>
              {tiers.map((t) => <th key={t.code} className="pr-2">{t.code}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.zones.map((z) => (
              <tr key={z.code} className="border-t border-border">
                <td className="py-1 pr-3 whitespace-nowrap">{z.parentCode ? "↳ " : ""}{z.name}</td>
                {tiers.map((t) => (
                  <td key={t.code} className="pr-2" title={rateOf(z.code, t.code)?.statusNote || undefined}>
                    <Input
                      aria-label={`${z.name} ${t.code}`}
                      className="h-8 w-24"
                      inputMode="decimal"
                      placeholder="hérite"
                      value={value(z.code, t.code)}
                      onChange={(e) => setCell((c) => ({ ...c, [`${z.code}|${t.code}`]: e.target.value }))}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Case vide = tarif de la zone parente. {dirty.length} modification(s) non enregistrée(s).</span>
        <Button size="sm" onClick={saveCells} disabled={dirty.length === 0}>Enregistrer la grille</Button>
      </div>

      <SettingsField
        id="grid-csv"
        label="Import CSV"
        hint="Une ligne par tarif : zone_code;tranche_code;mode;montant (ex. CI-ABJ-Z2;P1;STANDARD;1500). En-tête optionnel ; montant vide = suppression."
      >
        <SettingsTextarea id="grid-csv" value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={"zone_code;tier_code;mode;amount\nCI-ABJ-Z2;P1;STANDARD;1500"} />
      </SettingsField>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={loadReport}>Coût facturé vs coût réel</Button>
        <Button size="sm" onClick={importCsv} disabled={!csv.trim()}>Importer</Button>
      </div>
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
