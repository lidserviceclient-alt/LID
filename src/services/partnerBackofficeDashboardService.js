import api from "./api";

export async function getMyPartnerStats() {
  const res = await api.get("/api/v1/backoffice/partners/me/stats");
  return res?.data;
}

export async function getMyPartnerCollection({ productLimit = 8, orderLimit = 8, customerLimit = 8 } = {}) {
  const res = await api.get("/api/v1/backoffice/partners/me/collection", {
    params: { productLimit, orderLimit, customerLimit }
  });
  return res?.data;
}
