import api from "./api";

export async function getCatalogLayoutCollection({ latestLimit } = {}) {
  const res = await api.get("/api/v1/catalog/layout/collection", {
    params: { latestLimit: latestLimit ?? undefined },
  });
  return res?.data;
}

