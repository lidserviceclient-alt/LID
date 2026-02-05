import api from './api';

export const verifyPayment = async (invoiceToken) => {
  const { data } = await api.get(`/api/v1/payments/verify/${encodeURIComponent(invoiceToken)}`);
  return data;
};

