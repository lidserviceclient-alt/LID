import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import PageSEO from '@/components/PageSEO';

const PENDING_ORDER_TTL_MS = 30 * 60 * 1000;

// Le panier est vide des la creation de la commande : on propose de reprendre le paiement tant que la commande est valide
function readPendingPayment() {
  try {
    const raw = window.localStorage.getItem('lid_pending_payment');
    if (!raw) return null;
    const pending = JSON.parse(raw);
    if (!pending?.paymentUrl || Date.now() - Number(pending.createdAt || 0) > PENDING_ORDER_TTL_MS) {
      window.localStorage.removeItem('lid_pending_payment');
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

export default function PaymentCancel() {
  const navigate = useNavigate();
  const pending = readPendingPayment();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <PageSEO title="Paiement annulé" description="Votre paiement a été annulé." noindex />
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center">
        <XCircle className="mx-auto mb-4 text-red-600" size={48} />
        <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Paiement annulé</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          {pending
            ? `Le paiement a été annulé. Votre commande ${pending.orderNumber || ''} est conservée 30 minutes : vous pouvez reprendre le paiement.`
            : 'Le paiement a été annulé. Votre commande non payée est annulée automatiquement ; vous pouvez repasser commande depuis la boutique.'}
        </p>
        <div className="mt-6 flex gap-3">
          {pending ? (
            <button
              onClick={() => { window.location.href = pending.paymentUrl; }}
              className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
            >
              Reprendre le paiement
            </button>
          ) : (
            <button
              onClick={() => navigate('/cart')}
              className="flex-1 py-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-colors"
            >
              Retour au panier
            </button>
          )}
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

