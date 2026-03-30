import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { verifyPayment } from '@/services/paymentService.js';
import { subscribeFrontendRealtime } from '@/services/realtimeService.js';
import { useCart } from '@/features/cart/CartContext';

const verifyPromiseByToken = new Map();

function getOrCreateVerifyPromise(token) {
  const existing = verifyPromiseByToken.get(token);
  if (existing) {
    return existing;
  }
  const promise = verifyPayment(token).finally(() => {
    verifyPromiseByToken.delete(token);
  });
  verifyPromiseByToken.set(token, promise);
  return promise;
}

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { consumePurchasedItems } = useCart();
  const consumePurchasedItemsRef = useRef(consumePurchasedItems);
  const [state, setState] = useState({ loading: true, ok: false, message: '' });

  useEffect(() => {
    consumePurchasedItemsRef.current = consumePurchasedItems;
  }, [consumePurchasedItems]);

  useEffect(() => {
    const token = (params.get('token') || params.get('invoice_token') || params.get('invoiceToken') || '').trim();
    if (!token) {
      setState({ loading: false, ok: false, message: 'Token de paiement manquant.' });
      return;
    }

    const cacheKey = `lid_payment_verify_result_${token}`;
    const cachedRaw = typeof window !== 'undefined' ? window.sessionStorage.getItem(cacheKey) : null;
    if (cachedRaw) {
      try {
        const cachedData = JSON.parse(cachedRaw);
        applyPaymentState(cachedData);
        return;
      } catch {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(cacheKey);
        }
      }
    }

    let mounted = true;
    getOrCreateVerifyPromise(token)
      .then((data) => {
        if (!mounted) return;
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }
        applyPaymentState(data);
      })
      .catch((err) => {
        if (!mounted) return;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.errorMessage ||
          err?.message ||
          'Impossible de vérifier le paiement.';
        setState({ loading: false, ok: false, message });
      });

    return () => {
      mounted = false;
    };
  }, [params, navigate]);

  useEffect(() => {
    const token = (params.get('token') || params.get('invoice_token') || params.get('invoiceToken') || '').trim();
    if (!token) {
      return () => {};
    }

    const unsubscribe = subscribeFrontendRealtime((event) => {
      if (event?.topic !== 'payment.status.updated') {
        return;
      }
      const invoiceToken = `${event?.payload?.invoiceToken || ''}`.trim();
      if (!invoiceToken || invoiceToken !== token) {
        return;
      }
      applyPaymentState({
        status: event?.payload?.status || '',
      });
    }, ['payment.status.updated']);

    return () => {
      unsubscribe();
    };
  }, [params]);

  function applyPaymentState(data) {
    const status = `${data?.status || ''}`.toUpperCase();
    if (status === 'COMPLETED') {
      const token = (params.get('token') || params.get('invoice_token') || params.get('invoiceToken') || '').trim();
      if (typeof window !== 'undefined' && token) {
        const consumedKey = `lid_payment_checkout_consumed_${token}`;
        const alreadyConsumed = window.sessionStorage.getItem(consumedKey) === '1';
        if (!alreadyConsumed) {
          const checkoutItemsKey = `lid_payment_checkout_items_${token}`;
          const rawItems = window.sessionStorage.getItem(checkoutItemsKey);
          if (rawItems) {
            try {
              const parsedItems = JSON.parse(rawItems);
              consumePurchasedItemsRef.current(parsedItems);
            } finally {
              window.sessionStorage.setItem(consumedKey, '1');
              window.sessionStorage.removeItem(checkoutItemsKey);
            }
          }
        }
      }
      if (data?.postPaymentSyncOk === false) {
        const extra = data?.coreOrderId ? ` (commande: ${data.coreOrderId})` : '';
        const err = data?.postPaymentSyncError ? `: ${data.postPaymentSyncError}` : '';
        setState({ loading: false, ok: true, message: `Paiement confirmé, mais le traitement interne a échoué${extra}${err}` });
        return;
      }

      setState({ loading: false, ok: true, message: 'Paiement confirmé. Merci !' });
      setTimeout(() => navigate('/profile?tab=orders', { replace: true }), 800);
      return;
    }
    if (status === 'PENDING') {
      setState({ loading: false, ok: false, message: 'Paiement en attente. Vous pouvez réessayer dans quelques secondes.' });
      return;
    }
    setState({ loading: false, ok: false, message: 'Paiement non confirmé.' });
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center">
        {state.loading ? (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-orange-600" size={44} />
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Vérification du paiement…</h1>
            <p className="text-sm text-neutral-500 mt-2">Veuillez patienter.</p>
          </>
        ) : state.ok ? (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-green-600" size={48} />
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Paiement réussi</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{state.message}</p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-4 text-red-600" size={48} />
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Paiement non confirmé</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{state.message}</p>
            <button
              onClick={() => navigate('/profile?tab=orders')}
              className="mt-6 w-full py-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-colors"
            >
              Voir mes commandes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
