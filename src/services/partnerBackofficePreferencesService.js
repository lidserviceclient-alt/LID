import api from "./api";

const BASE = "/api/v1/backoffice/partners/me/preferences";

export async function getMyPartnerPreferences() {
  const res = await api.get(BASE);
  return res?.data;
}

export async function updateMyPartnerPreferences(payload) {
  const res = await api.put(BASE, payload);
  return res?.data;
}

