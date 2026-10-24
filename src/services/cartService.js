import api from "./api";

const BASE = "/api/v1/carts";

export const getCustomerCart = async (customerId) => {
  const { data } = await api.get(`${BASE}/customer/${encodeURIComponent(customerId)}`);
  return data;
};

export const syncCustomerCart = async (customerId, items) => {
  const { data } = await api.put(`${BASE}/customer/${encodeURIComponent(customerId)}/items`, items);
  return data;
};

export const upsertCustomerCartItem = async (customerId, articleId, payload) => {
  const { data } = await api.put(
    `${BASE}/customer/${encodeURIComponent(customerId)}/items/${encodeURIComponent(articleId)}`,
    payload
  );
  return data;
};

export const removeCustomerCartItem = async (customerId, articleId, { color, size } = {}) => {
  const params = {};
  if (color !== undefined && color !== null && `${color}`.trim() !== "") params.color = color;
  if (size !== undefined && size !== null && `${size}`.trim() !== "") params.size = size;
  const { data } = await api.delete(`${BASE}/${encodeURIComponent(customerId)}/articles/${encodeURIComponent(articleId)}`, { params });
  return data;
};

export const clearCustomerCart = async (customerId) => {
  await api.delete(`${BASE}/customer/${encodeURIComponent(customerId)}/clear`);
};
