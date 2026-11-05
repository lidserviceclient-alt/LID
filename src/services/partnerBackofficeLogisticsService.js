import api from "./api";

// Regle R4 : mode de livraison du partenaire (A/B), adresse de retrait et frais de collecte estimes.
const BASE = "/api/v1/backoffice/partners/me/logistics";

export async function getMyLogistics({ articleId, weightGrams } = {}) {
  const params = {};
  if (articleId) params.articleId = articleId;
  if (weightGrams) params.weightGrams = weightGrams;
  const res = await api.get(BASE, { params });
  return res?.data;
}

export async function updateMyPickupAddress(payload) {
  const res = await api.put(`${BASE}/pickup`, payload);
  return res?.data;
}
