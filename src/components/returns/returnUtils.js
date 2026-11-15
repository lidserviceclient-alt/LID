export const RETURN_STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "SUBMITTED", label: "Nouveau" },
  { value: "UNDER_REVIEW", label: "En analyse" },
  { value: "APPROVED", label: "Accepté" },
  { value: "REJECTED", label: "Refusé" },
  { value: "REFUNDED", label: "Remboursé" },
  { value: "CLOSED", label: "Clos" }
];

export const mapReturnStatusLabel = (status) =>
  RETURN_STATUS_OPTIONS.find((o) => o.value && o.value === status)?.label || status || "-";

export const REFUND_LABELS = {
  NOT_REQUESTED: "Aucun remboursement",
  PENDING: "En attente",
  PROCESSING: "En cours",
  COMPLETED: "Terminé",
  FAILED: "Échec",
  MANUAL_REVIEW: "À traiter manuellement"
};

export const formatReturnDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
};
