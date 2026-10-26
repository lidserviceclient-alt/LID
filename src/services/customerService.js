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

/** Annule la commande du client (CGV art. 12) : non payee, ou payee mais pas encore preparee. */
export const cancelCustomerOrder = async (orderId) => {
  if (!orderId) return;
  await api.post(`/api/v1/orders/${orderId}/cancel`);
};

/** Ouvre le justificatif d'achat (CGV art. 10) dans un nouvel onglet, imprimable ou enregistrable en PDF. */
export const openOrderReceipt = async (orderId) => {
  if (!orderId) return;
  const { data } = await api.get(`/api/v1/orders/${orderId}/receipt`, { responseType: 'text', transformResponse: [(raw) => raw] });
  const url = URL.createObjectURL(new Blob([data], { type: 'text/html;charset=utf-8' }));
  const win = window.open(url, '_blank', 'noopener');
  if (!win) {
    window.location.assign(url);
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

/** Droit de suppression (CGU art. 9 et 13) : supprime le compte, ou l'anonymise s'il a un historique de commandes. */
export const deleteCustomerAccount = async (customerId) => {
  const resolvedCustomerId = resolveCustomerId(customerId);
  if (!resolvedCustomerId) return;
  await api.delete(`/api/v1/customers/${resolvedCustomerId}`);
};
