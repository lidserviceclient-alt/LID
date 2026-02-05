import api from './api';

export const getCustomerOrders = async (customerId, page = 0, size = 10) => {
  const { data } = await api.get('/api/v1/orders', {
    params: { customerId, page, size }
  });
  return Array.isArray(data) ? data : [];
};

export const getCustomerWishlist = async (customerId) => {
  const { data } = await api.get('/api/v1/wishlist', {
    params: { customerId }
  });
  return Array.isArray(data) ? data : [];
};

