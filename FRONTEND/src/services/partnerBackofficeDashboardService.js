import api from "./api";

export async function getMyPartnerStats() {
  const res = await api.get("/api/v1/backoffice/partners/me/stats");
  return res?.data;
}

