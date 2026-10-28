import { useEffect, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";

/**
 * Confirmation d'une action sur une commande, avec motif / montant / référence selon ce que l'API exige.
 * `onConfirm({ reason, amount, reference, fields })` doit lever une erreur pour rester ouverte (message affiché).
 */
export default function OrderActionModal({
  open,
  onClose,
  title,
  description,
  notice,
  confirmLabel = "Confirmer",
  destructive = false,
  reasonLabel,
  reasonRequired = false,
  reasonMinLength = 5,
  reasonPlaceholder = "",
  amountLabel,
  amountMax,
  amountDefault,
  referenceLabel,
  referenceMinLength = 3,
  fields = [],
  onConfirm
}) {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setAmount(amountDefault !== undefined && amountDefault !== null ? `${amountDefault}` : "");
      setReference("");
      setValues({});
      setError("");
      setSaving(false);
    }
  }, [open, amountDefault]);

  const reasonOk = !reasonLabel || !reasonRequired || reason.trim().length >= reasonMinLength;
  const referenceOk = !referenceLabel || reference.trim().length >= referenceMinLength;
  const amountNumber = Number(amount);
  const amountOk =
    !amountLabel || (Number.isFinite(amountNumber) && amountNumber > 0 && (amountMax === undefined || amountNumber <= Number(amountMax)));
  const fieldsOk = fields.every((f) => !f.required || `${values[f.name] || ""}`.trim().length > 0);
  const canSubmit = reasonOk && referenceOk && amountOk && fieldsOk && !saving;

  async function submit() {
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    try {
      await onConfirm({
        reason: reason.trim(),
        amount: amountLabel ? amountNumber : undefined,
        reference: reference.trim(),
        fields: values
      });
    } catch (err) {
      setError(err?.message || "L'action a échoué.");
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={saving ? () => {} : onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Retour
          </Button>
          <Button variant={destructive ? "destructive" : "primary"} onClick={submit} disabled={!canSubmit} isLoading={saving}>
            {saving ? "En cours…" : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        {description ? <p className="text-muted-foreground">{description}</p> : null}
        {notice ? (
          <div className="rounded-lg border border-amber-300/60 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-200">
            {notice}
          </div>
        ) : null}

        {amountLabel ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{amountLabel}</label>
            <Input type="number" min={1} max={amountMax} value={amount} onChange={(e) => setAmount(e.target.value)} />
            {amountMax !== undefined ? (
              <p className="text-xs text-muted-foreground">
                Maximum : {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(amountMax))} FCFA
              </p>
            ) : null}
          </div>
        ) : null}

        {fields.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <label className="text-sm font-medium">
              {f.label}
              {f.required ? " *" : ""}
            </label>
            <Input
              type={f.type || "text"}
              placeholder={f.placeholder || ""}
              value={values[f.name] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
            />
          </div>
        ))}

        {referenceLabel ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{referenceLabel} *</label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ex : WAVE-20260512-0042" />
          </div>
        ) : null}

        {reasonLabel ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              {reasonLabel}
              {reasonRequired ? " *" : " (facultatif)"}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {reasonRequired ? (
              <p className="text-xs text-muted-foreground">Obligatoire ({reasonMinLength} caractères minimum), conservé dans l'historique.</p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
