import api from './api';
import { getAccessTokenPayload } from './auth';

const resolveCustomerId = (customerId) => {
  return customerId || getAccessTokenPayload()?.sub || null;
};

export const getCustomerOrders = async (customerId, page = 0, size = 10) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId) {
    return [];
  }
  const { data } = await api.get('/api/v1/orders', {
    params: { customerId: resolvedCustomerId, page, size }
  });
  return Array.isArray(data) ? data : [];
};

export const getCustomerWishlist = async (customerId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId) {
    return [];
  }
  const { data } = await api.get('/api/v1/wishlist', {
    params: { customerId: resolvedCustomerId }
  });
  return Array.isArray(data) ? data : [];
};

export const addCustomerWishlist = async (customerId, articleId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !articleId) {
    return null;
  }
  const { data } = await api.post(`/api/v1/wishlist/${articleId}`, null, {
    params: { customerId: resolvedCustomerId }
  });
  return data;
};

export const removeCustomerWishlist = async (customerId, articleId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !articleId) {
    return;
  }
  await api.delete(`/api/v1/wishlist/${articleId}`, {
    params: { customerId: resolvedCustomerId }
  });
};

export const isCustomerWishlist = async (customerId, articleId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !articleId) {
    return false;
  }
  const { data } = await api.get(`/api/v1/wishlist/${articleId}/exists`, {
    params: { customerId: resolvedCustomerId }
  });
  return Boolean(data);
};

export const getCustomerAddresses = async (customerId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId) {
    return [];
  }
  const { data } = await api.get(`/api/v1/customers/${resolvedCustomerId}/addresses`);
  return Array.isArray(data) ? data : [];
};

export const createCustomerAddress = async (customerId, payload) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId) {
    return null;
  }
  const { data } = await api.post(`/api/v1/customers/${resolvedCustomerId}/addresses`, payload);
  return data;
};

export const updateCustomerAddress = async (customerId, addressId, payload) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !addressId) {
    return null;
  }
  const { data } = await api.put(`/api/v1/customers/${resolvedCustomerId}/addresses/${addressId}`, payload);
  return data;
};

export const setDefaultCustomerAddress = async (customerId, addressId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !addressId) {
    return null;
  }
  const { data } = await api.put(`/api/v1/customers/${resolvedCustomerId}/addresses/${addressId}/default`);
  return data;
};

export const deleteCustomerAddress = async (customerId, addressId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !addressId) {
    return;
  }
  await api.delete(`/api/v1/customers/${resolvedCustomerId}/addresses/${addressId}`);
};
