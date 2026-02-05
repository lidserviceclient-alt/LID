import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { verifyPayment } from '@/services/paymentService.js';
import { useCart } from '@/features/cart/CartContext';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [state, setState] = useState({ loading: true, ok: false, message: '' });

  useEffect(() => {
    const token = params.get('token') || '';
    if (!token) {
      setState({ loading: false, ok: false, message: 'Token de paiement manquant.' });
      return;
    }

    let mounted = true;
    verifyPayment(token)
      .then((data) => {
        if (!mounted) return;
        const status = `${data?.status || ''}`.toUpperCase();
        if (status === 'COMPLETED') {
          clearCart();
          setState({ loading: false, ok: true, message: 'Paiement confirmé. Merci !' });
          setTimeout(() => navigate('/profile?tab=orders', { replace: true }), 800);
          return;
        }
        if (status === 'PENDING') {
          setState({ loading: false, ok: false, message: 'Paiement en attente. Vous pouvez réessayer dans quelques secondes.' });
          return;
        }
        setState({ loading: false, ok: false, message: 'Paiement non confirmé.' });
      })
      .catch(() => {
        if (!mounted) return;
        setState({ loading: false, ok: false, message: 'Impossible de vérifier le paiement.' });
      });

    return () => {
      mounted = false;
    };
  }, [params, navigate, clearCart]);

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

