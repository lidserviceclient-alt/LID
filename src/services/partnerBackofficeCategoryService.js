import api from "./api";

const BASE = "/api/v1/backoffice/partners/me/categories-crud";
const COLLECTION_CACHE_TTL_MS = 30_000;

let collectionCache = null;
let collectionCacheAt = 0;
let collectionRequest = null;

export function invalidateMyCategoriesCollectionCache() {
  collectionCache = null;
  collectionCacheAt = 0;
  collectionRequest = null;
}

export async function listMySubCategories() {
  const res = await api.get(BASE);
  return res?.data;
}

export async function getMyCategoriesCollection({ force = false } = {}) {
  const now = Date.now();
  if (!force && collectionCache && now - collectionCacheAt < COLLECTION_CACHE_TTL_MS) {
    return collectionCache;
  }
  if (!force && collectionRequest) {
    return collectionRequest;
  }

  collectionRequest = api.get(`${BASE}/collection`)
    .then((res) => {
      collectionCache = res?.data;
      collectionCacheAt = Date.now();
      return collectionCache;
    })
    .finally(() => {
      collectionRequest = null;
    });

  return collectionRequest;
}

export async function createMySubCategory(dto) {
  const res = await api.post(BASE, dto);
  invalidateMyCategoriesCollectionCache();
  return res?.data;
}

export async function updateMySubCategory(id, dto) {
  const res = await api.put(`${BASE}/${id}`, dto);
  invalidateMyCategoriesCollectionCache();
  return res?.data;
}

export async function deleteMySubCategory(id) {
  await api.delete(`${BASE}/${id}`);
  invalidateMyCategoriesCollectionCache();
}
