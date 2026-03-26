import api from "./api";

export async function getMyCustomerCollection({ page = 0, size = 10 } = {}) {
  const res = await api.get("/api/v1/customers/me/collection", { params: { page, size } });
  return res?.data;
}

export async function getMyCheckoutCollection() {
  const res = await api.get("/api/v1/customers/me/checkout/collection");
  return res?.data;
}

