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

/** Rattachement commune → zone tarifaire (modifiable ; une commune sans zone est traitée « hors zones »). */
export function CommunesCard({ data, reload, onError, onSuccess }) {
  const zones = data.tariffZones || [];
  const communes = (data.zones || []).filter((z) => z.level === "COMMUNE" && `${z.parentCode || ""}`.startsWith("CI-ABJ"));
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
      title="Communes et zones tarifaires"
      description="Chaque commune d’Abidjan appartient à une zone tarifaire : le client paie le tarif de la zone de sa commune. Le découpage par défaut suit la distance au dépôt de Cocody Riviera 3 et reste modifiable."
    >
      <div className="text-sm font-medium">Commune → zone</div>
      <p className="text-xs text-muted-foreground">
        Une commune rattachée directement à « Abidjan » (sans zone) est traitée comme « hors zones » (voir la section « Hors Abidjan »).
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


export default function ZonesSection() {
  return (
    <PricingSection>
      {({ data, reload, notify, onError }) => <CommunesCard data={data} reload={reload} onError={onError} onSuccess={notify} />}
    </PricingSection>
  );
}
