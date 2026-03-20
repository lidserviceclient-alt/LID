import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center">
        <XCircle className="mx-auto mb-4 text-red-600" size={48} />
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Paiement annulé</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Le paiement a été annulé. Vous pouvez réessayer depuis votre panier.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="flex-1 py-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-colors"
          >
            Retour au panier
          </button>
          <button
            onClick={() => navigate('/profile?tab=orders')}
            className="flex-1 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Mes commandes
          </button>
        </div>
      </div>
    </div>
  );
}

