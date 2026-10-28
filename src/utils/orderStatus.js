// Vocabulaire client unique pour l'etat d'une commande : la page de suivi et « Mes commandes » du profil
// s'appuient sur ce module pour dire exactement la meme chose. Aucun statut brut de l'API n'est affiche.

/** Etapes de la frise d'avancement (dans l'ordre). */
export const ORDER_STEPS = [
  { key: "placed", label: "Commande passée" },
  { key: "paid", label: "Paiement confirmé" },
  { key: "preparing", label: "Préparation" },
  { key: "shipping", label: "En livraison" },
  { key: "delivered", label: "Livrée" },
];

/**
 * tone : couleur du badge. step : index de l'etape EN COURS dans ORDER_STEPS (les precedentes sont faites ;
 * 5 = tout est fait). issue : etat anormal a signaler. group : filtre de « Mes commandes ».
 */
const ORDER_STATUS = {
  PENDING: { label: "En attente de paiement", tone: "amber", step: 1, group: "active" },
  PAID: { label: "Commande confirmée", tone: "green", step: 2, group: "active" },
  PROCESSING: { label: "En préparation", tone: "blue", step: 2, group: "active" },
  // Colis emballe mais pas encore pris par le livreur : la preparation est faite, la livraison n'a pas commence.
  READY_TO_DELIVER: { label: "Prête, en attente du livreur", tone: "blue", step: 3, stepHint: "En attente du livreur", group: "active" },
  DELIVERY_IN_PROGRESS: { label: "En cours de livraison", tone: "violet", step: 3, stepHint: "Remis au livreur", group: "active" },
  DELIVERY_FAILED: { label: "Livraison à reprogrammer", tone: "red", step: 3, issue: true, group: "active" },
  DELIVERED: { label: "Livrée", tone: "green", step: 5, group: "delivered" },
  CANCELED: { label: "Annulée", tone: "neutral", step: -1, group: "closed" },
  REFUNDED: { label: "Remboursée", tone: "neutral", step: 5, group: "closed" },
};

export const normalizeOrderStatus = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  return ORDER_STATUS[s] ? s : "PENDING";
};

export const getOrderStatusMeta = (value) => {
  const code = normalizeOrderStatus(value);
  return { code, ...ORDER_STATUS[code] };
};

export const TONE_BADGE = {
  amber: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  green: "bg-[#6aa200]/10 text-[#3f6300] ring-[#6aa200]/25 dark:text-[#9fd63a] dark:ring-[#6aa200]/40",
  blue: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
  violet: "bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30",
  red: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30",
  neutral: "bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700",
};

export const TONE_DOT = {
  amber: "bg-amber-500",
  green: "bg-[#6aa200]",
  blue: "bg-sky-500",
  violet: "bg-violet-500",
  red: "bg-red-500",
  neutral: "bg-neutral-400",
};

/** Filtres de « Mes commandes ». */
export const ORDER_FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "active", label: "En cours" },
  { key: "delivered", label: "Livrées" },
  { key: "closed", label: "Annulées" },
];

export const matchesOrderFilter = (status, filter) =>
  filter === "all" || getOrderStatusMeta(status).group === filter;

/** CGV art. 12 : le client annule tant que la commande n'est pas prise en charge (meme matrice que l'API). */
export const isCustomerCancellable = (status) => ["PENDING", "PAID"].includes(normalizeOrderStatus(status));

/** Justificatif d'achat : uniquement pour une commande payee. */
export const hasReceipt = (status) => !["PENDING", "CANCELED"].includes(normalizeOrderStatus(status));

/** Fin de la fenetre de retour (meme regle que ReturnPolicyService : depart a la date de livraison). */
export const computeReturnDeadline = ({ status, deliveryDate, createdAt }, returnWindow) => {
  if (normalizeOrderStatus(status) !== "DELIVERED") return null;
  const start = new Date(deliveryDate || createdAt || "");
  if (Number.isNaN(start.getTime())) return null;
  const count = Number(returnWindow?.count) > 0 ? Number(returnWindow.count) : 7;
  const end = new Date(start);
  if (returnWindow?.unit === "HOURS") end.setHours(end.getHours() + count);
  else end.setDate(end.getDate() + count);
  return end;
};

