import api from "./api";

export async function trackOrder(reference) {
  const ref = `${reference || ""}`.trim();
  if (!ref) {
    throw new Error("Veuillez entrer un numéro de commande");
  }
  const { data } = await api.get(`/api/v1/public/orders/tracking/${encodeURIComponent(ref)}`);
  return data;
}

