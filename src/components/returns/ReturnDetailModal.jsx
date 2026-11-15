import { useEffect, useState } from "react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Select from "../ui/Select.jsx";
import Modal from "../ui/Modal.jsx";
import { backofficeApi } from "../../services/api.js";
import { REFUND_LABELS, RETURN_STATUS_OPTIONS as statusOptions, mapReturnStatusLabel as mapStatusLabel } from "./returnUtils.js";

/**
 * Détail d'un retour (modale) : statut, imputabilité partenaire, remboursement manuel.
 * `returnId` ouvre la modale ; `onChanged` est appelé après chaque mise à jour pour recharger la liste.
 */
export default function ReturnDetailModal({ returnId, onClose, onChanged }) {
  const detailOpen = returnId != null;
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [sellerFault, setSellerFault] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [refundReference, setRefundReference] = useState("");
  const [refundSaving, setRefundSaving] = useState(false);
  useEffect(() => {
    if (returnId == null) return undefined;
    let cancelled = false;
    setDetail(null);
    setDetailError("");
    setRefundReference("");
    setDetailLoading(true);
    backofficeApi
      .returnDetail(returnId)
      .then((res) => {
        if (cancelled) return;
        setDetail(res);
        setStatusUpdate(res?.status || "");
        setSellerFault(Boolean(res?.sellerFault));
      })
      .catch((err) => !cancelled && setDetailError(err?.message || "Impossible de charger le retour."))
      .finally(() => !cancelled && setDetailLoading(false));
    return () => {
      cancelled = true;
    };
  }, [returnId]);

  const submitManualRefund = async () => {
    const reference = refundReference.trim();
    if (!detail?.id || reference.length < 3) return;
    setRefundSaving(true);
    setDetailError("");
    try {
      const updated = await backofficeApi.completeReturnRefund(detail.id, reference);
      setDetail(updated);
      setRefundReference("");
      await onChanged?.();
    } catch (err) {
      setDetailError(err?.message || "Impossible de finaliser le remboursement.");
    } finally {
      setRefundSaving(false);
    }
  };

  const submitStatus = async () => {
    if (!detail?.id || !statusUpdate) return;
    setStatusSaving(true);
    setDetailError("");
    try {
      const updated = await backofficeApi.updateReturnStatus(
        detail.id,
        statusUpdate,
        statusUpdate === "APPROVED" || statusUpdate === "REFUNDED" ? sellerFault : undefined
      );
      setDetail(updated);
      await onChanged?.();
    } catch (err) {
      setDetailError(err?.message || "Impossible de mettre à jour le statut.");
    } finally {
      setStatusSaving(false);
    }
  };

  return (
  <Modal
    isOpen={detailOpen}
    onClose={onClose}
    title="Détail du retour"
    size="lg"
  >
    {detailLoading ? (
      <div className="text-sm text-muted-foreground">Chargement…</div>
    ) : detailError ? (
      <div className="text-sm text-red-600">{detailError}</div>
    ) : detail ? (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground">Commande</div>
            <div className="font-semibold">{detail.orderNumber}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="font-semibold">{detail.email}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Téléphone</div>
            <div className="font-semibold">{detail.customerPhone || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Motif</div>
            <div className="font-semibold">{detail.reason}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Statut</div>
            <Badge label={mapStatusLabel(detail.status)} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Remboursement</div>
            <div className="font-semibold">
              {detail.refundAmount != null ? `${detail.refundAmount} FCFA · ` : ""}
              {REFUND_LABELS[detail.refundStatus] || detail.refundStatus || "-"}
            </div>
            {detail.refundReference ? (
              <div className="text-xs text-muted-foreground">Réf. {detail.refundReference}</div>
            ) : null}
          </div>
        </div>

        {detail.refundStatus === "MANUAL_REVIEW" ? (
          <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
            <div className="font-semibold text-amber-900">Ce remboursement ne peut pas être automatisé (carte ou résultat incertain).</div>
            <p className="text-xs text-amber-800">Effectuez le remboursement hors plateforme, puis saisissez sa référence : le retour, la commande et le reversement du partenaire sont alors mis à jour.</p>
            <div className="flex flex-col gap-2 md:flex-row">
              <Input value={refundReference} onChange={(e) => setRefundReference(e.target.value)} placeholder="Référence du virement / de l'opération" className="flex-1" />
              <Button onClick={submitManualRefund} disabled={refundSaving || refundReference.trim().length < 3}>
                {refundSaving ? "..." : "Marquer comme remboursé"}
              </Button>
            </div>
          </div>
        ) : null}

        {detail.details ? (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            {detail.details}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-sm font-semibold">Articles</div>
          <div className="space-y-2">
            {(detail.items || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3 text-sm">
                <div>
                  <div className="font-semibold">{item.articleName}</div>
                  <div className="text-xs text-muted-foreground">ID: {item.articleId}</div>
                </div>
                <div className="text-xs text-muted-foreground">Qté: {item.quantity}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Mettre à jour le statut</div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)} className="flex-1">
              {statusOptions.filter((o) => o.value).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Button onClick={submitStatus} disabled={statusSaving} className="md:w-40">
              {statusSaving ? "..." : "Mettre à jour"}
            </Button>
          </div>
          {statusUpdate === "APPROVED" || statusUpdate === "REFUNDED" ? (
            <label className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm">
              <input type="checkbox" className="mt-1" checked={sellerFault} onChange={(e) => setSellerFault(e.target.checked)} />
              <span>
                <span className="font-medium">Retour imputable au partenaire (produit défectueux ou non conforme)</span>
                <span className="block text-xs text-muted-foreground">
                  Pré-rempli d'après le motif. Si coché, les frais de paiement initiaux sont à la charge du partenaire ; sinon LID les supporte.
                </span>
              </span>
            </label>
          ) : null}
        </div>
      </div>
    ) : null}
  </Modal>
  );
}
