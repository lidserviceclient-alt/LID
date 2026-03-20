import api from "./api";

export async function subscribeNewsletter(email) {
  const { data } = await api.post("/api/v1/newsletter/subscribe", { email });
  return data;
}

export async function unsubscribeNewsletter(email) {
  const { data } = await api.post("/api/v1/newsletter/unsubscribe", { email });
  return data;
}

