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

export const addCustomerWishlist = async (customerId, productId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !productId) {
    return null;
  }
  const { data } = await api.post(`/api/v1/wishlist/${productId}`, null, {
    params: { customerId: resolvedCustomerId }
  });
  return data;
};

export const removeCustomerWishlist = async (customerId, productId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !productId) {
    return;
  }
  await api.delete(`/api/v1/wishlist/${productId}`, {
    params: { customerId: resolvedCustomerId }
  });
};

export const isCustomerWishlist = async (customerId, productId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId || !productId) {
    return false;
  }
  const { data } = await api.get(`/api/v1/wishlist/${productId}/exists`, {
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

export const getMyCustomerProfileCollection = async (page = 0, size = 100) => {
  const { data } = await api.get('/api/v1/customers/me/collection', {
    params: { page, size }
  });
  return data;
};

export const getMyCustomerCheckoutCollection = async () => {
  const { data } = await api.get('/api/v1/customers/me/checkout/collection');
  return data;
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
