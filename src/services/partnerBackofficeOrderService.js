import api from "./api";

const BASE = "/api/v1/backoffice/partners/me/orders-crud";

export async function listMyOrders({ page = 0, size = 50 } = {}) {
  const res = await api.get(BASE, { params: { page, size } });
  return res?.data;
}

export async function getMyOrder(id) {
  const res = await api.get(`${BASE}/${id}`);
  return res?.data;
}

export async function updateMyOrder(id, payload) {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res?.data;
}

export async function cancelMyOrder(id, { comment } = {}) {
  await api.delete(`${BASE}/${id}`, { params: { comment } });
}

