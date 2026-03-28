import api from "./api";

const BASE = "/api/v1/backoffice/partners/me/categories-crud";

export async function listMySubCategories() {
  const res = await api.get(BASE);
  return res?.data;
}

export async function getMyCategoriesCollection() {
  const res = await api.get(`${BASE}/collection`);
  return res?.data;
}

export async function createMySubCategory(dto) {
  const res = await api.post(BASE, dto);
  return res?.data;
}

export async function updateMySubCategory(id, dto) {
  const res = await api.put(`${BASE}/${id}`, dto);
  return res?.data;
}

export async function deleteMySubCategory(id) {
  await api.delete(`${BASE}/${id}`);
}