/** Phrase courte affichee sous le statut. */
export const getOrderHeadline = (status, { eta, deliveredAt } = {}) => {
  const etaText = eta ? ` le ${formatDate(eta, { long: true })}` : " prochainement";
  switch (normalizeOrderStatus(status)) {
    case "PENDING":
      return "Nous attendons la confirmation de votre paiement pour lancer la préparation.";
    case "PAID":
      return "Votre paiement est confirmé. Le vendeur va préparer votre commande.";
    case "PROCESSING":
      return `Votre commande est en cours de préparation. Livraison prévue${etaText}.`;
    case "READY_TO_DELIVER":
      return `Votre colis est prêt et attend le livreur. Livraison prévue${etaText}.`;
    case "DELIVERY_IN_PROGRESS":
      return `Votre colis a été remis au livreur et est en route. Livraison prévue${etaText}.`;
    case "DELIVERY_FAILED":
      return "Le livreur n'a pas pu vous remettre le colis. Une nouvelle tentative sera organisée ; contactez-nous si besoin.";
    case "DELIVERED":
      return deliveredAt ? `Votre commande a été livrée le ${formatDate(deliveredAt, { long: true })}.` : "Votre commande a été livrée.";
    case "CANCELED":
      return "Cette commande a été annulée. Si vous aviez payé, le remboursement est effectué sur votre moyen de paiement.";
    case "REFUNDED":
      return "Cette commande a été remboursée sur votre moyen de paiement.";
    default:
      return "";
  }
};

/** Libelles de l'historique (statuts de commande). */
export const ORDER_EVENT_LABEL = {
  PENDING: "Commande enregistrée",
  PAID: "Paiement confirmé",
  PROCESSING: "Préparation commencée",
  READY_TO_DELIVER: "Colis prêt, en attente du livreur",
  DELIVERY_IN_PROGRESS: "Colis remis au livreur",
  DELIVERY_FAILED: "Tentative de livraison échouée",
  DELIVERED: "Commande livrée",
  CANCELED: "Commande annulée",
  REFUNDED: "Commande remboursée",
};

/** Statuts d'un colis (logistique). */
const SHIPMENT_STATUS = {
  // Un colis n'existe qu'a partir de « Prête » : EN_PREPARATION = emballe, en attente du livreur.
  EN_PREPARATION: { label: "Prêt, en attente du livreur", tone: "blue" },
  EN_COURS: { label: "En cours de livraison", tone: "violet" },
  LIVREE: { label: "Livré", tone: "green" },
  ECHEC: { label: "Livraison échouée", tone: "red" },
};

export const getShipmentStatusMeta = (value) => {
  const s = `${value || ""}`.trim().toUpperCase();
  return SHIPMENT_STATUS[s] ? { code: s, ...SHIPMENT_STATUS[s] } : { code: s, label: "À confirmer", tone: "neutral" };
};

const PAYMENT_STATUS = {
  PENDING: "En attente",
  COMPLETED: "Payé",
  CANCELLED: "Paiement annulé",
  FAILED: "Paiement refusé",
  PARTIALLY_REFUNDED: "Partiellement remboursé",
  REFUNDED: "Remboursé",
};

export const getPaymentStatusLabel = (value) => PAYMENT_STATUS[`${value || ""}`.trim().toUpperCase()] || null;

// --- Formatage ---

export const formatMoney = (value, currency = "FCFA") => {
  const n = Number(value);
  const cur = !currency || `${currency}`.toUpperCase() === "XOF" ? "FCFA" : currency;
  if (!Number.isFinite(n)) return `— ${cur}`;
  return `${n.toLocaleString("fr-FR")} ${cur}`;
};

export const toDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value, { long = false } = {}) => {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString("fr-FR", long ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateTime = (value) => {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// --- Reprise du paiement (commande en attente, conservee 30 min apres sa creation) ---

const PENDING_PAYMENT_KEY = "lid_pending_payment";
const PENDING_ORDER_TTL_MS = 30 * 60 * 1000;

/** Lien de paiement memorise par le tunnel de commande, s'il est encore valide (et pour cette commande). */
export function readPendingPayment(orderNumber) {
  try {
    const raw = window.localStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    if (!pending?.paymentUrl || Date.now() - Number(pending.createdAt || 0) > PENDING_ORDER_TTL_MS) {
      window.localStorage.removeItem(PENDING_PAYMENT_KEY);
      return null;
    }
    if (orderNumber && pending.orderNumber && `${pending.orderNumber}`.trim() !== `${orderNumber}`.trim()) {
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}
