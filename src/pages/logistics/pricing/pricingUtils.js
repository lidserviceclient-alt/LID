/** Utilitaires partagés des sous-sections de la tarification de livraison. */
export const fmt = (n) => (n === null || n === undefined || n === "" ? "—" : Number(n).toLocaleString("fr-FR"));
export const num = (v) => (`${v ?? ""}`.trim() === "" ? null : Number(`${v}`.replace(",", ".")));

/** Toutes les valeurs du réglage (le serveur remplace plafonds et dépôt par ce qui est envoyé). */
export function fullSettings(s, patch = {}) {
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

export const activeTiers = (data) => (data.tiers || []).filter((t) => t.active !== false);
export const tierRange = (t) => `${Number(t.minKg)}–${t.maxKg == null ? "∞" : Number(t.maxKg)} kg`;
export const OUTSIDE_LABELS = {
  DISTANCE: "Calcul par la distance (Google Maps ou vol d’oiseau × facteur routier), affiché « estimation »",
  FLAT: "Tarif forfaitaire par colis (+ supplément de poids)",
  DISABLED: "Livraison désactivée hors des zones (commande refusée)"
};

