// Aides d'affichage des commandes de l'espace partenaire : lecture tolérante (aucun NaN / undefined affiché).
import { formatMoney } from "@/utils/orderStatus";

/** Nombre sûr : accepte "5 900", "5900,50" ; renvoie null si non numérique. */
export const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const cleaned = `${value}`.replace(/\s/g, "").replace(",", ".").replace(/[^0-9.+-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

export const money = (value) => formatMoney(toNumber(value) ?? 0);

/** Montant à afficher, ou null si inconnu (pour masquer la ligne plutôt qu'afficher 0 trompeur). */
export const moneyOrNull = (value) => {
  const n = toNumber(value);
  return n === null ? null : formatMoney(n);
};

export const normalizeRaw = (status) => `${status || ""}`.trim().toUpperCase();

// Statuts de colis (API) rapprochés des statuts de commande pour un libellé unique.
const SHIPMENT_TO_ORDER = {
  EN_PREPARATION: "READY_TO_DELIVER",
  EN_COURS: "DELIVERY_IN_PROGRESS",
  LIVREE: "DELIVERED",
  ECHEC: "DELIVERY_FAILED",
  READY_TO_DELIVER: "READY_TO_DELIVER",
  DELIVERY_IN_PROGRESS: "DELIVERY_IN_PROGRESS",
  DELIVERED: "DELIVERED",
  DELIVERY_FAILED: "DELIVERY_FAILED",
};

export const STATUS_LABELS = {
  PENDING: "En attente de paiement",
  PAID: "Payée",
  PROCESSING: "En préparation",
  READY_TO_DELIVER: "Colis prêt",
  DELIVERY_IN_PROGRESS: "En livraison",
  DELIVERY_FAILED: "Livraison échouée",
  DELIVERED: "Livré",
  CANCELED: "Annulée",
  REFUNDED: "Remboursée",
};

/** Statut affiché : celui du colis du partenaire s'il existe, sinon celui de la commande. */
export const effectiveStatus = (orderStatus, shipments) => {
  const order = normalizeRaw(orderStatus);
  if (order === "CANCELED" || order === "REFUNDED") return order;
  const list = Array.isArray(shipments) ? shipments : [];
  const mapped = list.map((s) => SHIPMENT_TO_ORDER[normalizeRaw(s?.status)]).filter(Boolean);
  if (!mapped.length) return order || "PENDING";
  // Plusieurs colis : on affiche le moins avancé (la commande n'est « livrée » que si tous le sont).
  const rank = ["READY_TO_DELIVER", "DELIVERY_FAILED", "DELIVERY_IN_PROGRESS", "DELIVERED"];
  return mapped.sort((a, b) => rank.indexOf(a) - rank.indexOf(b))[0];
};

export const statusGroup = (status) => {
  const raw = normalizeRaw(status);
  if (raw === "DELIVERED") return "Completed";
  if (raw === "CANCELED" || raw === "REFUNDED") return "Cancelled";
  if (["PROCESSING", "READY_TO_DELIVER", "DELIVERY_IN_PROGRESS", "DELIVERY_FAILED"].includes(raw)) return "Processing";
  return "Pending";
};

export const SETTLEMENT_LABELS = {
  UNPAID: "Non payée",
  AWAITING_DELIVERY: "En attente de livraison",
  PENDING_WINDOW: "Fenêtre de retour en cours",
  ON_HOLD: "Retour ouvert",
  ELIGIBLE: "Éligible au versement",
  PAID: "Versé",
  CANCELLED: "Annulé",
  CANCELED: "Annulé",
};

export const settlementLabel = (value, eligibleAt) => {
  const status = normalizeRaw(value);
  const label = SETTLEMENT_LABELS[status] || "";
  if (status === "PENDING_WINDOW" && eligibleAt) {
    const d = new Date(eligibleAt);
    if (!Number.isNaN(d.getTime())) return `${label} (éligible le ${d.toLocaleDateString("fr-FR")})`;
  }
  return label;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const readableShopName = (value) => {
  const name = `${value || ""}`.trim();
  return name && !UUID_RE.test(name) ? name : "";
};

/** Colis du partenaire prêts pour QR : un QR par colis (qrPayload, sinon LID-SHIP-<code>). */
export const normalizeShipments = (shipments) =>
  (Array.isArray(shipments) ? shipments : []).map((s, index) => {
    const handoffCode = `${s?.handoffCode || ""}`.trim();
    const qrPayload = `${s?.qrPayload || ""}`.trim() || (handoffCode ? `LID-SHIP-${handoffCode}` : "");
    return {
      key: s?.id ?? `shipment-${index}`,
      id: s?.id ?? null,
      status: normalizeRaw(s?.status),
      trackingNumber: `${s?.trackingNumber || ""}`.trim(),
      handoffCode,
      qrPayload,
    };
  });
