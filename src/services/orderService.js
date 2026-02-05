import api from './api';

export const checkout = async (customerId, payload) => {
  const { data } = await api.post('/api/v1/checkout', payload, {
    params: { customerId }
  });
  return data;
};

