import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Banknote,
  CheckCircle2,
  Info,
  KeyRound,
  PackageCheck,
  RefreshCcw,
  ShieldAlert,
  Truck,
  UserPlus
} from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import OrderActionModal from "../components/orders/OrderActionModal.jsx";
import {
  PaymentBadge,
  Pill,
  REFUND_STATUS_LABELS,
  RETURN_STATUS_LABELS,
  SHIPMENT_LABELS,
  StatusBadge,
  formatCurrency,
  formatDateTime,
  refundTone,
  statusActionHint,
  statusActionLabel,
  statusLabel
} from "../components/orders/orderUtils.jsx";
import { backofficeApi } from "../services/api.js";

// Étapes du parcours normal d'une commande
const FLOW = ["PENDING", "PAID", "PROCESSING", "READY_TO_DELIVER", "DELIVERY_IN_PROGRESS", "DELIVERED"];

function Section({ title, subtitle, right, children }) {
  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </Card>
  );
}

function Row({ label, value, strong, negative }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={(strong ? "text-lg font-semibold " : "font-medium ") + (negative ? "text-emerald-600" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

function Timeline({ status, history }) {
  const seen = new Set((history || []).map((h) => h.status));
  seen.add(status);
  const currentIndex = FLOW.indexOf(status === "DELIVERY_FAILED" ? "DELIVERY_IN_PROGRESS" : status);
  const ended = status === "CANCELED" || status === "REFUNDED";
  const steps = FLOW.map((step, index) => ({
    step,
    done: ended ? seen.has(step) : index <= currentIndex,
    current: !ended && index === currentIndex
  }));
  return (
    <ol className="flex gap-1 overflow-x-auto pb-1">
      {steps.map(({ step, done, current }) => (
        <li key={step} className="flex min-w-[88px] flex-1 flex-col items-center gap-1.5 text-center">
          <div
            className={
              "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold " +
              (current
                ? "border-foreground bg-foreground text-background"
                : done
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-700"
                  : "border-input text-muted-foreground")
            }
          >
            {done && !current ? <CheckCircle2 className="h-4 w-4" /> : FLOW.indexOf(step) + 1}
          </div>
          <span className={"text-[11px] leading-tight " + (current ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {statusLabel(step)}
          </span>
        </li>
      ))}
      {status === "DELIVERY_FAILED" || ended ? (
        <li className="flex min-w-[88px] flex-1 flex-col items-center gap-1.5 text-center">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-rose-500 bg-rose-500/15 text-rose-700">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-semibold leading-tight text-rose-700">{statusLabel(status)}</span>
        </li>
      ) : null}
    </ol>
  );
}

export default function OrderDetail() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await backofficeApi.orderDetail(reference);
        setDetail(data);
        setError("");
      } catch (err) {
        setError(err?.message || "Impossible de charger la commande.");
      } finally {
        setLoading(false);
      }
    },
    [reference]
  );

  useEffect(() => {
    load();
  }, [load]);

  const actions = detail?.actions;
  const status = detail?.currentStatus;
  const ref = detail?.orderNumber || reference;

  // Exécute une action puis recharge la commande ; l'erreur est relayée à l'appelant (modale ou bandeau)
  async function perform(fn, successText) {
    await fn();
    setNotice({ type: "success", text: successText });
    await load(true);
  }

  // Action sans modale : l'erreur s'affiche dans le bandeau
  async function direct(key, fn, successText) {
    setBusy(key);
    setNotice(null);
    try {
      await perform(fn, successText);
    } catch (err) {
      setNotice({ type: "error", text: err?.message || "L'action a échoué." });
    } finally {
      setBusy("");
    }
  }

  const forcible = useMemo(() => (actions?.forcibleStatuses || []).filter((s) => s !== "PENDING"), [actions]);

  const itemsBySeller = useMemo(() => {
    const groups = new Map();
    (detail?.items || []).forEach((item) => {
      const key = item.sellerName || "LID";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return [...groups.entries()];
  }, [detail]);

  // ---------- configuration de la modale selon l'action ----------
  const close = () => setModal(null);

  function modalProps() {
    if (!modal) return { open: false };
    const done = (fn, text) => async (input) => {
      await perform(() => fn(input), text);
      close();
    };
    switch (modal.kind) {
      case "status":
        return {
          title: statusActionLabel(modal.target),
          description: `La commande ${ref} passera au statut « ${statusLabel(modal.target)} ».`,
          notice:
            modal.target === "READY_TO_DELIVER"
              ? "Les colis seront créés (un par vendeur) et proposés au livreur. Une fois le colis prêt, la commande ne pourra plus être annulée (CGV art. 12). Le client est prévenu par e-mail."
              : modal.target === "PROCESSING"
                ? "Le client ne pourra plus annuler et le partenaire verra ses coordonnées. Le client est prévenu par e-mail."
                : undefined,
          reasonLabel: "Commentaire",
          confirmLabel: "Confirmer",
          onConfirm: done(
            ({ reason }) => backofficeApi.updateOrderStatus(ref, modal.target, { comment: reason }),
            `Commande passée à « ${statusLabel(modal.target)} ».`
          )
        };
      case "cancel":
        return {
          title: "Annuler la commande",
          description: `Vous allez annuler la commande ${ref}. Cette action est définitive.`,
          notice: actions?.refundOnCancel
            ? "Commande déjà payée : le client est remboursé automatiquement (mobile money). Un paiement par carte passe en remboursement manuel à traiter ici. Le stock est remis en vente."
            : "Commande non payée : aucun remboursement. Le stock réservé est libéré.",
          reasonLabel: "Motif de l'annulation",
          reasonRequired: true,
          reasonPlaceholder: "Ex : rupture de stock chez le vendeur, demande du client…",
          confirmLabel: "Annuler la commande",
          destructive: true,
          onConfirm: done(
            ({ reason }) => backofficeApi.updateOrderStatus(ref, "CANCELED", { comment: reason }),
            "Commande annulée."
          )
        };
      case "force":
        return {
          title: modal.target === "CANCELED" ? "Annulation exceptionnelle (colis perdu / livraison échouée)" : `Forcer : ${statusLabel(modal.target)}`,
          description:
            modal.target === "CANCELED"
              ? "Une commande déjà envoyée pour livraison ne s'annule pas (CGV art. 12). Exception réservée au colis perdu ou à la livraison échouée."
              : `Transition hors parcours normal vers « ${statusLabel(modal.target)} ».`,
          notice:
            modal.target === "CANCELED" && actions?.refundOnCancel
              ? "Le client sera remboursé automatiquement. Le motif est conservé dans l'historique de la commande."
              : "Le motif est conservé dans l'historique de la commande, marqué « FORCÉ ».",
          reasonLabel: "Motif du forçage",
          reasonRequired: true,
          confirmLabel: "Forcer la transition",
          destructive: true,
          onConfirm: done(
            ({ reason }) => backofficeApi.updateOrderStatus(ref, modal.target, { force: true, comment: reason }),
            `Statut forcé : « ${statusLabel(modal.target)} ».`
          )
        };
      case "refund":
        return {
          title: "Rembourser la commande",
          description: `Reste remboursable : ${formatCurrency(actions?.refundableAmount)}. Laissez le montant par défaut pour un remboursement total.`,
          notice:
            "Mobile money pris en charge (Orange, MTN, Moov, Wave) : décaissement automatique. Paiement par carte ou opérateur non supporté : le remboursement passe « à traiter manuellement » et se clôture avec la référence de l'opération.",
          amountLabel: "Montant à rembourser (FCFA)",
          amountMax: actions?.refundableAmount,
          amountDefault: actions?.refundableAmount,
          reasonLabel: "Motif du remboursement",
          reasonRequired: true,
          confirmLabel: "Rembourser",
          onConfirm: done(
            ({ reason, amount }) =>
              backofficeApi.refundOrder(ref, {
                amount: amount && Number(amount) < Number(actions?.refundableAmount) ? amount : undefined,
                reason
              }),
            "Remboursement lancé."
          )
        };
      case "refundRetry": {
        const pay = (detail.payments || []).find((p) => p.id === modal.refund.paymentId);
        return {
          title: "Relancer le remboursement automatique",
          description: `Remboursement de ${formatCurrency(modal.refund.amount)} par ${pay?.operator || "mobile money"} : le décaissement va être renvoyé à l'opérateur.`,
          notice: modal.refund.lastError
            ? `Dernier échec : ${modal.refund.lastError}. Si le statut est « À traiter manuellement » après une erreur de communication, vérifiez d'abord chez l'opérateur avec la référence REFUND-${modal.refund.id} : la même référence est réutilisée, elle ne peut être décaissée qu'une fois.`
            : `La référence REFUND-${modal.refund.id} est réutilisée chez l'opérateur : le client ne peut pas être remboursé deux fois.`,
          confirmLabel: "Relancer le remboursement",
          onConfirm: async () => {
            const res = await backofficeApi.retryRefund(modal.refund.id);
            await load(true);
            if (!res?.success) {
              throw new Error(res?.message || "Le remboursement n'a pas pu être effectué.");
            }
            setNotice({ type: "success", text: res.message || "Remboursement effectué." });
            close();
          }
        };
      }
      case "refundComplete":
        return {
          title: "Clôturer le remboursement",
          description: `Remboursement de ${formatCurrency(modal.refund.amount)} effectué hors plateforme (carte, opérateur non automatisable).`,
          referenceLabel: "Référence de l'opération",
          confirmLabel: "Clôturer",
          onConfirm: done(({ reference: r }) => backofficeApi.completeRefund(modal.refund.id, r), "Remboursement clôturé.")
        };
      case "returnComplete":
        return {
          title: "Clôturer le remboursement du retour",
          description: `Retour n° ${modal.ret.id} : remboursement effectué hors plateforme.`,
          referenceLabel: "Référence de l'opération",
          confirmLabel: "Clôturer",
          onConfirm: done(({ reference: r }) => backofficeApi.completeReturnRefund(modal.ret.id, r), "Remboursement du retour clôturé.")
        };
      case "returnStatus":
        return {
          title: modal.label,
          description: modal.description,
          confirmLabel: modal.label,
          destructive: modal.status === "REJECTED",
          onConfirm: done(() => backofficeApi.updateReturnStatus(modal.ret.id, modal.status), modal.success)
        };
      case "courier":
        return {
          title: "Affecter un livreur",
          description: "Identifiant du livreur tel qu'enregistré au scan (e-mail de son compte).",
          fields: [
            { name: "courierUser", label: "E-mail du livreur", required: true },
            { name: "courierName", label: "Nom" },
            { name: "courierPhone", label: "Téléphone" }
          ],
          confirmLabel: "Affecter",
          onConfirm: done(
            ({ fields }) =>
              backofficeApi.assignShipmentCourier(modal.shipment.id, {
                courierUser: fields.courierUser.trim(),
                courierName: fields.courierName || undefined,
                courierPhone: fields.courierPhone || undefined
              }),
            "Livreur affecté."
          )
        };
      case "unlock":
        return {
          title: "Débloquer le code de livraison",
          description: "Le code a été saisi de façon erronée trop de fois. Le livreur pourra de nouveau le saisir.",
          confirmLabel: "Débloquer",
          onConfirm: done(() => backofficeApi.unlockShipmentCode(modal.shipment.id), "Code de livraison débloqué.")
        };
      case "depot":
        return {
          title: "Retour du colis au dépôt",
          description: "La livraison est abandonnée : le colis revient au dépôt et la commande est annulée.",
          notice: actions?.refundOnCancel ? "Commande payée : le client est remboursé automatiquement." : undefined,
          reasonLabel: "Motif",
          reasonRequired: true,
          confirmLabel: "Renvoyer au dépôt",
          destructive: true,
          onConfirm: done(({ reason }) => backofficeApi.returnShipmentToDepot(modal.shipment.id, reason), "Colis renvoyé au dépôt.")
        };
      default:
        return { open: false };
    }
  }

  if (loading && !detail) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Chargement de la commande…</div>;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-4 w-4" />
          Commandes
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50/60 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
          {error || "Commande introuvable."}
        </div>
      </div>
    );
  }

  const mp = modalProps();
  const changeable = actions.allowedStatuses || [];
  const cancelHint = !actions.cancellable ? actions.cancelBlockedReason : null;
  const retryableRefunds = (detail.refunds || []).filter((r) => (actions.retryableRefundIds || []).includes(r.id));
  const pendingRefunds = (detail.refunds || []).filter((r) => ["PENDING", "FAILED", "MANUAL_REVIEW", "PROCESSING"].includes(r.status));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-3">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Toutes les commandes
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Commande {detail.orderNumber}</h2>
              <StatusBadge status={status} />
              <PaymentBadge status={detail.payments?.[0]?.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Passée le {formatDateTime(detail.createdAt)}
              {detail.customer?.name ? ` par ${detail.customer.name}` : ""}
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => load(true)} disabled={loading}>
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {notice ? (
        <div
          role="status"
          className={
            "flex items-start justify-between gap-3 rounded-lg border p-3 text-sm " +
            (notice.type === "success"
              ? "border-emerald-300/60 bg-emerald-50/60 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/10 dark:text-emerald-200"
              : "border-red-200 bg-red-50/60 text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200")
          }
        >
          <span>{notice.text}</span>
          <button type="button" className="text-xs underline" onClick={() => setNotice(null)}>
            Fermer
          </button>
        </div>
      ) : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Suivi de la commande">
            <Timeline status={status} history={detail.statusHistory} />
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Historique</p>
              <ul className="space-y-2">
                {[...(detail.statusHistory || [])].reverse().map((h, index) => (
                  <li key={h.id ?? index} className="flex flex-wrap items-start gap-x-3 gap-y-1 text-sm">
                    <StatusBadge status={h.status} />
                    <span className="text-xs text-muted-foreground">{formatDateTime(h.changedAt)}</span>
                    {h.comment ? <span className="basis-full text-muted-foreground sm:basis-auto">{h.comment}</span> : null}
                  </li>
                ))}
                {(detail.statusHistory || []).length === 0 ? <li className="text-sm text-muted-foreground">Aucun historique.</li> : null}
              </ul>
            </div>
          </Section>

          <Section title="Articles" subtitle="Un contrat de vente par vendeur (CGV art. 3)">
            {itemsBySeller.map(([seller, items]) => (
              <div key={seller} className="overflow-hidden rounded-lg border border-border">
                <div className="flex items-center justify-between bg-muted/40 px-3 py-2 text-sm">
                  <span className="font-semibold">Vendu par {seller}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0))}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={`${item.articleId}-${index}`} className="border-t border-border">
                          <td className="p-3">{item.articleName}</td>
                          <td className="whitespace-nowrap p-3 text-right text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="whitespace-nowrap p-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </Section>

          <Section title="Paiement et remboursements">
            {(detail.payments || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun paiement enregistré pour cette commande.</p>
            ) : (
              detail.payments.map((p) => (
                <div key={p.id} className="space-y-1 rounded-lg border border-border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{p.operator || "Moyen de paiement non précisé"}</span>
                    <PaymentBadge status={p.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span>Montant : {formatCurrency(p.amount)}</span>
                    <span>Date : {formatDateTime(p.paymentDate)}</span>
                    {p.transactionId ? <span>Transaction : {p.transactionId}</span> : null}
                    {Number(p.refundedAmount) > 0 ? <span>Déjà remboursé : {formatCurrency(p.refundedAmount)}</span> : null}
                  </div>
                </div>
              ))
            )}

            {(detail.refunds || []).length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remboursements</p>
                {detail.refunds.map((r) => (
                  <div key={r.id} className="space-y-2 rounded-lg border border-border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{formatCurrency(r.amount)}</span>
                      <Pill tone={refundTone(r.status)}>{REFUND_STATUS_LABELS[r.status] || r.status}</Pill>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.reason} • demandé le {formatDateTime(r.createdAt)}
                      {r.refundId ? ` • référence ${r.refundId}` : ""}
                    </p>
                    {r.lastError && r.status !== "COMPLETED" && r.status !== "CANCELLED" ? (
                      <p className="rounded-md border border-red-200 bg-red-50/60 p-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200">
                        Dernier échec : {r.lastError}
                      </p>
                    ) : null}
                    {["PENDING", "FAILED", "MANUAL_REVIEW", "PROCESSING"].includes(r.status) ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {r.retryable ? (
                            <Button size="sm" className="gap-2" onClick={() => setModal({ kind: "refundRetry", refund: r })}>
                              <RefreshCcw className="h-3.5 w-3.5" />
                              Relancer le remboursement automatique
                            </Button>
                          ) : null}
                          <Button size="sm" variant="outline" onClick={() => setModal({ kind: "refundComplete", refund: r })}>
                            Clôturer avec une référence
                          </Button>
                        </div>
                        {!r.retryable && r.retryBlockedReason ? (
                          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {r.retryBlockedReason}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </Section>

          <Section title="Livraison et colis">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <Row label="Mode de livraison" value={detail.shipping?.methodLabel || detail.shipping?.methodCode || "-"} />
              <Row label="Téléphone" value={detail.shipping?.phone || "-"} />
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Adresse</p>
                <p className="font-medium">{detail.shipping?.address || "-"}</p>
              </div>
            </div>
            {(detail.shipments || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun colis pour l'instant : les colis (un par vendeur) sont créés quand vous indiquez « Colis prêt pour le livreur ».</p>
            ) : (
              detail.shipments.map((s) => (
                <div key={s.id} className="space-y-2 rounded-lg border border-border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-semibold">
                      <Truck className="h-4 w-4" />
                      Colis {s.trackingId || `#${s.id}`}
                    </span>
                    <Pill tone={s.status === "LIVREE" ? "green" : s.status === "ECHEC" ? "red" : "blue"}>
                      {SHIPMENT_LABELS[s.status] || s.status}
                    </Pill>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span>Transporteur : {s.carrier || "-"}</span>
                    <span>Livreur : {s.courierName || s.courierUser || "non affecté"}</span>
                    {s.courierPhone ? <span>{s.courierPhone}</span> : null}
                    <span>Livraison estimée : {formatDateTime(s.eta)}</span>
                    {s.deliveredAt ? <span>Livré le {formatDateTime(s.deliveredAt)}</span> : null}
                    {s.failedAttempts > 0 ? <span>Échecs : {s.failedAttempts}</span> : null}
                  </div>
                  {s.codeLocked ? (
                    <p className="flex items-center gap-1.5 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Code de livraison bloqué après trop d'essais.
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {s.codeLocked ? (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal({ kind: "unlock", shipment: s })}>
                        <KeyRound className="h-3.5 w-3.5" />
                        Débloquer le code
                      </Button>
                    ) : null}
                    {s.status !== "LIVREE" ? (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal({ kind: "courier", shipment: s })}>
                        <UserPlus className="h-3.5 w-3.5" />
                        {s.courierUser ? "Changer de livreur" : "Affecter un livreur"}
                      </Button>
                    ) : null}
                    {s.status === "ECHEC" ? (
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModal({ kind: "depot", shipment: s })}>
                        <PackageCheck className="h-3.5 w-3.5" />
                        Retour au dépôt
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </Section>

          <Section title="Retours" subtitle="Remboursement partiel ou total selon les articles retournés (CGV art. 7)">
            {(detail.returns || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune demande de retour.
                {status === "DELIVERED" ? " Le client peut en déposer une pendant la fenêtre de retour." : ""}
              </p>
            ) : (
              detail.returns.map((ret) => {
                const open = ["SUBMITTED", "UNDER_REVIEW"].includes(ret.status);
                const needsRetry = ret.status === "APPROVED" && ret.refundStatus !== "COMPLETED";
                const manual = ["MANUAL_REVIEW", "PENDING", "PROCESSING"].includes(ret.refundStatus) && ret.status !== "REJECTED";
                return (
                  <div key={ret.id} className="space-y-2 rounded-lg border border-border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">Retour n° {ret.id}</span>
                      <div className="flex gap-2">
                        <Pill tone={ret.status === "REJECTED" ? "red" : ret.status === "REFUNDED" ? "green" : "blue"}>
                          {RETURN_STATUS_LABELS[ret.status] || ret.status}
                        </Pill>
                        <Pill tone={refundTone(ret.refundStatus)}>{REFUND_STATUS_LABELS[ret.refundStatus] || ret.refundStatus}</Pill>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Motif : {ret.reason}
                      {ret.details ? ` — ${ret.details}` : ""} • {formatDateTime(ret.createdAt)}
                    </p>
                    <ul className="text-xs">
                      {(ret.items || []).map((it) => (
                        <li key={it.id}>
                          {it.quantity} × {it.articleName} ({formatCurrency(it.unitPrice)})
                        </li>
                      ))}
                    </ul>
                    {ret.refundAmount ? (
                      <p className="text-xs">
                        Remboursement : <strong>{formatCurrency(ret.refundAmount)}</strong>
                        {ret.refundReference ? ` • référence ${ret.refundReference}` : ""}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {ret.status === "SUBMITTED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setModal({
                              kind: "returnStatus",
                              ret,
                              status: "UNDER_REVIEW",
                              label: "Mettre en analyse",
                              description: "Le retour est pris en charge, sans remboursement pour l'instant.",
                              success: "Retour mis en analyse."
                            })
                          }
                        >
                          Mettre en analyse
                        </Button>
                      ) : null}
                      {open || needsRetry ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setModal({
                              kind: "returnStatus",
                              ret,
                              status: "APPROVED",
                              label: needsRetry ? "Relancer le remboursement" : "Approuver et rembourser",
                              description:
                                "Le remboursement est calculé sur les articles retournés (frais de retour selon le motif) puis lancé automatiquement.",
                              success: "Retour approuvé, remboursement lancé."
                            })
                          }
                        >
                          {needsRetry ? "Relancer le remboursement" : "Approuver et rembourser"}
                        </Button>
                      ) : null}
                      {open ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setModal({
                              kind: "returnStatus",
                              ret,
                              status: "REJECTED",
                              label: "Refuser le retour",
                              description: "Le client est prévenu par e-mail. Aucun remboursement.",
                              success: "Retour refusé."
                            })
                          }
                        >
                          Refuser
                        </Button>
                      ) : null}
                      {manual ? (
                        <Button size="sm" variant="outline" onClick={() => setModal({ kind: "returnComplete", ret })}>
                          Clôturer avec une référence
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </Section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <Section title="Actions">
            <div className="space-y-4">
              {retryableRefunds.length > 0 ? (
                <div className="space-y-1.5 rounded-lg border border-amber-300/70 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-900/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">Remboursement en échec</p>
                  <Button
                    className="w-full justify-start gap-2"
                    onClick={() => setModal({ kind: "refundRetry", refund: retryableRefunds[0] })}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Relancer le remboursement automatique
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(retryableRefunds[0].amount)}
                    {retryableRefunds.length > 1 ? ` (+ ${retryableRefunds.length - 1} autre${retryableRefunds.length > 2 ? "s" : ""} dans « Paiement et remboursements »)` : ""}
                    {retryableRefunds[0].lastError ? ` • ${retryableRefunds[0].lastError}` : ""}
                  </p>
                </div>
              ) : null}
              {changeable.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Faire avancer</p>
                  {changeable.map((target, index) => {
                    const hint = statusActionHint(target);
                    const hintId = `status-action-hint-${target}`;
                    return (
                      <div key={target} className="group relative">
                        <Button
                          variant={index === 0 ? "primary" : "outline"}
                          className="w-full justify-start gap-2"
                          title={hint || undefined}
                          aria-describedby={hint ? hintId : undefined}
                          onClick={() => setModal({ kind: "status", target })}
                        >
                          {statusActionLabel(target)}
                          {hint ? <Info className="ml-auto h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" /> : null}
                        </Button>
                        {hint ? (
                          <span
                            id={hintId}
                            role="tooltip"
                            className="pointer-events-none absolute left-0 right-0 top-full z-20 mt-1 hidden rounded-md border border-border bg-popover p-2 text-xs text-popover-foreground shadow-md group-focus-within:block group-hover:block"
                          >
                            {hint}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Annulation</p>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-rose-300 text-rose-700 hover:bg-rose-50"
                  disabled={!actions.cancellable}
                  onClick={() => setModal({ kind: "cancel" })}
                >
                  <Ban className="h-4 w-4" />
                  Annuler la commande
                </Button>
                {actions.cancellable ? (
                  <p className="text-xs text-muted-foreground">
                    Motif obligatoire.{" "}
                    {actions.refundOnCancel ? "Commande payée : remboursement automatique du client." : "Commande non payée : aucun remboursement."}
                  </p>
                ) : (
                  <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {cancelHint}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remboursement</p>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  disabled={!actions.refundable}
                  onClick={() => setModal({ kind: "refund" })}
                >
                  <Banknote className="h-4 w-4" />
                  Rembourser (total ou partiel)
                </Button>
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {actions.refundable
                    ? `Reste remboursable : ${formatCurrency(actions.refundableAmount)}.`
                    : actions.refundBlockedReason}
                </p>
                {pendingRefunds.length > 0 ? (
                  <p className="text-xs font-medium text-amber-700">
                    {pendingRefunds.length} remboursement{pendingRefunds.length > 1 ? "s" : ""} à suivre dans « Paiement et remboursements ».
                  </p>
                ) : null}
              </div>

              {forcible.length > 0 ? (
                <div className="space-y-2 border-t border-border pt-3">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                    onClick={() => setAdvancedOpen((v) => !v)}
                    aria-expanded={advancedOpen}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Actions avancées {advancedOpen ? "▲" : "▼"}
                  </button>
                  {advancedOpen ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Transitions hors parcours normal : motif obligatoire, tracé dans l'historique.
                      </p>
                      {forcible.map((target) => (
                        <Button
                          key={target}
                          size="sm"
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setModal({ kind: "force", target })}
                        >
                          {target === "CANCELED" ? "Annuler : colis perdu / livraison échouée" : `Forcer : ${statusLabel(target)}`}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Section>

          <Section title="Montants">
            <div className="space-y-2">
              <Row label="Sous-total articles" value={formatCurrency(detail.amounts.subTotal)} />
              <Row label="Livraison" value={formatCurrency(detail.amounts.shipping)} />
              {Number(detail.amounts.discount) > 0 ? (
                <Row label="Remise" value={`-${formatCurrency(detail.amounts.discount)}`} negative />
              ) : null}
              <div className="border-t border-border pt-2">
                <Row label="Total TTC" value={formatCurrency(detail.amounts.total)} strong />
              </div>
              <p className="text-xs text-muted-foreground">
                dont TVA ({detail.amounts.vatRatePercent} %) : {formatCurrency(detail.amounts.vatIncluded)}
              </p>
            </div>
          </Section>

          <Section title="Client">
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{detail.customer?.name || "-"}</p>
              <p className="text-muted-foreground">{detail.customer?.email || "-"}</p>
              <p className="text-muted-foreground">{detail.customer?.phone || detail.shipping?.phone || "-"}</p>
            </div>
          </Section>
        </div>
      </div>

      <OrderActionModal {...mp} open={Boolean(modal)} onClose={close} />
    </div>
  );
}
