import api from "./api";

export async function listPublicPartners({ page = 0, size = 100, q } = {}) {
  const res = await api.get("/api/v1/catalog/partners", {
    params: { page, size, q: q || undefined },
  });
  return res?.data;
}

export async function getPublicPartner(partnerId) {
  const res = await api.get(`/api/v1/catalog/partners/${partnerId}`);
  return res?.data;
}

export async function getPublicPartnerCollection(partnerId, { page = 0, size = 20, sortKey } = {}) {
  const res = await api.get(`/api/v1/catalog/partners/${partnerId}/collection`, {
    params: { page, size, sortKey: sortKey || undefined },
  });
  return res?.data;
}

export async function listPublicPartnerProducts(partnerId, { page = 0, size = 24, sortKey } = {}) {
  const res = await api.get(`/api/v1/catalog/partners/${partnerId}/products`, {
    params: { page, size, sortKey: sortKey || undefined },
  });
  return res?.data;
}
