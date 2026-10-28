// Suggestions proposées UNIQUEMENT dans le formulaire d'ajout : jamais affichées comme modalités existantes
// (la base est la seule source de vérité).
export const SHIPPING_METHOD_PRESETS = {
  STANDARD: {
    code: "STANDARD",
    label: "Livraison standard",
    description: "3-5 jours ouvrables",
    costAmount: 3250,
    sortOrder: 0,
    leadTimeUnit: "DAYS",
    leadTimeMin: 3,
    leadTimeMax: 5
  },
  EXPRESS: {
    code: "EXPRESS",
    label: "Livraison express",
    description: "24-48h",
    costAmount: 5000,
    sortOrder: 1,
    leadTimeUnit: "HOURS",
    leadTimeMin: 24,
    leadTimeMax: 48
  }
};

export const buildShippingMethodForm = (code = "STANDARD", overrides = {}) => {
  const preset = SHIPPING_METHOD_PRESETS[code] || SHIPPING_METHOD_PRESETS.STANDARD;
  return {
    code: preset.code,
    label: preset.label,
    description: preset.description,
    costAmount: `${preset.costAmount}`,
    leadTimeUnit: preset.leadTimeUnit,
    leadTimeMin: `${preset.leadTimeMin}`,
    leadTimeMax: `${preset.leadTimeMax}`,
    enabled: true,
    isDefault: preset.code === "STANDARD",
    sortOrder: `${preset.sortOrder}`,
    ...overrides
  };
};

export const toVatPercentInput = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return "18";
  const normalized = parsed <= 1 ? parsed * 100 : parsed;
  return `${normalized}`;
};

export const toPercentInput = (value, fallback = "0") => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  const normalized = parsed <= 1 ? parsed * 100 : parsed;
  return `${normalized}`;
};

export const formatReturnWindowLabel = (unit, min, max) => {
  const safeMin = Number(min);
  const safeMax = Number(max);
  const suffix = `${unit || ""}`.toUpperCase() === "HOURS" ? "heures" : "jours";
  if (Number.isFinite(safeMin) && Number.isFinite(safeMax)) return `${safeMin}-${safeMax} ${suffix}`;
  return `0-0 ${suffix}`;
};

export const formatRefundPolicyLabel = (mode) =>
  `${mode || ""}`.trim().toUpperCase() === "ORDER_ONLY"
    ? "Remboursement de la commande uniquement"
    : "Remboursement total commande + livraison";

export const formatFullName = (u) => `${u?.prenom || ""} ${u?.nom || ""}`.trim() || "-";
