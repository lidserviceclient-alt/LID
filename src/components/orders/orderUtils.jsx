import { cn } from "../../utils/cn.js";

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(num))} FCFA`;
};

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const TONES = {
  amber: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  blue: "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-300",
  indigo: "border-transparent bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  teal: "border-transparent bg-teal-500/15 text-teal-700 dark:text-teal-300",
  green: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  red: "border-transparent bg-rose-500/15 text-rose-700 dark:text-rose-300",
  orange: "border-transparent bg-orange-500/15 text-orange-700 dark:text-orange-300",
  slate: "border-transparent bg-slate-500/15 text-slate-700 dark:text-slate-300"
};

// Statuts réels de la commande, dans l'ordre du parcours
export const ORDER_STATUSES = [
  { value: "PENDING", label: "En attente de paiement", short: "En attente", tone: "amber" },
  { value: "PAID", label: "Payée", short: "Payées", tone: "blue" },
  { value: "PROCESSING", label: "En préparation", short: "En préparation", tone: "indigo" },
  { value: "READY_TO_DELIVER", label: "Colis prêt, en attente du livreur", short: "Colis prêts", tone: "teal" },
  { value: "DELIVERY_IN_PROGRESS", label: "En cours de livraison", short: "En livraison", tone: "teal" },
  { value: "DELIVERY_FAILED", label: "Livraison échouée", short: "Livraison échouée", tone: "orange" },
  { value: "DELIVERED", label: "Livrée", short: "Livrées", tone: "green" },
  { value: "CANCELED", label: "Annulée", short: "Annulées", tone: "red" },
  { value: "REFUNDED", label: "Remboursée", short: "Remboursées", tone: "slate" }
];

const STATUS_INDEX = Object.fromEntries(ORDER_STATUSES.map((s) => [s.value, s]));

export const statusLabel = (status) => STATUS_INDEX[status]?.label || status || "-";

// Verbe d'action pour passer à un statut
export const STATUS_ACTION_LABELS = {
  PROCESSING: "Démarrer la préparation",
  READY_TO_DELIVER: "Colis prêt pour le livreur",
  DELIVERY_IN_PROGRESS: "Marquer en cours de livraison",
  DELIVERED: "Marquer livrée",
  DELIVERY_FAILED: "Marquer livraison échouée"
};

export const statusActionLabel = (status) => STATUS_ACTION_LABELS[status] || `Passer à « ${statusLabel(status)} »`;

// Ce que l'action implique, affiché en infobulle (survol et focus clavier) sous le bouton
export const STATUS_ACTION_HINTS = {
  PROCESSING:
    "Vous commencez à rassembler et emballer les articles ; le client ne peut plus annuler et le partenaire voit ses coordonnées.",
  READY_TO_DELIVER:
    "Le colis est emballé et attend le livreur : il devient disponible pour la livraison et la commande ne pourra plus être annulée."
};

export const statusActionHint = (status) => STATUS_ACTION_HINTS[status] || "";

export function StatusBadge({ status, className }) {
  const meta = STATUS_INDEX[status];
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONES[meta?.tone || "slate"],
        className
      )}
    >
      {meta?.label || status || "-"}
    </span>
  );
}

const PAYMENT_META = {
  PENDING: { label: "En attente", tone: "amber" },
  COMPLETED: { label: "Payé", tone: "green" },
  CANCELLED: { label: "Annulé", tone: "slate" },
  FAILED: { label: "Échoué", tone: "red" },
  PARTIALLY_REFUNDED: { label: "Remboursé en partie", tone: "orange" },
  REFUNDED: { label: "Remboursé", tone: "slate" }
};

export function PaymentBadge({ status, className }) {
  const meta = PAYMENT_META[status] || { label: "Non payé", tone: "slate" };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONES[meta.tone],
        className
      )}
    >
      {meta.label}
    </span>
  );
}

export const SHIPMENT_LABELS = {
  EN_PREPARATION: "En préparation",
  EN_COURS: "Remis au livreur",
  LIVREE: "Livré",
  ECHEC: "Échec de livraison"
};

export const REFUND_STATUS_LABELS = {
  PENDING: "En attente",
  PROCESSING: "En cours",
  COMPLETED: "Terminé",
  FAILED: "Échec",
  CANCELLED: "Annulé",
  MANUAL_REVIEW: "À traiter manuellement",
  NOT_REQUESTED: "Aucun remboursement"
};

export const refundTone = (status) =>
  ({
    COMPLETED: "green",
    PROCESSING: "blue",
    PENDING: "amber",
    FAILED: "red",
    MANUAL_REVIEW: "orange",
    CANCELLED: "slate"
  })[status] || "slate";

export const RETURN_STATUS_LABELS = {
  SUBMITTED: "Nouveau",
  UNDER_REVIEW: "En analyse",
  APPROVED: "Accepté",
  REJECTED: "Refusé",
  REFUNDED: "Remboursé",
  COMPLETED: "Terminé",
  CLOSED: "Clos"
};

export function Pill({ children, tone = "slate", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone] || TONES.slate,
        className
      )}
    >
      {children}
    </span>
  );
}
