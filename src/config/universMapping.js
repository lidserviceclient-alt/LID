// Regroupement des catégories racine du mega-menu par "univers".
// Deux sources possibles, dans cet ordre de priorité :
// 1) un champ `univers` explicite porté par la catégorie (si le backend l'expose un jour)
// 2) ce mapping par nom de catégorie
// Toute catégorie non trouvée dans les deux retombe dans "Autres" (vraie exception, pas un fallback de confort).
export const UNIVERS_MAPPING = {
  "Alimentation": ["Alimentation", "Fruits & Légumes"],
  "Boissons & Alcool": ["Boissons", "Alcool"],
  "Tech & Mobile": ["Technologie", "4G/5G"],
  "Mode & Accessoires": ["Vêtements"],
};

function normalizeName(value) {
  return `${value || ""}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

const NORMALIZED_LOOKUP = new Map();
for (const [universLabel, categoryNames] of Object.entries(UNIVERS_MAPPING)) {
  for (const name of categoryNames) {
    NORMALIZED_LOOKUP.set(normalizeName(name), universLabel);
  }
}

export function getUniversLabel(category) {
  const explicit = `${category?.univers || ""}`.trim();
  if (explicit) return explicit;
  return NORMALIZED_LOOKUP.get(normalizeName(category?.nom)) || "Autres";
}
