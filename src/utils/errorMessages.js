// Messages d'erreur conviviaux : un message technique du backend ne doit jamais atteindre le client.

const RESOURCE_LABELS = {
  payment: { noun: 'ce paiement', hint: true },
  order: { noun: 'cette commande', hint: true },
  article: { noun: 'cet article', hint: false },
  product: { noun: 'ce produit', hint: false },
  customer: { noun: 'ce compte', hint: false },
  partner: { noun: 'ce vendeur', hint: false },
  category: { noun: 'cette catégorie', hint: false },
  address: { noun: 'cette adresse', hint: false },
};

const PAYMENT_NOT_FOUND_HELP = ' Si vous avez été débité, ne payez pas une seconde fois : contactez-nous avec votre numéro de commande.';

// Motifs révélant un message technique (à ne jamais afficher tel quel).
const TECHNICAL_PATTERNS = [
  /resource\s+\S+\s+not\s+found/i,
  /field\s+\S+\s+equals\s+to/i,
  /\bequals to\b/i,
  /exception/i,
  /\bat\s+[\w$.]+\(.*\)/,
  /stack\s*trace/i,
  /\bnull\s*pointer/i,
  /sql|jdbc|hibernate|constraint|duplicate key|could not execute/i,
  /status code \d{3}/i,
  /request failed/i,
  /network\s*error/i,
  /timeout of \d+/i,
  /\bECONN\w+|\bERR_\w+/,
  /<\/?[a-z][\s\S]*>/i,
  /^\s*[{[]/,
  /[?&]merchantId=/i,
  /\bLID-[0-9A-F]{8,}/i,
];

export function isTechnicalMessage(message) {
  const text = `${message ?? ''}`.trim();
  if (!text) return true;
  if (text.length > 200) return true;
  return TECHNICAL_PATTERNS.some((re) => re.test(text));
}

function notFoundMessage(rawMessage) {
  const match = /resource\s+(\w+)\s+not\s+found/i.exec(`${rawMessage ?? ''}`);
  const key = match ? match[1].toLowerCase() : '';
  const info = RESOURCE_LABELS[key];
  if (key === 'payment') {
    return `Nous n'avons pas retrouvé ce paiement.${PAYMENT_NOT_FOUND_HELP}`;
  }
  if (key === 'order') {
    return `Nous n'avons pas retrouvé cette commande.${PAYMENT_NOT_FOUND_HELP}`;
  }
  if (info) return `Nous n'avons pas retrouvé ${info.noun}. Il a peut-être été supprimé ou n'est plus disponible.`;
  return "Nous n'avons pas retrouvé l'élément demandé. Il a peut-être été supprimé ou n'est plus disponible.";
}

/**
 * Convertit n'importe quelle erreur (axios, Error, string) en message français affichable.
 * @param {*} err erreur capturée
 * @param {string} fallback message par défaut (contexte métier) si rien de mieux
 * @param {{ allowServerMessage?: boolean }} [options] autorise le message serveur s'il n'est pas technique (4xx)
 */
export function friendlyErrorMessage(err, fallback = 'Une erreur est survenue. Veuillez réessayer.', options = {}) {
  const { allowServerMessage = true } = options;
  const status = err?.response?.status ?? err?.status;
  const data = err?.response?.data;
  const serverMessage =
    (typeof data === 'string' ? data : null) ||
    data?.errorMessage || data?.message || data?.error || '';
  const rawMessage = `${serverMessage || err?.message || (typeof err === 'string' ? err : '')}`;

  if (/resource\s+\S+\s+not\s+found/i.test(rawMessage)) return notFoundMessage(rawMessage);
  if (status === 429) return 'Trop de requêtes en peu de temps. Patientez un instant puis réessayez.';
  if (status >= 500) return 'Un problème est survenu de notre côté, réessayez dans un instant.';
  if (status === 401) return 'Votre session a expiré. Veuillez vous reconnecter.';
  if (status === 403) return "Vous n'avez pas l'autorisation d'effectuer cette action.";
  if (status === 404) return "Nous n'avons pas retrouvé l'élément demandé. Il a peut-être été supprimé ou n'est plus disponible.";
  if (!err?.response && (err?.code === 'ECONNABORTED' || /timeout/i.test(rawMessage))) {
    return 'Le serveur met trop de temps à répondre. Vérifiez votre connexion et réessayez.';
  }
  if (!err?.response && (err?.request || err?.code === 'ERR_NETWORK' || /network\s*error|failed to fetch/i.test(rawMessage))) {
    return 'Connexion impossible. Vérifiez votre connexion internet et réessayez.';
  }
  if (allowServerMessage && status >= 400 && status < 500 && serverMessage && !isTechnicalMessage(serverMessage)) {
    return `${serverMessage}`.trim();
  }
  return fallback;
}

/** Extrait le jeton LID-… d'une valeur brute (supprime tout suffixe « ?merchantId=… » ou « &… »). */
export function sanitizePaymentToken(raw) {
  const value = `${raw ?? ''}`.trim();
  if (!value) return '';
  return value.split(/[?&#\s]/)[0].trim();
}

/** Lit token et merchantId depuis les paramètres, même si le prestataire a collé « ?merchantId=… » au jeton. */
export function readPaymentReturnParams(params) {
  const rawToken = params.get('token') || params.get('invoice_token') || params.get('invoiceToken') || '';
  let merchantId = params.get('merchantId') || params.get('merchant_id') || '';
  if (!merchantId) {
    const m = /[?&]merchantId=([^&#\s]+)/i.exec(rawToken);
    if (m) merchantId = decodeURIComponent(m[1]);
  }
  return { token: sanitizePaymentToken(rawToken), merchantId: `${merchantId}`.trim() };
}
