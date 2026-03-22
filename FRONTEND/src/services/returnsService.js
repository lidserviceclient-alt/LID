import api from "./api";

export async function getReturnOrder(orderNumber, email) {
  const ord = `${orderNumber || ""}`.trim();
  const mail = `${email || ""}`.trim();
  if (!ord || !mail) {
    throw new Error("Veuillez renseigner le numéro de commande et l'email");
  }
  const { data } = await api.get(`/api/v1/public/returns/order/${encodeURIComponent(ord)}`, {
    params: { email: mail }
  });
  return data;
}

export async function createReturnRequest(payload) {
  const { data } = await api.post("/api/v1/public/returns", payload);
  return data;
}
