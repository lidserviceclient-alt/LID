import api from "./api";

export async function getCatalogProductsPage(page = 0, size = 50) {
  const params = new URLSearchParams({ page: `${page}`, size: `${size}` });
  const res = await api.get(`/api/v1/catalog/products?${params.toString()}`);
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
