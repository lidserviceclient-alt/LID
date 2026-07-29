const OTHER_GROUP_LABEL = "Autres";

/**
 * Temporary front-end mapping of root categories to "univers" until the
 * backend exposes a univers/group field on each category. Entries accept
 * either a category id or slug (case-insensitive) so the mapping survives
 * id changes across environments.
 *
 * How to switch to server data later: once the API returns `univers` (or
 * `groupe`/`group`) on each root category, this whole file becomes
 * unnecessary for new data — resolveCategoryUniverse() already reads that
 * field first and only falls back to CATEGORY_GROUPS when it's absent. You
 * can delete CATEGORY_GROUPS entirely once every root category has the
 * field set server-side.
 */
export const CATEGORY_GROUPS = {
  "Alimentation": ["ALIMENTATION"],
  "Boissons & Alcool": ["BOISSONS"],
  "Tech & Mobile": ["TECHNOLOGIE"],
  "Mode & Accessoires": ["VETEMENT"],
  "Maison": ["MAISON"],
};

function matchesGroupEntry(category, entry) {
  const key = `${entry ?? ""}`.trim().toUpperCase();
  if (!key) return false;
  const id = `${category?.id ?? ""}`.trim().toUpperCase();
  const slug = `${category?.slug ?? ""}`.trim().toUpperCase();
  return key === id || key === slug;
}

/**
 * Resolves the univers label for a root category: prefers a backend-provided
 * field (univers/groupe/group) so this mapping can be dropped once the API
 * supports it, and falls back to the static CATEGORY_GROUPS config.
 */
export function resolveCategoryUniverse(category, groups = CATEGORY_GROUPS) {
  const backendUniverse = category?.univers || category?.groupe || category?.group;
  if (backendUniverse) return `${backendUniverse}`.trim();

  for (const [label, entries] of Object.entries(groups)) {
    if ((entries || []).some((entry) => matchesGroupEntry(category, entry))) {
      return label;
    }
  }
  return null;
}

/**
 * Groups root categories by univers, preserving CATEGORY_GROUPS order, then
 * any backend-provided univers not in the static config, then "Autres" last.
 * Groups with no matching category are omitted.
 */
export function groupCategoriesByUniverse(categories, groups = CATEGORY_GROUPS) {
  const staticOrder = Object.keys(groups);
  const buckets = new Map();

  for (const category of Array.isArray(categories) ? categories : []) {
    const label = resolveCategoryUniverse(category, groups) || OTHER_GROUP_LABEL;
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label).push(category);
  }

  const orderedLabels = [
    ...staticOrder.filter((label) => buckets.has(label)),
    ...[...buckets.keys()].filter((label) => !staticOrder.includes(label) && label !== OTHER_GROUP_LABEL),
  ];
  if (buckets.has(OTHER_GROUP_LABEL)) orderedLabels.push(OTHER_GROUP_LABEL);

  return orderedLabels.map((label) => ({ key: label, label, categories: buckets.get(label) }));
}
