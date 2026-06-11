import api from "./api";

export async function getCatalogCategories() {
  const res = await api.get("/api/v1/catalog/categories");
  return Array.isArray(res?.data) ? res.data : [];
}

export async function getFeaturedCatalogCategories(limit = 12) {
  const params = new URLSearchParams();
  if (limit !== null && limit !== undefined && Number.isFinite(Number(limit))) {
    params.set("limit", `${limit}`);
  }
  const query = params.toString();
  const res = await api.get(`/api/v1/catalog/categories/featured${query ? `?${query}` : ""}`);
  return Array.isArray(res?.data) ? res.data : [];
}

export function resolveBackendAssetUrl(url) {
  const raw = `${url || ""}`.trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  const apiBase = `${import.meta.env.VITE_API_URL || "http://localhost:9000"}`.replace(/\/+$/, "");
  const normalized = raw.replace(/^\/+/, "");

  if (raw.startsWith("/imgs/") || raw.startsWith("/favicon") || raw.startsWith("/manifest")) {
    return raw;
  }
  if (normalized.startsWith("api/v1/cdn/")) {
    return `${apiBase}/${normalized}`;
  }
  if (normalized.startsWith("cdn/")) {
    return `${apiBase}/api/v1/${normalized}`;
  }
  if (/^(products|categories|partners|blog|tickets|media)\//i.test(normalized)) {
    return `${apiBase}/api/v1/cdn/${normalized}`;
  }
  if (raw.startsWith("/")) return `${apiBase}${raw}`;
  return `${apiBase}/${normalized}`;
}

export function buildCategoryTree(list) {
  const nodesById = new Map();
  const roots = [];

  for (const item of Array.isArray(list) ? list : []) {
    if (!item?.id) continue;
    nodesById.set(item.id, { ...item, children: [] });
  }

  for (const node of nodesById.values()) {
    const parentId = node.parentId;
    if (parentId && nodesById.has(parentId)) {
      nodesById.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (arr) => {
    arr.sort((a, b) => {
      const ao = Number(a?.ordre) || 0;
      const bo = Number(b?.ordre) || 0;
      if (ao !== bo) return ao - bo;
      return `${a?.nom || ""}`.localeCompare(`${b?.nom || ""}`, "fr");
    });
    for (const n of arr) sortNodes(n.children);
  };
  sortNodes(roots);

  return roots;
}
