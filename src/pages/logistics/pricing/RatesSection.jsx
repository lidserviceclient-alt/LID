import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import SettingsCard from "../../settings/components/SettingsCard.jsx";
import SettingsField, { SettingsTextarea } from "../../settings/components/SettingsField.jsx";
import { backofficeApi } from "../../../services/api.js";
import { PricingSection } from "./PricingContext.jsx";
import { fmt, num, activeTiers, tierRange } from "./pricingUtils.js";

/** Grille par zone : 4 zones × tranches, suppléments de poids. */
export function ZoneGridCard({ data, reload, onError, onSuccess }) {
  const zones = data.tariffZones || [];
  const tiers = activeTiers(data);
  const base = tiers[0];
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
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
  return (
    <SettingsCard
      title="Tarifs de livraison par zone"
      description="Le client paie le tarif de SA zone pour chaque colis (un colis par vendeur), plus le supplément de poids du colis. Le rattachement des communes se règle dans « Zones & communes »."
    >
      {data.settings.activeStrategy !== "ZONE_WEIGHT" && data.settings.activeStrategy !== "ZONE_VOLUMETRIC" ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          La stratégie active est « {data.settings.activeStrategy} » : cette grille n’est pas utilisée pour la livraison client
          (elle reste utilisée pour les frais de collecte de l’option B). Activez « Zone et poids » dans la section « Stratégie ».
        </p>
      ) : null}
      {zones.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune zone tarifaire (niveau TARIFF_ZONE) : créez-les via un import de grille (section « Import / Export »).</p>
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
    </SettingsCard>
  );
}

/** Grille complète : toutes les zones (pays, villes, communes, zones tarifaires) × tranches actives, tarifs STANDARD. */
export function FullGridCard({ data, reload, onError, onSuccess }) {
  const [cell, setCell] = useState({});
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
  return (
    <SettingsCard
      title="Grille complète (avancé)"
      description="Toutes les zones (pays, villes, communes, zones tarifaires) × tranches actives, tarifs STANDARD ; l’express ajoute le supplément fixe. Une case vide hérite de la zone parente (base + supplément). Les montants hors des 4 zones d’Abidjan sont INDICATIFS."
    >
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

    </SettingsCard>
  );
}

export default function RatesSection() {
  return (
    <PricingSection>
      {({ data, reload, notify, onError }) => (
        <>
          <ZoneGridCard data={data} reload={reload} onError={onError} onSuccess={notify} />
          <FullGridCard data={data} reload={reload} onError={onError} onSuccess={notify} />
        </>
      )}
    </PricingSection>
  );
}
