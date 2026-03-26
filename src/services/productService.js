import api from "./api";

export async function getCatalogProductsPage(page = 0, size = 50, { q, category, sortKey } = {}) {
  const params = new URLSearchParams({ page: `${page}`, size: `${size}` });
  if (q !== null && q !== undefined && `${q}`.trim()) params.set("q", `${q}`.trim());
  if (category !== null && category !== undefined && `${category}`.trim()) params.set("category", `${category}`.trim());
  if (sortKey !== null && sortKey !== undefined && `${sortKey}`.trim()) params.set("sortKey", `${sortKey}`.trim());
  const res = await api.get(`/api/v1/catalog/products?${params.toString()}`);
  return res?.data;
}

export async function getCatalogCollection({
  featuredLimit,
  bestSellerLimit,
  latestLimit,
  featuredCategoryLimit,
  postsLimit,
  ticketsLimit,
  partnersPage,
  partnersSize,
  partnersQ,
  page = 0,
  size = 24,
  q,
  category,
  sortKey
} = {}) {
  const params = new URLSearchParams({ page: `${page}`, size: `${size}` });
  if (featuredLimit !== null && featuredLimit !== undefined) params.set("featuredLimit", `${featuredLimit}`);
  if (bestSellerLimit !== null && bestSellerLimit !== undefined) params.set("bestSellerLimit", `${bestSellerLimit}`);
  if (latestLimit !== null && latestLimit !== undefined) params.set("latestLimit", `${latestLimit}`);
  if (featuredCategoryLimit !== null && featuredCategoryLimit !== undefined) params.set("featuredCategoryLimit", `${featuredCategoryLimit}`);
  if (postsLimit !== null && postsLimit !== undefined) params.set("postsLimit", `${postsLimit}`);
  if (ticketsLimit !== null && ticketsLimit !== undefined) params.set("ticketsLimit", `${ticketsLimit}`);
  if (partnersPage !== null && partnersPage !== undefined) params.set("partnersPage", `${partnersPage}`);
  if (partnersSize !== null && partnersSize !== undefined) params.set("partnersSize", `${partnersSize}`);
  if (partnersQ !== null && partnersQ !== undefined && `${partnersQ}`.trim()) params.set("partnersQ", `${partnersQ}`.trim());
  if (q !== null && q !== undefined && `${q}`.trim()) params.set("q", `${q}`.trim());
  if (category !== null && category !== undefined && `${category}`.trim()) params.set("category", `${category}`.trim());
  if (sortKey !== null && sortKey !== undefined && `${sortKey}`.trim()) params.set("sortKey", `${sortKey}`.trim());
  const res = await api.get(`/api/v1/catalog/collection?${params.toString()}`);
  return res?.data;
}

export async function getCatalogProductPageCollection(id, { page = 0, size = 20, relatedLimit, sortKey } = {}) {
  const params = new URLSearchParams({ page: `${page}`, size: `${size}` });
  if (relatedLimit !== null && relatedLimit !== undefined) params.set("relatedLimit", `${relatedLimit}`);
  if (sortKey !== null && sortKey !== undefined && `${sortKey}`.trim()) params.set("sortKey", `${sortKey}`.trim());
  const query = params.toString();
  const res = await api.get(`/api/v1/catalog/products/${encodeURIComponent(id)}/collection${query ? `?${query}` : ""}`);
  return res?.data;
}

async function runWithConcurrency(tasks, concurrency) {
  const queue = [...tasks];
  const results = [];
  const workers = Array.from({ length: Math.max(1, concurrency) }).map(async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;
      results.push(await task());
    }
  });
  await Promise.all(workers);
  return results;
}

export async function getAllCatalogProducts({ pageSize = 500, maxPages = 200, concurrency = 6 } = {}) {
  const first = await getCatalogProductsPage(0, pageSize);
  const firstContent = Array.isArray(first?.content) ? first.content : [];
  const totalPages = Number.isFinite(Number(first?.totalPages)) ? Number(first.totalPages) : 1;

  const safeTotalPages = Math.min(Math.max(totalPages, 1), maxPages);
  if (safeTotalPages <= 1) return firstContent;

  const tasks = [];
  for (let p = 1; p < safeTotalPages; p++) {
    tasks.push(async () => {
      const data = await getCatalogProductsPage(p, pageSize);
      return Array.isArray(data?.content) ? data.content : [];
    });
  }

  const pages = await runWithConcurrency(tasks, concurrency);
  return firstContent.concat(...pages);
}

export async function getCatalogProduct(id) {
  const res = await api.get(`/api/v1/catalog/products/${encodeURIComponent(id)}/details`);
  return res?.data;
}

export async function getFeaturedCatalogProducts(limit = 12) {
  const params = new URLSearchParams();
  if (limit !== null && limit !== undefined && Number.isFinite(Number(limit))) {
    params.set("limit", `${limit}`);
  }
  const query = params.toString();
  const res = await api.get(`/api/v1/catalog/products/featured${query ? `?${query}` : ""}`);
  return res?.data;
}

export async function getBestSellerCatalogProducts(limit = 12) {
  const params = new URLSearchParams();
  if (limit !== null && limit !== undefined && Number.isFinite(Number(limit))) {
    params.set("limit", `${limit}`);
  }
  const query = params.toString();
  const res = await api.get(`/api/v1/catalog/products/bestsellers${query ? `?${query}` : ""}`);
  return res?.data;
}

export async function getLatestCatalogProducts(limit = 20) {
  const params = new URLSearchParams();
  if (limit !== null && limit !== undefined && Number.isFinite(Number(limit))) {
    params.set("limit", `${limit}`);
  }
  const query = params.toString();
  const res = await api.get(`/api/v1/catalog/products/latest${query ? `?${query}` : ""}`, {
    validateStatus: (status) => (status >= 200 && status < 300) || status === 404
  });
  if (res.status === 404) {
    const page = await getCatalogProductsPage(0, Math.min(Math.max(Number(limit) || 20, 1), 200), { sortKey: "newest" });
    return Array.isArray(page?.content) ? page.content : [];
  }
  return res?.data;
}
