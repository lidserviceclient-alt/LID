import api from "./api";

const BASE = "/api/v1/backoffice/partners/me/subscription";

export async function getMyPartnerSubscription() {
  const res = await api.get(BASE);
  return res?.data;
}

export async function upgradeMyPartnerSubscription() {
  const res = await api.post(`${BASE}/upgrade`);
  return res?.data;
}
