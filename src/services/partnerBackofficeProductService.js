import api from "./api";

const BASE = "/api/v1/backoffice/partners/me/products-crud";

export async function listMyProducts({ page = 0, size = 100 } = {}) {
  const res = await api.get(BASE, { params: { page, size } });
  return res?.data;
}

export async function createMyProduct(dto) {
  const res = await api.post(BASE, dto);
  return res?.data;
}

export async function updateMyProduct(id, dto) {
  const res = await api.put(`${BASE}/${id}`, dto);
  return res?.data;
}

export async function deleteMyProduct(id) {
  await api.delete(`${BASE}/${id}`);
}
