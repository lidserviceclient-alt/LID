import api from "./api";

const BASE = "/api/v1/backoffice/partners/me/settings";

export async function getMyPartnerSettings() {
  const res = await api.get(BASE);
  return res?.data;
}

export async function getMyPartnerSettingsCollection() {
  const res = await api.get(`${BASE}/collection`);
  return res?.data;
}

export async function updateMyPartnerSettings(payload) {
  const res = await api.put(BASE, payload);
  return res?.data;
}
