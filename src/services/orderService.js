import api from './api';

export const checkout = async (customerId, payload, idempotencyKey) => {
  const { data } = await api.post('/api/v1/checkout', payload, {
    params: { customerId },
    // La creation de commande appelle le prestataire de paiement : plus long que le delai par defaut
    timeout: 30000,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined
  });
  return data;
};

export const quoteCheckout = async (customerId, payload) => {
  const { data } = await api.post('/api/v1/checkout/quote', payload, {
    params: { customerId }
  });
  return data;
};
