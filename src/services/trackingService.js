import api from "./api";

export async function trackOrder(reference) {
  const ref = `${reference || ""}`.trim();
  const cleaned = ref
    .replace(/^#/, "")
    .replace(/^\s+/g, "")
    .replace(/\s+$/g, "")
    .replace(/^LID-/i, "");
  if (!cleaned) {
    throw new Error("Veuillez entrer un numéro de commande");
  }
  const { data } = await api.get(`/api/v1/public/orders/tracking/${encodeURIComponent(cleaned)}`);
  return data;
}

/** Livraison de la commande : zone tarifaire et un tarif par colis (un colis par vendeur). Memes droits que le suivi. */
export async function getOrderShipping(reference) {
  const cleaned = `${reference || ""}`.trim().replace(/^#/, "").replace(/^LID-/i, "");
  if (!cleaned) return null;
  const { data } = await api.get(`/api/v1/public/orders/tracking/${encodeURIComponent(cleaned)}/shipping`);
  return data;
}
