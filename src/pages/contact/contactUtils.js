export const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return `${value}`;
  return new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(d);
};

/** Traitement d'un message reçu. */
export const HANDLING = {
  NEW: { label: "Non lu", variant: "warning" },
  READ: { label: "Lu", variant: "neutral" },
  PROCESSED: { label: "Traité", variant: "success" },
  ARCHIVED: { label: "Archivé", variant: "outline" }
};

/** Statut d'envoi de l'e-mail (notification à l'équipe pour un message reçu, envoi au destinataire sinon). */
export const DELIVERY = {
  SENT: { label: "Envoyé", variant: "success" },
  FAILED: { label: "Échec d'envoi", variant: "destructive" },
  PENDING: { label: "En attente", variant: "warning" }
};

export const DIRECTION = {
  INBOUND: { label: "Reçu" },
  OUTBOUND: { label: "Envoyé" }
};

export const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

export const senderLabel = (m) => m?.senderName || m?.senderEmail || "Expéditeur inconnu";

export const recipientsLabel = (m) => {
  const list = Array.isArray(m?.recipients) ? m.recipients : [];
  if (list.length <= 2) return list.join(", ") || "-";
  return `${list.slice(0, 2).join(", ")} +${list.length - 2}`;
};
