import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../ui/Table.jsx";
import { backofficeApi } from "../../services/api.js";
import { formatCurrency, formatDateTime } from "./orderUtils.jsx";
import { cn } from "../../utils/cn.js";

const STATUS_LABELS = {
  PENDING: "En attente",
  FAILED: "Échec du traitement",
  MANUAL_REVIEW: "À traiter manuellement"
};

const LEVEL_STYLES = {
  OK: "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  WARNING: "border-transparent bg-orange-500/20 text-orange-700 dark:text-orange-300",
  CRITICAL: "border-transparent bg-rose-500/20 text-rose-700 dark:text-rose-300"
};

const formatAge = (hours) => {
  const h = Number(hours) || 0;
  if (h < 48) return `${h} h`;
  const days = Math.floor(h / 24);
  return `${days} j ${h % 24} h`;
};

/**
 * Remboursements « a traiter » : engages sous 48 h (orange au-dela), plafond de 14 jours (rouge apres 10 jours).
 * Masque tant qu'il n'y a rien a traiter ; ne remplace pas le traitement depuis le detail de la commande.
 */
export default function RefundSlaPanel({ reloadKey = 0 }) {
  const navigate = useNavigate();
  const [sla, setSla] = useState(null);
  const [onlyLate, setOnlyLate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    backofficeApi
      .refundSla()
      .then((data) => !cancelled && setSla(data))
      .catch(() => !cancelled && setSla(null));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const items = Array.isArray(sla?.items) ? sla.items : [];
  if (!sla || items.length === 0) return null;

  const visible = onlyLate ? items.filter((i) => i.level !== "OK") : items;
  const critical = sla.criticalCount || 0;
  const late = sla.warningCount || 0;
  const tone = critical > 0 ? "border-rose-300 dark:border-rose-900/60" : late > 0 ? "border-orange-300 dark:border-orange-900/60" : "";

  return (
    <Card className={cn("space-y-3 p-3 sm:p-4", tone)}>
      <div className="flex flex-wrap items-center gap-3">
        <AlertTriangle className={cn("h-5 w-5", critical > 0 ? "text-rose-600" : late > 0 ? "text-orange-500" : "text-muted-foreground")} />
        <div>
          <h2 className="text-sm font-semibold">Remboursements à traiter ({sla.total})</h2>
          <p className="text-xs text-muted-foreground">
            Un remboursement doit être engagé sous {sla.warningHours} h et au plus tard sous {sla.maxDays} jours.
            {late > 0 ? ` ${late} en retard` : ""}
            {critical > 0 ? `, dont ${critical} de plus de ${sla.criticalDays} jours.` : late > 0 ? "." : ""}
          </p>
        </div>
        <Button variant={onlyLate ? "primary" : "outline"} size="sm" className="ml-auto" onClick={() => setOnlyLate((v) => !v)}>
          {onlyLate ? "Afficher tout" : "Seulement les retards"}
        </Button>
      </div>
      <Table>
        <THead>
          <TRow>
            <TCell>Commande</TCell>
            <TCell className="hidden md:table-cell">Origine</TCell>
            <TCell className="text-right">Montant</TCell>
            <TCell>Statut</TCell>
            <TCell>Ancienneté</TCell>
            <TCell className="hidden lg:table-cell">Échéance maximale</TCell>
          </TRow>
        </THead>
        <tbody>
          {visible.map((item) => (
            <TRow
              key={item.refundId}
              className={item.orderNumber ? "cursor-pointer" : ""}
              onClick={() => item.orderNumber && navigate(`/orders/${encodeURIComponent(item.orderNumber)}`)}
            >
              <TCell className="font-semibold">{item.orderNumber || `Paiement ${item.paymentId}`}</TCell>
              <TCell className="hidden text-xs text-muted-foreground md:table-cell">
                {item.source === "RETURN" ? "Retour produit" : "Annulation"}
              </TCell>
              <TCell className="whitespace-nowrap text-right font-medium">{formatCurrency(item.amount)}</TCell>
              <TCell className="text-xs">{STATUS_LABELS[item.status] || item.status}</TCell>
              <TCell>
                <span
                  className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold", LEVEL_STYLES[item.level] || LEVEL_STYLES.OK)}
                  title={item.overdue ? "Délai maximal dépassé" : undefined}
                >
                  {formatAge(item.ageHours)}
                  {item.overdue ? " · dépassé" : ""}
                </span>
              </TCell>
              <TCell className="hidden whitespace-nowrap text-xs text-muted-foreground lg:table-cell">{formatDateTime(item.maxDeadline)}</TCell>
            </TRow>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
